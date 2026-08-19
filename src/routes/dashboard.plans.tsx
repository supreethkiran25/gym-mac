import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Layers,
  Check,
  Plus,
  Users,
  AlertTriangle,
  PauseCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Edit2,
  Trash2,
  Copy,
  Lock,
  Award,
  ArrowRight,
} from "lucide-react";
import { useGymStore, MembershipPlan } from "../lib/gym-store";
import { PlanEditorModal } from "../components/dashboard/PlanEditorModal";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/plans")({
  component: MembershipPlansMatrix,
});

function MembershipPlansMatrix() {
  const {
    settings,
    members,
    currentUser,
    deletePlan,
    addPlan,
    requestRoleSwitch,
    setIsAddMemberOpen,
  } = useGymStore();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<MembershipPlan | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const isAdmin = currentUser.role === "admin";

  const totalActive = members.filter((m) => m.status === "Active").length;
  const totalExpiring = members.filter((m) => m.status === "Expiring").length;
  const totalFrozen = members.filter((m) => m.status === "Frozen").length;
  const totalHighAttendance = members.filter((m) => m.attendanceRate >= 70).length;

  const handleOpenCreate = () => {
    setPlanToEdit(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (plan: MembershipPlan) => {
    setPlanToEdit(plan);
    setIsEditorOpen(true);
  };

  const handleDuplicate = (plan: MembershipPlan) => {
    addPlan({
      name: `${plan.name} (Copy)`,
      type: plan.type,
      durationMonths: plan.durationMonths,
      price: plan.price,
      perks: [...plan.perks],
    });
    toast.success(`Duplicated plan as "${plan.name} (Copy)"`);
  };

  const handleDelete = (plan: MembershipPlan) => {
    const membersInPlan = members.filter((m) => m.plan === plan.name);
    if (membersInPlan.length > 0) {
      const confirmDelete = window.confirm(
        `Warning: There are ${membersInPlan.length} active member(s) currently enrolled in "${plan.name}". Are you sure you want to delete this plan?`
      );
      if (!confirmDelete) return;
    } else {
      const confirmDelete = window.confirm(`Delete plan "${plan.name}"?`);
      if (!confirmDelete) return;
    }

    deletePlan(plan.id);
    toast.success(`Deleted plan "${plan.name}"`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Membership Plans & Pricing Matrix
            </h1>
            <span className="rounded-full bg-brand-soft text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-bold font-mono">
              {settings.membershipPlans.length} Active Tiers
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure subscription tiers, fee structures, included member privileges, and upgrade pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand/20 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Plan</span>
          </button>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-accent transition shadow-2xs"
          >
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>Enroll Member</span>
          </button>
        </div>
      </div>

      {/* Aggregate Distribution Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground">Active Enrolled Members</span>
          <p className="text-2xl font-bold font-mono text-emerald-500">{totalActive}</p>
          <p className="text-[11px] text-muted-foreground">Active subscriptions across all tiers</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground">Expiring This Week</span>
          <p className="text-2xl font-bold font-mono text-amber-500">{totalExpiring}</p>
          <p className="text-[11px] text-muted-foreground">Queued for automated renewal follow-up</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground">Frozen / Paused Passes</span>
          <p className="text-2xl font-bold font-mono text-muted-foreground">{totalFrozen}</p>
          <p className="text-[11px] text-muted-foreground">Travel / Medical temporary holds</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-1 shadow-2xs">
          <span className="text-xs font-semibold text-muted-foreground">Upgrade Opportunities</span>
          <p className="text-2xl font-bold font-mono text-brand">{totalHighAttendance}</p>
          <p className="text-[11px] text-muted-foreground">Members with &gt;70% attendance ready to upgrade</p>
        </div>
      </div>

      {/* Visual Comparison Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {settings.membershipPlans.map((plan) => {
          const membersInPlan = members.filter((m) => m.plan === plan.name);
          const isPopular = plan.type === "VIP Pass" || plan.name.toLowerCase().includes("vip") || plan.name.toLowerCase().includes("pro");
          const monthlyEquiv = Math.round(plan.price / Math.max(1, plan.durationMonths));

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl border p-6 transition duration-200 hover:shadow-xl ${
                isPopular
                  ? "border-brand/40 bg-gradient-to-b from-brand/10 via-card to-card ring-1 ring-brand/30 shadow-lg shadow-brand/5"
                  : "border-border bg-card shadow-2xs hover:border-border/80"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 right-5 flex items-center gap-1 rounded-full bg-brand px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-md shadow-brand/30">
                  <Award className="h-3 w-3" />
                  <span>Featured Tier</span>
                </div>
              )}

              <div>
                {/* Category & Duration */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand font-mono">
                    {plan.type || "Membership"}
                  </span>
                  <span className="text-xs font-mono font-bold text-muted-foreground bg-accent px-2 py-0.5 rounded-lg border border-border">
                    {plan.durationMonths} {plan.durationMonths === 1 ? "Month" : "Months"}
                  </span>
                </div>

                {/* Name & Pricing */}
                <h3 className="text-xl font-bold text-foreground mt-3 tracking-tight">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold font-mono text-foreground">
                    {settings.currencySymbol}{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    ({settings.currencySymbol}{monthlyEquiv.toLocaleString("en-IN")}/mo)
                  </span>
                </div>

                {/* Vitals breakdown */}
                <div className="mt-4 rounded-2xl border border-border/80 bg-background/60 p-3.5 text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-brand" />
                      Enrolled Members:
                    </span>
                    <span className="font-mono font-bold text-foreground bg-accent px-2 py-0.5 rounded-md">
                      {membersInPlan.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                      Upgrade Prospects:
                    </span>
                    <span className="font-mono font-semibold text-brand">
                      {members.filter((m) => m.plan === plan.name && m.attendanceRate >= 70).length} prime
                    </span>
                  </div>
                </div>

                {/* Perks Checklist */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    Included Privileges ({plan.perks.length})
                  </p>
                  <ul className="space-y-2 text-xs">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-foreground leading-snug">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 mt-0.5">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons & Management */}
              <div className="mt-6 pt-4 border-t border-border/70 space-y-2.5">
                {/* Admin Plan Management Toolbar */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-background py-2 text-xs font-semibold text-foreground hover:bg-accent hover:border-brand/40 transition-colors"
                    title="Edit Plan pricing, perks or duration"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-brand" />
                    <span>Edit Plan</span>
                  </button>

                  <button
                    onClick={() => handleDuplicate(plan)}
                    className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    title="Duplicate this plan"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(plan)}
                    className="rounded-xl border border-border bg-background p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Enroll Member button */}
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 active:scale-[0.99] transition shadow-xs"
                >
                  <span>Enroll in {plan.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plan Editor Modal */}
      <PlanEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setPlanToEdit(null);
        }}
        planToEdit={planToEdit}
      />
    </div>
  );
}
