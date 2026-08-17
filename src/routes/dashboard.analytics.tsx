import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
} from "lucide-react";
import { useGymStore } from "../lib/gym-store";

export const Route = createFileRoute("/dashboard/analytics")({
  component: AnalyticsDashboard,
});

const RETENTION_COHORTS = [
  { cohort: "Dec 2025", size: 45, m1: "95%", m2: "92%", m3: "88%", m4: "85%", m5: "82%" },
  { cohort: "Jan 2026", size: 52, m1: "96%", m2: "94%", m3: "90%", m4: "88%", m5: "—" },
  { cohort: "Feb 2026", size: 48, m1: "94%", m2: "90%", m3: "86%", m4: "—", m5: "—" },
  { cohort: "Mar 2026", size: 60, m1: "98%", m2: "95%", m3: "—", m4: "—", m5: "—" },
  { cohort: "Apr 2026", size: 65, m1: "97%", m2: "—", m3: "—", m4: "—", m5: "—" },
];

const TRAINER_REVENUE_SHARE = [
  { name: "Coach Vikram", value: 145000, color: "#10b981" },
  { name: "Coach Rohit", value: 115000, color: "#3b82f6" },
  { name: "Coach Ananya", value: 85000, color: "#a855f7" },
  { name: "Floor Group Classes", value: 65000, color: "#f59e0b" },
];

function AnalyticsDashboard() {
  const { members, payments, settings } = useGymStore();

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === "Active" || m.status === "Expiring").length;
  const retentionRate = Math.round((activeMembers / (totalMembers || 1)) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Analytics & Member Retention</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {retentionRate}% 90-Day Retention
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Cohort retention curves, trainer performance yields, and churn mitigation telemetry.
          </p>
        </div>
      </div>

      {/* Retention KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Overall Member Retention</span>
          <p className="text-3xl font-bold font-mono tracking-tight text-emerald">{retentionRate}%</p>
          <p className="text-xs text-muted-foreground">+3.2% above fitness industry average (78%)</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Average Member Lifetime Value (LTV)</span>
          <p className="text-3xl font-bold font-mono tracking-tight text-foreground">
            {settings.currencySymbol}34,500
          </p>
          <p className="text-xs text-emerald flex items-center gap-1 font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" /> +18.5% year-over-year
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Monthly Churn Probability</span>
          <p className="text-3xl font-bold font-mono tracking-tight text-warn">4.2%</p>
          <p className="text-xs text-muted-foreground">Low risk based on current floor attendance rate</p>
        </div>
      </div>

      {/* Cohort Retention Table */}
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold tracking-tight">Member Cohort Retention Matrix</h3>
          <p className="text-xs text-muted-foreground">
            Percentage of members active across subsequent months after initial enrollment
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-canvas text-left uppercase text-muted-foreground font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Cohort Month</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">Month 1</th>
                <th className="py-3 px-4">Month 2</th>
                <th className="py-3 px-4">Month 3</th>
                <th className="py-3 px-4">Month 4</th>
                <th className="py-3 px-4">Month 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {RETENTION_COHORTS.map((row) => (
                <tr key={row.cohort} className="hover:bg-muted/40 transition">
                  <td className="py-3 px-4 font-semibold text-foreground">{row.cohort}</td>
                  <td className="py-3 px-4 font-mono">{row.size} members</td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald">{row.m1}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald">{row.m2}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-emerald">{row.m3}</td>
                  <td className="py-3 px-4 font-mono font-medium">{row.m4}</td>
                  <td className="py-3 px-4 font-mono font-medium">{row.m5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trainer Performance & Revenue Contribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Trainer PT Revenue Yield</h3>
            <p className="text-xs text-muted-foreground">Personal Training revenue generated per coach</p>
          </div>

          <div className="space-y-3 pt-2">
            {TRAINER_REVENUE_SHARE.map((item) => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold">{item.name}</span>
                  <span className="font-mono font-bold">
                    {settings.currencySymbol}{item.value.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(item.value / 160000) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Member Acquisition Channels</h3>
            <p className="text-xs text-muted-foreground">Source breakdown for active member registrations</p>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-canvas">
              <span className="font-medium">Direct Walk-Ins & Word of Mouth</span>
              <span className="font-mono font-bold text-emerald">54% (82 members)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-canvas">
              <span className="font-medium">Google Maps & Local Search</span>
              <span className="font-mono font-bold text-blue-500">28% (42 members)</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl border border-border bg-canvas">
              <span className="font-medium">Instagram & Social Campaigns</span>
              <span className="font-mono font-bold text-purple-500">18% (28 members)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
