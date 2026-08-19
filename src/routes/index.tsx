import React, { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Crown,
  Headphones,
  ShieldCheck,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  Eye,
  EyeOff,
  Dumbbell,
  Users,
  CreditCard,
  BarChart3,
  Layers,
  QrCode,
  Calendar,
  MessageCircle,
  Clock,
  Printer,
  ChevronDown,
  Building,
  KeyRound,
  Check,
  TrendingUp,
  Activity,
  Sun,
  Moon,
} from "lucide-react";
import { useGymStore, UserRole } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LandingAndAuthPage,
  head: () => ({
    meta: [
      { title: "PEAKREP GYM OS — Enterprise Fitness Club Management Platform" },
      {
        name: "description",
        content:
          "The modern all-in-one operating system for high-performance gyms. Turnstile check-ins, automated WhatsApp billing, dual-role RBAC, GST INV-01 tax invoicing, and revenue analytics.",
      },
    ],
  }),
});

function LandingAndAuthPage() {
  const { login, settings, theme, toggleTheme } = useGymStore();
  const navigate = useNavigate();

  // Admin login states
  const [adminIdentifier, setAdminIdentifier] = useState("admin@gym.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Reception login states
  const [receptionIdentifier, setReceptionIdentifier] = useState("reception@gym.com");
  const [receptionPassword, setReceptionPassword] = useState("recep123");
  const [showReceptionPass, setShowReceptionPass] = useState(false);
  const [receptionLoading, setReceptionLoading] = useState(false);

  // Forgot password modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setTimeout(() => {
      login("admin", adminIdentifier, settings.ownerName || "Karan Johar (Owner)");
      setAdminLoading(false);
      toast.success("Welcome, Gym Owner! Logged in with Full Access.");
      navigate({ to: "/dashboard" });
    }, 300);
  };

  const handleReceptionLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setReceptionLoading(true);
    setTimeout(() => {
      login("reception", receptionIdentifier, "Sneha Reddy (Front Desk)");
      setReceptionLoading(false);
      toast.success("Welcome, Front Desk! Logged in with Reception Access.");
      navigate({ to: "/dashboard" });
    }, 300);
  };

  const handleQuickDemoAdmin = () => {
    login("admin", "admin@gym.com", settings.ownerName || "Karan Johar (Owner)");
    toast.success("Logged in directly as Gym Director (Full Access)");
    navigate({ to: "/dashboard" });
  };

  const handleQuickDemoReception = () => {
    login("reception", "reception@gym.com", "Sneha Reddy (Front Desk)");
    toast.success("Logged in directly as Reception Desk");
    navigate({ to: "/dashboard" });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Password reset instructions dispatched to ${forgotEmail || "your email"}`);
    setForgotModalOpen(false);
  };

  const scrollToLogin = () => {
    const el = document.getElementById("login-portal");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-foreground flex flex-col justify-between selection:bg-brand selection:text-brand-foreground font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-10 w-10 rounded-2xl object-cover border border-border shadow-xs"
              />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-brand-foreground font-heading font-black text-base shadow-md">
                PR
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-wider uppercase text-foreground font-heading">
                  PEAKREP OS
                </span>
                <span className="hidden sm:inline-flex rounded-full bg-brand-soft border border-brand/20 px-2 py-0.5 text-[10px] font-bold text-brand uppercase">
                  v9.2 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium truncate max-w-[200px] sm:max-w-none">
                {settings.name}
              </p>
            </div>
          </div>

          {/* Nav Links & Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition">Features</a>
              <a href="#preview" className="hover:text-foreground transition">Live Preview</a>
              <a href="#security" className="hover:text-foreground transition">RBAC Security</a>
              <a href="#integrations" className="hover:text-foreground transition">Hardware & UPI</a>
            </nav>

            {/* Theme Toggle */}
            <button
              onClick={() => toggleTheme()}
              className="p-2 rounded-xl border border-border bg-canvas hover:bg-muted text-muted-foreground hover:text-foreground transition"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
            </button>

            {/* Jump to Login CTA */}
            <button
              onClick={scrollToLogin}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted transition shadow-2xs"
            >
              <KeyRound className="h-3.5 w-3.5 text-brand" />
              <span>Console Login</span>
            </button>

            <button
              onClick={handleQuickDemoAdmin}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-heading font-extrabold hover:opacity-95 transition shadow-sm"
            >
              <span>Instant Launch</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 space-y-20 sm:space-y-28 py-10 sm:py-16">
        {/* ========================================================================= */}
        {/* HERO SECTION: SaaS Positioning & Value Proposition */}
        {/* ========================================================================= */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-4 py-1.5 text-xs font-heading font-bold text-brand uppercase tracking-wider shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5" /> Next-Gen Enterprise Gym Operating System · 2026
            </div>

            {/* Hero Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-foreground font-heading leading-[1.08]">
              The High-Performance <span className="text-brand">Operating System</span> for Modern Gyms
            </h1>

            {/* Hero Subtitle */}
            <p className="text-base sm:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-normal">
              Power your entire fitness business with real-time biometric turnstile check-ins, automated WhatsApp dues reminders, dual-role RBAC security for Directors & Front Desk, 1-page Indian GST INV-01 tax invoicing, and live financial ledgers.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <button
                onClick={scrollToLogin}
                className="inline-flex items-center gap-2.5 rounded-2xl bg-foreground text-background px-6 py-3.5 text-sm font-heading font-bold hover:opacity-90 transition shadow-lg"
              >
                <KeyRound className="h-4 w-4 text-brand" />
                <span>Go to Login Console</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              <button
                onClick={handleQuickDemoAdmin}
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-6 py-3.5 text-sm font-heading font-bold text-foreground hover:bg-muted transition shadow-2xs"
              >
                <Zap className="h-4 w-4 text-amber-500" />
                <span>1-Click Director Demo Access</span>
              </button>
            </div>

            {/* Value Props Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-6 text-left max-w-4xl mx-auto">
              <div className="p-3.5 rounded-2xl border border-border bg-surface/70 space-y-1">
                <div className="flex items-center gap-1.5 text-brand font-bold text-xs">
                  <ShieldCheck className="h-4 w-4" /> Dual-Role RBAC
                </div>
                <p className="text-[11px] text-muted-foreground">Strict Owner vs Reception isolation with passcode gate.</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-border bg-surface/70 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald font-bold text-xs">
                  <MessageCircle className="h-4 w-4" /> WhatsApp Billing
                </div>
                <p className="text-[11px] text-muted-foreground">Automated receipts & dynamic Indian UPI payment QR links.</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-border bg-surface/70 space-y-1">
                <div className="flex items-center gap-1.5 text-sky-500 font-bold text-xs">
                  <Printer className="h-4 w-4" /> 1-Page GST Invoicing
                </div>
                <p className="text-[11px] text-muted-foreground">SAC 999723 tax breakdown & single A4 print isolation.</p>
              </div>

              <div className="p-3.5 rounded-2xl border border-border bg-surface/70 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-500 font-bold text-xs">
                  <QrCode className="h-4 w-4" /> Floor Check-In Desk
                </div>
                <p className="text-[11px] text-muted-foreground">Instant barcode/RFID scanning & live occupancy counter.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* LIVE SYSTEM PREVIEW MOCKUP */}
        {/* ========================================================================= */}
        <section id="preview" className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-64 w-64 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <span className="text-xs font-bold font-heading uppercase text-brand tracking-wider">
                  Live Operations Console
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-foreground font-heading">
                  PeakRep Cockpit: Real-Time Gym Health
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald">
                  <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
                  Live Sync Active
                </span>
              </div>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Floor Occupancy</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-heading text-foreground">42 Inside</span>
                  <span className="text-xs font-bold text-emerald">23% Capacity</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-[23%] bg-emerald rounded-full" />
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Monthly Revenue</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-heading text-foreground">{settings.currencySymbol}4,85,000</span>
                  <span className="text-xs font-bold text-emerald">+18.4%</span>
                </div>
                <p className="text-[10px] text-muted-foreground">GST collected: {settings.currencySymbol}74,000</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Members</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-heading text-foreground">1,248</span>
                  <span className="text-xs font-bold text-brand">96.2% Ret.</span>
                </div>
                <p className="text-[10px] text-muted-foreground">14 renewing this week</p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1.5">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Today's Collections</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-black font-heading text-foreground">{settings.currencySymbol}38,500</span>
                  <span className="text-xs font-bold text-sky-500">12 Txns</span>
                </div>
                <p className="text-[10px] text-muted-foreground">UPI: 80% · Card: 15% · Cash: 5%</p>
              </div>
            </div>

            {/* Mini Activity Feed */}
            <div className="p-4 rounded-2xl border border-border bg-canvas/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>Recent Front Desk & Floor Events</span>
                <span className="text-[10px] font-mono text-muted-foreground">Auto-Refreshed Just Now</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border">
                  <CheckCircle2 className="h-4 w-4 text-emerald shrink-0" />
                  <span className="truncate"><strong>Rahul Varma</strong> checked in (Card #009)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border">
                  <CreditCard className="h-4 w-4 text-brand shrink-0" />
                  <span className="truncate"><strong>Pooja Hegde</strong> renewed Annual Pass ({settings.currencySymbol}12,000)</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-border">
                  <MessageCircle className="h-4 w-4 text-emerald shrink-0" />
                  <span className="truncate">WhatsApp Tax Invoice sent to <strong>Karan S.</strong></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* CORE SAAS FEATURES SHOWCASE */}
        {/* ========================================================================= */}
        <section id="features" className="mx-auto max-w-7xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold font-heading uppercase text-brand tracking-widest">
              Core SaaS Modules
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground font-heading">
              Everything Your Gym Needs to Scale Smoothly
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Eliminate paper ledgers, fragmented WhatsApp messages, and untracked cash collections with one integrated software platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Floor Check-in */}
            <div className="p-6 rounded-3xl border border-border bg-surface space-y-4 hover:border-brand/40 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/10 text-emerald border border-emerald-500/20">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">Turnstile & QR Floor Check-In</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Lightning fast punch-in via barcode scanner, QR reader, or manual desk lookup. Real-time floor occupancy counter, auto-detection of expired memberships, and anti-tailgating alerts.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Live Occupancy</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">RFID Support</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Expiry Guard</span>
              </div>
            </div>

            {/* Feature 2: WhatsApp Billing & Reminders */}
            <div className="p-6 rounded-3xl border border-border bg-surface space-y-4 hover:border-brand/40 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand border border-brand/20">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">Automated WhatsApp Billing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Dispatch personalized payment reminders with instant Indian UPI intent links in 1 click. Send digital tax receipts, workout schedules, and expiring pass alerts directly to members' WhatsApp.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">1-Click WhatsApp</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">UPI Intent QR</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Zero SMS Cost</span>
              </div>
            </div>

            {/* Feature 3: Dual-Role RBAC */}
            <div className="p-6 rounded-3xl border border-border bg-surface space-y-4 hover:border-brand/40 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">Dual-Role RBAC & Zero-Trust</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Complete separation of duties between Gym Director and Reception Staff. Front desk can manage check-ins and payments but cannot edit plan prices, delete audit logs, or view owner payroll.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Owner Cockpit</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Front Desk View</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Passcode Gate</span>
              </div>
            </div>

            {/* Feature 4: GST INV-01 Invoicing */}
            <div className="p-6 rounded-3xl border border-border bg-surface space-y-4 hover:border-brand/40 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
                <Printer className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">1-Page Indian GST Tax Invoicing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                SAC 999723 compliant tax invoices with automatic CGST (9%) + SGST (9%) breakdown, Indian rupee numeral-to-words converter, authorized signatory line, and clean 1-page A4 PDF print isolation.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">SAC 999723</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">CGST + SGST</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Single Page A4</span>
              </div>
            </div>

            {/* Feature 5: Member 360 CRM */}
            <div className="p-6 rounded-3xl border border-border bg-surface space-y-4 hover:border-brand/40 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">Member 360 CRM & Lifecycle</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Holistic member profile tracking: plan renewals, medical freeze requests, locker assignments, membership transfers, trainer allocation, and attendance history in a single slide-over panel.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Locker Bay</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Freeze & Transfer</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Audit Timeline</span>
              </div>
            </div>

            {/* Feature 6: Financial Ledger & Expenses */}
            <div className="p-6 rounded-3xl border border-border bg-surface space-y-4 hover:border-brand/40 transition">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading">Expense Ledger & Net Profit</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Log gym rent, electricity bills, equipment maintenance, trainer commissions, and staff payroll. Compare gross collections vs monthly operational overheads with real-time profit analytics.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Payroll & Rent</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Daily Cash Count</span>
                <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">Net P&L Engine</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HARDWARE & INTEGRATIONS */}
        {/* ========================================================================= */}
        <section id="integrations" className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-3xl border border-border bg-surface/60 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold font-heading uppercase text-brand tracking-wider">
                  Hardware & Ecosystem
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading">
                  Seamless Plug-and-Play Integration
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">Direct USB, LAN & Cloud APIs</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1">
                <p className="text-sm font-bold text-foreground">Turnstile Gates</p>
                <p className="text-[11px] text-muted-foreground">ZKTeco, Essl, Hikvision RFID</p>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1">
                <p className="text-sm font-bold text-foreground">Indian UPI QR</p>
                <p className="text-[11px] text-muted-foreground">GPay, PhonePe, Paytm, BharatPe</p>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1">
                <p className="text-sm font-bold text-foreground">A4 & Thermal Print</p>
                <p className="text-[11px] text-muted-foreground">Epson, TVS, HP Laser & POS</p>
              </div>
              <div className="p-4 rounded-2xl border border-border bg-canvas space-y-1">
                <p className="text-sm font-bold text-foreground">WhatsApp Cloud</p>
                <p className="text-[11px] text-muted-foreground">Official Business API & Webhooks</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* DEDICATED ROLE-BASED LOGIN CONSOLE (Positioned below hero & features) */}
        {/* ========================================================================= */}
        <section id="login-portal" className="mx-auto max-w-7xl px-4 sm:px-6 pt-6">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1 text-xs font-heading font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              <KeyRound className="h-3.5 w-3.5" /> Secure Authentication Gateway
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground font-heading">
              ROLE-BASED LOGIN PORTAL
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Select your designated access role below or use 1-click instant demo credentials to enter the workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* 1. Login Cards Column (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* ADMIN LOGIN CARD (Purple) */}
              <div className="rounded-3xl border-2 border-purple-500/40 bg-surface p-6 sm:p-7 shadow-xl shadow-purple-500/5 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-600 text-white shadow-md">
                      <Crown className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground font-heading">DIRECTOR / OWNER LOGIN</h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Full Executive Access</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAdminIdentifier("admin@gym.com");
                      setAdminPassword("admin123");
                      toast.success("Loaded demo Admin credentials");
                    }}
                    className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline bg-purple-500/10 px-2.5 py-1 rounded-lg"
                  >
                    Quick Auto-Fill
                  </button>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Email / Phone Number</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={adminIdentifier}
                        onChange={(e) => setAdminIdentifier(e.target.value)}
                        placeholder="admin@gym.com or +91 98450 00111"
                        required
                        className="w-full rounded-xl border border-border bg-canvas pl-9 pr-3 py-2.5 text-xs focus:border-purple-500 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="text-[11px] text-muted-foreground hover:text-purple-600"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type={showAdminPass ? "text" : "password"}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-border bg-canvas pl-9 pr-9 py-2.5 text-xs font-mono focus:border-purple-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showAdminPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={adminLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-3 text-xs font-heading font-bold transition shadow-md shadow-purple-600/20"
                    >
                      <span>{adminLoading ? "Authenticating..." : "Login to Director Console"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickDemoAdmin}
                      className="px-3.5 rounded-xl border border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 text-xs font-bold transition"
                      title="1-Click Instant Demo Entry"
                    >
                      Instant
                    </button>
                  </div>
                </form>
              </div>

              {/* RECEPTION LOGIN CARD (Green) */}
              <div className="rounded-3xl border-2 border-emerald-500/40 bg-surface p-6 sm:p-7 shadow-xl shadow-emerald-500/5 space-y-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-white shadow-md">
                      <Headphones className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground font-heading">FRONT DESK / RECEPTION</h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Front Desk & Cashier Access</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setReceptionIdentifier("reception@gym.com");
                      setReceptionPassword("recep123");
                      toast.success("Loaded demo Reception credentials");
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline bg-emerald-500/10 px-2.5 py-1 rounded-lg"
                  >
                    Quick Auto-Fill
                  </button>
                </div>

                <form onSubmit={handleReceptionLogin} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Email / Phone Number</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        value={receptionIdentifier}
                        onChange={(e) => setReceptionIdentifier(e.target.value)}
                        placeholder="reception@gym.com or +91 98450 00222"
                        required
                        className="w-full rounded-xl border border-border bg-canvas pl-9 pr-3 py-2.5 text-xs focus:border-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-foreground">Password</label>
                      <button
                        type="button"
                        onClick={() => setForgotModalOpen(true)}
                        className="text-[11px] text-muted-foreground hover:text-emerald-600"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type={showReceptionPass ? "text" : "password"}
                        value={receptionPassword}
                        onChange={(e) => setReceptionPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full rounded-xl border border-border bg-canvas pl-9 pr-9 py-2.5 text-xs font-mono focus:border-emerald-500 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => setShowReceptionPass(!showReceptionPass)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showReceptionPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={receptionLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-heading font-bold transition shadow-md shadow-emerald-600/20"
                    >
                      <span>{receptionLoading ? "Authenticating..." : "Login to Reception Desk"}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={handleQuickDemoReception}
                      className="px-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold transition"
                      title="1-Click Instant Demo Entry"
                    >
                      Instant
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* 2. RBAC Architecture & Security Summary (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Role-Based Redirection Matrix */}
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7 space-y-5 shadow-xs">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                  Role Privileges & Access Scope
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-purple-600 dark:text-purple-300 text-xs">
                      <Crown className="h-4 w-4" /> Director (Owner)
                    </div>
                    <div className="text-sm font-black text-foreground font-heading">Full Business Control</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Financial ledger, staff payroll, pricing plan edits, raw audit logs & business configuration.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-300 text-xs">
                      <Headphones className="h-4 w-4" /> Reception (Staff)
                    </div>
                    <div className="text-sm font-black text-foreground font-heading">Front Desk Operations</div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Check-in desk, plan renewals, walk-in registration, cash & UPI collection, locker allocations.
                    </p>
                  </div>
                </div>
              </div>

              {/* RBAC Security Layers */}
              <div className="rounded-3xl border border-border bg-surface p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald" />
                    <span className="text-xs font-heading font-bold uppercase tracking-wider text-foreground">
                      Active Enterprise Safeguards
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                    ENFORCED
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {[
                    "Passcode Gate for Master Settings",
                    "Offline-Resilient Local Storage Sync",
                    "Immutable System Audit Logs",
                    "GST INV-01 Tax Number Formatting",
                    "Single-Page A4 Print Isolation",
                    "Session Security & Instant Log Out",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-canvas text-foreground font-medium text-xs"
                    >
                      <Check className="h-3.5 w-3.5 text-emerald shrink-0" />
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setForgotModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground font-heading">Reset Account Password</h3>
              <button onClick={() => setForgotModalOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                ✕
              </button>
            </div>
            <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
              <p className="text-muted-foreground">
                Enter your registered admin or reception email address to receive an instant recovery reset link.
              </p>
              <input
                type="email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@gym.com"
                className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs focus:border-foreground focus:outline-hidden"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border bg-canvas text-muted-foreground font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-bold hover:opacity-90 font-heading"
                >
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern SaaS Footer */}
      <footer className="border-t border-border/80 bg-surface/80 py-8 text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-heading font-black text-foreground tracking-wider uppercase">PEAKREP OS</span>
            <span>·</span>
            <span>© {new Date().getFullYear()} {settings.name}. All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-4 font-medium">
            <span className="inline-flex items-center gap-1.5 text-emerald font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
              All Systems Operational
            </span>
            <span>·</span>
            <span>RBAC Matrix v9.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}