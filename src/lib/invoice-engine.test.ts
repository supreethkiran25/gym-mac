import { describe, it, expect } from "vitest";
import {
  generateNextInvoiceNumber,
  generateNextCreditNoteNumber,
  calculateTaxInclusive,
  evaluateRefundState,
} from "./invoice-engine";

describe("Invoice, GST & Financial Reconciliation Engine", () => {
  describe("generateNextInvoiceNumber", () => {
    it("starts from INV-2026-0001 when no invoices exist", () => {
      const next = generateNextInvoiceNumber([]);
      expect(next).toBe("INV-2026-0001");
    });

    it("increments monotonically past highest existing sequence", () => {
      const existing = ["INV-2026-0001", "INV-2026-0002", "INV-2026-0009"];
      const next = generateNextInvoiceNumber(existing);
      expect(next).toBe("INV-2026-0010");
    });

    it("handles legacy prefixes cleanly (e.g. PEAK-2026-0042)", () => {
      const existing = ["PEAK-2026-0042"];
      const next = generateNextInvoiceNumber(existing, "PEAK-2026-");
      expect(next).toBe("PEAK-2026-0043");
    });
  });

  describe("generateNextCreditNoteNumber", () => {
    it("generates sequential credit notes", () => {
      const next = generateNextCreditNoteNumber(["CN-2026-0001"]);
      expect(next).toBe("CN-2026-0002");
    });
  });

  describe("calculateTaxInclusive", () => {
    it("splits 18% GST correctly into base and split CGST/SGST", () => {
      const result = calculateTaxInclusive(1180, 18);
      expect(result.totalAmount).toBe(1180);
      expect(result.baseAmount).toBe(1000);
      expect(result.taxAmount).toBe(180);
      expect(result.cgstAmount).toBe(90);
      expect(result.sgstAmount).toBe(90);
    });

    it("handles 0% tax rate", () => {
      const result = calculateTaxInclusive(5000, 0);
      expect(result.baseAmount).toBe(5000);
      expect(result.taxAmount).toBe(0);
    });
  });

  describe("evaluateRefundState", () => {
    it("correctly handles full refund", () => {
      const res = evaluateRefundState(3000, 3000, 3000, 3000);
      expect(res.isEligible).toBe(true);
      expect(res.paymentStatus).toBe("Refunded");
      expect(res.remainingPaymentAmount).toBe(0);
      expect(res.newCollectedAmount).toBe(0);
      expect(res.newDue).toBe(3000);
    });

    it("correctly handles partial refund", () => {
      const res = evaluateRefundState(8000, 2000, 8000, 8000);
      expect(res.isEligible).toBe(true);
      expect(res.paymentStatus).toBe("Partial Refund");
      expect(res.remainingPaymentAmount).toBe(6000);
      expect(res.newCollectedAmount).toBe(6000);
      expect(res.newDue).toBe(2000);
    });

    it("rejects refund exceeding payment amount", () => {
      const res = evaluateRefundState(3000, 4000, 3000, 3000);
      expect(res.isEligible).toBe(false);
      expect(res.errorMessage).toContain("cannot exceed");
    });
  });
});
