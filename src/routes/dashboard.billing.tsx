import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Receipt, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useGymStore } from "../lib/gym-store";

export const Route = createFileRoute("/dashboard/billing")({
  component: Billing,
});

function Billing() {
  const { members, settings } = useGymStore();

  const activeMembersCount = members.filter((m) => m.status === "Active" || m.status === "Expiring").length;
  const currentMonthBill = activeMembersCount * settings.perMemberRate;
  const estNextMonthBill = (activeMembersCount + 8) * settings.perMemberRate;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SaaS Subscription & Invoices</h1>
          <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
            Active Tier
          </span>
        </div>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Transparent usage-based pricing at ₹{settings.perMemberRate} per active member / month.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-6 md:col-span-2 space-y-4">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Current Billing Cycle</p>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl sm:text-5xl font-bold">
              {settings.currencySymbol}
              {currentMonthBill.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-muted-foreground">/ month</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Calculated on {activeMembersCount} active/expiring members × {settings.currencySymbol}
            {settings.perMemberRate} rate
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald">
            <CheckCircle2 className="h-4 w-4" />
            <span>Active plan · Next auto-settlement on 1st of next month</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-3">
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Estimated Next Cycle</p>
          <p className="font-mono text-3xl font-bold">
            {settings.currencySymbol}
            {estNextMonthBill.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground">
            Projected on ~{activeMembersCount + 8} active members
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Platform Subscription Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-canvas text-left uppercase text-muted-foreground font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-5">Billing Period</th>
                <th className="py-3 px-5">Active Volume</th>
                <th className="py-3 px-5">Amount</th>
                <th className="py-3 px-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                ["1 May 2026", "April Usage · 148 active members", "₹1,480", "Paid"],
                ["1 Apr 2026", "March Usage · 141 active members", "₹1,410", "Paid"],
                ["1 Mar 2026", "February Usage · 132 active members", "₹1,320", "Paid"],
                ["1 Feb 2026", "January Usage · 124 active members", "₹1,240", "Paid"],
              ].map(([d, l, a, s]) => (
                <tr key={d} className="hover:bg-muted/40 transition">
                  <td className="px-5 py-3.5 text-muted-foreground font-mono">{d}</td>
                  <td className="px-5 py-3.5 font-medium text-foreground">{l}</td>
                  <td className="px-5 py-3.5 font-mono font-semibold">{a}</td>
                  <td className="px-5 py-3.5 text-right">
                    <span className="inline-flex rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs text-accent-foreground font-semibold">
                      {s}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}