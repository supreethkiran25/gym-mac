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
  ShoppingBag,
  KeyRound,
  QrCode,
  Sun,
  Moon,
  Activity,
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

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/leads", label: "Prospect & Trial CRM", icon: UserPlus },
  { to: "/dashboard/members", label: "Members Directory", icon: Users },
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
    setIsCommandPaletteOpen,
    openUPIQRModal,
  } = useGymStore();

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

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

        {/* Navigation Items Links */}
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
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-foreground text-background shadow-xs font-bold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.to === "/dashboard/members" && pendingDuesCount > 0 && (
                  <span className="rounded-full bg-warn/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-warn">
                    {pendingDuesCount}
                  </span>
                )}
                {item.to === "/dashboard/leads" && activeLeadsCount > 0 && (
                  <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[10px] font-mono font-bold text-purple-600 dark:text-purple-400">
                    {activeLeadsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Quick Profile & Settings */}
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-border bg-canvas p-2.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald" />
              <span className="font-semibold text-foreground">SaaS Online</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground">v2.4 Pro</span>
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
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background font-bold text-sm">
                  R
                </div>
                <div>
                  <h3 className="text-sm font-bold">{settings.name}</h3>
                  <p className="text-[10px] text-muted-foreground">Gym Management</p>
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
                        ? "bg-foreground text-background"
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
        {/* Universal Top Header */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface/80 px-4 md:px-8 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground"
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
              onClick={() => openUPIQRModal(settings.membershipPlans[0]?.price || 2800, "Walk-in Member", "Monthly Flex Pass")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-semibold hover:bg-muted transition"
            >
              <QrCode className="h-4 w-4 text-emerald" />
              <span>UPI QR</span>
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