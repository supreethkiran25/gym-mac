import React, { useState } from "react";
import {
  X,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  MessageCircle,
  FileText,
  Edit2,
  CheckCircle2,
  Clock,
  Dumbbell,
  HeartPulse,
  Flame,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Check,
  QrCode,
  Utensils,
  KeyRound,
} from "lucide-react";
import { useGymStore, Member, MemberStatus } from "../../lib/gym-store";
import { toast } from "sonner";

export function Member360Sheet() {
  const {
    isMember360Open,
    setIsMember360Open,
    selectedMember360,
    renewMember,
    toggleFreezeMember,
    setPaymentForMember,
    setIsRecordPaymentOpen,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
    setEditingMember,
    openUPIQRModal,
    settings,
  } = useGymStore();

  const [renewMonths, setRenewMonths] = useState(1);
  const [showRenewConfirm, setShowRenewConfirm] = useState(false);

  if (!isMember360Open || !selectedMember360) return null;

  const m: Member = selectedMember360;

  // Calculate days remaining
  const expiryDate = new Date(m.expiry);
  const today = new Date();
  const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
  const isExpiringSoon = diffDays <= 7 && diffDays >= 0;
  const isExpired = diffDays < 0;

  const handleSendWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi ${m.name}, greetings from ${settings.name}! ${
        m.due > 0
          ? `You have a pending balance of ${settings.currencySymbol}${m.due.toLocaleString("en-IN")}. Please scan your UPI code or pay online to keep training smoothly.`
          : `Your ${m.plan} membership is valid until ${m.expiry}. See you on the workout floor!`
      }`
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Opened WhatsApp chat for ${m.name}`);
  };

  const handleRenew = () => {
    renewMember(m.id, renewMonths);
    toast.success(`Renewed ${m.name}'s membership for ${renewMonths} month(s)!`);
    setShowRenewConfirm(false);
  };

  const handleFreezeToggle = () => {
    toggleFreezeMember(m.id);
    toast.info(m.status === "Frozen" ? `Resumed membership for ${m.name}` : `Paused/Frozen membership for ${m.name}`);
  };

  const statusBadgeColor: Record<MemberStatus, string> = {
    Active: "bg-emerald-soft text-accent-foreground border-emerald/30",
    Expiring: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    Expired: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Partial: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    Frozen: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-surface border-l border-border shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface/80 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background font-semibold text-sm">
              {m.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight">{m.name}</h2>
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusBadgeColor[m.status]}`}>
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">ID: {m.id} · Enrolled {m.joinDate}</p>
            </div>
          </div>
          <button
            onClick={() => setIsMember360Open(false)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-canvas p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">Days Remaining</p>
              <p className={`mt-1 font-mono text-xl font-bold ${isExpired ? "text-danger" : isExpiringSoon ? "text-warn" : "text-foreground"}`}>
                {isExpired ? "Expired" : `${diffDays} days`}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Expires {m.expiry}</p>
            </div>

            <div className="rounded-xl border border-border bg-canvas p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">Attendance Rate</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xl font-bold">{m.attendanceRate}%</span>
                <div className="h-2 w-12 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald transition-all"
                    style={{ width: `${m.attendanceRate}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.lastVisit}</p>
            </div>

            <div className="rounded-xl border border-border bg-canvas p-3.5">
              <p className="text-[11px] font-medium text-muted-foreground">Outstanding Due</p>
              <p className={`mt-1 font-mono text-xl font-bold ${m.due > 0 ? "text-warn" : "text-emerald"}`}>
                {m.due > 0 ? `${settings.currencySymbol}${m.due.toLocaleString("en-IN")}` : "Paid in Full"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{m.plan}</p>
            </div>
          </div>

          {/* One-Click Action Command Dock */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              One-Click Operations
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setShowRenewConfirm((prev) => !prev)}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface hover:border-emerald hover:bg-emerald-soft/30 transition text-center group"
              >
                <RefreshCw className="h-4 w-4 text-emerald group-hover:rotate-180 transition duration-300" />
                <span className="mt-1.5 text-xs font-semibold">Renew Plan</span>
                <span className="text-[10px] text-muted-foreground">+1 / +3 / +12 Mo</span>
              </button>

              <button
                onClick={handleFreezeToggle}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface hover:bg-muted transition text-center"
              >
                {m.status === "Frozen" ? (
                  <PlayCircle className="h-4 w-4 text-emerald" />
                ) : (
                  <PauseCircle className="h-4 w-4 text-amber-500" />
                )}
                <span className="mt-1.5 text-xs font-semibold">
                  {m.status === "Frozen" ? "Unfreeze" : "Freeze Plan"}
                </span>
                <span className="text-[10px] text-muted-foreground">Pause pass</span>
              </button>

              <button
                onClick={handleSendWhatsApp}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface hover:border-emerald hover:bg-emerald-soft/30 transition text-center group"
              >
                <MessageCircle className="h-4 w-4 text-emerald" />
                <span className="mt-1.5 text-xs font-semibold">WhatsApp</span>
                <span className="text-[10px] text-muted-foreground">Send Nudge</span>
              </button>

              <button
                onClick={() => {
                  if (m.due > 0) {
                    openUPIQRModal(m.due, m.name, `Clear Balance Due`);
                  } else {
                    setPaymentForMember(m);
                    setIsRecordPaymentOpen(true);
                  }
                }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-surface hover:border-emerald hover:bg-emerald-soft/30 transition text-center"
              >
                <QrCode className="h-4 w-4 text-blue-500" />
                <span className="mt-1.5 text-xs font-semibold">{m.due > 0 ? "Scan QR Pay" : "Pay Dues"}</span>
                <span className="text-[10px] text-muted-foreground">{m.due > 0 ? `₹${m.due}` : "Record Log"}</span>
              </button>
            </div>

            {/* Inline Fast Renewal Dropdown */}
            {showRenewConfirm && (
              <div className="rounded-xl border border-emerald/40 bg-emerald-soft/30 p-4 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Select Extension Duration:</span>
                  <span className="text-xs font-mono font-bold text-accent-foreground">
                    {settings.currencySymbol}
                    {(
                      (settings.membershipPlans.find((p) => p.name === m.plan)?.price || 2800) *
                      (renewMonths === 12 ? 8 : renewMonths === 3 ? 2.6 : 1)
                    ).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "1 Month", val: 1 },
                    { label: "3 Months", val: 3 },
                    { label: "12 Months", val: 12 },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => setRenewMonths(opt.val)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                        renewMonths === opt.val
                          ? "bg-foreground text-background border-foreground"
                          : "border-border bg-surface hover:bg-muted"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowRenewConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium border border-border bg-surface hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRenew}
                    className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-foreground text-background hover:opacity-90 transition"
                  >
                    Confirm & Extend Expiry
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Workout, Diet & Locker Widgets */}
          <div className="rounded-xl border border-border bg-canvas p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Personalized Programs & Assets
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl border border-border bg-surface space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Dumbbell className="h-3.5 w-3.5 text-purple-500" />
                  <span className="font-semibold text-[11px]">Workout Split</span>
                </div>
                <p className="font-medium text-foreground truncate">{m.assignedWorkout || "Push-Pull-Legs Split"}</p>
              </div>

              <div className="p-2.5 rounded-xl border border-border bg-surface space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Utensils className="h-3.5 w-3.5 text-emerald" />
                  <span className="font-semibold text-[11px]">Nutrition Plan</span>
                </div>
                <p className="font-medium text-foreground truncate">{m.assignedDiet || "High Protein Muscle (2400 kcal)"}</p>
              </div>

              <div className="p-2.5 rounded-xl border border-border bg-surface space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <KeyRound className="h-3.5 w-3.5 text-blue-500" />
                  <span className="font-semibold text-[11px]">Locker Box</span>
                </div>
                <p className="font-medium text-foreground">
                  {m.assignedLocker ? `Locker #${m.assignedLocker}` : "Locker #12 (Men's)"}
                </p>
              </div>
            </div>
          </div>

          {/* Member Profile Details & Fitness Goals */}
          <div className="rounded-xl border border-border bg-canvas p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fitness Profile & Contact
              </span>
              <button
                onClick={() => setEditingMember(m)}
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <Edit2 className="h-3 w-3" /> Edit details
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium mt-0.5">{m.phone}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium mt-0.5 truncate">{m.email || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assigned Coach</p>
                <p className="font-medium mt-0.5">{m.assignedTrainer || "Floor Open"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Emergency Contact</p>
                <p className="font-medium mt-0.5">{m.emergencyContact || "—"}</p>
              </div>
            </div>

            {m.healthGoal && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                  <Flame className="h-3.5 w-3.5 text-amber-500" />
                  <span>Goal: {m.healthGoal}</span>
                </div>
              </div>
            )}

            {m.notes && (
              <p className="text-xs text-muted-foreground bg-surface p-2.5 rounded-lg border border-border">
                <b>Notes:</b> {m.notes}
              </p>
            )}
          </div>

          {/* Member Invoices & Receipts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Invoices & Payment Receipts ({m.invoices?.length || 0})
              </span>
            </div>

            {m.invoices && m.invoices.length > 0 ? (
              <div className="space-y-2">
                {m.invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface p-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-mono font-medium">{inv.invoiceNumber}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {inv.date} · {inv.method} · {inv.plan}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold">
                        {settings.currencySymbol}
                        {inv.amount.toLocaleString("en-IN")}
                      </span>
                      <button
                        onClick={() => {
                          setActiveInvoicePayment({
                            id: inv.id,
                            member: m.name,
                            memberId: m.id,
                            date: inv.date,
                            method: inv.method,
                            amount: inv.amount,
                            category: "Membership",
                            status: inv.status,
                            invoiceNumber: inv.invoiceNumber,
                          });
                          setIsInvoiceModalOpen(true);
                        }}
                        className="rounded px-2 py-1 bg-muted hover:bg-border transition font-medium"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No invoices logged yet.</p>
            )}
          </div>

          {/* Comprehensive Member Timeline */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Member Activity & Milestone Timeline
            </span>

            {(() => {
              const timelineEvents = m.timeline && m.timeline.length > 0
                ? m.timeline
                : [
                    {
                      id: "evt-reg",
                      title: `Enrolled in ${m.plan}`,
                      timestamp: m.joinDate || "1 May 2026",
                      type: "upgrade" as const,
                    },
                    ...(m.invoices || []).map((inv) => ({
                      id: `evt-inv-${inv.id}`,
                      title: `Payment received: ${settings.currencySymbol}${inv.amount.toLocaleString("en-IN")} via ${inv.method} (${inv.invoiceNumber})`,
                      timestamp: inv.date,
                      type: "payment" as const,
                    })),
                    {
                      id: "evt-plan",
                      title: `Active Training Status: ${m.plan} (${m.status})`,
                      timestamp: m.joinDate || "1 May 2026",
                      type: "upgrade" as const,
                    },
                    ...(m.assignedWorkout
                      ? [
                          {
                            id: "evt-wo",
                            title: `Assigned Workout Program: ${m.assignedWorkout}`,
                            timestamp: "Active Routine",
                            type: "pt_session" as const,
                          },
                        ]
                      : []),
                  ];

              return (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {timelineEvents.map((event) => {
                    const getIcon = () => {
                      switch (event.type) {
                        case "attendance":
                          return <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />;
                        case "payment":
                          return <CreditCard className="h-3.5 w-3.5 text-blue-500" />;
                        case "upgrade":
                          return <TrendingUp className="h-3.5 w-3.5 text-purple-500" />;
                        case "pt_session":
                          return <Dumbbell className="h-3.5 w-3.5 text-amber-500" />;
                        case "freeze":
                          return <PauseCircle className="h-3.5 w-3.5 text-orange-500" />;
                        default:
                          return <Clock className="h-3.5 w-3.5 text-muted-foreground" />;
                      }
                    };

                    return (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-6 top-1 grid h-4 w-4 place-items-center rounded-full bg-surface border border-border">
                          {getIcon()}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-foreground">{event.title}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{event.timestamp}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
