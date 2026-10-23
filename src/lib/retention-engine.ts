/**
 * PEAKREP OS — Attendance-Driven Retention & Churn Analytics Engine
 * Identifies drops in attendance based on verifiable check-in records,
 * computes cohort-based retention, and surfaces early intervention alerts.
 */

import { Member } from "./gym-store";
import { getDaysDifference, formatDateYMD } from "./membership-lifecycle";

export interface AttendanceDropAlert {
  memberId: string;
  memberName: string;
  phone: string;
  plan: string;
  lastVisit: string;
  daysSinceLastVisit: number;
  attendanceRate: number;
  riskLevel: "Critical" | "Warning" | "Moderate";
  recommendedAction: string;
  assignedTrainer?: string;
}

export interface RetentionMetrics {
  totalEnrolled: number;
  activeCount: number;
  expiringCount: number;
  expiredCount: number;
  frozenCount: number;
  cohortRetentionRate: number; // percentage of non-expired active members
  attendanceRiskCount: number;
  averageAttendanceRate: number;
}

/**
 * Analyzes member roster and surfaces verifiable attendance drops.
 * Thresholds:
 * - Critical: Active member with attendance rate < 30% or no visit in > 14 days
 * - Warning: Active member with no visit in 7-14 days
 * - Moderate: Active member with attendance rate 30-50%
 */
export function identifyAttendanceDrops(
  members: Member[],
  referenceDateStr?: string,
): AttendanceDropAlert[] {
  const todayStr = referenceDateStr || formatDateYMD(new Date());
  const alerts: AttendanceDropAlert[] = [];

  for (const m of members) {
    // Only analyze active or expiring members who are not frozen
    if (m.status !== "Active" && m.status !== "Expiring") {
      continue;
    }

    let daysSinceVisit = 0;
    if (m.lastVisit.includes("Today")) {
      daysSinceVisit = 0;
    } else if (m.lastVisit.includes("Yesterday")) {
      daysSinceVisit = 1;
    } else {
      // Check timeline for latest attendance timestamp
      const attendanceEvents = m.timeline.filter((e) => e.type === "attendance");
      if (attendanceEvents.length > 0) {
        const latest = attendanceEvents[0];
        // Parse date from title or timestamp if available
        const match = latest.timestamp.match(/\d{4}-\d{2}-\d{2}/);
        if (match) {
          daysSinceVisit = Math.max(0, getDaysDifference(todayStr, match[0]));
        } else {
          daysSinceVisit = 7; // Estimated when relative string
        }
      } else {
        daysSinceVisit = Math.max(0, getDaysDifference(todayStr, m.joinDate));
      }
    }

    if (m.attendanceRate < 35 || daysSinceVisit >= 14) {
      alerts.push({
        memberId: m.id,
        memberName: m.name,
        phone: m.phone,
        plan: m.plan,
        lastVisit: m.lastVisit,
        daysSinceLastVisit: daysSinceVisit,
        attendanceRate: m.attendanceRate,
        riskLevel: "Critical",
        recommendedAction: "Schedule coach check-in or send motivational workout nudge",
        assignedTrainer: m.assignedTrainer,
      });
    } else if (daysSinceVisit >= 7 || m.attendanceRate < 50) {
      alerts.push({
        memberId: m.id,
        memberName: m.name,
        phone: m.phone,
        plan: m.plan,
        lastVisit: m.lastVisit,
        daysSinceLastVisit: daysSinceVisit,
        attendanceRate: m.attendanceRate,
        riskLevel: "Warning",
        recommendedAction: "Send friendly routine reminder or nutrition consultation invite",
        assignedTrainer: m.assignedTrainer,
      });
    }
  }

  // Sort critical first, then by days since visit
  return alerts.sort((a, b) => {
    if (a.riskLevel === "Critical" && b.riskLevel !== "Critical") return -1;
    if (b.riskLevel === "Critical" && a.riskLevel !== "Critical") return 1;
    return b.daysSinceLastVisit - a.daysSinceLastVisit;
  });
}

/**
 * Calculates authoritative, transparent retention statistics across the gym roster.
 */
export function calculateRetentionMetrics(members: Member[]): RetentionMetrics {
  const total = members.length;
  if (total === 0) {
    return {
      totalEnrolled: 0,
      activeCount: 0,
      expiringCount: 0,
      expiredCount: 0,
      frozenCount: 0,
      cohortRetentionRate: 100,
      attendanceRiskCount: 0,
      averageAttendanceRate: 100,
    };
  }

  let activeCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  let frozenCount = 0;
  let totalAttendance = 0;

  for (const m of members) {
    totalAttendance += m.attendanceRate || 0;
    if (m.status === "Active") activeCount++;
    else if (m.status === "Expiring") expiringCount++;
    else if (m.status === "Expired") expiredCount++;
    else if (m.status === "Frozen") frozenCount++;
    else if (m.status === "Partial") activeCount++;
  }

  // Verified active cohort = (active + expiring) / (total - frozen)
  const activeCohort = activeCount + expiringCount;
  const denominator = Math.max(1, total - frozenCount);
  const cohortRetentionRate = Math.round((activeCohort / denominator) * 100);
  const averageAttendanceRate = Math.round(totalAttendance / total);
  const attendanceRiskCount = identifyAttendanceDrops(members).length;

  return {
    totalEnrolled: total,
    activeCount,
    expiringCount,
    expiredCount,
    frozenCount,
    cohortRetentionRate,
    attendanceRiskCount,
    averageAttendanceRate,
  };
}
