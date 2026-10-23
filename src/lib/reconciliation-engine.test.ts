import { describe, it, expect } from "vitest";
import { runFinancialReconciliation, computeDailyCloseSummary } from "./reconciliation-engine";
import { Payment, Member, RefundRecord, GymExpense } from "./gym-store";

describe("Financial Reconciliation Engine", () => {
  const members: Member[] = [
    {
      id: "m-1",
      name: "Suresh Kumar",
      phone: "+91 91111 22222",
      email: "suresh@gym.com",
      plan: "Monthly Flex",
      planPrice: 3000,
      collectedAmount: 3000,
      due: 0,
      joinDate: "2026-06-01",
      expiry: "2026-07-01",
      status: "Active",
      attendanceRate: 80,
      lastVisit: "Today",
      isCurrentlyInside: false,
      installments: [],
      timeline: [],
      invoices: [
        {
          id: "inv-1",
          invoiceNumber: "INV-2026-0001",
          date: "2026-06-01",
          amount: 3000,
          plan: "Monthly Flex",
          method: "UPI",
          status: "Paid",
        },
      ],
    },
  ];

  const payments: Payment[] = [
    {
      id: "p-1",
      memberId: "m-1",
      member: "Suresh Kumar",
      date: "2026-06-01",
      method: "UPI",
      amount: 3000,
      category: "Membership",
      status: "Paid",
      invoiceNumber: "INV-2026-0001",
    },
    {
      id: "p-2",
      member: "Walk-in Guest",
      date: "2026-06-01",
      method: "Cash",
      amount: 500,
      category: "Registration",
      status: "Paid",
      invoiceNumber: "", // Missing invoice number!
    },
  ];

  const refunds: RefundRecord[] = [
    {
      id: "ref-1",
      paymentId: "p-1",
      memberId: "m-1",
      memberName: "Suresh Kumar",
      amount: 500,
      date: "2026-06-01",
      reason: "Satisfaction guarantee credit",
      processedBy: "Admin",
      invoiceNumber: "INV-2026-0001",
    },
  ];

  it("reconciles payments, detects missing invoices, and calculates net amounts", () => {
    const report = runFinancialReconciliation(payments, members, refunds);
    expect(report.items.length).toBe(2);
    expect(report.matchedCount).toBe(1);
    expect(report.discrepancyCount).toBe(1);
    expect(report.items[0].netAmount).toBe(2500); // 3000 - 500 refund
    expect(report.items[1].status).toBe("Missing Invoice");
  });

  it("computes daily close summary with breakdown by payment method", () => {
    const expenses: GymExpense[] = [
      {
        id: "exp-1",
        title: "Cleaning Supplies",
        category: "Supplements & Inventory",
        amount: 350,
        date: "2026-06-01",
        paymentMethod: "Cash",
        status: "Paid",
        recipientName: "CleanMart",
        recordedBy: "Admin",
      },
    ];

    const close = computeDailyCloseSummary("2026-06-01", payments, expenses, refunds);
    expect(close.grossCollected).toBe(3500);
    expect(close.totalRefunds).toBe(500);
    expect(close.netCollections).toBe(3000);
    expect(close.operatingExpenses).toBe(350);
    expect(close.netCashFlow).toBe(2650);
    expect(close.byPaymentMethod.UPI).toBe(3000);
    expect(close.byPaymentMethod.Cash).toBe(500);
    expect(close.reconciliationStatus).toBe("Balanced");
  });
});
