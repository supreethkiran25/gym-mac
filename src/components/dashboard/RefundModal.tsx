import React, { useState } from "react";
import { X, RotateCcw, ShieldAlert, CheckCircle2, AlertTriangle } from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { toast } from "sonner";

export function RefundModal() {
  const {
    isRefundModalOpen,
    setIsRefundModalOpen,
    selectedPaymentForRefund,
    setSelectedPaymentForRefund,
    refundPayment,
    currentUser,
    settings,
  } = useGymStore();

  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [confirmStep, setConfirmStep] = useState(false);

  React.useEffect(() => {
    if (selectedPaymentForRefund) {
      setRefundAmount(selectedPaymentForRefund.amount);
      setReason("Member relocated / medical cancellation");
      setConfirmStep(false);
    }
  }, [selectedPaymentForRefund]);

  if (!isRefundModalOpen || !selectedPaymentForRefund) return null;

  const handleClose = () => {
    setIsRefundModalOpen(false);
    setSelectedPaymentForRefund(null);
  };

  const handleProcessRefund = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please enter a valid reason for the refund");
      return;
    }
    if (refundAmount <= 0 || refundAmount > selectedPaymentForRefund.amount) {
      toast.error(`Refund amount must be between 1 and ${settings.currencySymbol}${selectedPaymentForRefund.amount}`);
      return;
    }

    const success = refundPayment(selectedPaymentForRefund.id, refundAmount, reason);
    if (success) {
      toast.success(
        `Refund of ${settings.currencySymbol}${refundAmount.toLocaleString("en-IN")} processed successfully!`
      );
      handleClose();
    } else {
      toast.error("Failed to process refund.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <RotateCcw className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  Admin Authority Required
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mt-0.5">Issue Payment Refund</h3>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Selected Transaction Summary */}
        <div className="rounded-2xl border border-border bg-canvas p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Invoice Number:</span>
            <span className="font-mono font-bold text-foreground">{selectedPaymentForRefund.invoiceNumber}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Member Name:</span>
            <span className="font-bold text-foreground">{selectedPaymentForRefund.member}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Original Paid Amount:</span>
            <span className="font-mono font-bold text-foreground">
              {settings.currencySymbol}
              {selectedPaymentForRefund.amount.toLocaleString("en-IN")} ({selectedPaymentForRefund.method})
            </span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Transaction Date:</span>
            <span>{selectedPaymentForRefund.date}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleProcessRefund} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Refund Amount ({settings.currencySymbol})</label>
            <input
              type="number"
              min="1"
              max={selectedPaymentForRefund.amount}
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              required
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm font-bold font-mono focus:border-foreground focus:outline-hidden"
            />
            <p className="text-[11px] text-muted-foreground">
              Full refund: {settings.currencySymbol}
              {selectedPaymentForRefund.amount.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Cancellation & Refund Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs focus:border-foreground focus:outline-hidden"
            >
              <option value="Member relocated / medical cancellation">Member relocated / medical cancellation</option>
              <option value="Accidental duplicate charge">Accidental duplicate charge</option>
              <option value="Dissatisfaction / Plan downgrade adjustment">Dissatisfaction / Plan downgrade adjustment</option>
              <option value="Executive Director discretionary refund">Executive Director discretionary refund</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Audit Notice */}
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-tight">
              This action will adjust the member's collected balance and permanently log an audit entry under Director{" "}
              <strong>{currentUser.name}</strong>.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md"
            >
              Confirm Refund
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
