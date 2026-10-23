import { describe, it, expect } from "vitest";
import {
  calculateRenewalExpiry,
  deriveMembershipLifecycleStatus,
  calculateFreezeWindow,
  calculateUnfreezeExpiry,
  getDaysDifference,
} from "./membership-lifecycle";

describe("Membership Lifecycle Engine", () => {
  describe("calculateRenewalExpiry", () => {
    it("should extend from current expiry date when member renews early", () => {
      // Current expiry is 2026-06-15, today is 2026-06-01 (14 days left)
      const currentExp = "2026-06-15";
      const referenceDate = "2026-06-01";
      const newExp = calculateRenewalExpiry(currentExp, 1, referenceDate);

      // Should add 1 month to June 15, yielding July 15 (preserving the 14 remaining days)
      expect(newExp).toBe("2026-07-15");
    });

    it("should start from today when member renews after expiring", () => {
      // Current expiry was 2026-05-01, today is 2026-06-01 (already expired)
      const currentExp = "2026-05-01";
      const referenceDate = "2026-06-01";
      const newExp = calculateRenewalExpiry(currentExp, 1, referenceDate);

      // Should start from June 1, yielding July 1
      expect(newExp).toBe("2026-07-01");
    });

    it("should correctly handle multi-month renewals (e.g., 3-month quarterly)", () => {
      const currentExp = "2026-06-01";
      const referenceDate = "2026-06-01";
      const newExp = calculateRenewalExpiry(currentExp, 3, referenceDate);
      expect(newExp).toBe("2026-09-01");
    });
  });

  describe("deriveMembershipLifecycleStatus", () => {
    it("returns 'Frozen' if freezeUntil is active", () => {
      const status = deriveMembershipLifecycleStatus("2026-07-01", "2026-06-10", "2026-06-01");
      expect(status).toBe("Frozen");
    });

    it("returns 'Active' for membership expiring well in future", () => {
      const status = deriveMembershipLifecycleStatus("2026-07-01", undefined, "2026-06-01");
      expect(status).toBe("Active");
    });

    it("returns 'Expiring' when within 7-day threshold", () => {
      const status = deriveMembershipLifecycleStatus("2026-06-05", undefined, "2026-06-01");
      expect(status).toBe("Expiring");
    });

    it("returns 'Expiring' during grace period (-1 day)", () => {
      const status = deriveMembershipLifecycleStatus("2026-05-31", undefined, "2026-06-01");
      expect(status).toBe("Expiring");
    });

    it("returns 'Expired' past the grace period", () => {
      const status = deriveMembershipLifecycleStatus("2026-05-20", undefined, "2026-06-01");
      expect(status).toBe("Expired");
    });
  });

  describe("Freeze & Unfreeze calculations", () => {
    it("correctly sets freeze start and end window", () => {
      const { freezeStartDate, freezeUntilDate } = calculateFreezeWindow(15, "2026-06-01");
      expect(freezeStartDate).toBe("2026-06-01");
      expect(freezeUntilDate).toBe("2026-06-16");
    });

    it("extends expiry by exact days frozen when unfreezing", () => {
      // Member originally expires 2026-08-01, froze on 2026-06-01, unfreezes on 2026-06-11 (10 days frozen)
      const { newExpiry, daysExtended } = calculateUnfreezeExpiry(
        "2026-08-01",
        "2026-06-01",
        "2026-06-11",
      );
      expect(daysExtended).toBe(10);
      expect(newExpiry).toBe("2026-08-11");
    });
  });
});
