/**
 * PEAKREP OS — Authoritative Access Control & Check-In Decision Engine
 * Enforces business rules for physical turnstile access, anti-passback,
 * expiration, freeze periods, dues policies, and permissioned manual overrides.
 */

import { Member } from "./gym-store";
import {
  deriveMembershipLifecycleStatus,
  formatDateYMD,
  getDaysDifference,
} from "./membership-lifecycle";

export type AccessDecisionCode =
  | "AUTHORIZED"
  | "OVERRIDDEN"
  | "EXPIRED"
  | "FROZEN"
  | "ALREADY_INSIDE"
  | "DUES_BLOCKED"
  | "NOT_FOUND";

export interface AccessDecision {
  allowed: boolean;
  code: AccessDecisionCode;
  message: string;
  member?: Member;
  requiresOverride: boolean;
  timestamp: string;
  overrideReason?: string;
  authorizedBy?: string;
}

export interface AccessControlPolicy {
  blockOnOverdueDues: boolean; // default: false (gyms usually warn on partial dues rather than hard-block)
  maxGraceDays: number; // default: 2 days
  enforceAntiPassback: boolean; // default: true
}

export const DEFAULT_ACCESS_POLICY: AccessControlPolicy = {
  blockOnOverdueDues: false,
  maxGraceDays: 2,
  enforceAntiPassback: true,
};

export interface AccessRequestOptions {
  referenceDate?: string;
  policy?: AccessControlPolicy;
  isOverride?: boolean;
  overrideReason?: string;
  operatorName: string;
  operatorRole: string;
}

/**
 * Authoritative access decision evaluation.
 */
export function evaluateAccessDecision(
  member: Member | undefined,
  options: AccessRequestOptions,
): AccessDecision {
  const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const todayStr = options.referenceDate || formatDateYMD(new Date());
  const policy = options.policy || DEFAULT_ACCESS_POLICY;

  if (!member) {
    return {
      allowed: false,
      code: "NOT_FOUND",
      message: "Access Denied: Member ID or QR code not found in gym directory.",
      requiresOverride: false,
      timestamp: timeNow,
    };
  }

  // 1. Anti-Passback Check
  if (policy.enforceAntiPassback && member.isCurrentlyInside) {
    if (options.isOverride && options.overrideReason) {
      return {
        allowed: true,
        code: "OVERRIDDEN",
        message: `Turnstile Passback Overridden: Member checked in again (${options.overrideReason})`,
        member,
        requiresOverride: false,
        timestamp: timeNow,
        overrideReason: options.overrideReason,
        authorizedBy: `${options.operatorName} (${options.operatorRole})`,
      };
    }
    return {
      allowed: false,
      code: "ALREADY_INSIDE",
      message: `Anti-Passback Alert: ${member.name} is already logged as inside the gym floor since ${member.checkInTime || "earlier today"}.`,
      member,
      requiresOverride: true,
      timestamp: timeNow,
    };
  }

  // 2. Freeze Status Check
  const lifecycleStatus = deriveMembershipLifecycleStatus(
    member.expiry,
    member.freezeUntil,
    todayStr,
  );

  if (lifecycleStatus === "Frozen") {
    if (options.isOverride && options.overrideReason) {
      return {
        allowed: true,
        code: "OVERRIDDEN",
        message: `Frozen Membership Overridden: ${member.name} authorized by front desk (${options.overrideReason})`,
        member,
        requiresOverride: false,
        timestamp: timeNow,
        overrideReason: options.overrideReason,
        authorizedBy: `${options.operatorName} (${options.operatorRole})`,
      };
    }
    return {
      allowed: false,
      code: "FROZEN",
      message: `Access Denied: ${member.name}'s membership is paused / frozen until ${member.freezeUntil}. Reason: ${member.freezeReason || "Administrative hold"}.`,
      member,
      requiresOverride: true,
      timestamp: timeNow,
    };
  }

  // 3. Expiration Check
  const daysLeft = getDaysDifference(member.expiry, todayStr);
  if (daysLeft < -policy.maxGraceDays) {
    if (options.isOverride && options.overrideReason) {
      return {
        allowed: true,
        code: "OVERRIDDEN",
        message: `Expired Membership Overridden: ${member.name} granted exceptional pass (${options.overrideReason})`,
        member,
        requiresOverride: false,
        timestamp: timeNow,
        overrideReason: options.overrideReason,
        authorizedBy: `${options.operatorName} (${options.operatorRole})`,
      };
    }
    return {
      allowed: false,
      code: "EXPIRED",
      message: `Access Denied: Membership expired on ${member.expiry} (${Math.abs(daysLeft)} days overdue). Renewal required.`,
      member,
      requiresOverride: true,
      timestamp: timeNow,
    };
  }

  // 4. Overdue Dues Policy Check
  if (policy.blockOnOverdueDues && member.due > 0) {
    if (options.isOverride && options.overrideReason) {
      return {
        allowed: true,
        code: "OVERRIDDEN",
        message: `Outstanding Dues Overridden: Authorized by front desk (${options.overrideReason})`,
        member,
        requiresOverride: false,
        timestamp: timeNow,
        overrideReason: options.overrideReason,
        authorizedBy: `${options.operatorName} (${options.operatorRole})`,
      };
    }
    return {
      allowed: false,
      code: "DUES_BLOCKED",
      message: `Access Suspended: Outstanding balance of ₹${member.due.toLocaleString("en-IN")}. Please clear dues to proceed.`,
      member,
      requiresOverride: true,
      timestamp: timeNow,
    };
  }

  // 5. Valid & Authorized
  return {
    allowed: true,
    code: "AUTHORIZED",
    message: `Access Granted: Welcome to the gym floor, ${member.name}! (${member.plan})`,
    member,
    requiresOverride: false,
    timestamp: timeNow,
  };
}
