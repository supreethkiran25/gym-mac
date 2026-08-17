import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Users,
  CreditCard,
  UserCheck,
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
} from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";

export function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    members,
    leads,
    posProducts,
    workoutPrograms,
    staff,
    classes,
    theme,
    toggleTheme,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsCheckInOpen,
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

  const matchingMembers = query.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(query.toLowerCase()) ||
          m.phone.includes(query) ||
          m.plan.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchingLeads = query.trim()
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(query.toLowerCase()) ||
          l.phone.includes(query) ||
          l.source.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchingPOS = query.trim()
    ? posProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.sku.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchingStaff = query.trim()
    ? staff.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.role.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const matchingClasses = query.trim()
    ? classes.filter(
        (c) =>
          c.title.toLowerCase().includes(query.toLowerCase()) ||
          c.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const navItems = [
    { label: "Overview Command Center", path: "/dashboard", icon: Zap },
    { label: "Prospect & Trial CRM", path: "/dashboard/leads", icon: UserPlus },
    { label: "Members Directory", path: "/dashboard/members", icon: Users },
    { label: "Live Floor & Heatmaps", path: "/dashboard/attendance", icon: UserCheck },
    { label: "Front-Desk POS Pro Shop", path: "/dashboard/pos", icon: ShoppingBag },
    { label: "Finances & Cashflow", path: "/dashboard/payments", icon: CreditCard },
    { label: "Workouts & Diet Programs", path: "/dashboard/workouts", icon: Dumbbell },
    { label: "Locker & Key Registry", path: "/dashboard/lockers", icon: KeyRound },
    { label: "Classes & Schedule", path: "/dashboard/classes", icon: Calendar },
    { label: "Staff & 1-Click Payroll", path: "/dashboard/staff", icon: Users },
    { label: "Membership Plans", path: "/dashboard/plans", icon: Layers },
    { label: "Analytics & Retention", path: "/dashboard/analytics", icon: BarChart3 },
    { label: "Settings & Studio", path: "/dashboard/settings", icon: Settings },
  ];

  const matchingNav = navItems.filter((n) =>
    n.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Input */}
        <div className="flex items-center border-b border-border px-4 py-3 bg-muted/30">
          <Search className="h-4 w-4 text-muted-foreground mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search members, leads, POS items, actions, pages... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-medium"
          />
          {query && (
            <button onClick={() => setQuery("")} className="text-xs text-muted-foreground hover:text-foreground">
              Clear
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 text-xs">
          {/* Quick Actions Shortcuts */}
          {!query && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Rapid Actions
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => handleAction(() => toggleTheme())}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-foreground" />}
                    <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Theme</span>
                </button>

                <button
                  onClick={() => handleAction(() => setIsCheckInOpen(true))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <UserCheck className="h-4 w-4 text-emerald" />
                    <span>Instant Floor Check-In</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">1-Click</span>
                </button>

                <button
                  onClick={() => handleAction(() => openUPIQRModal(2800, "Walk-in Member", "Monthly Flex Pass"))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="h-4 w-4 text-emerald" />
                    <span>Generate Dynamic UPI QR</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">UPI Pay</span>
                </button>

                <button
                  onClick={() => handleAction(() => setIsAddMemberOpen(true))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <Plus className="h-4 w-4 text-blue-500" />
                    <span>Add New Member</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Enrollment</span>
                </button>

                <button
                  onClick={() => handleAction(() => setIsRecordPaymentOpen(true))}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="h-4 w-4 text-purple-500" />
                    <span>Record Payment / Dues</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Invoice</span>
                </button>
              </div>
            </div>
          )}

          {/* Members Matches */}
          {matchingMembers.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Members ({matchingMembers.length})
              </p>
              <div className="space-y-0.5">
                {matchingMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      handleAction(() => {
                        setSelectedMember360(m);
                        setIsMember360Open(true);
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-6 w-6 place-items-center rounded-lg bg-foreground text-background font-bold text-[10px]">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-[10px] text-muted-foreground">{m.phone} · {m.plan}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald">View 360 →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leads Matches */}
          {matchingLeads.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Prospect Leads ({matchingLeads.length})
              </p>
              <div className="space-y-0.5">
                {matchingLeads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() =>
                      handleAction(() => {
                        navigate({ to: "/dashboard/leads" });
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <UserPlus className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="font-semibold">{l.name}</p>
                        <p className="text-[10px] text-muted-foreground">{l.phone} · {l.source} ({l.stage})</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-purple-600">Open CRM →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* POS Matches */}
          {matchingPOS.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Pro Shop Products ({matchingPOS.length})
              </p>
              <div className="space-y-0.5">
                {matchingPOS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() =>
                      handleAction(() => {
                        navigate({ to: "/dashboard/pos" });
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="h-4 w-4 text-emerald" />
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground">SKU: {p.sku} · ₹{p.price}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald">POS Store →</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Section Matches */}
          {matchingNav.length > 0 && (
            <div>
              <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Navigation
              </p>
              <div className="space-y-0.5">
                {matchingNav.map((n) => (
                  <button
                    key={n.path}
                    onClick={() =>
                      handleAction(() => {
                        navigate({ to: n.path });
                      })
                    }
                    className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-foreground hover:bg-muted transition text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <n.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{n.label}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
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
