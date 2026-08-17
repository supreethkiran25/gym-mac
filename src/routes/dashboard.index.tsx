import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Activity,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  UserCheck,
  Calendar,
  Layers,
  Zap,
  Phone,
  MessageCircle,
  Dumbbell,
  CheckCircle2,
  Clock,
  Building,
  UserPlus,
  ShoppingBag,
  KeyRound,
  FileText,
  Flame,
  QrCode,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { SmartInsightCard } from "../components/dashboard/SmartInsightCard";
import { OwnerQuickstartBar } from "../components/dashboard/OwnerQuickstartBar";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

// Chart mock data
const REVENUE_VELOCITY = [
  { day: "Mon", membership: 42000, pt: 18000, pos: 4500 },
  { day: "Tue", membership: 38000, pt: 22000, pos: 5200 },
  { day: "Wed", membership: 65000, pt: 25000, pos: 7800 },
  { day: "Thu", membership: 48000, pt: 19000, pos: 6100 },
  { day: "Fri", membership: 72000, pt: 31000, pos: 9400 },
  { day: "Sat", membership: 94000, pt: 42000, pos: 14200 },
  { day: "Sun", membership: 81000, pt: 36000, pos: 11800 },
];

const HOURLY_RUSH = [
  { hour: "6 AM", count: 18 },
  { hour: "7 AM", count: 34 },
  { hour: "8 AM", count: 48 },
  { hour: "9 AM", count: 28 },
  { hour: "10 AM", count: 14 },
  { hour: "11 AM", count: 9 },
  { hour: "12 PM", count: 12 },
  { hour: "1 PM", count: 8 },
  { hour: "4 PM", count: 19 },
  { hour: "5 PM", count: 32 },
  { hour: "6 PM", count: 56 },
  { hour: "7 PM", count: 64 },
  { hour: "8 PM", count: 52 },
  { hour: "9 PM", count: 26 },
  { hour: "10 PM", count: 11 },
];

function DashboardOverview() {
  const {
    members,
    payments,
    insights,
    staff,
    leads,
    posProducts,
    lockers,
    settings,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsCheckInOpen,
    setSelectedMember360,
    setIsMember360Open,
    openUPIQRModal,
  } = useGymStore();

  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const expiringSoonCount = members.filter((m) => m.status === "Expiring").length;
  const expiredCount = members.filter((m) => m.status === "Expired").length;
  const pendingDuesTotal = members.reduce((sum, m) => sum + m.due, 0);
  const staffOnFloorCount = staff.filter((s) => s.status === "On Floor").length;
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  const occupiedLockersCount = lockers.filter((l) => l.status === "Occupied").length;

  // At-Risk Members (<60% attendance or expired)
  const atRiskMembers = members.filter((m) => m.attendanceRate < 65 || m.status === "Expired").slice(0, 4);

  const handleMemberClick = (member: Member) => {
    setSelectedMember360(member);
    setIsMember360Open(true);
  };

  const handleSendWinbackWhatsApp = (m: Member) => {
    const text = encodeURIComponent(
      `Hi ${m.name}, we miss seeing you at ${settings.name}! We've credited a complimentary 1-on-1 trainer assessment pass to your account. Drop by this week!`
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Sent winback message to ${m.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Guided Owner Quickstart Bar */}
      <OwnerQuickstartBar />

      {/* 2. Executive Welcome & Live Floor Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Executive Command Center</h1>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald"></span>
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Real-time gym operations telemetry, floor occupancy, revenue velocity, and churn radar.
          </p>
        </div>

        {/* Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsCheckInOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald/40 bg-emerald-soft px-3.5 py-2 text-xs font-semibold text-accent-foreground hover:bg-emerald-soft/80 transition shadow-xs"
          >
            <UserCheck className="h-4 w-4" />
            <span>Instant Floor Check-In</span>
          </button>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Member</span>
          </button>
        </div>
      </div>

      {/* 3. Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Floor Occupants */}
        <Link
          to="/dashboard/attendance"
          className="group rounded-2xl border border-border bg-surface p-4 hover:border-emerald transition shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Inside Gym</span>
            <Activity className="h-4 w-4 text-emerald" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">
            {insideMembers.length}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald"></span>
            <span>Capacity 80</span>
          </p>
        </Link>

        {/* Revenue Today */}
        <Link
          to="/dashboard/payments"
          className="group rounded-2xl border border-border bg-surface p-4 hover:border-emerald transition shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Today's Revenue</span>
            <CreditCard className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">
            ₹68.5k
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald">+18% vs yesterday</p>
        </Link>

        {/* Active Prospect Leads */}
        <Link
          to="/dashboard/leads"
          className="group rounded-2xl border border-border bg-surface p-4 hover:border-emerald transition shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Prospect Leads</span>
            <UserPlus className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">
            {activeLeadsCount}
          </p>
          <p className="mt-1 text-[11px] font-medium text-purple-600 dark:text-purple-400">4 trial passes</p>
        </Link>

        {/* Pending Dues */}
        <Link
          to="/dashboard/members"
          className="group rounded-2xl border border-border bg-surface p-4 hover:border-warn transition shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Pending Dues</span>
            <AlertTriangle className="h-4 w-4 text-warn" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-warn">
            {settings.currencySymbol}{pendingDuesTotal.toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">
            {members.filter((m) => m.due > 0).length} members
          </p>
        </Link>

        {/* Expiring Soon */}
        <Link
          to="/dashboard/members"
          className="group rounded-2xl border border-border bg-surface p-4 hover:border-amber-500 transition shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Expiring &lt;7d</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-amber-500">
            {expiringSoonCount + expiredCount}
          </p>
          <p className="mt-1 text-[11px] font-medium text-muted-foreground">Action required</p>
        </Link>

        {/* Staff on Duty */}
        <Link
          to="/dashboard/staff"
          className="group rounded-2xl border border-border bg-surface p-4 hover:border-emerald transition shadow-2xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Staff on Duty</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-foreground">
            {staffOnFloorCount} / {staff.length}
          </p>
          <p className="mt-1 text-[11px] font-medium text-emerald">Shift active</p>
        </Link>
      </div>

      {/* 4. Actionable Insights Stream */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald" />
              <h2 className="text-sm font-semibold tracking-tight">Actionable Operations Telemetry</h2>
            </div>
            <span className="text-xs text-muted-foreground">{insights.length} active triggers</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {insights.map((ins) => (
              <SmartInsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </div>
      )}

      {/* 5. Live Charts Grid (Revenue Velocity & Hourly Rush) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Revenue Velocity (Subscriptions vs PT vs POS)</h3>
              <p className="text-xs text-muted-foreground">Daily gross collections across all revenue streams</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald"></span> Subscriptions
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span> Personal Training
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Pro Shop POS
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_VELOCITY}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="membership"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSub)"
                />
                <Area
                  type="monotone"
                  dataKey="pt"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPT)"
                />
                <Area
                  type="monotone"
                  dataKey="pos"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={0.2}
                  fill="#3b82f6"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Rush Bar Chart (1 Col) */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Today's Peak Rush Curve</h3>
            <p className="text-xs text-muted-foreground">Floor occupancy distribution by hour</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_RUSH}>
                <XAxis dataKey="hour" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(v: any) => [`${v} members`, "Occupants"]}
                />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 6. At-Risk Member Radar & Live Floor Occupants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Member Radar */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold tracking-tight">Member Retention & At-Risk Radar</h3>
            </div>
            <span className="rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 text-xs font-semibold">
              {atRiskMembers.length} Ghost Members
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Members with falling workout attendance or expired passes. Send a 1-click re-engagement pass.
          </p>

          <div className="space-y-2.5 divide-y divide-border/40">
            {atRiskMembers.map((m) => (
              <div key={m.id} className="pt-2.5 flex items-center justify-between gap-3 text-xs">
                <div
                  onClick={() => handleMemberClick(m)}
                  className="cursor-pointer hover:text-emerald transition"
                >
                  <p className="font-bold text-foreground">{m.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Attendance: <b className="text-warn">{m.attendanceRate}%</b> · Last visit {m.lastVisit}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendWinbackWhatsApp(m)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5 text-emerald" />
                    <span>Nudge Pass</span>
                  </button>
                  <button
                    onClick={() => handleMemberClick(m)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Floor Occupants */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald" />
              <h3 className="text-sm font-bold tracking-tight">Active Floor Occupants ({insideMembers.length})</h3>
            </div>
            <Link to="/dashboard/attendance" className="text-xs font-medium text-emerald hover:underline">
              View Heatmap →
            </Link>
          </div>

          <div className="space-y-2.5 divide-y divide-border/40">
            {insideMembers.length > 0 ? (
              insideMembers.map((m) => (
                <div key={m.id} className="pt-2.5 flex items-center justify-between gap-3 text-xs">
                  <div
                    onClick={() => handleMemberClick(m)}
                    className="cursor-pointer hover:text-emerald transition"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald"></span>
                      <p className="font-bold text-foreground">{m.name}</p>
                      <span className="rounded-md bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground font-mono">
                        {m.plan}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground ml-4">
                      In since {m.checkInTime || "Morning"} · {m.assignedWorkout || "Push-Pull-Legs"}
                    </p>
                  </div>

                  <button
                    onClick={() => handleMemberClick(m)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No members currently inside. Click "Instant Floor Check-In" to check in members.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}