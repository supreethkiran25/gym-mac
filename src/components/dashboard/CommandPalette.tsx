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
  UserPlus,
  KeyRound,
  QrCode,
  Sun,
  Moon,
  Radio,
  Utensils,
  Wrench,
} from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    members,
    leads,
    lockers,
    workoutPrograms,
    dietPlans,
    staff,
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
          m.plan.toLowerCase().includes(q),
      )
    : [];

  const matchingStaff = q
    ? staff.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q) ||
          s.phone.includes(q),
      )
    : [];

  const matchingPlans = q
    ? settings.membershipPlans.filter(
        (p) => p.name.toLowerCase().includes(q) || p.type.toLowerCase().includes(q),
      )
    : [];

  const matchingLockers = q
    ? lockers.filter(
        (l) =>
          l.number.toString().includes(q) ||
          l.assignedMemberName?.toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q),
      )
    : [];

  const matchingWorkouts = q
    ? workoutPrograms.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.focus.toLowerCase().includes(q),
      )
    : [];

  const matchingDiets = q
    ? dietPlans.filter(
        (d) => d.title.toLowerCase().includes(q) || d.category.toLowerCase().includes(q),
      )
    : [];

  const matchingLeads = q
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.phone.includes(q) ||
          l.fitnessGoal.toLowerCase().includes(q),
      )
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-16 sm:pt-24 backdrop-blur-xs animate-in fade-in duration-100 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 bg-surface">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, member name, plan, locker, or action..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded"
            >
              Clear
            </button>
          ) : (
            <kbd className="hidden sm:inline-block rounded border border-border bg-canvas px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              ESC to close
            </kbd>
          )}
        </div>

        {/* Results / Navigation Commands List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 text-xs space-y-3">
          {/* Quick Actions */}
          <div>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Operational Actions
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() =>
                  handleAction(() => {
                    setIsAddMemberOpen(true);
                  })
                }
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <UserPlus className="h-4 w-4 text-emerald" />
                  <span className="font-semibold">Enroll New Member</span>
                </div>
                <span className="text-[11px] text-muted-foreground">Register membership</span>
              </button>

              <button
                onClick={() =>
                  handleAction(() => {
                    setIsRecordPaymentOpen(true);
                  })
                }
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="font-semibold">Record Payment / Installment</span>
                </div>
                <span className="text-[11px] text-muted-foreground">UPI, Cash, Card</span>
              </button>

              <button
                onClick={() =>
                  handleAction(() => {
                    openUPIQRModal(
                      settings.membershipPlans[0]?.price || 3000,
                      "Walk-in Member",
                      "Monthly Flex",
                    );
                  })
                }
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="h-4 w-4 text-brand" />
                  <span className="font-semibold">Display Dynamic UPI QR Code</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Instant counter collection
                </span>
              </button>

              <button
                onClick={() =>
                  handleAction(() => {
                    toggleTheme();
                  })
                }
                className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
              >
                <div className="flex items-center gap-2.5">
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-500" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                  <span className="font-semibold">
                    Toggle Appearance ({theme === "dark" ? "Light" : "Dark"} Mode)
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Direct Navigation Links */}
          <div>
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Module Navigation
            </p>
            <div className="grid grid-cols-2 gap-1">
              {[
                { to: "/dashboard", label: "Overview", icon: Users },
                { to: "/dashboard/leads", label: "Prospect CRM", icon: UserPlus },
                { to: "/dashboard/members", label: "Members Directory", icon: Users },
                { to: "/dashboard/payments", label: "Finances & Ledger", icon: CreditCard },
                { to: "/dashboard/workouts", label: "Workout & Diets", icon: Dumbbell },
                { to: "/dashboard/lockers", label: "Locker Registry", icon: KeyRound },
                { to: "/dashboard/staff", label: "Staff & Payroll", icon: Users },
                { to: "/dashboard/plans", label: "Membership Plans", icon: Layers },
                { to: "/dashboard/reminders", label: "Broadcast Center", icon: Radio },
                { to: "/dashboard/analytics", label: "Analytics & Growth", icon: BarChart3 },
                { to: "/dashboard/settings", label: "Business Settings", icon: Settings },
              ].map((link) => (
                <button
                  key={link.to}
                  onClick={() =>
                    handleAction(() => {
                      navigate({ to: link.to as never });
                    })
                  }
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
                >
                  <link.icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-medium truncate">{link.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Matched Members */}
          {matchingMembers.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Members ({matchingMembers.length})
              </p>
              <div className="space-y-0.5">
                {matchingMembers.slice(0, 4).map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      handleAction(() => {
                        setSelectedMember360(m);
                        setIsMember360Open(true);
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-brand" />
                      <span className="font-semibold">{m.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        ({m.phone} • {m.plan})
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {m.due > 0 ? `Due: ₹${m.due}` : "Active"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Lockers */}
          {matchingLockers.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Lockers ({matchingLockers.length})
              </p>
              <div className="space-y-0.5">
                {matchingLockers.slice(0, 3).map((l) => (
                  <button
                    key={l.id}
                    onClick={() =>
                      handleAction(() => {
                        navigate({ to: "/dashboard/lockers" });
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-brand" />
                      <span className="font-semibold">Locker #{l.number}</span>
                      <span className="text-[11px] text-muted-foreground">({l.section})</span>
                    </div>
                    <span className="text-[10px] font-mono">{l.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Workout Splits */}
          {matchingWorkouts.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Workouts ({matchingWorkouts.length})
              </p>
              <div className="space-y-0.5">
                {matchingWorkouts.slice(0, 3).map((w) => (
                  <button
                    key={w.id}
                    onClick={() =>
                      handleAction(() => {
                        navigate({ to: "/dashboard/workouts" });
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-left hover:bg-muted transition text-foreground"
                  >
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-3.5 w-3.5 text-brand" />
                      <span className="font-semibold">{w.title}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {w.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
