import React, { useState } from "react";
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Layers,
  Calendar,
  Dumbbell,
  BarChart3,
  BellRing,
  Settings,
  Search,
  Plus,
  Menu,
  X,
  UserPlus,
  KeyRound,
  QrCode,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  ChevronDown,
  Building,
  Radio,
  Send,
  RotateCw,
  FileSpreadsheet,
  Lock,
  Zap,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useGymStore } from "../lib/gym-store";
import { AddMemberModal } from "../components/AddMemberModal";
import { EditMemberModal } from "../components/EditMemberModal";
import { RecordPaymentModal } from "../components/RecordPaymentModal";
import { SettingsModal } from "../components/SettingsModal";
import { CommandPalette } from "../components/dashboard/CommandPalette";
import { Member360Sheet } from "../components/dashboard/Member360Sheet";
import { InvoiceModal } from "../components/dashboard/InvoiceModal";
import { DynamicUPIQRModal } from "../components/dashboard/DynamicUPIQRModal";
import { MobileBottomNav } from "../components/dashboard/MobileBottomNav";
import { LiveClock } from "../components/dashboard/LiveClock";
import { RoleBadge } from "../components/dashboard/RoleBadge";
import { RefundModal } from "../components/dashboard/RefundModal";
import { RenewMemberModal } from "../components/dashboard/RenewMemberModal";
import { BulkImportModal } from "../components/dashboard/BulkImportModal";
import { TransferMembershipModal } from "../components/dashboard/TransferMembershipModal";
import { FreezeMemberModal } from "../components/dashboard/FreezeMemberModal";
import { AdminAuthModal } from "../components/dashboard/AdminAuthModal";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

interface NavGroup {
  group: string;
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    role: "all" | "admin";
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: "HOME",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, role: "all" },
      { to: "/dashboard/checkin", label: "Floor Check-In", icon: CheckCircle2, role: "all" },
    ],
  },
  {
    group: "OPERATIONS",
    items: [
      { to: "/dashboard/members", label: "Members Directory", icon: Users, role: "all" },
      { to: "/dashboard/renewals", label: "Renewals Hub", icon: RotateCw, role: "all" },
      { to: "/dashboard/plans", label: "Membership Plans", icon: Layers, role: "all" },
    ],
  },
  {
    group: "FINANCES & STAFF",
    items: [
      { to: "/dashboard/payments", label: "Finances & Dues", icon: CreditCard, role: "admin" },
      { to: "/dashboard/staff", label: "Staff & Payroll", icon: Users, role: "admin" },
    ],
  },
  {
    group: "GROWTH & CRM",
    items: [
      { to: "/dashboard/leads", label: "Prospect CRM", icon: UserPlus, role: "all" },
      { to: "/dashboard/reports", label: "Reports & Exports", icon: FileSpreadsheet, role: "all" },
      { to: "/dashboard/analytics", label: "Analytics & Growth", icon: BarChart3, role: "admin" },
    ],
  },
  {
    group: "FACILITIES & DIET",
    items: [
      { to: "/dashboard/workouts", label: "Workouts & Diet", icon: Dumbbell, role: "all" },
      { to: "/dashboard/lockers", label: "Locker Registry", icon: KeyRound, role: "all" },
      { to: "/dashboard/reminders", label: "Broadcast Center", icon: Radio, role: "all" },
    ],
  },
  {
    group: "SYSTEM",
    items: [
      { to: "/dashboard/settings", label: "Business Settings", icon: Settings, role: "admin" },
    ],
  },
];

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    members,
    leads,
    broadcasts,
    settings,
    currentUser,
    theme,
    toggleTheme,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    openUPIQRModal,
    requestRoleSwitch,
    logout,
  } = useGymStore();

  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isAdmin = currentUser.role === "admin";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate({ to: "/" });
  };

  const pendingDuesCount = members.filter((m) => m.due > 0).length;
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  const expiringMembersCount = members.filter((m) => m.status === "Expiring").length;
  const insideMembersCount = members.filter((m) => m.isCurrentlyInside).length;

  return (
    <div className="flex min-h-screen w-full bg-canvas text-foreground font-sans selection:bg-brand selection:text-brand-foreground">
      {/* Sleek Enterprise Navigation Rail (Gymforce / Calyxo Style) */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar select-none print:hidden">
        {/* Brand Header */}
        <div className="border-b border-border px-5 py-5">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-9 w-9 rounded-xl object-cover border border-brand/30 shadow-xs shrink-0"
              />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground font-heading font-black text-sm shadow-xs shrink-0">
                PR
              </div>
            )}
            <div className="leading-tight overflow-hidden flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h1 className="text-sm font-heading font-black tracking-wider uppercase text-foreground">
                  PEAKREP
                </h1>
                <span className="text-[9px] font-heading uppercase font-extrabold px-2 py-0.5 rounded-full bg-brand-soft text-brand border border-brand/20">
                  {isAdmin ? "Admin" : "Recep"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground truncate font-medium mt-0.5">
                {settings.name}
              </p>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-3.5 py-4">
          {NAV_GROUPS.map((group) => {
            const visibleItems = group.items.filter((item) => isAdmin || item.role === "all");
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.group} className="space-y-1">
                <div className="px-3 pb-1 text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground/70">
                  {group.group}
                </div>

                {visibleItems.map((item) => {
                  const isActive =
                    item.to === "/dashboard"
                      ? pathname === "/dashboard" || pathname === "/dashboard/"
                      : pathname.startsWith(item.to);

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "bg-brand-soft text-brand border border-brand/30 shadow-xs font-bold"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`h-4 w-4 shrink-0 transition-transform ${
                            isActive ? "text-brand scale-105" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.to === "/dashboard/checkin" && insideMembersCount > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                              isActive ? "bg-brand text-brand-foreground" : "bg-emerald-500/20 text-emerald"
                            }`}
                          >
                            {insideMembersCount}
                          </span>
                        )}

                        {item.to === "/dashboard/renewals" && expiringMembersCount > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                              isActive ? "bg-brand text-brand-foreground" : "bg-amber-500/20 text-amber-500"
                            }`}
                          >
                            {expiringMembersCount}
                          </span>
                        )}

                        {item.to === "/dashboard/members" && pendingDuesCount > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                              isActive ? "bg-brand text-brand-foreground" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {pendingDuesCount}
                          </span>
                        )}

                        {item.to === "/dashboard/leads" && activeLeadsCount > 0 && (
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                              isActive ? "bg-brand text-brand-foreground" : "bg-brand-soft text-brand"
                            }`}
                          >
                            {activeLeadsCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* User Session Footer & Log Out */}
        <div className="p-3.5 border-t border-border space-y-2.5">
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-brand-foreground font-heading font-extrabold text-xs shrink-0">
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="leading-tight truncate">
                <p className="text-xs font-bold text-foreground truncate">{currentUser.name}</p>
                <p className="text-[10px] text-brand uppercase font-extrabold tracking-wider">{currentUser.role}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border border-border bg-canvas hover:bg-rose-500/10 hover:border-rose-500/30 text-muted-foreground hover:text-rose-500 transition shrink-0"
              title="Log Out Session"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Utility Toggles */}
          <div className="flex items-center justify-between px-1 text-muted-foreground text-xs">
            <button
              onClick={() => toggleTheme()}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4" />
            </button>

            <button
              onClick={() => requestRoleSwitch(isAdmin ? "reception" : "admin")}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition text-[11px] font-semibold"
              title="Switch Active Role"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-brand" />
              <span>Switch: {isAdmin ? "Recep" : "Admin"}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/70 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className="flex h-full w-72 flex-col bg-surface p-4 shadow-2xl space-y-4 border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-3">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.name}
                    className="h-9 w-9 rounded-xl object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-brand-foreground font-heading font-black text-sm shrink-0">
                    PR
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-heading font-black tracking-wider uppercase text-foreground">PEAKREP</h2>
                  <p className="text-[11px] text-muted-foreground truncate">{settings.name}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-4 overflow-y-auto">
              {NAV_GROUPS.map((group) => {
                const visibleItems = group.items.filter((item) => isAdmin || item.role === "all");
                if (visibleItems.length === 0) return null;

                return (
                  <div key={group.group} className="space-y-1">
                    <div className="px-3 text-[10px] font-heading font-bold uppercase tracking-widest text-muted-foreground/70">
                      {group.group}
                    </div>
                    {visibleItems.map((item) => {
                      const isActive =
                        item.to === "/dashboard"
                          ? pathname === "/dashboard" || pathname === "/dashboard/"
                          : pathname.startsWith(item.to);

                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setMobileDrawerOpen(false)}
                          className={`flex items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                            isActive
                              ? "bg-brand-soft text-brand font-bold border border-brand/30"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 pb-16 md:pb-0">
        {/* Redesigned Universal Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/90 px-4 md:px-8 backdrop-blur-md print:hidden">
          {/* Header Left: Menu Toggle + PEAKREP Title & Dynamic Gym Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Universal Search & Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-brand/40 transition w-56 lg:w-72 text-left"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">Search members, actions...</span>
              <kbd className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Header Right: RoleBadge, Live Clock, Notifications, Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* RBAC Role Switcher Badge */}
            <RoleBadge variant="header" />

            {/* Live Real-Time Clock */}
            <LiveClock variant="badge" />

            {/* Notifications Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative p-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground hover:bg-muted transition"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {(pendingDuesCount > 0 || expiringMembersCount > 0) && (
                  <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-amber-500 text-[9px] font-bold text-white grid place-items-center">
                    {pendingDuesCount + expiringMembersCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl border border-border bg-surface shadow-2xl p-4 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold text-foreground">Operational Notifications</h4>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="text-muted-foreground hover:text-foreground p-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    {pendingDuesCount > 0 && (
                      <Link
                        to="/dashboard/payments"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition"
                      >
                        <span>{pendingDuesCount} member(s) with pending dues</span>
                        <span className="font-bold">Review →</span>
                      </Link>
                    )}
                    {expiringMembersCount > 0 && (
                      <Link
                        to="/dashboard/renewals"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition"
                      >
                        <span>{expiringMembersCount} membership(s) expiring soon</span>
                        <span className="font-bold">Renew →</span>
                      </Link>
                    )}
                    {pendingDuesCount === 0 && expiringMembersCount === 0 && (
                      <div className="py-4 text-center text-muted-foreground text-xs">
                        All member accounts & dues are fully updated!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Header Direct Log Out Action */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-heading font-bold text-muted-foreground hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 transition"
              title="Log Out Current Session"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </header>

        {/* Dynamic Nested Route View */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-canvas print:hidden">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Global Context Modals */}
      <AddMemberModal />
      <EditMemberModal />
      <RecordPaymentModal />
      <SettingsModal />
      <CommandPalette />
      <Member360Sheet />
      <InvoiceModal />
      <DynamicUPIQRModal />
      <MobileBottomNav />
      <RefundModal />
      <RenewMemberModal />
      <BulkImportModal />
      <TransferMembershipModal />
      <FreezeMemberModal />
      <AdminAuthModal />
    </div>
  );
}