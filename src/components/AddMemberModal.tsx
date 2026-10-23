import React, { useState } from "react";
import { X, UserPlus, Calendar, Phone, Mail, CreditCard, Check } from "lucide-react";
import { useGymStore, MemberStatus } from "../lib/gym-store";
import { toast } from "sonner";

export function AddMemberModal() {
  const { isAddMemberOpen, setIsAddMemberOpen, addMember, settings } = useGymStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState(settings.membershipPlans[0]?.id || "plan-1");
  const [paymentOption, setPaymentOption] = useState<"Full" | "Partial" | "Later">("Full");
  const [initialPaidAmount, setInitialPaidAmount] = useState("2000");
  const [notes, setNotes] = useState("");
  const [healthGoal, setHealthGoal] = useState("General Fitness");

  if (!isAddMemberOpen) return null;

  const currentPlan = settings.membershipPlans.find((p) => p.id === selectedPlanId) ||
    settings.membershipPlans[0] || {
      id: "default",
      name: "Monthly Flex",
      price: 3000,
      durationMonths: 1,
    };

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

    const planPrice = currentPlan.price;
    let initialPaid = 0;
    let dueAmount = 0;

    if (paymentOption === "Full") {
      initialPaid = planPrice;
      dueAmount = 0;
    } else if (paymentOption === "Partial") {
      initialPaid = parseFloat(initialPaidAmount) || 0;
      dueAmount = Math.max(0, planPrice - initialPaid);
    } else {
      initialPaid = 0;
      dueAmount = planPrice;
    }

    const status: MemberStatus = dueAmount > 0 ? "Partial" : "Active";
    const today = new Date().toISOString().split("T")[0];
    const expiry = calculateExpiry(currentPlan.durationMonths);

    addMember({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      plan: currentPlan.name,
      planPrice,
      joinDate: today,
      expiry,
      status,
      due: dueAmount,
      healthGoal,
      notes: notes.trim(),
    });

    toast.success(`Enrolled ${name} in ${currentPlan.name}!`);
    setIsAddMemberOpen(false);

    // Reset Form
    setName("");
    setPhone("+91 ");
    setEmail("");
    setPaymentOption("Full");
    setNotes("");
    setHealthGoal("General Fitness");
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
              <h2 className="text-base font-semibold text-foreground">Enroll New Member</h2>
              <p className="text-xs text-muted-foreground">
                Register membership and configure initial payment schedule
              </p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Member Name */}
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground font-medium outline-none focus:border-emerald transition"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">
                Phone Number (WhatsApp) *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-emerald transition"
              />
            </div>
            <div>
              <label className="block font-semibold text-muted-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald transition"
              />
            </div>
          </div>

          {/* Plan Selection */}
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Membership Plan *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground font-semibold outline-none focus:border-emerald transition"
            >
              {settings.membershipPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {settings.currencySymbol}
                  {plan.price.toLocaleString("en-IN")} ({plan.durationMonths} Mo)
                </option>
              ))}
            </select>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block font-semibold text-muted-foreground mb-1">
              Fitness Goal & Primary Focus
            </label>
            <input
              type="text"
              placeholder="e.g. Hypertrophy, Strength, Weight Loss"
              value={healthGoal}
              onChange={(e) => setHealthGoal(e.target.value)}
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald transition"
            />
          </div>

          {/* Payment Terms Option */}
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="block font-semibold text-muted-foreground">
              Initial Payment Terms
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentOption("Full")}
                className={`rounded-xl border p-2.5 text-center transition ${
                  paymentOption === "Full"
                    ? "border-emerald bg-emerald-soft text-accent-foreground font-semibold"
                    : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="font-bold">Full Payment</div>
                <div className="text-[10px] mt-0.5 opacity-80">
                  {settings.currencySymbol}
                  {currentPlan.price.toLocaleString("en-IN")}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption("Partial")}
                className={`rounded-xl border p-2.5 text-center transition ${
                  paymentOption === "Partial"
                    ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-semibold"
                    : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="font-bold">Installment</div>
                <div className="text-[10px] mt-0.5 opacity-80">Deposit now</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentOption("Later")}
                className={`rounded-xl border p-2.5 text-center transition ${
                  paymentOption === "Later"
                    ? "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold"
                    : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="font-bold">Pay Later</div>
                <div className="text-[10px] mt-0.5 opacity-80">Zero down</div>
              </button>
            </div>

            {paymentOption === "Partial" && (
              <div className="rounded-xl border border-border bg-canvas p-3 space-y-2 mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-semibold">
                    Initial Deposit Amount ({settings.currencySymbol}):
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={currentPlan.price - 1}
                    value={initialPaidAmount}
                    onChange={(e) => setInitialPaidAmount(e.target.value)}
                    className="w-28 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-mono font-bold text-foreground text-right outline-none focus:border-emerald"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground font-mono">
                  <span>Remaining Pending Due:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {settings.currencySymbol}
                    {Math.max(
                      0,
                      currentPlan.price - (parseFloat(initialPaidAmount) || 0),
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAddMemberOpen(false)}
              className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-foreground text-background px-5 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
