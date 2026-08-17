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
} from "lucide-react";
import { useGymStore, MembershipPlan } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/plans")({
  component: MembershipPlansMatrix,
});

function MembershipPlansMatrix() {
  const { settings, members, setIsAddMemberOpen } = useGymStore();

  const totalActive = members.filter((m) => m.status === "Active").length;
  const totalExpiring = members.filter((m) => m.status === "Expiring").length;
  const totalFrozen = members.filter((m) => m.status === "Frozen").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Membership Matrix & Upgrades</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {settings.membershipPlans.length} Tier Structures
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Visual package comparison, active member distribution, and upgrade conversion metrics.
          </p>
        </div>

        <button
          onClick={() => {
            setIsAddMemberOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
        >
          <Plus className="h-4 w-4" /> Enroll New Member
        </button>
      </div>

      {/* Aggregate Distribution Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Active Memberships</span>
          <p className="text-2xl font-bold font-mono text-emerald">{totalActive}</p>
          <p className="text-[11px] text-muted-foreground">Across all tiers</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Expiring This Week</span>
          <p className="text-2xl font-bold font-mono text-warn">{totalExpiring}</p>
          <p className="text-[11px] text-muted-foreground">Renewal nudges queued</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Frozen / Paused Passes</span>
          <p className="text-2xl font-bold font-mono text-muted-foreground">{totalFrozen}</p>
          <p className="text-[11px] text-muted-foreground">Travel / Medical holds</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Upgrade Opportunities</span>
          <p className="text-2xl font-bold font-mono text-purple-600 dark:text-purple-400">
            {members.filter((m) => m.attendanceRate >= 70).length}
          </p>
          <p className="text-[11px] text-muted-foreground">High-frequency members</p>
        </div>
      </div>

      {/* Visual Comparison Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {settings.membershipPlans.map((plan) => {
          const membersInPlan = members.filter((m) => m.plan === plan.name);
          const isPopular = plan.type === "VIP Pass" || plan.name.includes("Pro");

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-2xl border p-6 transition hover:shadow-md ${
                isPopular
                  ? "border-emerald/50 bg-emerald-soft/10 ring-1 ring-emerald/30"
                  : "border-border bg-surface"
              }`}
            >
              {isPopular && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-emerald px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Top Seller
                </span>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {plan.type}
                  </span>
                  <span className="text-xs font-mono font-medium text-muted-foreground">
                    {plan.durationMonths} Mo
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground mt-2">{plan.name}</h3>
                <p className="text-2xl font-bold font-mono text-foreground mt-1">
                  {settings.currencySymbol}{plan.price.toLocaleString("en-IN")}
                </p>

                {/* Vitals breakdown */}
                <div className="mt-4 rounded-xl border border-border bg-canvas p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrolled Members:</span>
                    <span className="font-mono font-bold text-foreground">{membersInPlan.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upgrade Potential:</span>
                    <span className="font-mono font-semibold text-purple-600 dark:text-purple-400">
                      {members.filter((m) => m.plan === plan.name && m.attendanceRate >= 70).length} candidates
                    </span>
                  </div>
                </div>

                {/* Perks Checklist */}
                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                    Included Perks
                  </p>
                  <ul className="space-y-2 text-xs">
                    {plan.perks.map((perk, i) => (
                      <li key={i} className="flex items-start gap-2 text-foreground">
                        <Check className="h-3.5 w-3.5 text-emerald shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
                >
                  Enroll in {plan.name}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
