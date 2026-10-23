/**
 * PEAKREP OS — Authoritative Invoice, GST & Financial Reconciliation Engine
 * Guarantees monotonic sequential invoice numbers, tax-inclusive rounding,
 * credit notes, partial refunds, and authoritative ledger balances.
 */

export interface TaxBreakdown {
  totalAmount: number;
  baseAmount: number;
  taxAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  taxRatePercent: number;
}

export interface CreditNote {
  id: string;
  creditNoteNumber: string;
  originalInvoiceNumber: string;
  date: string;
  amount: number;
  reason: string;
  issuedTo: string;
  processedBy: string;
}

/**
 * Calculates tax-inclusive breakdown (e.g. 18% GST).
 */
export function calculateTaxInclusive(totalAmount: number, taxRatePercent = 18): TaxBreakdown {
  if (taxRatePercent <= 0) {
    return {
      totalAmount,
      baseAmount: totalAmount,
      taxAmount: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      taxRatePercent: 0,
    };
  }
  const factor = 1 + taxRatePercent / 100;
  const baseAmount = Math.round((totalAmount / factor) * 100) / 100;
  const taxAmount = Math.round((totalAmount - baseAmount) * 100) / 100;
  const halfTax = Math.round((taxAmount / 2) * 100) / 100;

  return {
    totalAmount,
    baseAmount,
    taxAmount,
    cgstAmount: halfTax,
    sgstAmount: halfTax,
    taxRatePercent,
  };
}

/**
 * Generates the next monotonic, sequential invoice number.
 * Scans all existing invoice numbers, extracts the sequence number, and increments.
 */
export function generateNextInvoiceNumber(
  existingInvoiceNumbers: string[],
  prefix = "INV-2026-",
): string {
  let highestSeq = 0;

  for (const inv of existingInvoiceNumbers) {
    if (!inv) continue;
    // Match trailing digits (e.g., INV-2026-0042 or PEAK-2026-1234 -> 42 or 1234)
    const match = inv.match(/(\d+)$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > highestSeq) {
        highestSeq = seq;
      }
    }
  }

  const nextSeq = highestSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

/**
 * Generates a sequential Credit Note number.
 */
export function generateNextCreditNoteNumber(
  existingCreditNotes: string[],
  prefix = "CN-2026-",
): string {
  let highestSeq = 0;

  for (const cn of existingCreditNotes) {
    if (!cn) continue;
    const match = cn.match(/(\d+)$/);
    if (match) {
      const seq = parseInt(match[1], 10);
      if (!isNaN(seq) && seq > highestSeq) {
        highestSeq = seq;
      }
    }
  }

  const nextSeq = highestSeq + 1;
  return `${prefix}${String(nextSeq).padStart(4, "0")}`;
}

/**
 * Evaluates refund impact on payment and member balance.
 */
export function evaluateRefundState(
  originalPaymentAmount: number,
  refundAmount: number,
  currentCollectedAmount: number,
  planPrice: number,
): {
  paymentStatus: "Refunded" | "Partial Refund";
  remainingPaymentAmount: number;
  newCollectedAmount: number;
  newDue: number;
  isEligible: boolean;
  errorMessage?: string;
} {
  if (refundAmount <= 0) {
    return {
      paymentStatus: "Partial Refund",
      remainingPaymentAmount: originalPaymentAmount,
      newCollectedAmount: currentCollectedAmount,
      newDue: Math.max(0, planPrice - currentCollectedAmount),
      isEligible: false,
      errorMessage: "Refund amount must be greater than zero.",
    };
  }

  if (refundAmount > originalPaymentAmount) {
    return {
      paymentStatus: "Partial Refund",
      remainingPaymentAmount: originalPaymentAmount,
      newCollectedAmount: currentCollectedAmount,
      newDue: Math.max(0, planPrice - currentCollectedAmount),
      isEligible: false,
      errorMessage: `Refund amount (₹${refundAmount}) cannot exceed the payment amount (₹${originalPaymentAmount}).`,
    };
  }

  const remainingPayment = originalPaymentAmount - refundAmount;
  const paymentStatus = remainingPayment === 0 ? "Refunded" : "Partial Refund";
  const newCollected = Math.max(0, currentCollectedAmount - refundAmount);
  const newDue = Math.max(0, planPrice - newCollected);

  return {
    paymentStatus,
    remainingPaymentAmount: remainingPayment,
    newCollectedAmount: newCollected,
    newDue,
    isEligible: true,
  };
}
