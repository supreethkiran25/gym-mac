import React, { useState } from "react";
import {
  Building2,
  Zap,
  HelpCircle,
  TrendingUp,
  Users,
  CheckCircle2,
  QrCode,
  ShoppingBag,
  ArrowRight,
  ChevronDown,
  UserPlus,
  Send,
  CreditCard,
} from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { toast } from "sonner";

export function OwnerQuickstartBar() {
  const {
    locations,
    currentLocationId,
    switchLocation,
    members,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    openUPIQRModal,
    sendAllReminders,
    settings,
  } = useGymStore();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const currentLoc = locations.find((l) => l.id === currentLocationId) || locations[0];
  const pendingDuesCount = members.filter((m) => m.due > 0).length;

  const handleBatchNudge = () => {
    sendAllReminders();
    toast.success(`Queued automated WhatsApp/SMS payment reminders for ${pendingDuesCount} member(s)!`);
  };

  return (
    <div className="rounded-2xl border border-border bg-gradient-to-r from-surface via-surface to-canvas p-4 space-y-3 shadow-2xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Branch / Franchise Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowLocationMenu((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition"
            >
              <Building2 className="h-3.5 w-3.5 text-emerald" />
              <span>{currentLoc.name}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>

            {showLocationMenu && (
              <div className="absolute left-0 top-10 z-40 w-64 rounded-xl border border-border bg-surface p-1.5 shadow-xl space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
                <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Switch Active Gym Branch
                </p>
                {locations.map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      switchLocation(loc.id);
                      setShowLocationMenu(false);
                      toast.info(`Switched active branch to ${loc.name}`);
                    }}
                    className={`w-full flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs text-left transition ${
                      loc.id === currentLocationId
                        ? "bg-foreground text-background font-semibold"
                        : "hover:bg-muted text-foreground"
                    }`}
                  >
                    <span className="truncate">{loc.name}</span>
                    <span className="text-[10px] opacity-80">{members.length} active</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
            <span>SaaS Tier: <b>Enterprise Unlimited</b></span>
          </div>
        </div>

        {/* Quick Direct Operations Action Dock */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            title="Enroll new member"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Enroll Member</span>
          </button>

          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            title="Record member fee payment"
          >
            <CreditCard className="h-3.5 w-3.5 text-purple-500" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => openUPIQRModal(settings.membershipPlans[0]?.price || 2800, "Walk-in Member", "Monthly Flex Pass")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald/40 bg-emerald-soft px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-emerald-soft/80 transition"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Show UPI QR</span>
          </button>

          {pendingDuesCount > 0 && (
            <button
              onClick={handleBatchNudge}
              className="inline-flex items-center gap-1.5 rounded-xl border border-warn/40 bg-warn/10 text-warn px-3 py-1.5 text-xs font-semibold hover:bg-warn/20 transition"
              title="Queue automated WhatsApp reminders"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Nudge Dues ({pendingDuesCount})</span>
            </button>
          )}

          <button
            onClick={() => setShowGlossary((prev) => !prev)}
            className="p-1.5 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground transition"
            title="Explain Dashboard Terms"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Metric Plain English Glossary Accordion */}
      {showGlossary && (
        <div className="rounded-xl border border-border bg-canvas p-4 text-xs space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Gym Owner's Plain-English Metric Guide</span>
            <button onClick={() => setShowGlossary(false)} className="text-muted-foreground hover:text-foreground">
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-muted-foreground">
            <div className="p-2 rounded-lg bg-surface border border-border">
              <b className="text-foreground">MRR (Monthly Revenue):</b> Predictable recurring subscription fees collected every month.
            </div>
            <div className="p-2 rounded-lg bg-surface border border-border">
              <b className="text-foreground">Retention Rate:</b> Percentage of members renewing on time vs dropping out.
            </div>
            <div className="p-2 rounded-lg bg-surface border border-border">
              <b className="text-foreground">Pro Shop POS:</b> High-margin protein, drinks, and gear sold at front desk.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
