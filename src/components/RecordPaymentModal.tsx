import React, { useState, useEffect } from "react";
import { X, CreditCard, Calendar, User, Check, FileText } from "lucide-react";
import { useGymStore } from "../lib/gym-store";
import { toast } from "sonner";

export function RecordPaymentModal() {
  const {
    isRecordPaymentOpen,
    setIsRecordPaymentOpen,
    paymentForMember,
    setPaymentForMember,
    members,
    recordPayment,
    settings,
  } = useGymStore();

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"UPI" | "Cash" | "Card" | "Bank">("UPI");
  const [category, setCategory] = useState<"Membership" | "Personal Training" | "Registration">("Membership");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [installmentIndex, setInstallmentIndex] = useState(1);

  useEffect(() => {
    if (paymentForMember) {
      setSelectedMemberId(paymentForMember.id);
      if (paymentForMember.due > 0) {
        setAmount(paymentForMember.due.toString());
      } else {
        const plan = settings.membershipPlans.find((p) => p.name === paymentForMember.plan);
        setAmount(plan ? plan.price.toString() : "3000");
      }
      setInstallmentIndex((paymentForMember.installments?.length || 0) + 1);
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].id);
      setAmount(members[0].due > 0 ? members[0].due.toString() : "3000");
      setInstallmentIndex((members[0].installments?.length || 0) + 1);
    }
  }, [paymentForMember, members, settings]);

  if (!isRecordPaymentOpen && !paymentForMember) return null;

  const handleClose = () => {
    setIsRecordPaymentOpen(false);
    setPaymentForMember(null);
  };

  const handleMemberChange = (id: string) => {
    setSelectedMemberId(id);
    const m = members.find((x) => x.id === id);
    if (m) {
      setAmount(m.due > 0 ? m.due.toString() : "3000");
      setInstallmentIndex((m.installments?.length || 0) + 1);
    }
  };

  const currentMember = members.find((m) => m.id === selectedMemberId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const paidAmount = parseFloat(amount);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }

    const memberName = currentMember?.name || "Member";

    recordPayment({
      memberId: selectedMemberId,
      member: memberName,
      date,
      method,
      amount: paidAmount,
      category,
      installmentNumber: installmentIndex,
      notes: notes.trim() || `${category} Fee via ${method}`,
    });

    toast.success(
      `Recorded ${settings.currencySymbol}${paidAmount.toLocaleString("en-IN")} via ${method} for ${memberName}!`
    );
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-soft text-accent-foreground">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Record Payment & Generate Invoice</h2>
              <p className="text-xs text-muted-foreground">Recognize collected funds & update member ledger</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Select Member *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-emerald transition"
              required
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.plan} · {m.phone}) {m.due > 0 ? `[Due: ${settings.currencySymbol}${m.due}]` : "[Paid]"}
                </option>
              ))}
            </select>
          </div>

          {/* Member Due Context Banner */}
          {currentMember && (
            <div className="rounded-xl border border-border bg-canvas p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Plan Fee:</span>
                <span className="font-mono font-bold text-foreground">{settings.currencySymbol}{currentMember.planPrice.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previously Paid:</span>
                <span className="font-mono font-bold text-emerald">{settings.currencySymbol}{currentMember.collectedAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="text-muted-foreground">Outstanding Pending Due:</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {settings.currencySymbol}{currentMember.due.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          )}

          {/* Amount & Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Amount ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                min={1}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2000"
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm font-mono font-bold text-foreground outline-none focus:border-emerald transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-emerald transition"
              >
                <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Cash">Cash at Counter</option>
                <option value="Card">Debit / Credit Card</option>
                <option value="Bank">Direct Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Payment Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-emerald transition"
              >
                <option value="Membership">Membership Pass</option>
                <option value="Personal Training">Personal Training</option>
                <option value="Registration">Admission / Registration</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm font-mono text-foreground outline-none focus:border-emerald transition"
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Payment Notes & Ref Number
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UPI Ref #4829104, Installment 2 of 3"
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-sm text-foreground outline-none focus:border-emerald transition"
            />
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-foreground text-background px-5 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              Confirm & Issue Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
