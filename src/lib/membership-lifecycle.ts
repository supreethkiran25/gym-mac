/**
 * PEAKREP OS — Authoritative Membership Lifecycle Engine
 * Handles exact date arithmetic, renewals, freeze pause & extension, and status transitions.
 */

export type LifecycleStatus = "Active" | "Expiring" | "Expired" | "Partial" | "Frozen";

export interface MembershipLifecyclePolicy {
  expiringThresholdDays: number; // default: 7 days
  gracePeriodDays: number; // default: 2 days
}

export const DEFAULT_LIFECYCLE_POLICY: MembershipLifecyclePolicy = {
  expiringThresholdDays: 7,
  gracePeriodDays: 2,
};

/**
 * Normalizes a date into YYYY-MM-DD format using local calendar components.
 */
export function formatDateYMD(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses YYYY-MM-DD into a localized Date at 00:00:00.
 */
export function parseDateYMD(dateStr: string): Date {
  const parts = dateStr.split("-").map((p) => parseInt(p, 10));
  if (parts.length !== 3 || isNaN(parts[0]) || isNaN(parts[1]) || isNaN(parts[2])) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
}

/**
 * Calculates the exact days between two dates (target - reference).
 */
export function getDaysDifference(targetDateStr: string, referenceDateStr?: string): number {
  const refDate = referenceDateStr ? parseDateYMD(referenceDateStr) : parseDateYMD(formatDateYMD(new Date()));
  const targetDate = parseDateYMD(targetDateStr);
  const diffMs = targetDate.getTime() - refDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Authoritatively derives the lifecycle status of a membership without conflating payment dues.
 */
export function deriveMembershipLifecycleStatus(
  expiryDateStr: string,
  freezeUntilStr?: string,
  referenceDateStr?: string,
  policy: MembershipLifecyclePolicy = DEFAULT_LIFECYCLE_POLICY,
): LifecycleStatus {
  const todayStr = referenceDateStr || formatDateYMD(new Date());

  // Check Freeze first
  if (freezeUntilStr && freezeUntilStr >= todayStr) {
    return "Frozen";
  }

  const daysLeft = getDaysDifference(expiryDateStr, todayStr);

  if (daysLeft < -policy.gracePeriodDays) {
    return "Expired";
  }
  if (daysLeft < 0) {
    // Within grace period
    return "Expiring";
  }
  if (daysLeft <= policy.expiringThresholdDays) {
    return "Expiring";
  }
  return "Active";
}

/**
 * Calculates new expiry date for a renewal.
 * Crucial Rule: If a member renews early (currentExpiry > today), the new duration
 * is appended onto the existing expiry date so the member does not lose remaining days!
 */
export function calculateRenewalExpiry(
  currentExpiryStr: string,
  durationMonths: number,
  referenceDateStr?: string,
): string {
  const todayStr = referenceDateStr || formatDateYMD(new Date());
  const currentExpiry = parseDateYMD(currentExpiryStr);
  const today = parseDateYMD(todayStr);

  // If currently active and expiring in future, add from current expiry.
  // Otherwise, add from today.
  const baseDate = currentExpiry.getTime() > today.getTime() ? new Date(currentExpiry) : new Date(today);

  // Add exact calendar months
  const currentMonth = baseDate.getMonth();
  baseDate.setMonth(currentMonth + durationMonths);

  return formatDateYMD(baseDate);
}

/**
 * Freezes a membership:
 * Sets the freezeUntil date and saves the start date for later resumption.
 */
export function calculateFreezeWindow(daysToFreeze: number, referenceDateStr?: string): {
  freezeStartDate: string;
  freezeUntilDate: string;
} {
  const startDate = referenceDateStr ? parseDateYMD(referenceDateStr) : parseDateYMD(formatDateYMD(new Date()));
  const freezeUntil = new Date(startDate);
  freezeUntil.setDate(freezeUntil.getDate() + daysToFreeze);

  return {
    freezeStartDate: formatDateYMD(startDate),
    freezeUntilDate: formatDateYMD(freezeUntil),
  };
}

/**
 * Resumes / unfreezes a membership:
 * Extends the existing expiry date by the exact number of days the member was frozen.
 */
export function calculateUnfreezeExpiry(
  currentExpiryStr: string,
  freezeStartDateStr: string,
  unfreezeDateStr?: string,
): { newExpiry: string; daysExtended: number } {
  const todayStr = unfreezeDateStr || formatDateYMD(new Date());
  const freezeStart = parseDateYMD(freezeStartDateStr);
  const unfreezeDate = parseDateYMD(todayStr);

  const daysFrozen = Math.max(0, Math.round((unfreezeDate.getTime() - freezeStart.getTime()) / (1000 * 60 * 60 * 24)));

  const expiryDate = parseDateYMD(currentExpiryStr);
  expiryDate.setDate(expiryDate.getDate() + daysFrozen);

  return {
    newExpiry: formatDateYMD(expiryDate),
    daysExtended: daysFrozen,
  };
}
