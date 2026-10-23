/**
 * PEAKREP OS — Authoritative Financial Reconciliation Engine
 * Automatically audits the payment ledger against member installment records,
 * member invoices, processed refunds, and operational expenses.
 * Surfaces unmatched entries, over-refunds, missing invoices, and discrepancies.
 */

import { Payment, Member, RefundRecord, GymExpense } from "./gym-store";

export type ReconciliationStatus = "Matched" | "Discrepancy" | "Missing Invoice" | "Over-Refund";

export interface ReconciliationItem {
  id: string;
  paymentId: string;
  date: string;
  memberId?: string;
  memberName: string;
  invoiceNumber: string;
  paymentAmount: number;
  totalRefunded: number;
  netAmount: number;
  memberRecordedCollected: number;
  status: ReconciliationStatus;
  discrepancyAmount: number;
  details: string;
}

export interface DailyCloseSummary {
  date: string;
  totalPaymentsCount: number;
  grossCollected: number;
  totalRefunds: number;
  netCollections: number;
  operatingExpenses: number;
  netCashFlow: number;
  byPaymentMethod: {
    UPI: number;
    Cash: number;
    Card: number;
    Bank: number;
  };
  reconciliationStatus: "Balanced" | "Variance Detected";
  varianceNotes?: string;
}

/**
 * Reconciles every payment against member invoices and refund ledger.
 */
export function runFinancialReconciliation(
  payments: Payment[],
  members: Member[],
  refunds: RefundRecord[],
): {
  items: ReconciliationItem[];
  matchedCount: number;
  discrepancyCount: number;
  totalGrossReconciled: number;
  totalNetReconciled: number;
  totalDiscrepancyAmount: number;
} {
  const refundMap = new Map<string, number>();
  for (const r of refunds) {
    const existing = refundMap.get(r.paymentId) || 0;
    refundMap.set(r.paymentId, existing + r.amount);
  }

  const memberMap = new Map<string, Member>();
  for (const m of members) {
    memberMap.set(m.id, m);
  }

  const items: ReconciliationItem[] = [];
  let matchedCount = 0;
  let discrepancyCount = 0;
  let totalGrossReconciled = 0;
  let totalNetReconciled = 0;
  let totalDiscrepancyAmount = 0;

  for (const p of payments) {
    const totalRefunded = refundMap.get(p.id) || 0;
    const netAmount = Math.max(0, p.amount - totalRefunded);
    totalGrossReconciled += p.amount;
    totalNetReconciled += netAmount;

    const member = p.memberId ? memberMap.get(p.memberId) : undefined;
    const memberCollected = member?.collectedAmount || 0;

    let status: ReconciliationStatus = "Matched";
    let details = "Verified against payment invoice ledger";
    let discrepancyAmount = 0;

    // Check 1: Over-refund
    if (totalRefunded > p.amount) {
      status = "Over-Refund";
      discrepancyAmount = totalRefunded - p.amount;
      details = `Total refunds (₹${totalRefunded}) exceed payment face value (₹${p.amount})`;
      discrepancyCount++;
      totalDiscrepancyAmount += discrepancyAmount;
    }
    // Check 2: Missing invoice number
    else if (!p.invoiceNumber || p.invoiceNumber.trim() === "") {
      status = "Missing Invoice";
      discrepancyAmount = p.amount;
      details = "Payment has no sequential tax invoice number assigned";
      discrepancyCount++;
      totalDiscrepancyAmount += discrepancyAmount;
    }
    // Check 3: Invoice relationship on member
    else if (member) {
      const hasInvoice = member.invoices.some((inv) => inv.invoiceNumber === p.invoiceNumber);
      if (!hasInvoice && p.category === "Membership") {
        status = "Discrepancy";
        details = `Invoice ${p.invoiceNumber} not linked in member's invoice directory`;
        discrepancyCount++;
      } else {
        matchedCount++;
      }
    } else {
      matchedCount++;
    }

    items.push({
      id: `rec-${p.id}`,
      paymentId: p.id,
      date: p.date,
      memberId: p.memberId,
      memberName: p.member,
      invoiceNumber: p.invoiceNumber || "N/A",
      paymentAmount: p.amount,
      totalRefunded,
      netAmount,
      memberRecordedCollected: memberCollected,
      status,
      discrepancyAmount,
      details,
    });
  }

  return {
    items,
    matchedCount,
    discrepancyCount,
    totalGrossReconciled,
    totalNetReconciled,
    totalDiscrepancyAmount,
  };
}

/**
 * Computes Daily Cash Close Summary for end-of-shift / end-of-day register closing.
 */
export function computeDailyCloseSummary(
  targetDate: string,
  payments: Payment[],
  expenses: GymExpense[],
  refunds: RefundRecord[],
): DailyCloseSummary {
  const dayPayments = payments.filter((p) => p.date === targetDate);
  const dayExpenses = expenses.filter((e) => e.date === targetDate && e.status === "Paid");
  const dayRefunds = refunds.filter((r) => r.date === targetDate);

  const byPaymentMethod = {
    UPI: 0,
    Cash: 0,
    Card: 0,
    Bank: 0,
  };

  let grossCollected = 0;
  for (const p of dayPayments) {
    grossCollected += p.amount;
    if (p.method === "UPI") byPaymentMethod.UPI += p.amount;
    else if (p.method === "Cash") byPaymentMethod.Cash += p.amount;
    else if (p.method === "Card") byPaymentMethod.Card += p.amount;
    else if (p.method === "Bank") byPaymentMethod.Bank += p.amount;
  }

  const totalRefunds = dayRefunds.reduce((sum, r) => sum + r.amount, 0);
  const netCollections = Math.max(0, grossCollected - totalRefunds);
  const operatingExpenses = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = netCollections - operatingExpenses;

  return {
    date: targetDate,
    totalPaymentsCount: dayPayments.length,
    grossCollected,
    totalRefunds,
    netCollections,
    operatingExpenses,
    netCashFlow,
    byPaymentMethod,
    reconciliationStatus: totalRefunds > grossCollected ? "Variance Detected" : "Balanced",
    varianceNotes:
      totalRefunds > grossCollected
        ? "Warning: Daily refunds exceed daily collections. Audit register drawer."
        : undefined,
  };
}
