import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Users,
  CreditCard,
  Calendar,
  Layers,
  Dumbbell,
  BarChart3,
  Settings,
  Plus,
  ArrowRight,
  Zap,
  DollarSign,
  UserPlus,
  ShoppingBag,
  KeyRound,
  QrCode,
  Sun,
  Moon,
  Clock,
  Wrench,
  Activity,
  Send,
  Sparkles,
} from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    members,
    leads,
    posProducts,
    equipment,
    staff,
    classes,
    settings,
    theme,
    toggleTheme,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setSelectedMember360,
    setIsMember360Open,
    openUPIQRModal,
  } = useGymStore();

  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const handleClose = () => {
    setIsCommandPaletteOpen(false);
  };

  const handleAction = (callback: () => void) => {
    callback();
    handleClose();
  };

  const q = query.trim().toLowerCase();

  const matchingMembers = q
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.phone.includes(q) ||
          m.plan.toLowerCase().includes(q)
      )
    : [];

  const matchingStaff = q
    ? staff.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.phone.includes(q)
      )
    : [];

  const matchingPlans = q
    ? settings.membershipPlans.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q)
      )
    : [];

  const matchingClasses = q
    ? classes.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.trainer.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      )
    : [];

  const matchingEquipment = q
    ? equipment.filter(
        (eq) =>
          eq.name.toLowerCase().includes(q) ||
          eq.serialNumber.toLowerCase().includes(q) ||
          eq.location.toLowerCase().includes(q)
      )
    : [];

  const matchingLeads = q
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.source.toLowerCase().includes(q)
      )
    : [];

  const matchingPOS = q
    ? posProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      )
    : [];

  const navRoutes = [
    { label: "Executive Command Center", path: "/dashboard", icon: Activity, section: "Navigation" },
    { label: "Members Directory & 360", path: "/dashboard/members", icon: Users, section: "Navigation" },
    { label: "Finances & Cashflow Ledger", path: "/dashboard/payments", icon: CreditCard, section: "Navigation" },
    { label: "Prospect & Trial CRM Funnel", path: "/dashboard/leads", icon: UserPlus, section: "Navigation" },
    { label: "Front-Desk POS Pro Shop", path: "/dashboard/pos", icon: ShoppingBag, section: "Navigation" },
    { label: "Staff & Payroll Management", path: "/dashboard/staff", icon: Users, section: "Navigation" },
    { label: "Studio Classes & Schedules", path: "/dashboard/classes", icon: Calendar, section: "Navigation" },
    { label: "Workout & Macro Diet Hub", path: "/dashboard/workouts", icon: Dumbbell, section: "Navigation" },
    { label: "Locker & Key Registry", path: "/dashboard/lockers", icon: KeyRound, section: "Navigation" },
    { label: "Membership Packages & Matrix", path: "/dashboard/plans", icon: Layers, section: "Navigation" },
    { label: "Equipment Health & Service Log", path: "/dashboard/equipment", icon: Wrench, section: "Navigation" },
    { label: "Analytics & Retention", path: "/dashboard/analytics", icon: BarChart3, section: "Navigation" },
    { label: "Smart Communications Hub", path: "/dashboard/reminders", icon: Send, section: "Navigation" },
    { label: "Studio Settings & GST Profile", path: "/dashboard/settings", icon: Settings, section: "Navigation" },
  ];

  const matchingNav = navRoutes.filter((n) =>
    n.label.toLowerCase().includes(q) || n.path.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-16 sm:pt-24 px-4 backdrop-blur-xs animate-in fade-in duration-100"
      onClick={handleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") handleClose();
      }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl animate-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 bg-surface">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, member, staff, plan, or action... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-hidden placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex items-center rounded-md border border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Command Results Scroll View */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {/* Quick Direct Actions */}
          {(!q || "enroll add new member pay upi qr".includes(q)) && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Instant Actions (1-Click)
              </p>

              <button
                onClick={() => handleAction(() => setIsAddMemberOpen(true))}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition">
                    <Plus className="h-3.5 w-3.5" />
                  </span>
                  <span>Enroll New Member Profile</span>
                </div>
                <kbd className="font-mono text-[10px] text-muted-foreground">↵</kbd>
              </button>

              <button
                onClick={() => handleAction(() => setIsRecordPaymentOpen(true))}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 group-hover:scale-105 transition">
                    <CreditCard className="h-3.5 w-3.5" />
                  </span>
                  <span>Record Payment & Generate GST Tax Invoice</span>
                </div>
                <kbd className="font-mono text-[10px] text-muted-foreground">↵</kbd>
              </button>

              <button
                onClick={() =>
                  handleAction(() =>
                    openUPIQRModal(
                      settings.membershipPlans[0]?.price || 2800,
                      "Walk-in Member",
                      "Monthly Flex Pass"
                    )
                  )
                }
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-emerald-soft text-accent-foreground group-hover:scale-105 transition">
                    <QrCode className="h-3.5 w-3.5" />
                  </span>
                  <span>Generate Dynamic Front-Desk UPI QR Code</span>
                </div>
                <kbd className="font-mono text-[10px] text-muted-foreground">↵</kbd>
              </button>

              <button
                onClick={() => handleAction(toggleTheme)}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="p-1 rounded-lg bg-muted text-foreground group-hover:scale-105 transition">
                    {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </span>
                  <span>Toggle Theme ({theme === "dark" ? "Light Mode" : "Dark Mode"})</span>
                </div>
                <kbd className="font-mono text-[10px] text-muted-foreground">↵</kbd>
              </button>
            </div>
          )}

          {/* Matching Members */}
          {matchingMembers.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Members ({matchingMembers.length})
              </p>
              {matchingMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() =>
                    handleAction(() => {
                      setSelectedMember360(m);
                      setIsMember360Open(true);
                    })
                  }
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background font-bold text-[10px]">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{m.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{m.phone} · {m.plan}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono font-semibold">
                    {m.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Staff */}
          {matchingStaff.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Staff & Coaches ({matchingStaff.length})
              </p>
              {matchingStaff.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleAction(() => navigate({ to: "/dashboard/staff" }))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-soft text-accent-foreground font-bold text-[10px]">
                      {s.avatar || s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{s.name}</p>
                      <p className="text-[10px] text-muted-foreground">{s.role} · {s.shift}</p>
                    </div>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold">
                    {s.status}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Plans */}
          {matchingPlans.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Membership Plans ({matchingPlans.length})
              </p>
              {matchingPlans.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleAction(() => navigate({ to: "/dashboard/plans" }))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="h-4 w-4 text-emerald" />
                    <span>{p.name}</span>
                  </div>
                  <span className="font-mono font-semibold">
                    {settings.currencySymbol}{p.price.toLocaleString("en-IN")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Studio Classes */}
          {matchingClasses.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Classes ({matchingClasses.length})
              </p>
              {matchingClasses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => handleAction(() => navigate({ to: "/dashboard/classes" }))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>{c.title} ({c.time})</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Coach: {c.trainer}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matching Equipment */}
          {matchingEquipment.length > 0 && (
            <div className="space-y-1">
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Equipment ({matchingEquipment.length})
              </p>
              {matchingEquipment.map((eq) => (
                <button
                  key={eq.id}
                  onClick={() => handleAction(() => navigate({ to: "/dashboard/equipment" }))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Dumbbell className="h-4 w-4 text-amber-500" />
                    <span>{eq.name} ({eq.serialNumber})</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{eq.location}</span>
                </button>
              ))}
            </div>
          )}

          {/* Navigation Items */}
          <div className="space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Direct Navigation
            </p>
            {matchingNav.map((n) => (
              <button
                key={n.path}
                onClick={() => handleAction(() => navigate({ to: n.path }))}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition group"
              >
                <div className="flex items-center gap-2.5">
                  <n.icon className="h-4 w-4 text-muted-foreground group-hover:text-emerald transition" />
                  <span>{n.label}</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
              </button>
            ))}
          </div>
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between border-t border-border bg-canvas/80 px-4 py-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[9px]">↵</kbd> Select
            </span>
          </div>
          <span>Linear Fast Search</span>
        </div>
      </div>
    </div>
  );
}
