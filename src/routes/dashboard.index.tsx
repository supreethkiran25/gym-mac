import React, { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  CreditCard,
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
  Calendar,
  MessageCircle,
  FileText,
  Clock,
  ArrowRight,
  ShieldCheck,
  Receipt,
  UserX,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Scale,
  X,
  FileCheck2,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
  head: () => ({
    meta: [{ title: "Operations Cockpit | PEAKREP Gym OS" }],
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
    locations,
    getDailyClose,
    getAttendanceDropAlerts,
    getRetentionMetrics,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsBulkImportOpen,
    setSelectedMember360,
    setIsMember360Open,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
  } = useGymStore();

  const [activeQueueTab, setActiveQueueTab] = useState<"expiring" | "dues" | "slumps" | "leads">("expiring");
  const [isDailyCloseModalOpen, setIsDailyCloseModalOpen] = useState(false);
  const [countedCashInput, setCountedCashInput] = useState<string>("");

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
  const overdueMembers = members.filter((m) => m.due > 0);
  const pendingDuesTotal = overdueMembers.reduce((sum, m) => sum + m.due, 0);
  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  const overdueLeads = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost");

  // Authoritative Attendance Retention Drop Alerts
  const attendanceSlumpAlerts = useMemo(() => {
    return getAttendanceDropAlerts();
  }, [members]);

  // True Cohort Retention Calculation
  const retentionStats = useMemo(() => {
    return getRetentionMetrics();
  }, [members]);

  // Daily Close Summary
  const dailyCloseSummary = useMemo(() => {
    return getDailyClose();
  }, [payments, expenses]);

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

  const gymCapacity = locations[0]?.capacity || 150;
  const capacityPercent = Math.min(100, Math.round((insideMembers.length / gymCapacity) * 100));

  const handleMemberClick = (member: Member) => {
    setSelectedMember360(member);
    setIsMember360Open(true);
  };

  const handleSendNudgeWhatsApp = (m: Member) => {
    const text = encodeURIComponent(
      `Hi ${m.name}, greetings from ${settings.name}! ${
        m.due > 0
          ? `Your outstanding balance is ${settings.currencySymbol}${m.due.toLocaleString("en-IN")}. Please clear dues at the front desk or via UPI.`
          : `Your ${m.plan} subscription expires on ${m.expiry}. Renew today to maintain uninterrupted biometric gym access!`
      }`,
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`WhatsApp reminder generated for ${m.name}`);
  };

  // Discrepancy calculation for Cash Drawer Close
  const countedCashNumber = parseFloat(countedCashInput) || 0;
  const cashDiscrepancy = countedCashNumber - dailyCloseSummary.byPaymentMethod.Cash;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Header with Time-Aware Greeting & Operator Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white uppercase">
            {greeting}, {firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Operations Cockpit — Live Turnstile Gate, Risk Queues & Reconciled Financials.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDailyCloseModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 text-xs font-semibold text-slate-200 transition cursor-pointer"
          >
            <Scale className="h-3.5 w-3.5 text-sky-400" />
            <span>Daily Cash Close</span>
          </button>

          <Link
            to="/dashboard/checkin"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 text-xs font-bold transition shadow-lg cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Turnstile Scan</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards (Glassmorphism Charcoal & Sky) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Members */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl bg-[#0a0d14]/70 backdrop-blur-md">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              ACTIVE ENROLLED
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white font-mono">
              {activeMembersCount}
            </p>
            <div className="text-[11px] text-slate-400 font-medium">
              Inside Floor: <strong className="text-emerald-400 font-mono">{insideMembers.length}</strong>
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/20 shrink-0">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Collections Inflow */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl bg-[#0a0d14]/70 backdrop-blur-md">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              COLLECTIONS INFLOW
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white font-mono">
              {settings.currencySymbol}
              {totalInflow.toLocaleString("en-IN")}
            </p>
            <div className="text-[11px] text-slate-400 font-medium">
              Today: <strong className="text-sky-400 font-mono">+{settings.currencySymbol}{todayRevenue.toLocaleString("en-IN")}</strong>
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-400/20 shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>

        {/* Net Operating Position */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl bg-[#0a0d14]/70 backdrop-blur-md">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              NET OPERATING CASH
            </div>
            <p className={`text-2xl sm:text-3xl font-heading font-extrabold tracking-tight font-mono ${netOperatingBalance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {settings.currencySymbol}
              {netOperatingBalance.toLocaleString("en-IN")}
            </p>
            <div className="text-[11px] text-slate-400 font-medium">
              Burn Outflow: {settings.currencySymbol}{totalOutflow.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/[0.04] text-slate-400 border border-white/8 shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="glass-card-interactive rounded-3xl p-5 flex items-center justify-between border border-white/8 shadow-xl bg-[#0a0d14]/70 backdrop-blur-md">
          <div className="space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              OUTSTANDING DUES
            </div>
            <p className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-amber-400 font-mono">
              {settings.currencySymbol}
              {pendingDuesTotal.toLocaleString("en-IN")}
            </p>
            <div className="text-[11px] text-slate-400 font-medium">
              {overdueMembers.length} accounts with balance
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* SECTION A: OPERATIONS COMMAND CENTER (Unified Actionable Exception Queue) */}
      <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/80 p-6 space-y-5 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <h2 className="text-sm font-heading font-black uppercase tracking-wider text-white">
                Operations Command Center — Actionable Exceptions
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Prioritized operational items requiring desk attention. All exceptions derive from live store state.
            </p>
          </div>

          {/* Queue Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-[#05080f] p-1 rounded-2xl border border-white/10 text-xs font-semibold">
            <button
              onClick={() => setActiveQueueTab("expiring")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueTab === "expiring"
                  ? "bg-sky-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Expiring Soon</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {expiringSoonMembers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveQueueTab("dues")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueTab === "dues"
                  ? "bg-sky-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Overdue Dues</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {overdueMembers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveQueueTab("slumps")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueTab === "slumps"
                  ? "bg-sky-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Attendance Slumps</span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-mono">
                {attendanceSlumpAlerts.length}
              </span>
            </button>
            <button
              onClick={() => setActiveQueueTab("leads")}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
                activeQueueTab === "leads"
                  ? "bg-sky-600 text-white font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Leads To Follow-Up</span>
              <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono">
                {overdueLeads.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Expiring Soon Queue */}
        {activeQueueTab === "expiring" && (
          <div className="space-y-2">
            {expiringSoonMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                ✓ No memberships expiring in the next 7 days.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expiringSoonMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] flex items-center justify-between text-xs hover:border-amber-500/40 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{m.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/20 text-amber-400 font-mono">
                          Expires: {m.expiry}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {m.phone} · Plan: {m.plan}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendNudgeWhatsApp(m)}
                        className="px-2.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-emerald-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Send WhatsApp Renewal Nudge"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Nudge</span>
                      </button>
                      <button
                        onClick={() => handleMemberClick(m)}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Renew
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Overdue Dues Queue */}
        {activeQueueTab === "dues" && (
          <div className="space-y-2">
            {overdueMembers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                ✓ All member installment dues are fully collected.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overdueMembers.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] flex items-center justify-between text-xs hover:border-rose-500/40 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{m.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-mono font-bold">
                          Due: {settings.currencySymbol}{m.due.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {m.phone} · Plan: {m.plan} ({settings.currencySymbol}{m.collectedAmount} paid)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSendNudgeWhatsApp(m)}
                        className="px-2.5 py-1.5 rounded-xl border border-white/10 hover:bg-white/10 text-emerald-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        title="Send WhatsApp Payment Nudge"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Nudge</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsRecordPaymentOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
                      >
                        Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Attendance Slump Retention Alerts (Feature 4) */}
        {activeQueueTab === "slumps" && (
          <div className="space-y-2">
            {attendanceSlumpAlerts.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                ✓ No active retention drop anomalies detected across enrolled athletes.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {attendanceSlumpAlerts.map((alert) => (
                  <div
                    key={alert.memberId}
                    className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-950/20 flex items-center justify-between text-xs hover:border-rose-500/50 transition"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-2">
                        <UserX className="h-3.5 w-3.5 text-rose-400" />
                        <span>{alert.memberName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-rose-500/30 text-rose-300 font-mono font-bold">
                          {alert.riskLevel} Risk
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Attendance Rate: {alert.attendanceRate}% · {alert.daysSinceLastVisit} days since last check-in (Last: {alert.lastVisit})
                      </p>
                      <p className="text-[10px] text-rose-400/90 font-mono">
                        Action: {alert.recommendedAction}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const m = members.find((x) => x.id === alert.memberId);
                        if (m) handleMemberClick(m);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Inspect Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Leads Follow-Up Queue */}
        {activeQueueTab === "leads" && (
          <div className="space-y-2">
            {overdueLeads.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                ✓ All CRM enquiries and trials are followed up.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {overdueLeads.slice(0, 6).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between text-xs hover:border-white/15 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{lead.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-400 font-semibold uppercase">
                          {lead.stage}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {lead.phone} · Source: {lead.source}
                      </p>
                    </div>

                    <Link
                      to="/dashboard/leads"
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                    >
                      Lead CRM
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION B & C: LIVE OPERATIONS & VERIFIED PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Live Floor & Capacity Roster */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-6 space-y-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-heading font-black uppercase tracking-wider text-white">
                  Live Operations & Floor Turnstile Gate
                </h3>
                <p className="text-xs text-slate-400">
                  Verified biometric check-ins currently on floor vs configured capacity.
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-400 font-mono uppercase">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Gate Active</span>
              </span>
            </div>

            {/* Capacity Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Floor Load Density</span>
                <span className="text-white font-mono font-bold">
                  {insideMembers.length} / {gymCapacity} Peak Slots ({capacityPercent}%)
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    capacityPercent > 85 ? "bg-rose-500" : capacityPercent > 65 ? "bg-amber-500" : "bg-sky-500"
                  }`}
                  style={{ width: `${capacityPercent}%` }}
                />
              </div>
            </div>

            {/* Currently Inside Members List */}
            <div className="space-y-2 pt-2">
              <p className="text-xs font-semibold text-slate-400">Currently Inside Roster:</p>
              {insideMembers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 border border-white/5 rounded-2xl bg-white/[0.01]">
                  No members currently inside. Use Turnstile Scan to check in incoming athletes.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {insideMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white">{m.name}</div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Checked in at {m.checkInTime || "Morning"} · {m.plan}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                        Floor Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Retention Cohort & Daily Register Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-6 space-y-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-heading font-black uppercase tracking-wider text-white">
                Cohort Retention Analysis
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Authoritative Retention
              </span>
            </div>

            {/* True Cohort Retention Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Retention Rate
                </span>
                <p className="text-2xl font-bold font-mono text-emerald-400">
                  {retentionStats.cohortRetentionRate}%
                </p>
                <p className="text-[11px] text-slate-500">
                  {retentionStats.activeCount} of {retentionStats.totalEnrolled} active members
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Expired / Churned
                </span>
                <p className="text-2xl font-bold font-mono text-rose-400">
                  {100 - retentionStats.cohortRetentionRate}%
                </p>
                <p className="text-[11px] text-slate-500">
                  {retentionStats.expiredCount} expired accounts
                </p>
              </div>
            </div>

            {/* Daily Register Drawer Status */}
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 text-sky-400" />
                  <span>Today's Register Drawer</span>
                </span>
                <span className="text-[11px] font-mono text-sky-300">
                  {dailyCloseSummary.totalPaymentsCount} transactions
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Cash Collected:</span>
                  <p className="font-mono font-bold text-white">
                    {settings.currencySymbol}{dailyCloseSummary.byPaymentMethod.Cash.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">UPI / Digital:</span>
                  <p className="font-mono font-bold text-white">
                    {settings.currencySymbol}{dailyCloseSummary.byPaymentMethod.UPI.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Net Cash in Drawer:</span>
                  <p className="font-mono font-bold text-emerald-400">
                    {settings.currencySymbol}{dailyCloseSummary.byPaymentMethod.Cash.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Card / Bank:</span>
                  <p className="font-mono font-bold text-white">
                    {settings.currencySymbol}{(dailyCloseSummary.byPaymentMethod.Card + dailyCloseSummary.byPaymentMethod.Bank).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDailyCloseModalOpen(true)}
                className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Perform End-of-Day Register Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Link
          to="/dashboard/workouts"
          className="group rounded-2xl border border-white/5 bg-[#0a0d14]/70 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-sky-500/40 hover:bg-white/[0.04] transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white group-hover:bg-sky-500 group-hover:text-black transition">
            <Dumbbell className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">
            WORKOUT & DIET
          </span>
        </Link>

        <button
          onClick={() => setIsRecordPaymentOpen(true)}
          className="group rounded-2xl border border-white/5 bg-[#0a0d14]/70 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-sky-500/40 hover:bg-white/[0.04] transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white group-hover:bg-sky-500 group-hover:text-black transition">
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">
            RECORD PAYMENT
          </span>
        </button>

        <Link
          to="/dashboard/checkin"
          className="group rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-sky-400 hover:bg-sky-500/20 transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-sky-500 text-black shadow-xs font-bold">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
            TURNSTILE SCAN
          </span>
        </Link>

        <Link
          to="/dashboard/renewals"
          className="group rounded-2xl border border-white/5 bg-[#0a0d14]/70 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-sky-500/40 hover:bg-white/[0.04] transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white group-hover:bg-sky-500 group-hover:text-black transition">
            <RotateCw className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">
            RENEWALS HUB
          </span>
        </Link>

        <Link
          to="/dashboard/reminders"
          className="group rounded-2xl border border-white/5 bg-[#0a0d14]/70 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-sky-500/40 hover:bg-white/[0.04] transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white group-hover:bg-sky-500 group-hover:text-black transition">
            <Radio className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">
            BROADCAST
          </span>
        </Link>

        <Link
          to="/dashboard/reports"
          className="group rounded-2xl border border-white/5 bg-[#0a0d14]/70 p-4 flex flex-col items-center justify-center gap-2 text-center hover:border-sky-500/40 hover:bg-white/[0.04] transition shadow-2xs cursor-pointer"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-white group-hover:bg-sky-500 group-hover:text-black transition">
            <FileSpreadsheet className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-white">
            REPORTS & EXPORTS
          </span>
        </Link>
      </div>

      {/* Two-Column Operational Views: Members Directory & Receipts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Member Directory Roster */}
        <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-6 space-y-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-black uppercase tracking-wider text-white">
                Member Directory & Status
              </h3>
              <p className="text-xs text-slate-400">
                Click member to open profile 360, freeze, or transfer
              </p>
            </div>
            <Link
              to="/dashboard/members"
              className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-[#05080f] overflow-hidden">
            {members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                onClick={() => handleMemberClick(m)}
                className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 font-bold text-xs text-white">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{m.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {m.phone} • {m.plan}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {m.due > 0 ? (
                    <span className="rounded-full bg-amber-500/20 text-amber-400 font-bold px-2.5 py-0.5 text-[10px] font-mono">
                      Due: {settings.currencySymbol}
                      {m.due.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full font-bold px-2.5 py-0.5 text-[10px] ${
                        m.status === "Active"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : m.status === "Expiring"
                            ? "bg-amber-500/20 text-amber-400"
                            : m.status === "Frozen"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-rose-500/20 text-rose-400"
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
                    className="p-1.5 rounded-lg border border-white/10 hover:bg-white/10 text-slate-400 hover:text-emerald-400"
                    title="Send WhatsApp Nudge"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Invoices & Tax Receipts */}
        <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-6 space-y-4 shadow-xs backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-black uppercase tracking-wider text-white">
                Recent Sequential Tax Invoices
              </h3>
              <p className="text-xs text-slate-400">
                Authoritative GST invoices and audit trails
              </p>
            </div>
            <Link
              to="/dashboard/payments"
              className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Ledger</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-white/5 rounded-2xl border border-white/5 bg-[#05080f] overflow-hidden">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-white/[0.02] transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/5 border border-white/10 text-slate-300">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{p.member}</span>
                      <span className="rounded bg-white/10 px-1.5 py-0.2 text-[10px] font-mono text-slate-300">
                        {p.method}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {p.invoiceNumber} • {p.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">
                    {settings.currencySymbol}
                    {p.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => {
                      setActiveInvoicePayment(p);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
                    title="View / Print Tax Receipt"
                  >
                    <FileText className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {payments.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500">
                No payment transactions recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DAILY REGISTER CLOSE MODAL */}
      {isDailyCloseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-sky-500/30 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-sky-400">
                <Scale className="h-5 w-5" />
                <h3 className="font-bold text-base text-white">Daily Cash Drawer Close & Reconciliation</h3>
              </div>
              <button
                onClick={() => setIsDailyCloseModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Register Date:</span>
                  <span className="font-mono font-bold text-white">{dailyCloseSummary.date}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Gross Collections:</span>
                  <span className="font-mono font-bold text-white">
                    {settings.currencySymbol}{dailyCloseSummary.grossCollected.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pl-2 text-[11px]">
                  <span>• Cash Received:</span>
                  <span className="font-mono text-white">
                    {settings.currencySymbol}{dailyCloseSummary.byPaymentMethod.Cash.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pl-2 text-[11px]">
                  <span>• UPI / Online:</span>
                  <span className="font-mono text-white">
                    {settings.currencySymbol}{dailyCloseSummary.byPaymentMethod.UPI.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pl-2 text-[11px]">
                  <span>• Card / POS & Bank:</span>
                  <span className="font-mono text-white">
                    {settings.currencySymbol}{(dailyCloseSummary.byPaymentMethod.Card + dailyCloseSummary.byPaymentMethod.Bank).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-rose-400 pt-1 border-t border-white/5">
                  <span>Operating Expenses:</span>
                  <span className="font-mono font-bold">
                    -{settings.currencySymbol}{dailyCloseSummary.operatingExpenses.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 pt-1 border-t border-white/5 font-bold text-sm">
                  <span>System Expected Cash in Drawer:</span>
                  <span className="font-mono">
                    {settings.currencySymbol}{dailyCloseSummary.byPaymentMethod.Cash.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Physically Counted Cash in Drawer ({settings.currencySymbol}):
                </label>
                <input
                  type="number"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  placeholder="Enter physical counted cash amount..."
                  className="w-full rounded-2xl border border-white/10 bg-[#05080f] p-3 text-sm text-white font-mono placeholder-slate-500 focus:border-sky-500 focus:outline-hidden"
                />
              </div>

              {countedCashInput !== "" && (
                <div
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    cashDiscrepancy === 0
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                      : cashDiscrepancy > 0
                        ? "bg-amber-950/30 border-amber-500/30 text-amber-300"
                        : "bg-rose-950/30 border-rose-500/30 text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 shrink-0" />
                    <span>
                      {cashDiscrepancy === 0
                        ? "Cash Drawer Exactly Balanced ✓"
                        : cashDiscrepancy > 0
                          ? `Cash Overage of +${settings.currencySymbol}${cashDiscrepancy.toLocaleString("en-IN")}`
                          : `Cash Shortage of -${settings.currencySymbol}${Math.abs(cashDiscrepancy).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm">
                    {cashDiscrepancy > 0 ? `+${cashDiscrepancy}` : cashDiscrepancy}
                  </span>
                </div>
              )}

              <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-slate-400">
                <FileCheck2 className="inline h-3.5 w-3.5 mr-1 text-sky-400" />
                Audited by <span className="text-white font-semibold">{currentUser.name}</span> ({currentUser.role}). All close summaries are saved to the immutable finance log.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDailyCloseModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 cursor-pointer"
              >
                Close Window
              </button>
              <button
                type="button"
                onClick={() => {
                  toast.success(`✓ Daily Register Closed: ${settings.currencySymbol}${dailyCloseSummary.byPaymentMethod.Cash.toLocaleString("en-IN")} reconciled`);
                  setIsDailyCloseModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition cursor-pointer shadow-md"
              >
                Finalize & Sign Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

