import { describe, it, expect } from "vitest";
import { validateCsvImportBatch, normalizePhone, normalizeEmail } from "./csv-import-validator";
import { Member, MembershipPlan } from "./gym-store";

describe("Safe CSV Import Validator Engine", () => {
  const existingMembers: Member[] = [
    {
      id: "m-1",
      name: "Existing User",
      phone: "+91 98765 43210",
      email: "existing@gym.com",
      plan: "Monthly Flex",
      planPrice: 3000,
      collectedAmount: 3000,
      due: 0,
      joinDate: "2026-01-01",
      expiry: "2026-06-01",
      status: "Active",
      attendanceRate: 90,
      lastVisit: "Today",
      isCurrentlyInside: false,
      installments: [],
      timeline: [],
      invoices: [],
    },
  ];

  const plans: MembershipPlan[] = [
    {
      id: "p-1",
      name: "Monthly Flex",
      price: 3000,
      durationMonths: 1,
      type: "Standard",
      perks: [],
      activeCount: 1,
      expiringCount: 0,
      frozenCount: 0,
      upgradeOpportunities: 0,
    },
    {
      id: "p-2",
      name: "Annual Elite",
      price: 24000,
      durationMonths: 12,
      type: "VIP",
      perks: [],
      activeCount: 0,
      expiringCount: 0,
      frozenCount: 0,
      upgradeOpportunities: 0,
    },
  ];

  it("normalizes phone and email cleanly", () => {
    expect(normalizePhone("+91 (987) 654-3210")).toBe("+919876543210");
    expect(normalizeEmail("   USER@Gym.COM  ")).toBe("user@gym.com");
  });

  it("accepts valid rows and computes due and status", () => {
    const rawRows = [
      {
        name: "Rahul Verma",
        phone: "+91 91234 56789",
        email: "rahul@verma.com",
        plan: "Monthly Flex",
        paidAmount: "3000",
      },
    ];

    const result = validateCsvImportBatch(rawRows, existingMembers, plans, "2026-06-01");
    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(0);
    expect(result.validRows[0].name).toBe("Rahul Verma");
    expect(result.validRows[0].computedDue).toBe(0);
    expect(result.validRows[0].computedStatus).toBe("Active");
  });

  it("detects duplicates against existing members", () => {
    const rawRows = [
      {
        name: "Imposter User",
        phone: "+91 98765 43210", // already in existingMembers
        plan: "Monthly Flex",
      },
    ];

    const result = validateCsvImportBatch(rawRows, existingMembers, plans);
    expect(result.validCount).toBe(0);
    expect(result.errorCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.invalidRows[0].errors[0].error).toContain("already registered");
  });

  it("detects intra-batch duplicate phones", () => {
    const rawRows = [
      { name: "Person A", phone: "+91 99999 11111", plan: "Monthly Flex" },
      { name: "Person B", phone: "+91 99999 11111", plan: "Monthly Flex" },
    ];

    const result = validateCsvImportBatch(rawRows, existingMembers, plans);
    expect(result.validCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(result.duplicateCount).toBe(1);
    expect(result.invalidRows[0].errors[0].error).toContain("within the same CSV batch");
  });

  it("rejects unknown plan names with descriptive feedback", () => {
    const rawRows = [
      { name: "Sam Jones", phone: "+91 95555 44444", plan: "NonExistentPlan" },
    ];

    const result = validateCsvImportBatch(rawRows, existingMembers, plans);
    expect(result.validCount).toBe(0);
    expect(result.invalidRows[0].errors[0].error).toContain("Available: Monthly Flex, Annual Elite");
  });
});
