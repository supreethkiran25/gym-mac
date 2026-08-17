import React, { useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
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

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Prospect CRM", icon: UserPlus },
  { to: "/dashboard/members", label: "Members Directory", icon: Users },
  { to: "/dashboard/payments", label: "Finances & Payments", icon: CreditCard },
  { to: "/dashboard/workouts", label: "Workout & Diet Plans", icon: Dumbbell },
  { to: "/dashboard/lockers", label: "Locker Registry", icon: KeyRound },
  { to: "/dashboard/staff", label: "Staff & Payroll", icon: Users },
  { to: "/dashboard/plans", label: "Membership Plans", icon: Layers },
  { to: "/dashboard/reminders", label: "Broadcast Center", icon: Radio },
  { to: "/dashboard/analytics", label: "Analytics & Growth", icon: BarChart3 },
  { to: "/dashboard/settings", label: "Business Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    members,
    leads,
    broadcasts,
    settings,
    theme,
    toggleTheme,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsCommandPaletteOpen,
    setIsSettingsOpen,
    openUPIQRModal,
  } = useGymStore();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const pendingDuesCount = members.filter((m) => m.due > 0).length;
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  const expiringMembersCount = members.filter((m) => m.status === "Expiring").length;

  return (
    <div className="flex min-h-screen w-full bg-canvas text-foreground">
      {/* Enterprise Navigation Rail for Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface/60 select-none">
        {/* Brand Header */}
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-10 w-10 rounded-xl object-cover border border-border shadow-xs shrink-0"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background font-bold font-mono text-base shadow-xs shrink-0">
                PR
              </div>
            )}
            <div className="leading-tight overflow-hidden">
              <h1 className="text-sm font-bold tracking-wider uppercase text-foreground">
                PEAKREP
              </h1>
              <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">
                {settings.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition ${
                  isActive
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.to === "/dashboard/members" && pendingDuesCount > 0 && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    isActive ? "bg-background text-foreground" : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    {pendingDuesCount}
                  </span>
                )}
                {item.to === "/dashboard/leads" && activeLeadsCount > 0 && (
                  <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold ${
                    isActive ? "bg-background text-foreground" : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                  }`}>
                    {activeLeadsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Quick Profile & Sync Status */}
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-border bg-canvas p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald" />
              <span className="font-semibold text-foreground truncate">{settings.ownerName || "Gym Director"}</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">OS v8.0</span>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Navigation Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
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
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background font-bold text-sm shrink-0">
                    PR
                  </div>
                )}
                <div>
                  <h2 className="text-sm font-bold tracking-wider uppercase text-foreground">PEAKREP</h2>
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

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const isActive =
                  item.to === "/dashboard"
                    ? pathname === "/dashboard" || pathname === "/dashboard/"
                    : pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                      isActive
                        ? "bg-foreground text-background font-bold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 pb-16 md:pb-0">
        {/* Redesigned Universal Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/90 px-4 md:px-8 backdrop-blur-md">
          {/* Header Left: Menu Toggle + PEAKREP Title & Dynamic Gym Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground"
              aria-label="Open mobile menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Application Branding Hub */}
            <div className="flex items-center gap-2.5">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="hidden sm:block h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                />
              ) : null}
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm md:text-base font-bold tracking-wider uppercase text-foreground">
                    PEAKREP
                  </span>
                </div>
                <p className="text-[11px] md:text-xs text-muted-foreground font-medium truncate max-w-[150px] sm:max-w-[240px] md:max-w-[320px]">
                  {settings.name}
                </p>
              </div>
            </div>

            {/* Universal Search & Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2.5 rounded-xl border border-border bg-canvas px-3.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition w-48 lg:w-64 text-left ml-2"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">Search records, actions...</span>
              <kbd className="ml-auto inline-flex items-center gap-0.5 text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Header Right: Live Clock, Notifications, Quick Actions & Profile */}
          <div className="flex items-center gap-2">
            {/* Live Real-Time Clock */}
            <LiveClock variant="badge" />

            {/* Search Icon Trigger on Small Screens */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="md:hidden p-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>

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

                  <div className="space-y-2 max-h-64 overflow-y-auto text-xs">
                    {pendingDuesCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-foreground space-y-1">
                        <p className="font-semibold text-amber-600 dark:text-amber-400">
                          {pendingDuesCount} Pending Dues
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Members have outstanding installment balances awaiting collection.
                        </p>
                      </div>
                    )}

                    {expiringMembersCount > 0 && (
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-foreground space-y-1">
                        <p className="font-semibold text-rose-600 dark:text-rose-400">
                          {expiringMembersCount} Members Expiring Soon
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Members reach term expiration within the next 7 days.
                        </p>
                      </div>
                    )}

                    {broadcasts.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-canvas border border-border text-foreground space-y-1">
                        <p className="font-semibold">Recent Broadcast: {broadcasts[0].title}</p>
                        <p className="text-[11px] text-muted-foreground">{broadcasts[0].sentAt || broadcasts[0].createdAt}</p>
                      </div>
                    )}

                    {pendingDuesCount === 0 && expiringMembersCount === 0 && broadcasts.length === 0 && (
                      <p className="text-center text-muted-foreground py-4 text-xs">
                        No pending operational alerts.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border flex justify-end">
                    <Link
                      to="/dashboard/reminders"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-semibold text-emerald hover:underline"
                    >
                      Open Broadcast Center →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground hover:bg-muted transition"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>

            {/* Show UPI QR Button */}
            <button
              onClick={() => openUPIQRModal(settings.membershipPlans[0]?.price || 3000, "Walk-in Member", "Monthly Flex Pass")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            >
              <QrCode className="h-3.5 w-3.5 text-emerald" />
              <span>UPI QR</span>
            </button>

            {/* Record Payment Button */}
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs font-semibold hover:bg-muted transition"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Record Payment</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Member</span>
            </button>

            {/* Profile Dropdown / Trigger */}
            <Link
              to="/dashboard/settings"
              className="hidden md:flex items-center gap-2 rounded-xl border border-border bg-canvas p-1.5 hover:bg-muted transition"
              title="Business Profile & Settings"
            >
              <div className="grid h-6 w-6 place-items-center rounded-lg bg-muted text-[11px] font-bold text-foreground">
                {settings.ownerName ? settings.ownerName.charAt(0) : "G"}
              </div>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 px-4 md:px-8 py-6 md:py-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Interactive Modals & Slide-Overs */}
      <CommandPalette />
      <Member360Sheet />
      <InvoiceModal />
      <DynamicUPIQRModal />
      <AddMemberModal />
      <EditMemberModal />
      <RecordPaymentModal />
      <SettingsModal />
      <MobileBottomNav />
    </div>
  );
}