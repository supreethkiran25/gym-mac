import { describe, it, expect } from "vitest";
import { identifyAttendanceDrops, calculateRetentionMetrics } from "./retention-engine";
import { Member } from "./gym-store";

describe("Attendance-Driven Retention Engine", () => {
  const mockMembers: Member[] = [
    {
      id: "m-active-consistent",
      name: "Marcus Vance",
      phone: "+91 98888 11111",
      email: "marcus@gym.com",
      plan: "Annual Elite",
      planPrice: 24000,
      collectedAmount: 24000,
      due: 0,
      joinDate: "2026-01-01",
      expiry: "2026-12-31",
      status: "Active",
      attendanceRate: 92,
      lastVisit: "Today, 06:30 AM",
      isCurrentlyInside: true,
      installments: [],
      timeline: [],
      invoices: [],
    },
    {
      id: "m-slumping",
      name: "Siddharth Rao",
      phone: "+91 97777 22222",
      email: "sid@gym.com",
      plan: "Monthly Flex",
      planPrice: 3000,
      collectedAmount: 3000,
      due: 0,
      joinDate: "2026-05-01",
      expiry: "2026-07-01",
      status: "Active",
      attendanceRate: 25, // critically low
      lastVisit: "16 days ago",
      isCurrentlyInside: false,
      installments: [],
      timeline: [],
      invoices: [],
    },
    {
      id: "m-frozen",
      name: "Deepa Nair",
      phone: "+91 96666 33333",
      email: "deepa@gym.com",
      plan: "Quarterly Pro",
      planPrice: 8000,
      collectedAmount: 8000,
      due: 0,
      joinDate: "2026-02-01",
      expiry: "2026-08-01",
      status: "Frozen",
      freezeUntil: "2026-07-15",
      attendanceRate: 50,
      lastVisit: "Frozen",
      isCurrentlyInside: false,
      installments: [],
      timeline: [],
      invoices: [],
    },
  ];

  it("identifies attendance slumps and flags critical risk", () => {
    const alerts = identifyAttendanceDrops(mockMembers);
    expect(alerts.length).toBe(1);
    expect(alerts[0].memberId).toBe("m-slumping");
    expect(alerts[0].riskLevel).toBe("Critical");
  });

  it("calculates transparent cohort retention rates excluding frozen holds", () => {
    const metrics = calculateRetentionMetrics(mockMembers);
    expect(metrics.totalEnrolled).toBe(3);
    expect(metrics.activeCount).toBe(2);
    expect(metrics.frozenCount).toBe(1);
    expect(metrics.cohortRetentionRate).toBe(100); // 2 active out of 2 non-frozen
  });
});
