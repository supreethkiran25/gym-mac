import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  CreditCard,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  RotateCw,
  Plus,
  ArrowUpRight,
  Activity,
  Zap,
  Flame,
  Dumbbell,
  Radio,
  FileSpreadsheet,
  BarChart3,
  Calendar,
  MessageCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  Droplets,
  Award,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
  head: () => ({
    meta: [{ title: "Cockpit Overview | PEAKREP Gym OS" }],
  }),
});

function DashboardOverview() {
  const {
    members,
    payments,
    expenses,
    staff,
    leads,
    lockers,
    workoutPrograms,
    settings,
    currentUser,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsBulkImportOpen,
    setSelectedMember360,
    setIsMember360Open,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
  } = useGymStore();

  const isAdmin = currentUser.role === "admin";

  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "GOOD MORNING" : hour < 17 ? "GOOD AFTERNOON" : "GOOD EVENING";
  const firstName = currentUser.name.split(" ")[0]?.toUpperCase() || "ADMIN";

  // Members & Floor metrics
  const activeMembersCount = members.filter(
    (m) => m.status === "Active" || m.status === "Expiring",
  ).length;
  const expiringSoonMembers = members.filter((m) => m.status === "Expiring");
  const expiredMembers = members.filter((m) => m.status === "Expired");
  const overdueMembers = members.filter((m) => m.due > 0);
  const pendingDuesTotal = overdueMembers.reduce((sum, m) => sum + m.due, 0);
  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;

  // Financial Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPayments = payments.filter((p) => p.date === todayStr && p.status !== "Refunded");
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalInflow = payments.reduce(
    (sum, p) => sum + (p.status === "Refunded" ? 0 : p.amount),
    0,
  );
  const totalOutflow = expenses.reduce((sum, e) => sum + (e.status === "Paid" ? e.amount : 0), 0);
  const netOperatingBalance = totalInflow - totalOutflow;
  const isNetLoss = netOperatingBalance < 0;

  // Performance Ring Metrics (Target calculations)
  const revenueTarget = 150000;
  const revenuePercent = Math.min(100, Math.round((totalInflow / revenueTarget) * 100));
  const retentionPercent =
    members.length > 0
      ? Math.round(((members.length - expiredMembers.length) / members.length) * 100)
      : 100;
  const capacityPercent = Math.min(100, Math.round((insideMembers.length / 25) * 100));

  const handleMemberClick = (member: Member) => {
    setSelectedMember360(member);
    setIsMember360Open(true);
  };

  const handleSendNudgeWhatsApp = (m: Member) => {
    const text = encodeURIComponent(
      `Hi ${m.name}, greetings from ${settings.name}! ${
        m.due > 0
          ? `Your outstanding balance is ${settings.currencySymbol}${m.due.toLocaleString("en-IN")}. Please pay online or at the front desk.`
          : `Your ${m.plan} subscription is valid until ${m.expiry}. Keep up the great training!`
      }`,
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Sent WhatsApp message to ${m.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Calyxo-Style Top Greeting Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-foreground uppercase">
              {greeting}, {firstName}!
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
              Your personalized gym operating system is running optimally.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand-soft/20 px-3.5 py-1 text-xs font-heading font-extrabold text-brand tracking-wider uppercase">
              <Activity className="h-3 w-3" />
              <span>LIVE FLOOR · {insideMembers.length} INSIDE</span>
            </span>
          </div>
        </div>

        {/* Operational Progress Bar (Calyxo XP bar style) */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground">
            <span>OPERATIONAL CAPACITY</span>
            <span className="font-mono text-foreground font-semibold">
              {insideMembers.length} / 25 Peak Slots
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.max(8, capacityPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Top Highlight Hero Card */}
      <div className="glass-panel-glow rounded-3xl p-5 sm:p-6 shadow-2xl border border-sky-500/25">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-300 text-black font-bold shrink-0 shadow-lg shadow-sky-500/30">
              <Zap className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-heading font-extrabold text-white uppercase tracking-wide">
                  {settings.name} — ACTIVE FLOOR DESK
                </h3>
                <span className="rounded-full gradient-sky-pill px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {isAdmin ? "Admin Full Access" : "Front Desk Mode"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                Live Turnstile scanner active with biometric check-in, dues verification, and
                automated renewal reminders.
              </p>

              {/* Status pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] font-medium text-zinc-400">
                <span className="rounded-lg bg-white/[0.04] border border-white/8 px-2.5 py-1 text-zinc-200 flex items-center gap-1">
                  ✓ Turnstile Gate Online
                </span>
                <span className="rounded-lg bg-white/[0.04] border border-white/8 px-2.5 py-1 text-zinc-200 flex items-center gap-1">
                  ✓ QR Scanner Ready
                </span>
                <span className="rounded-lg bg-white/[0.04] border border-white/8 px-2.5 py-1 text-zinc-200 flex items-center gap-1">
                  ✓ Dues Turnstile Lock
                </span>
                <span className="rounded-lg bg-white/[0.04] border border-white/8 px-2.5 py-1 text-zinc-200 flex items-center gap-1">
                  ✓ WhatsApp Alerts
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/dashboard/checkin"
              className="glass-button-primary inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-xs font-heading font-extrabold uppercase tracking-wider shadow-lg shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <span>Open Scanner</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 4 Streak / KPI Cards in Frosted Glass */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Directory Streak */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              ACTIVE MEMBERS
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
              {activeMembersCount}{" "}
              <span className="text-xs font-normal text-zinc-500">members</span>
            </p>
            <div className="text-[11px] text-zinc-400 font-medium">
              Inside Floor:{" "}
              <strong className="text-sky-400 font-mono">{insideMembers.length}</strong>
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/20 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total Inflow Collections */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              TOTAL INFLOW
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white font-mono">
              {settings.currencySymbol}
              {totalInflow.toLocaleString("en-IN")}
            </p>
            <div className="text-[11px] text-zinc-400 font-medium">
              Today:{" "}
              <strong className="text-sky-400 font-mono">
                +{settings.currencySymbol}
                {todayRevenue.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/20 shrink-0 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Operating Burn / Outflow */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              OPERATING OUTFLOW
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white font-mono">
              {settings.currencySymbol}
              {totalOutflow.toLocaleString("en-IN")}
            </p>
            <div className="text-[11px] text-zinc-400 font-medium">Rent, Power, Payroll</div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] text-zinc-400 border border-white/8 shrink-0">
            <Flame className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Member Dues */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              PENDING DUES
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white font-mono">
              {settings.currencySymbol}
              {pendingDuesTotal.toLocaleString("en-IN")}
            </p>
            <div className="text-[11px] text-zinc-400 font-medium">
              {overdueMembers.length} with balance
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] text-zinc-400 border border-white/8 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 4. Live Floor Attendance Heatmap & Front Desk Shift Matrix */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div>
            <h3 className="text-sm font-heading font-black uppercase tracking-wider text-foreground">
              Live Floor Traffic & Operational Shift Matrix
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time hourly attendance distribution, peak gym rush windows, and daily desk
              targets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-brand-soft border border-brand/20 px-3 py-1 text-[11px] font-heading font-bold text-brand uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-brand animate-pulse" />
              <span>Turnstile Active</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Today's Peak Hours Traffic Curve */}
          <div className="space-y-3 lg:col-span-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-heading font-bold uppercase tracking-wider text-foreground">
                Today's Peak Hour Traffic Distribution
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Current: <strong className="text-brand">{hour}:00 hrs</strong>
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-2">
              {[
                {
                  time: "06-09 AM",
                  label: "Morning Rush",
                  count: 18,
                  max: 25,
                  isCurrent: hour >= 6 && hour < 9,
                },
                {
                  time: "09-12 PM",
                  label: "Mid-Morning",
                  count: 8,
                  max: 25,
                  isCurrent: hour >= 9 && hour < 12,
                },
                {
                  time: "12-04 PM",
                  label: "Afternoon",
                  count: 4,
                  max: 25,
                  isCurrent: hour >= 12 && hour < 16,
                },
                {
                  time: "05-08 PM",
                  label: "Peak Prime",
                  count: 22,
                  max: 25,
                  isCurrent: hour >= 17 && hour < 20,
                },
                {
                  time: "08-10 PM",
                  label: "Late Session",
                  count: 11,
                  max: 25,
                  isCurrent: hour >= 20 && hour < 22,
                },
              ].map((slot) => {
                const pct = Math.round((slot.count / slot.max) * 100);
                return (
                  <div
                    key={slot.time}
                    className={`rounded-2xl border p-3 flex flex-col justify-between space-y-2 transition ${
                      slot.isCurrent
                        ? "border-brand bg-brand-soft/20 shadow-xs"
                        : "border-border bg-canvas hover:border-brand/30"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-mono font-bold text-muted-foreground">
                        {slot.time}
                      </div>
                      <div className="text-[11px] font-heading font-bold uppercase tracking-tight text-foreground truncate">
                        {slot.label}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-baseline justify-between text-[11px]">
                        <span className="font-heading font-black text-foreground">
                          {slot.count}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            slot.isCurrent ? "bg-brand" : pct > 75 ? "bg-rose-500" : "bg-emerald"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Financial Realization & Monthly Target Progress */}
          <div className="rounded-2xl border border-border bg-canvas p-4.5 space-y-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-foreground">
                Monthly Target Pace
              </span>
              <span className="text-[10px] font-heading font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald">
                {revenuePercent}% Realized
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-heading font-black text-foreground font-mono">
                  {settings.currencySymbol}
                  {totalInflow.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Target: {settings.currencySymbol}
                  {revenueTarget.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand transition-all duration-500 shadow-xs"
                  style={{ width: `${revenuePercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">
                  Retention
                </div>
                <div className="font-heading font-black text-foreground">
                  {retentionPercent}% Retained
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">
                  Active Leads
                </div>
                <div className="font-heading font-black text-brand">
                  {activeLeadsCount} Prospects
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Action Tiles Dock (Workouts, Nutrition, Lead Pipeline, Lockers, Water, Analytics Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/dashboard/workouts"
          className="group rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:border-brand/40 hover:bg-muted/40 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-foreground group-hover:bg-brand group-hover:text-brand-foreground transition">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
            WORKOUT & DIET
          </span>
        </Link>

        <button
          onClick={() => setIsRecordPaymentOpen(true)}
          className="group rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:border-brand/40 hover:bg-muted/40 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-foreground group-hover:bg-brand group-hover:text-brand-foreground transition">
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
            COLLECT DUES
          </span>
        </button>

        <Link
          to="/dashboard/checkin"
          className="group rounded-2xl border border-brand/30 bg-brand-soft/10 p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:border-brand/60 hover:bg-brand-soft/20 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground shadow-xs">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-brand">
            TURNSTILE SCAN
          </span>
        </Link>

        <Link
          to="/dashboard/renewals"
          className="group rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:border-brand/40 hover:bg-muted/40 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-foreground group-hover:bg-brand group-hover:text-brand-foreground transition">
            <RotateCw className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
            RENEWALS HUB
          </span>
        </Link>

        <Link
          to="/dashboard/reminders"
          className="group rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:border-brand/40 hover:bg-muted/40 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-foreground group-hover:bg-brand group-hover:text-brand-foreground transition">
            <Radio className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
            BROADCAST
          </span>
        </Link>

        <Link
          to="/dashboard/reports"
          className="group rounded-2xl border border-border bg-surface p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:border-brand/40 hover:bg-muted/40 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-canvas text-foreground group-hover:bg-brand group-hover:text-brand-foreground transition">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
            REPORTS & EXPORTS
          </span>
        </Link>
      </div>

      {/* 6. Two-Column Operational Views: Members Roster & Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Member Roster with Quick Renew/Nudge */}
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-black uppercase tracking-wider text-foreground">
                Live Member Roster & Status
              </h3>
              <p className="text-xs text-muted-foreground">
                Click member to open profile, freeze, or transfer
              </p>
            </div>
            <Link
              to="/dashboard/members"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-canvas overflow-hidden">
            {members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                onClick={() => handleMemberClick(m)}
                className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-surface border border-border font-bold text-xs">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {m.phone} • {m.plan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {m.due > 0 ? (
                    <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2.5 py-0.5 text-[10px] font-mono">
                      Due: {settings.currencySymbol}
                      {m.due.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full font-bold px-2.5 py-0.5 text-[10px] ${
                        m.status === "Active"
                          ? "bg-emerald-500/20 text-emerald"
                          : m.status === "Expiring"
                            ? "bg-amber-500/20 text-amber-500"
                            : m.status === "Frozen"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-rose-500/20 text-rose-500"
                      }`}
                    >
                      {m.status}
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendNudgeWhatsApp(m);
                    }}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-emerald"
                    title="Send WhatsApp Nudge"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Receipts & Collections */}
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-black uppercase tracking-wider text-foreground">
                Recent Receipts & Collections
              </h3>
              <p className="text-xs text-muted-foreground">
                Logged payments and generated tax receipts
              </p>
            </div>
            <Link
              to="/dashboard/payments"
              className="text-xs font-semibold text-brand hover:underline flex items-center gap-1"
            >
              <span>Ledger</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-canvas overflow-hidden">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-surface border border-border text-foreground">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{p.member}</span>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                        {p.method}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {p.invoiceNumber} • {p.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-sm">
                    {settings.currencySymbol}
                    {p.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => {
                      setActiveInvoicePayment(p);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="View / Print Tax Receipt"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {payments.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground">
                No payment transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
