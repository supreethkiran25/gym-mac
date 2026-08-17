import React, { useState } from "react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Activity,
  CreditCard,
  Layers,
  Calendar,
  Dumbbell,
  BarChart3,
  BellRing,
  Settings,
  Search,
  Plus,
  UserCheck,
  Menu,
  X,
  Command,
  TrendingUp,
  UserPlus,
  ShoppingBag,
  KeyRound,
  QrCode,
  Sun,
  Moon,
} from "lucide-react";
import { useGymStore } from "../lib/gym-store";
import { AddMemberModal } from "../components/AddMemberModal";
import { EditMemberModal } from "../components/EditMemberModal";
import { RecordPaymentModal } from "../components/RecordPaymentModal";
import { SettingsModal } from "../components/SettingsModal";
import { CommandPalette } from "../components/dashboard/CommandPalette";
import { Member360Sheet } from "../components/dashboard/Member360Sheet";
import { InstantCheckInModal } from "../components/dashboard/InstantCheckInModal";
import { InvoiceModal } from "../components/dashboard/InvoiceModal";
import { DynamicUPIQRModal } from "../components/dashboard/DynamicUPIQRModal";
import { MobileBottomNav } from "../components/dashboard/MobileBottomNav";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Prospect & Trial CRM", icon: UserPlus },
  { to: "/dashboard/members", label: "Members Directory", icon: Users },
  { to: "/dashboard/attendance", label: "Live Floor & Heatmap", icon: Activity },
  { to: "/dashboard/pos", label: "Front-Desk POS Store", icon: ShoppingBag },
  { to: "/dashboard/payments", label: "Finances & Cashflow", icon: CreditCard },
  { to: "/dashboard/workouts", label: "Workouts & Diets", icon: Dumbbell },
  { to: "/dashboard/lockers", label: "Locker Registry", icon: KeyRound },
  { to: "/dashboard/classes", label: "Classes & Schedule", icon: Calendar },
  { to: "/dashboard/staff", label: "Staff & Payroll", icon: Users },
  { to: "/dashboard/plans", label: "Membership Plans", icon: Layers },
  { to: "/dashboard/equipment", label: "Equipment Health", icon: Dumbbell },
  { to: "/dashboard/analytics", label: "Analytics & Growth", icon: BarChart3 },
  { to: "/dashboard/reminders", label: "Communications Hub", icon: BellRing },
  { to: "/dashboard/settings", label: "Settings & Studio", icon: Settings },
] as const;

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    members,
    leads,
    settings,
    theme,
    toggleTheme,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsCheckInOpen,
    setIsCommandPaletteOpen,
    openUPIQRModal,
  } = useGymStore();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const currentlyInsideCount = members.filter((m) => m.isCurrentlyInside).length;
  const pendingDuesCount = members.filter((m) => m.due > 0).length;
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;

  return (
    <div className="flex min-h-screen w-full bg-canvas text-foreground">
      {/* Sleek Adaptive Navigation Rail for Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface/50 select-none">
        {/* Gym Brand Hub */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-foreground text-background font-bold font-serif text-lg shadow-xs">
              R
            </div>
            <div className="leading-tight overflow-hidden">
              <p className="text-sm font-semibold truncate tracking-tight">{settings.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{settings.location}</p>
            </div>
          </div>
        </div>

        {/* Live Vitals Glance */}
        <div className="px-3 pt-3 pb-1">
          <div className="rounded-xl border border-border bg-canvas/80 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
                </span>
                Floor Occupants
              </span>
              <span className="font-mono font-bold">{currentlyInsideCount} / 80</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-emerald transition-all duration-300"
                style={{ width: `${(currentlyInsideCount / 80) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active =
              item.to === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition ${
                  active
                    ? "bg-foreground text-background font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.to === "/dashboard/attendance" && currentlyInsideCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      active ? "bg-background/20 text-background" : "bg-emerald-soft text-accent-foreground"
                    }`}
                  >
                    {currentlyInsideCount}
                  </span>
                )}
                {item.to === "/dashboard/leads" && activeLeadsCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      active ? "bg-background/20 text-background" : "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                    }`}
                  >
                    {activeLeadsCount}
                  </span>
                )}
                {item.to === "/dashboard/reminders" && pendingDuesCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                      active ? "bg-background/20 text-background" : "bg-warn/20 text-warn"
                    }`}
                  >
                    {pendingDuesCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Command Bar Trigger in Sidebar */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition"
          >
            <div className="flex items-center gap-2">
              <Command className="h-3.5 w-3.5" />
              <span>Command Palette</span>
            </div>
            <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded border border-border">
              ⌘K
            </kbd>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Menu */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-surface p-4 shadow-2xl border-r border-border">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background font-bold">
                  R
                </div>
                <span className="font-semibold text-sm">{settings.name}</span>
              </div>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-md text-muted-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.to === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition ${
                      active
                        ? "bg-foreground text-background font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Command Center Layout Area */}
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-8">
        {/* Top Executive Header Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-surface/80 px-4 md:px-8 py-3.5 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Universal Search & Command Palette Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/40 transition w-48 sm:w-72 md:w-80 text-left"
            >
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">Search members, POS, classes...</span>
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-surface px-1.5 py-0.5 rounded border border-border">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
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
              onClick={() => openUPIQRModal(2800, "Walk-in Member", "Monthly Flex Pass")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              <QrCode className="h-4 w-4 text-emerald" />
              <span>UPI QR</span>
            </button>

            {/* Instant Check-In Button */}
            <button
              onClick={() => setIsCheckInOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald/40 bg-emerald-soft px-3.5 py-2 text-xs font-semibold text-accent-foreground hover:bg-emerald-soft/80 transition shadow-xs"
            >
              <UserCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Live Check-In</span>
            </button>

            {/* Record Payment Button */}
            <button
              onClick={() => setIsRecordPaymentOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3.5 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              <CreditCard className="h-4 w-4" />
              <span className="hidden md:inline">Record Payment</span>
            </button>

            {/* Add Member Button */}
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </button>
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
      <InstantCheckInModal />
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