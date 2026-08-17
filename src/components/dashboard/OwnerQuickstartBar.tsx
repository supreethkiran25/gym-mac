import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  Users,
  QrCode,
  ChevronDown,
  UserPlus,
  Radio,
  CreditCard,
  KeyRound,
  Dumbbell,
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
    settings,
  } = useGymStore();

  const [showLocationMenu, setShowLocationMenu] = useState(false);

  const currentLoc = locations.find((l) => l.id === currentLocationId) || locations[0];
  const pendingDuesCount = members.filter((m) => m.due > 0).length;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 space-y-3 shadow-2xs">
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
            <span>PeakRep OS <b>v8.0</b></span>
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
            title="Record installment payment"
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Record Installment</span>
          </button>

          <button
            onClick={() => openUPIQRModal(settings.membershipPlans[0]?.price || 3000, "Walk-in Member", "Gym Fee")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            title="Show dynamic UPI QR"
          >
            <QrCode className="h-3.5 w-3.5 text-emerald" />
            <span>UPI QR</span>
          </button>

          <Link
            to="/dashboard/reminders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            title="Open Broadcast Messaging Center"
          >
            <Radio className="h-3.5 w-3.5 text-purple-500" />
            <span>Broadcast ({pendingDuesCount} Dues)</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
