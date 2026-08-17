import React, { useState } from "react";
import { X, UserPlus, Calendar, Phone, Mail, CreditCard, Sparkles, Check } from "lucide-react";
import { useGymStore, MemberStatus } from "../lib/gym-store";
import { toast } from "sonner";

export function AddMemberModal() {
  const { isAddMemberOpen, setIsAddMemberOpen, addMember, settings } = useGymStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(settings.membershipPlans[0]?.id || "plan-1");
  const [paymentOption, setPaymentOption] = useState<"Full" | "Partial" | "Later">("Full");
  const [partialDue, setPartialDue] = useState("1000");
  const [notes, setNotes] = useState("");

  if (!isAddMemberOpen) return null;

  const currentPlan =
    settings.membershipPlans.find((p) => p.id === selectedPlanId) || settings.membershipPlans[0];

  // Calculate expiry
  const calculateExpiry = (durationMonths: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + durationMonths);
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter member full name");
      return;
    }

    const dueAmount =
      paymentOption === "Full"
        ? 0
        : paymentOption === "Partial"
        ? parseFloat(partialDue) || 0
        : currentPlan.price;

    const status: MemberStatus = dueAmount > 0 ? "Partial" : "Active";
    const today = new Date().toISOString().split("T")[0];
    const expiry = calculateExpiry(currentPlan.durationMonths);

    addMember({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      plan: currentPlan.name,
      joinDate: today,
      expiry,
      status,
      due: dueAmount,
      notes: notes.trim(),
    });

    toast.success(`Member ${name} enrolled in ${currentPlan.name} successfully!`);
    setIsAddMemberOpen(false);

    // Reset Form
    setName("");
    setPhone("+91 ");
    setEmail("");
    setPaymentOption("Full");
    setNotes("");
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
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Add New Member</h2>
              <p className="text-xs text-muted-foreground">Fast 2-step enrollment & access pass</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddMemberOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Streamlined Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {/* Member Name */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Aarav Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="aarav@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 outline-none focus:border-emerald transition"
              />
            </div>
          </div>

          {/* Visual Membership Plan Selector (1-Click) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Select Membership Package *
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {settings.membershipPlans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition relative ${
                      isSelected
                        ? "border-emerald bg-emerald-soft/30 ring-1 ring-emerald"
                        : "border-border bg-canvas hover:bg-muted/50"
                    }`}
                  >
                    {isSelected && (
                      <Check className="absolute top-2.5 right-2.5 h-3.5 w-3.5 text-emerald" />
                    )}
                    <span className="text-xs font-semibold text-foreground">{p.name}</span>
                    <span className="text-sm font-mono font-bold text-accent-foreground mt-0.5">
                      {settings.currencySymbol}
                      {p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {p.durationMonths} month(s) validity
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Status Segmented Control (1-Click) */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-2">
              Payment Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "Full", label: "Paid in Full", desc: "No dues pending" },
                { id: "Partial", label: "Partial Paid", desc: "Balance pending" },
                { id: "Later", label: "Pay Later", desc: "Full due logged" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentOption(opt.id as any)}
                  className={`py-2 px-2.5 rounded-xl border text-center transition ${
                    paymentOption === opt.id
                      ? "border-foreground bg-foreground text-background font-semibold"
                      : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <p className="text-xs">{opt.label}</p>
                  <p className="text-[10px] opacity-80 mt-0.5">{opt.desc}</p>
                </button>
              ))}
            </div>

            {paymentOption === "Partial" && (
              <div className="mt-3 rounded-xl border border-border bg-canvas p-3">
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Remaining Due Amount ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentPlan.price}
                  value={partialDue}
                  onChange={(e) => setPartialDue(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-mono font-semibold outline-none focus:border-emerald"
                />
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 flex justify-end gap-2 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="rounded-xl border border-border bg-canvas px-4 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-foreground px-5 py-2 text-xs font-semibold text-background hover:opacity-90 transition"
            >
              Enroll & Issue Pass
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
