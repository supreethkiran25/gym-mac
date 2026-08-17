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
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
    settings,
  } = useGymStore();

  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"UPI" | "Cash" | "Card" | "Bank">("UPI");
  const [category, setCategory] = useState<"Membership" | "Personal Training" | "Merchandise" | "Registration">("Membership");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (paymentForMember) {
      setSelectedMemberId(paymentForMember.id);
      if (paymentForMember.due > 0) {
        setAmount(paymentForMember.due.toString());
      } else {
        const plan = settings.membershipPlans.find((p) => p.name === paymentForMember.plan);
        setAmount(plan ? plan.price.toString() : "2800");
      }
    } else if (members.length > 0) {
      setSelectedMemberId(members[0].id);
      setAmount(members[0].due > 0 ? members[0].due.toString() : "2800");
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
      setAmount(m.due > 0 ? m.due.toString() : "2800");
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
    const paymentStatus =
      currentMember && currentMember.due > paidAmount ? "Partial" : "Paid";

    recordPayment({
      memberId: selectedMemberId,
      member: memberName,
      date,
      method,
      amount: paidAmount,
      category,
      status: paymentStatus,
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
              <p className="text-xs text-muted-foreground">Single-click payment settlement & receipt</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Select Member *
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => handleMemberChange(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.plan} ({m.due > 0 ? `Outstanding: ${settings.currencySymbol}${m.due}` : "No dues"})
                </option>
              ))}
            </select>
          </div>

          {/* Payment Category Pills */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Fee Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["Membership", "Personal Training", "Merchandise", "Registration"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 px-2 rounded-lg border text-center text-xs transition truncate ${
                    category === cat
                      ? "border-foreground bg-foreground text-background font-semibold"
                      : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Amount ({settings.currencySymbol}) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald font-mono text-base font-bold transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
              >
                <option value="UPI">⚡ UPI / GPay / PhonePe</option>
                <option value="Cash">💵 Cash in Hand</option>
                <option value="Card">💳 Credit / Debit Card</option>
                <option value="Bank">🏛️ Bank Transfer / NEFT</option>
              </select>
            </div>
          </div>

          {/* Date & Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Transaction Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Receipt Note / Txn Ref
              </label>
              <input
                type="text"
                placeholder="e.g. UPI Ref #90219"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-border bg-canvas px-4 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-foreground px-5 py-2 text-xs font-semibold text-background hover:opacity-90 transition"
            >
              Record & Settle Balance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
