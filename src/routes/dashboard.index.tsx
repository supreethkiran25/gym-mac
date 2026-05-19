import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: Overview,
});

const revenueData = [
  { m: "Jun", v: 312000 },
  { m: "Jul", v: 348000 },
  { m: "Aug", v: 372000 },
  { m: "Sep", v: 410000 },
  { m: "Oct", v: 446000 },
  { m: "Nov", v: 482000 },
];

const stats = [
  { label: "Total members", value: "1,412", delta: "+42", up: true },
  { label: "Active members", value: "1,284", delta: "+38", up: true },
  { label: "Expired", value: "128", delta: "+6", up: false },
  { label: "Pending dues", value: "₹84,200", delta: "12 mem.", up: false, tone: "warn" as const },
  { label: "Monthly revenue", value: "₹4.82L", delta: "+12.4%", up: true },
  { label: "Annual revenue", value: "₹46.2L", delta: "+18%", up: true },
  { label: "Retention", value: "91%", delta: "+2.1%", up: true },
  { label: "Renewals due", value: "37", delta: "this week", up: false, tone: "warn" as const },
];

function Overview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="display text-4xl">Good morning, Karan.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's how Iron House is doing today — Tuesday, May 19.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="mt-2 font-serif text-3xl tracking-tight">{s.value}</p>
            <p
              className={`mt-1 inline-flex items-center gap-1 text-xs ${
                s.tone === "warn"
                  ? "text-warn"
                  : s.up
                    ? "text-emerald"
                    : "text-muted-foreground"
              }`}
            >
              {s.up ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {s.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Revenue</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <span className="font-serif text-2xl">₹24.7L</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.58 0.14 162)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="oklch(0.58 0.14 162)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.92 0.006 250)" vertical={false} />
                <XAxis dataKey="m" tickLine={false} axisLine={false} className="text-xs" />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid oklch(0.92 0.006 250)",
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`₹${(v / 1000).toFixed(0)}k`, "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="oklch(0.58 0.14 162)"
                  strokeWidth={2}
                  fill="url(#g)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-medium">Upcoming renewals</h2>
          <ul className="mt-4 divide-y divide-border">
            {[
              ["Aarav Sharma", "Monthly", "2 days"],
              ["Mehul Patel", "Quarterly", "4 days"],
              ["Riya Kapoor", "Annual", "6 days"],
              ["Kabir Nair", "Half-yearly", "1 week"],
              ["Tara Iyer", "Monthly", "1 week"],
            ].map(([n, t, d]) => (
              <li key={n} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p>{n}</p>
                  <p className="text-xs text-muted-foreground">{t}</p>
                </div>
                <span className="text-xs text-muted-foreground">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <QuickAction title="Add member" desc="Create a new gym membership." />
        <QuickAction title="Record payment" desc="Log a full or partial payment." />
        <QuickAction title="Send reminders" desc="Nudge members with pending dues." />
      </div>
    </div>
  );
}

function QuickAction({ title, desc }: { title: string; desc: string }) {
  return (
    <button className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 text-left transition hover:border-emerald hover:bg-emerald-soft/40">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald" />
    </button>
  );
}