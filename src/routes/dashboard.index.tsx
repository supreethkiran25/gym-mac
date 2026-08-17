import React, { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Calendar,
  Layers,
  Phone,
  MessageCircle,
  Dumbbell,
  CheckCircle2,
  Clock,
  Building,
  UserPlus,
  KeyRound,
  FileText,
  QrCode,
  Radio,
  Receipt,
  UserCheck,
  Activity,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { OwnerQuickstartBar } from "../components/dashboard/OwnerQuickstartBar";
import { LiveClock } from "../components/dashboard/LiveClock";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardOverview,
});

function DashboardOverview() {
  const {
    members,
    payments,
    staff,
    leads,
    lockers,
    workoutPrograms,
    settings,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setSelectedMember360,
    setIsMember360Open,
    openUPIQRModal,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
  } = useGymStore();

  const activeMembersCount = members.filter((m) => m.status === "Active" || m.status === "Expiring").length;
  const expiringSoonMembers = members.filter((m) => m.status === "Expiring");
  const overdueMembers = members.filter((m) => m.due > 0);
  const pendingDuesTotal = overdueMembers.reduce((sum, m) => sum + m.due, 0);
  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const occupiedLockers = lockers.filter((l) => l.status === "Occupied").length;
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;

  // Real Dynamic Revenue Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPayments = payments.filter((p) => p.date === todayStr);
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalCollectedRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpectedRevenue = members.reduce((sum, m) => sum + (m.planPrice || 0), 0);

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
      }`
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Sent WhatsApp message to ${m.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Quickstart Bar */}
      <OwnerQuickstartBar />

      {/* 2. Executive Operations Dashboard Hero */}
      <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-soft text-accent-foreground px-3 py-0.5 text-xs font-semibold">
                Operational Cockpit
              </span>
              <LiveClock variant="hero" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {settings.name}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Real-time member attendance, collected revenue velocity, dues recovery, and facility management.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll Member</span>
            </button>
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-4 py-2.5 text-xs font-semibold hover:bg-muted transition"
            >
              <CreditCard className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
            <Link
              to="/dashboard/reminders"
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 px-4 py-2.5 text-xs font-semibold hover:bg-purple-500/20 transition"
            >
              <Radio className="h-4 w-4" />
              <span>Broadcast Message</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Core Financial & Member KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total / Active Members */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Active Members</span>
            <Users className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">{activeMembersCount}</p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Inside Floor: <strong className="text-foreground font-mono">{insideMembers.length}</strong></span>
            <span>Total Enrolled: {members.length}</span>
          </div>
        </div>

        {/* Total Collected Revenue */}
        <div className="rounded-2xl border border-emerald/30 bg-emerald-soft/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald">Total Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{totalCollectedRevenue.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Today: {settings.currencySymbol}{todayRevenue.toLocaleString("en-IN")}</span>
            <span className="font-mono">Ledger Verified</span>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Dues</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{pendingDuesTotal.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{overdueMembers.length} Member(s) with Balance</span>
            <Link to="/dashboard/payments" className="text-amber-600 dark:text-amber-400 font-semibold hover:underline">
              Collect →
            </Link>
          </div>
        </div>

        {/* Facility Utilization */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Facility & Lockers</span>
            <KeyRound className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {occupiedLockers} / {lockers.length}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{lockers.filter((l) => l.status === "Available").length} Lockers Free</span>
            <Link to="/dashboard/lockers" className="text-foreground font-semibold hover:underline">
              Manage →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Operational Views: Members & Financial Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Member Roster with Quick Nudge */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Member Registry & Status</h3>
              <p className="text-xs text-muted-foreground">Click member to open complete profile & history</p>
            </div>
            <Link
              to="/dashboard/members"
              className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-canvas overflow-hidden">
            {members.slice(0, 5).map((m) => (
              <div
                key={m.id}
                onClick={() => handleMemberClick(m)}
                className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 cursor-pointer transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background font-bold text-xs">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{m.phone} • {m.plan}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {m.due > 0 ? (
                    <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 text-[10px] font-mono">
                      Due: {settings.currencySymbol}{m.due.toLocaleString("en-IN")}
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-soft text-accent-foreground font-semibold px-2 py-0.5 text-[10px]">
                      Active
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

        {/* Right Column: Recent Payments & Receipts */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Recent Financial Receipts</h3>
              <p className="text-xs text-muted-foreground">Logged payments and installment collections</p>
            </div>
            <Link
              to="/dashboard/payments"
              className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
            >
              <span>Ledger</span>
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-canvas overflow-hidden">
            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="p-3.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-canvas border border-border text-foreground">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{p.member}</span>
                      <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-mono text-muted-foreground">
                        {p.method}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground font-mono">{p.invoiceNumber} • {p.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-foreground text-sm">
                    {settings.currencySymbol}{p.amount.toLocaleString("en-IN")}
                  </span>
                  <button
                    onClick={() => {
                      setActiveInvoicePayment(p);
                      setIsInvoiceModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    title="View Receipt"
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

      {/* 5. Bottom Roster: Training Splits & Floor Staff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workout Splits */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Dumbbell className="h-3.5 w-3.5 text-emerald" />
              <span>Training Programs & Splits</span>
            </h3>
            <Link to="/dashboard/workouts" className="text-xs text-emerald font-semibold hover:underline">
              Workout Builder →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {workoutPrograms.slice(0, 3).map((w) => (
              <div key={w.id} className="p-3 rounded-xl border border-border bg-canvas flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{w.title}</p>
                  <p className="text-[11px] text-muted-foreground">{w.category} • {w.daysPerWeek} Days/Wk ({w.level})</p>
                </div>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                  {members.filter((m) => m.assignedWorkout === w.title).length} Enrolled
                </span>
              </div>
            ))}

            {workoutPrograms.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No workout splits created yet.
              </div>
            )}
          </div>
        </div>

        {/* Staff */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-blue-500" />
              <span>Duty Trainers & Staff</span>
            </h3>
            <Link to="/dashboard/staff" className="text-xs text-emerald font-semibold hover:underline">
              Staff Directory →
            </Link>
          </div>

          <div className="space-y-2 text-xs">
            {staff.slice(0, 3).map((s) => (
              <div key={s.id} className="p-3 rounded-xl border border-border bg-canvas flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">{s.name}</p>
                  <p className="text-[11px] text-muted-foreground">{s.role} • {s.shift}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  s.status === "On Floor" ? "bg-emerald-soft text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {s.status}
                </span>
              </div>
            ))}

            {staff.length === 0 && (
              <div className="p-4 text-center text-muted-foreground text-xs">
                No staff members currently configured.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}