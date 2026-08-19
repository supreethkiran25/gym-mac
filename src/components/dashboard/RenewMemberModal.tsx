import React, { useState, useEffect } from "react";
import { X, RotateCw, Calendar, CreditCard, Tag, CheckCircle2, QrCode } from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";
import { toast } from "sonner";

export function RenewMemberModal() {
  const {
    isRenewModalOpen,
    setIsRenewModalOpen,
    selectedMemberForRenewal,
    setSelectedMemberForRenewal,
    renewMember,
    extendMembershipDays,
    settings,
    openUPIQRModal,
  } = useGymStore();

  const [selectedPlan, setSelectedPlan] = useState("");
  const [durationMonths, setDurationMonths] = useState(1);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Cash" | "Card" | "Bank">("UPI");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"renew" | "extend">("renew");
  const [extendDays, setExtendDays] = useState(15);
  const [extendReason, setExtendReason] = useState("Loyalty grace period");

  useEffect(() => {
    if (selectedMemberForRenewal) {
      const planObj =
        settings.membershipPlans.find((p) => p.name === selectedMemberForRenewal.plan) ||
        settings.membershipPlans[0];
      setSelectedPlan(planObj?.name || "Monthly Flex");
      setDurationMonths(planObj?.durationMonths || 1);
      const rawPrice = planObj?.price || 3000;
      setPaidAmount(rawPrice);
      setDiscountPercent(0);
    }
  }, [selectedMemberForRenewal, settings.membershipPlans]);

  if (!isRenewModalOpen || !selectedMemberForRenewal) return null;

  const currentPlanObj = settings.membershipPlans.find((p) => p.name === selectedPlan);
  const basePrice = currentPlanObj ? currentPlanObj.price : 3000;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handlePlanChange = (name: string) => {
    setSelectedPlan(name);
    const p = settings.membershipPlans.find((plan) => plan.name === name);
    if (p) {
      setDurationMonths(p.durationMonths);
      const d = Math.round((p.price * discountPercent) / 100);
      setPaidAmount(Math.max(0, p.price - d));
    }
  };

  const handleDiscountChange = (disc: number) => {
    setDiscountPercent(disc);
    const d = Math.round((basePrice * disc) / 100);
    setPaidAmount(Math.max(0, basePrice - d));
  };

  const handleClose = () => {
    setIsRenewModalOpen(false);
    setSelectedMemberForRenewal(null);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewMember(
      selectedMemberForRenewal.id,
      durationMonths,
      selectedPlan,
      paidAmount,
      paymentMethod
    );
    toast.success(`Successfully renewed membership for ${selectedMemberForRenewal.name}!`);
    handleClose();
  };

  const handleExtendSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    extendMembershipDays(selectedMemberForRenewal.id, extendDays, extendReason);
    toast.success(`Added +${extendDays} days grace period to ${selectedMemberForRenewal.name}!`);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <RotateCw className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Membership Renewals Hub</h3>
              <p className="text-xs text-muted-foreground">
                Member: <strong className="text-foreground">{selectedMemberForRenewal.name}</strong> ({selectedMemberForRenewal.phone})
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Switcher: Full Renewal vs Grace Period Extension */}
        <div className="flex rounded-xl bg-canvas p-1 border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("renew")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "renew" ? "bg-surface text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Renew Plan Subscription
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("extend")}
            className={`flex-1 py-1.5 rounded-lg font-semibold transition ${
              activeTab === "extend" ? "bg-surface text-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Add Grace Days (+7/+15/+30)
          </button>
        </div>

        {activeTab === "renew" ? (
          <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
            {/* Current Status Preview */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-canvas border border-border">
              <div>
                <span className="text-muted-foreground block text-[11px]">Current Plan & Expiry</span>
                <span className="font-bold text-foreground">
                  {selectedMemberForRenewal.plan} · Expired/Expires: {selectedMemberForRenewal.expiry}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                {selectedMemberForRenewal.status}
              </span>
            </div>

            {/* Select Renewal Plan */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Select Renewal Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs font-semibold focus:border-foreground focus:outline-hidden"
              >
                {settings.membershipPlans.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} ({p.durationMonths} Mo) — {settings.currencySymbol}
                    {p.price.toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>

            {/* Discount Shortcuts */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground flex items-center justify-between">
                <span>Renewal Discount</span>
                {discountPercent > 0 && (
                  <span className="text-emerald font-bold">
                    -{discountPercent}% ({settings.currencySymbol}{discountAmount.toLocaleString("en-IN")})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                {[0, 5, 10, 15, 20].map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => handleDiscountChange(d)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition ${
                      discountPercent === d
                        ? "bg-foreground text-background border-foreground"
                        : "bg-canvas border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {d === 0 ? "None" : `${d}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount & Method */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">
                  Collecting Now ({settings.currencySymbol})
                </label>
                <input
                  type="number"
                  min="0"
                  max={finalPrice}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono font-bold focus:border-foreground focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs focus:border-foreground focus:outline-hidden"
                >
                  <option value="UPI">UPI / Dynamic QR</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card / POS</option>
                  <option value="Bank">Net Banking / Transfer</option>
                </select>
              </div>
            </div>

            {/* Dynamic UPI Trigger shortcut */}
            {paymentMethod === "UPI" && (
              <button
                type="button"
                onClick={() => openUPIQRModal(paidAmount, selectedMemberForRenewal.name, `Renewal: ${selectedPlan}`)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold"
              >
                <QrCode className="h-4 w-4" />
                <span>Show Member Dynamic UPI QR Code ({settings.currencySymbol}{paidAmount.toLocaleString("en-IN")})</span>
              </button>
            )}

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
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
              >
                Confirm & Activate Renewal
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleExtendSubmit} className="space-y-4 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              Grant complimentary grace days (e.g. for travel, illness, or member retention). Expiry date will be pushed
              forward without creating an invoice.
            </p>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Grace Period Duration</label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 15, 30, 60].map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setExtendDays(days)}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      extendDays === days
                        ? "bg-foreground text-background border-foreground"
                        : "bg-canvas border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    +{days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Extension Reason / Authorization</label>
              <input
                type="text"
                value={extendReason}
                onChange={(e) => setExtendReason(e.target.value)}
                placeholder="Reason for extension"
                required
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs focus:border-foreground focus:outline-hidden"
              />
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
                className="px-5 py-2 rounded-xl bg-foreground text-background font-bold transition hover:opacity-90 shadow-md"
              >
                Apply +{extendDays} Grace Days
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
