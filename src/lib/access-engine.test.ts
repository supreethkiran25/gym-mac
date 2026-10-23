import { describe, it, expect } from "vitest";
import { evaluateAccessDecision } from "./access-engine";
import { Member } from "./gym-store";

describe("Access Control & Check-In Decision Engine", () => {
  const baseMember: Member = {
    id: "m-test",
    name: "John Doe",
    phone: "+91 99999 88888",
    email: "john@gym.com",
    plan: "Quarterly Pro",
    planPrice: 8000,
    collectedAmount: 8000,
    due: 0,
    joinDate: "2026-01-01",
    expiry: "2026-07-01",
    status: "Active",
    attendanceRate: 85,
    lastVisit: "Yesterday",
    isCurrentlyInside: false,
    installments: [],
    timeline: [],
    invoices: [],
  };

  const defaultOperator = {
    operatorName: "Priya Sharma",
    operatorRole: "reception",
    referenceDate: "2026-06-01",
  };

  it("authorizes valid active member with zero dues", () => {
    const decision = evaluateAccessDecision(baseMember, defaultOperator);
    expect(decision.allowed).toBe(true);
    expect(decision.code).toBe("AUTHORIZED");
    expect(decision.requiresOverride).toBe(false);
  });

  it("blocks expired member past grace period", () => {
    const expiredMember: Member = {
      ...baseMember,
      expiry: "2026-05-15", // 17 days expired relative to 2026-06-01
      status: "Expired",
    };
    const decision = evaluateAccessDecision(expiredMember, defaultOperator);
    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("EXPIRED");
    expect(decision.requiresOverride).toBe(true);
  });

  it("allows expired member when valid staff override is provided", () => {
    const expiredMember: Member = {
      ...baseMember,
      expiry: "2026-05-15",
      status: "Expired",
    };
    const decision = evaluateAccessDecision(expiredMember, {
      ...defaultOperator,
      isOverride: true,
      overrideReason: "Renewing at desk post-workout (Approved by Director)",
    });
    expect(decision.allowed).toBe(true);
    expect(decision.code).toBe("OVERRIDDEN");
    expect(decision.authorizedBy).toContain("Priya Sharma");
  });

  it("blocks frozen member", () => {
    const frozenMember: Member = {
      ...baseMember,
      status: "Frozen",
      freezeUntil: "2026-06-15",
      freezeReason: "Shoulder rehab",
    };
    const decision = evaluateAccessDecision(frozenMember, defaultOperator);
    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("FROZEN");
    expect(decision.message).toContain("rehab");
  });

  it("blocks anti-passback if member is already inside", () => {
    const insideMember: Member = {
      ...baseMember,
      isCurrentlyInside: true,
      checkInTime: "07:15 AM",
    };
    const decision = evaluateAccessDecision(insideMember, defaultOperator);
    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("ALREADY_INSIDE");
  });

  it("blocks dues if blockOnOverdueDues policy is enabled", () => {
    const partialMember: Member = {
      ...baseMember,
      due: 2000,
      collectedAmount: 6000,
    };
    const decision = evaluateAccessDecision(partialMember, {
      ...defaultOperator,
      policy: {
        blockOnOverdueDues: true,
        maxGraceDays: 2,
        enforceAntiPassback: true,
      },
    });
    expect(decision.allowed).toBe(false);
    expect(decision.code).toBe("DUES_BLOCKED");
  });
});
