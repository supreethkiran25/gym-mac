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
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
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
    setSelectedMember360,
    setIsMember360Open,
    openUPIQRModal,
    renewMember,
    sendAllReminders,
    toggleStaffStatus,
  } = useGymStore();

  // Expandable Panel States
  const [expandedPanel, setExpandedPanel] = useState<string | null>("members");

  const togglePanel = (panelId: string) => {
    setExpandedPanel((prev) => (prev === panelId ? null : panelId));
  };

  const activeMembersCount = members.filter((m) => m.status === "Active" || m.status === "Expiring").length;
  const expiringSoonMembers = members.filter((m) => m.status === "Expiring");
  const overdueMembers = members.filter((m) => m.due > 0);
  const pendingDuesTotal = overdueMembers.reduce((sum, m) => sum + m.due, 0);
  const staffOnFloor = staff.filter((s) => s.status === "On Floor");
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  const trialLeads = leads.filter((l) => l.stage === "Trial Scheduled" || l.stage === "Trial Completed");

  // Real Dynamic Revenue Calculations
  const todayStr = new Date().toISOString().split("T")[0];
  const todayPayments = payments.filter((p) => p.date === todayStr && p.status === "Paid");
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalPaidRevenue = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

  // Dynamic 7-Day Revenue Velocity from actual payment records
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dynamicRevenueVelocity = daysOfWeek.map((day) => {
    const dayPayments = payments.filter((p) => p.status === "Paid");
    const membershipAmt = dayPayments
      .filter((p) => p.category === "Membership")
      .reduce((s, p) => s + p.amount, 0);
    const ptAmt = dayPayments
      .filter((p) => p.category === "Personal Training")
      .reduce((s, p) => s + p.amount, 0);
    const posAmt = dayPayments
      .filter((p) => p.category === "Pro Shop" || p.category === "Merchandise")
      .reduce((s, p) => s + p.amount, 0);

    return {
      day,
      membership: membershipAmt,
      pt: ptAmt,
      pos: posAmt,
    };
  });

  // Dynamic Lead Pipeline Bar Chart
  const LEADS_DATA = [
    { stage: "Inquiries", count: leads.filter((l) => l.stage === "Inquiry").length },
    { stage: "Trials", count: trialLeads.length },
    { stage: "Offers", count: leads.filter((l) => l.stage === "Offer Sent").length },
    { stage: "Enrolled", count: leads.filter((l) => l.stage === "Won").length },
  ];

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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Owner Quickstart Dock */}
      <OwnerQuickstartBar />

      {/* 2. Executive Hero & 5-Second Operational Vitals */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-surface via-surface to-canvas p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald"></span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Executive Command Center
              </h1>
              <span className="rounded-full bg-emerald-soft text-accent-foreground px-3 py-0.5 text-xs font-mono font-semibold">
                Live Gym Telemetry
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              Track subscriptions, gross revenue collection, expiring passes, overdue payment radar, and staff rosters in real time.
            </p>

            {/* 5-Second Quick Answer Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 font-medium">
                <Users className="h-3.5 w-3.5 text-emerald" />
                <span><b>{activeMembersCount}</b> Active Members</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 font-medium">
                <CreditCard className="h-3.5 w-3.5 text-purple-500" />
                <span><b>{settings.currencySymbol}{totalPaidRevenue.toLocaleString("en-IN")}</b> Collections</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span><b>{expiringSoonMembers.length}</b> Expiring &lt;7d</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 text-warn" />
                <span><b>{overdueMembers.length}</b> Overdue</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 font-medium">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                <span><b>{staffOnFloor.length}</b> On-Duty Coaches</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Enroll Member</span>
            </button>
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold hover:bg-muted transition"
            >
              <CreditCard className="h-4 w-4 text-purple-500" />
              <span>Record Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive Expandable Information Panels Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Operations & Financial Control Panels
          </h2>
          <span className="text-xs text-muted-foreground">Click any card to expand quick actions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Panel 1: Active Members Directory (Expandable) */}
          <div
            className={`rounded-2xl border transition shadow-2xs overflow-hidden flex flex-col justify-between ${
              expandedPanel === "members" ? "border-emerald bg-surface ring-1 ring-emerald/30" : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePanel("members")}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-soft text-accent-foreground font-bold">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Enrolled Members</h3>
                    <p className="text-[11px] text-muted-foreground">Active Subscriptions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-emerald">{activeMembersCount}</span>
                  {expandedPanel === "members" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Active Roster</span>
                <span className="font-mono text-foreground font-semibold">{members.length} Registered</span>
              </div>
            </div>

            {/* Expanded Active Members View */}
            {expandedPanel === "members" && (
              <div className="border-t border-border bg-canvas p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Enrolled Members</span>
                  <Link to="/dashboard/members" className="text-emerald hover:underline">
                    Full Directory →
                  </Link>
                </div>

                {members.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-2.5 text-xs">
                        <div onClick={() => handleMemberClick(m)} className="cursor-pointer hover:text-emerald">
                          <p className="font-bold text-foreground">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{m.phone} · {m.plan}</p>
                        </div>
                        <button
                          onClick={() => handleMemberClick(m)}
                          className="px-2 py-1 rounded-lg bg-muted hover:bg-border text-[10px] font-semibold transition"
                        >
                          View 360
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-3">No members registered yet.</p>
                )}
              </div>
            )}
          </div>

          {/* Panel 2: Gross Revenue MTD & Today (Expandable) */}
          <div
            className={`rounded-2xl border transition shadow-2xs overflow-hidden flex flex-col justify-between ${
              expandedPanel === "revenue" ? "border-purple-500 bg-surface ring-1 ring-purple-500/30" : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePanel("revenue")}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Gross Revenue MTD</h3>
                    <p className="text-[11px] text-muted-foreground">Today: +{settings.currencySymbol}{todayRevenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-foreground">{settings.currencySymbol}{totalPaidRevenue.toLocaleString("en-IN")}</span>
                  {expandedPanel === "revenue" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Transactions</span>
                <span className="font-mono font-semibold text-emerald">{payments.filter((p) => p.status === "Paid").length} Receipts</span>
              </div>
            </div>

            {/* Expanded Revenue Breakdown View */}
            {expandedPanel === "revenue" && (
              <div className="border-t border-border bg-canvas p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Stream Breakdown</span>
                  <Link to="/dashboard/payments" className="text-emerald hover:underline">
                    View Ledger →
                  </Link>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between p-2 rounded-lg bg-surface border border-border">
                    <span className="text-muted-foreground font-sans">Subscriptions:</span>
                    <span className="font-bold text-emerald">
                      {settings.currencySymbol}{payments.filter((p) => p.category === "Membership" && p.status === "Paid").reduce((s, p) => s + p.amount, 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between p-2 rounded-lg bg-surface border border-border">
                    <span className="text-muted-foreground font-sans">Personal Training:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {settings.currencySymbol}{payments.filter((p) => p.category === "Personal Training" && p.status === "Paid").reduce((s, p) => s + p.amount, 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsRecordPaymentOpen(true)}
                  className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
                >
                  + Record New Payment
                </button>
              </div>
            )}
          </div>

          {/* Panel 3: Expiring Passes Radar (Expandable) */}
          <div
            className={`rounded-2xl border transition shadow-2xs overflow-hidden flex flex-col justify-between ${
              expandedPanel === "expiring" ? "border-amber-500 bg-surface ring-1 ring-amber-500/30" : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePanel("expiring")}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Expiring &lt;7 Days</h3>
                    <p className="text-[11px] text-muted-foreground">Renewal Radar</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-amber-500">{expiringSoonMembers.length}</span>
                  {expandedPanel === "expiring" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {expiringSoonMembers.length === 0 ? "All member subscriptions currently up to date!" : "Immediate renewal nudges required"}
              </p>
            </div>

            {/* Expanded Expiring Members View */}
            {expandedPanel === "expiring" && (
              <div className="border-t border-border bg-canvas p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Expiring Member Queue</span>
                </div>

                {expiringSoonMembers.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {expiringSoonMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-2.5 text-xs">
                        <div onClick={() => handleMemberClick(m)} className="cursor-pointer hover:text-emerald">
                          <p className="font-bold text-foreground">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">Expires {m.expiry} · {m.plan}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSendNudgeWhatsApp(m)}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-emerald"
                            title="WhatsApp Nudge"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              renewMember(m.id, 1);
                              toast.success(`Renewed ${m.name} for 1 Month!`);
                            }}
                            className="px-2 py-1 rounded-lg bg-foreground text-background text-[10px] font-semibold hover:opacity-90"
                          >
                            Renew
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-3">No memberships expiring within the next 7 days.</p>
                )}
              </div>
            )}
          </div>

          {/* Panel 4: Pending Balance Dues Radar (Expandable) */}
          <div
            className={`rounded-2xl border transition shadow-2xs overflow-hidden flex flex-col justify-between ${
              expandedPanel === "dues" ? "border-warn bg-surface ring-1 ring-warn/30" : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePanel("dues")}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-warn/15 text-warn font-bold">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Pending Balance Dues</h3>
                    <p className="text-[11px] text-muted-foreground">{overdueMembers.length} Overdue Account(s)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-warn">{settings.currencySymbol}{pendingDuesTotal.toLocaleString("en-IN")}</span>
                  {expandedPanel === "dues" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Settlement Status</span>
                <span className="font-mono text-warn font-semibold">{overdueMembers.length > 0 ? "Action Needed" : "Clean Ledger"}</span>
              </div>
            </div>

            {/* Expanded Dues View */}
            {expandedPanel === "dues" && (
              <div className="border-t border-border bg-canvas p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Overdue Accounts ({overdueMembers.length})</span>
                  {overdueMembers.length > 0 && (
                    <button
                      onClick={() => {
                        sendAllReminders();
                        toast.success("Dispatched WhatsApp payment reminders!");
                      }}
                      className="text-emerald hover:underline"
                    >
                      Batch Nudge
                    </button>
                  )}
                </div>

                {overdueMembers.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {overdueMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-2.5 text-xs">
                        <div onClick={() => handleMemberClick(m)} className="cursor-pointer hover:text-emerald">
                          <p className="font-bold text-foreground">{m.name}</p>
                          <p className="text-[10px] font-mono text-warn font-bold">Due: {settings.currencySymbol}{m.due.toLocaleString("en-IN")}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleSendNudgeWhatsApp(m)}
                            className="p-1.5 rounded-lg border border-border hover:bg-muted text-emerald"
                            title="WhatsApp Nudge"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openUPIQRModal(m.due, m.name, `Clear Balance Due`)}
                            className="px-2 py-1 rounded-lg bg-foreground text-background text-[10px] font-semibold hover:opacity-90"
                          >
                            UPI QR
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-3">All member balances and partial dues are settled!</p>
                )}
              </div>
            )}
          </div>

          {/* Panel 5: On-Floor Coaches & Staff (Expandable) */}
          <div
            className={`rounded-2xl border transition shadow-2xs overflow-hidden flex flex-col justify-between ${
              expandedPanel === "staff" ? "border-blue-500 bg-surface ring-1 ring-blue-500/30" : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePanel("staff")}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Coaches on Duty</h3>
                    <p className="text-[11px] text-muted-foreground">{staffOnFloor.length} Active / {staff.length} Staff</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-foreground">{staffOnFloor.length}</span>
                  {expandedPanel === "staff" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>Shift Supervision</span>
                <span className="text-emerald font-semibold">{staff.length === 0 ? "No Staff Added" : "Floor Covered"}</span>
              </div>
            </div>

            {/* Expanded Staff View */}
            {expandedPanel === "staff" && (
              <div className="border-t border-border bg-canvas p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Duty Roster</span>
                  <Link to="/dashboard/staff" className="text-emerald hover:underline">
                    Manage Staff →
                  </Link>
                </div>

                {staff.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {staff.map((s) => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-2.5 text-xs">
                        <div>
                          <p className="font-bold text-foreground">{s.name}</p>
                          <p className="text-[10px] text-muted-foreground">{s.role} · {s.shift}</p>
                        </div>
                        <button
                          onClick={() => toggleStaffStatus(s.id, s.status === "On Floor" ? "Off Duty" : "On Floor")}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                            s.status === "On Floor" ? "bg-emerald-soft text-accent-foreground border-emerald/30" : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {s.status}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-3">No staff members registered. Click "Manage Staff" to add trainers.</p>
                )}
              </div>
            )}
          </div>

          {/* Panel 6: Prospect Leads Funnel (Expandable) */}
          <div
            className={`rounded-2xl border transition shadow-2xs overflow-hidden flex flex-col justify-between ${
              expandedPanel === "leads" ? "border-purple-500 bg-surface ring-1 ring-purple-500/30" : "border-border bg-surface hover:border-foreground/30"
            }`}
          >
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => togglePanel("leads")}>
                <div className="flex items-center gap-2.5">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 font-bold">
                    <UserPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Prospect Leads CRM</h3>
                    <p className="text-[11px] text-muted-foreground">{trialLeads.length} Trial Workout Pass(es)</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold text-purple-600 dark:text-purple-400">{activeLeadsCount}</span>
                  {expandedPanel === "leads" ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {activeLeadsCount === 0 ? "No open prospect leads." : "Inquiries & trial workouts in pipeline"}
              </p>
            </div>

            {/* Expanded Leads View */}
            {expandedPanel === "leads" && (
              <div className="border-t border-border bg-canvas p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                  <span>Active Inquiries</span>
                  <Link to="/dashboard/leads" className="text-emerald hover:underline">
                    View Funnel →
                  </Link>
                </div>

                {leads.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {leads.map((l) => (
                      <div key={l.id} className="flex items-center justify-between rounded-xl border border-border bg-surface p-2.5 text-xs">
                        <div>
                          <p className="font-bold text-foreground">{l.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{l.phone} · {l.source}</p>
                        </div>
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold">
                          {l.stage}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-xs text-muted-foreground py-3">No active prospect leads right now.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Telemetry Charts (Linear & Stripe Visual Velocity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold tracking-tight">Revenue Velocity (Subscriptions vs PT vs Pro Shop)</h3>
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
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Pro Shop
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dynamicRevenueVelocity}>
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
                  tickFormatter={(v) => `₹${v}`}
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

        {/* Lead Funnel Pipeline Bar Chart (1 Col) */}
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Lead Conversion Pipeline</h3>
            <p className="text-xs text-muted-foreground">Prospect funnel conversion progression</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={LEADS_DATA}>
                <XAxis dataKey="stage" stroke="#888888" fontSize={10} tickLine={false} />
                <YAxis stroke="#888888" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                  formatter={(v: any) => [`${v} leads`, "Prospects"]}
                />
                <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}