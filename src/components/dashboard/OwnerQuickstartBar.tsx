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
} from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { toast } from "sonner";

export function OwnerQuickstartBar() {
  const {
    locations,
    currentLocationId,
    switchLocation,
    members,
    checkInMember,
    openUPIQRModal,
    setIsAddMemberOpen,
    sendAllReminders,
    processPOSSale,
    posProducts,
    settings,
  } = useGymStore();

  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showGlossary, setShowGlossary] = useState(false);

  const currentLoc = locations.find((l) => l.id === currentLocationId) || locations[0];

  const handleSimulateRush = () => {
    // Check in 3 inactive members to simulate evening peak rush
    const notInside = members.filter((m) => !m.isCurrentlyInside).slice(0, 3);
    notInside.forEach((m) => checkInMember(m.id));
    toast.success(`⚡ Simulated rush: Checked in 3 members to gym floor!`);
  };

  const handleSimulateWalkInPOS = () => {
    if (posProducts.length > 0) {
      processPOSSale({
        memberName: "Walk-in Guest",
        items: [{ productId: posProducts[0].id, name: posProducts[0].name, price: posProducts[0].price, quantity: 1 }],
        paymentMethod: "UPI",
      });
      toast.success(`🛍️ Simulated Pro Shop Sale: Sold 1x ${posProducts[0].name} via UPI!`);
    }
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
                    <span className="text-[10px] opacity-80">{loc.memberCount} active</span>
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

        {/* Guided Simulation Buttons for Demo / Testing */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateRush}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
            title="Simulate 3 members checking in to floor"
          >
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Rush</span>
          </button>

          <button
            onClick={handleSimulateWalkInPOS}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
            title="Simulate selling protein powder"
          >
            <ShoppingBag className="h-3.5 w-3.5 text-purple-500" />
            <span>Simulate POS Sale</span>
          </button>

          <button
            onClick={() => openUPIQRModal(2800, "Walk-in Member", "Monthly Flex Pass")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald/40 bg-emerald-soft px-3 py-1.5 text-xs font-semibold text-accent-foreground hover:bg-emerald-soft/80 transition"
          >
            <QrCode className="h-3.5 w-3.5" />
            <span>Show UPI QR</span>
          </button>

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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-muted-foreground">
            <div className="p-2 rounded-lg bg-surface border border-border">
              <b className="text-foreground">Floor Occupancy:</b> Number of members actively on the workout floor right now.
            </div>
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
