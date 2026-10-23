import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Check, Layers, IndianRupee, Clock, Award } from "lucide-react";
import { useGymStore, MembershipPlan } from "../../lib/gym-store";
import { toast } from "sonner";

interface PlanEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: MembershipPlan | null;
}

const COMMON_PERKS_SUGGESTIONS = [
  "Unlimited Gym & Cardio Floor Access",
  "Free Locker & Shower Facilities",
  "1 Complimentary Personal Training Session",
  "Custom Diet & Nutrition Consultation",
  "Group Yoga, Zumba & CrossFit Classes",
  "Sauna & Steam Bath Access",
  "Body Composition & InBody Assessment",
  "Guest Pass (1/Month)",
  "PeakRep Member Mobile App Access",
];

export const PlanEditorModal: React.FC<PlanEditorModalProps> = ({
  isOpen,
  onClose,
  planToEdit,
}) => {
  const { addPlan, updatePlan, settings } = useGymStore();

  const [name, setName] = useState("");
  const [type, setType] = useState("Standard Pass");
  const [durationMonths, setDurationMonths] = useState(3);
  const [price, setPrice] = useState(6000);
  const [perks, setPerks] = useState<string[]>([]);
  const [newPerkInput, setNewPerkInput] = useState("");
  const [isTopSeller, setIsTopSeller] = useState(false);

  useEffect(() => {
    if (planToEdit) {
      setName(planToEdit.name);
      setType(planToEdit.type || "Standard Pass");
      setDurationMonths(planToEdit.durationMonths);
      setPrice(planToEdit.price);
      setPerks(planToEdit.perks || []);
      setIsTopSeller(
        planToEdit.type === "VIP Pass" ||
          planToEdit.name.toLowerCase().includes("vip") ||
          planToEdit.name.toLowerCase().includes("pro"),
      );
    } else {
      setName("");
      setType("Standard Pass");
      setDurationMonths(3);
      setPrice(6000);
      setPerks([
        "Unlimited Gym & Cardio Floor Access",
        "Free Locker & Shower Facilities",
        "1 Complimentary PT Session",
      ]);
      setIsTopSeller(false);
    }
    setNewPerkInput("");
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTypeChange = (newType: string) => {
    setType(newType);
    if (newType === "Annual Pass") setDurationMonths(12);
    else if (newType === "Semi-Annual Pass") setDurationMonths(6);
    else if (newType === "Quarterly Pass") setDurationMonths(3);
    else if (newType === "Monthly Pass") setDurationMonths(1);
    else if (newType === "VIP Pass") setIsTopSeller(true);
  };

  const handleAddPerk = (perkText?: string) => {
    const textToAdd = (perkText || newPerkInput).trim();
    if (!textToAdd) return;
    if (perks.includes(textToAdd)) {
      toast.info("Perk already included in plan");
      return;
    }
    setPerks([...perks, textToAdd]);
    setNewPerkInput("");
  };

  const handleRemovePerk = (index: number) => {
    setPerks(perks.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    if (price <= 0) {
      toast.error("Price must be greater than 0");
      return;
    }
    if (durationMonths <= 0) {
      toast.error("Duration must be at least 1 month");
      return;
    }

    const finalType = isTopSeller && type === "Standard Pass" ? "VIP Pass" : type.trim();

    if (planToEdit) {
      updatePlan(planToEdit.id, {
        name: name.trim(),
        type: finalType,
        durationMonths,
        price,
        perks: perks.length > 0 ? perks : ["General Gym Access"],
      });
      toast.success(`Updated "${name.trim()}" membership plan successfully`);
    } else {
      addPlan({
        name: name.trim(),
        type: finalType,
        durationMonths,
        price,
        perks: perks.length > 0 ? perks : ["General Gym Access"],
      });
      toast.success(`Created "${name.trim()}" membership plan successfully`);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Glow */}
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 border border-brand/25 text-brand shadow-xs">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                {planToEdit ? "Edit Membership Plan" : "Create New Membership Plan"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Configure pricing, billing duration, and included perks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Plan Name & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Plan Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Annual Elite Pro, 3-Month Transformation"
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Plan Category / Badge
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option value="Standard Pass">Standard Pass</option>
                <option value="Annual Pass">Annual Pass (12 Months)</option>
                <option value="Semi-Annual Pass">Semi-Annual Pass (6 Months)</option>
                <option value="Quarterly Pass">Quarterly Pass (3 Months)</option>
                <option value="Monthly Pass">Monthly Pass (1 Month)</option>
                <option value="VIP Pass">VIP Platinum Pass</option>
                <option value="Student Pass">Student Pass</option>
                <option value="Couple Pass">Couple Pass</option>
                <option value="Personal Training Package">Personal Training Package</option>
              </select>
            </div>
          </div>

          {/* Duration & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-brand" />
                Duration (Months) <span className="text-destructive">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="60"
                required
                value={durationMonths}
                onChange={(e) => setDurationMonths(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1">
                <IndianRupee className="h-3.5 w-3.5 text-brand" />
                Fee Amount ({settings.currencySymbol}) <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                  {settings.currencySymbol}
                </span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  required
                  value={price}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-border bg-background pl-8 pr-3.5 py-2.5 text-sm font-bold font-mono focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground font-mono">
                ~ {settings.currencySymbol}
                {Math.round(price / Math.max(1, durationMonths)).toLocaleString("en-IN")}/month
              </p>
            </div>
          </div>

          {/* Featured / Popular Tier Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-background/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand/10 text-brand">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Featured / Popular Tier</p>
                <p className="text-[11px] text-muted-foreground">
                  Highlights plan card with glow and 'Featured Tier' badge
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              id="isTopSellerToggle"
              checked={isTopSeller}
              onChange={(e) => setIsTopSeller(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand focus:ring-brand cursor-pointer"
            />
          </div>

          {/* Perks Management */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-brand" />
                Included Perks & Privileges ({perks.length})
              </span>
              <span className="text-[11px] text-muted-foreground">
                Displayed on membership comparison cards
              </span>
            </label>

            {/* Current Perks List */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {perks.map((perk, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border/80 bg-background/80 px-3 py-2 text-xs text-foreground group hover:border-brand/40 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{perk}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePerk(index)}
                    className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                    title="Remove perk"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {perks.length === 0 && (
                <p className="text-xs text-muted-foreground py-2 text-center italic">
                  No perks added yet. Type below or select quick suggestions.
                </p>
              )}
            </div>

            {/* Add Custom Perk Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPerkInput}
                onChange={(e) => setNewPerkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPerk();
                  }
                }}
                placeholder="Type a custom perk (e.g. Free 1kg Whey Protein shaker)..."
                className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => handleAddPerk()}
                className="flex items-center gap-1 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent/80 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1.5 tracking-wider">
                Quick Suggestions:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PERKS_SUGGESTIONS.filter((s) => !perks.includes(s))
                  .slice(0, 5)
                  .map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleAddPerk(sug)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-card/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-brand hover:text-foreground transition-colors"
                    >
                      <Plus className="h-2.5 w-2.5 text-brand" />
                      {sug}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/25 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              <Check className="h-4 w-4" />
              {planToEdit ? "Save Plan Changes" : "Create Plan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
