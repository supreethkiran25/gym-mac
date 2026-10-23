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
  QrCode,
  Building,
  KeyRound,
  Activity,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { useGymStore, UserRole } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LandingAndAuthPage,
  head: () => ({
    meta: [
      { title: "PEAKREP OS — The Sovereign Operating System for Elite Gyms" },
      {
        name: "description",
        content:
          "Minimalist, ultra-luxury gym operating system. Biometric turnstile telemetry, autonomous financial ledgers, and director-grade governance.",
      },
    ],
  }),
});

function LandingAndAuthPage() {
  const { login, settings, theme, toggleTheme } = useGymStore();
  const navigate = useNavigate();

  // Active Role Tab for Executive Gateway
  const [activeTab, setActiveTab] = useState<UserRole>("admin");

  // Admin credentials
  const [adminIdentifier, setAdminIdentifier] = useState("admin@gym.com");
  const [adminPassword, setAdminPassword] = useState("admin123");
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // Reception credentials
  const [receptionIdentifier, setReceptionIdentifier] = useState("reception@gym.com");
  const [receptionPassword, setReceptionPassword] = useState("recep123");
  const [showReceptionPass, setShowReceptionPass] = useState(false);
  const [receptionLoading, setReceptionLoading] = useState(false);

  // Interactive Live Cockpit preview state
  const [cockpitRole, setCockpitRole] = useState<"director" | "desk">("director");
  const [simulatedCheckins, setSimulatedCheckins] = useState(48);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    setTimeout(() => {
      login("admin", adminIdentifier, settings.ownerName || "Karan Johar (Director)");
      setAdminLoading(false);
      toast.success("Welcome, Director. Sovereign access authorized.");
      navigate({ to: "/dashboard" });
    }, 250);
  };

  const handleReceptionLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setReceptionLoading(true);
    setTimeout(() => {
      login("reception", receptionIdentifier, "Sneha Reddy (Front Desk)");
      setReceptionLoading(false);
      toast.success("Welcome. Front Desk terminal online.");
      navigate({ to: "/dashboard" });
    }, 250);
  };

  const handleQuickDirectorDemo = () => {
    login("admin", "admin@gym.com", settings.ownerName || "Karan Johar (Director)");
    toast.success("Authorized with Executive Director Privileges");
    navigate({ to: "/dashboard" });
  };

  const handleQuickReceptionDemo = () => {
    login("reception", "reception@gym.com", "Sneha Reddy (Front Desk)");
    toast.success("Authorized with Front Desk Privileges");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen bg-[#06080d] text-foreground font-sans selection:bg-sky-500/30 selection:text-white overflow-x-hidden">
      {/* Dynamic Sky-Blue Ambient Lighting Mesh (Underglow for Glassmorphism) */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10vw] left-1/2 -translate-x-1/2 w-[70vw] h-[45vw] rounded-full bg-gradient-to-b from-sky-500/18 via-sky-600/10 to-transparent blur-[140px]" />
        <div className="absolute top-[35vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full bg-gradient-to-bl from-sky-400/12 via-blue-600/08 to-transparent blur-[150px]" />
        <div className="absolute bottom-[-10vh] left-[-10vw] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-sky-600/10 via-blue-500/06 to-transparent blur-[160px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Floating Minimalist Glass Navigation Dock */}
        <header className="sticky top-5 z-50 px-4 sm:px-8 max-w-6xl mx-auto w-full">
          <nav className="glass-panel rounded-full px-5 py-3 flex items-center justify-between border border-white/10 shadow-2xl transition duration-300">
            {/* Minimal Brand Monogram */}
            <div className="flex items-center gap-3">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-sky-500 to-sky-300 text-black font-heading font-extrabold text-sm shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                PR
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  PEAKREP <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">OS</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-medium -mt-0.5 tracking-wider">
                  {settings.name || "Gold's Gym Flagship"}
                </span>
              </div>
            </div>

            {/* Clean, Content-Light Nav Anchors */}
            <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-200">
              <a href="#cockpit" className="hover:text-sky-400 transition-colors">
                Telemetry
              </a>
              <a href="#architecture" className="hover:text-sky-400 transition-colors">
                Pillars
              </a>
              <a href="#gateway" className="hover:text-sky-400 transition-colors">
                Executive Portal
              </a>
            </div>

            {/* Action Group */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                aria-label="Toggle visual mode"
                className="grid h-8 w-8 place-items-center rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <a
                href="#gateway"
                className="glass-button-primary px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:scale-[1.02] active:scale-95 transition"
              >
                <span>Launch OS</span>
                <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </nav>
        </header>

        {/* Hero Section: Minimalist, Spacious, Luxury Statement */}
        <section className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
          {/* Subtle Ambient Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full gradient-sky-pill text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            <span className="tracking-wider uppercase text-[11px] font-mono text-sky-300">
              The Sovereign Club Standard
            </span>
          </div>

          {/* Majestic Hero Headline in Outfit Font */}
          <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl leading-[1.12] tracking-tight text-white max-w-4xl">
            Precision control for{" "}
            <span className="gradient-text-sky block sm:inline">
              premier fitness clubs.
            </span>
          </h1>

          {/* Minimalist 1-sentence Subtitle with high contrast */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl font-medium leading-relaxed">
            Autonomous biometrics, automated revenue ledgers, and strict director-tier governance.
            Crafted for elite gym establishments.
          </p>

          {/* High-End Minimalist CTA Hub */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleQuickDirectorDemo}
              className="glass-button-primary px-7 py-3 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2.5 shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:scale-[1.02] active:scale-95 transition"
            >
              <Crown className="h-4 w-4 text-white" />
              <span>Enter Director Console</span>
              <ArrowRight className="h-3.5 w-3.5 opacity-80" />
            </button>

            <button
              onClick={handleQuickReceptionDemo}
              className="glass-button-secondary px-6 py-3 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition"
            >
              <Headphones className="h-4 w-4 text-sky-400" />
              <span>Front Desk Terminal</span>
            </button>
          </div>

          {/* 4-Figure Minimalist Floating Glass Metrics Strip */}
          <div className="mt-16 w-full max-w-3xl glass-panel rounded-3xl p-5 sm:p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border border-white/10 shadow-2xl">
            <div>
              <p className="font-heading font-bold text-2xl sm:text-3xl text-white">99.98%</p>
              <p className="text-xs text-slate-300 mt-1 tracking-wider uppercase font-mono font-medium">Turnstile Sync</p>
            </div>
            <div>
              <p className="font-heading font-bold text-2xl sm:text-3xl gradient-text-sky">₹0</p>
              <p className="text-xs text-slate-300 mt-1 tracking-wider uppercase font-mono font-medium">Dues Leakage</p>
            </div>
            <div>
              <p className="font-heading font-bold text-2xl sm:text-3xl text-white">&lt; 2.4s</p>
              <p className="text-xs text-slate-300 mt-1 tracking-wider uppercase font-mono font-medium">Desk Check-in</p>
            </div>
            <div>
              <p className="font-heading font-bold text-2xl sm:text-3xl text-sky-400">Strict</p>
              <p className="text-xs text-slate-300 mt-1 tracking-wider uppercase font-mono font-medium">Dual-Role RBAC</p>
            </div>
          </div>
        </section>

        {/* Interactive Live Cockpit Preview (Ultra-Refined Glassmorphism Showcase) */}
        <section id="cockpit" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div className="text-center mb-8">
            <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase">
              Live Club Telemetry
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white mt-1">
              The Sovereign Cockpit
            </h2>
          </div>

          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-sky-500/25 shadow-[0_20px_70px_rgba(0,0,0,0.6)]">
            {/* Top Toolbar: Mode Switcher & Status */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/8">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
                </span>
                <span className="font-mono text-xs text-zinc-300">
                  TURNSTILE 01: <span className="text-sky-400 font-semibold">ACTIVE</span> • 14ms
                </span>
              </div>

              {/* Quick Persona Switcher for Preview */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                <button
                  onClick={() => setCockpitRole("director")}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    cockpitRole === "director"
                      ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Director View
                </button>
                <button
                  onClick={() => setCockpitRole("desk")}
                  className={`px-3 py-1 rounded-lg font-medium transition ${
                    cockpitRole === "desk"
                      ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Reception Desk View
                </button>
              </div>
            </div>

            {/* Cockpit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {/* Telemetry Card 1: Today's Revenue */}
              <div className="glass-card-interactive rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                  <span>Daily Revenue Ledger</span>
                  <BarChart3 className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-3">
                  <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                    {cockpitRole === "director" ? "₹1,48,500" : "••••••••"}
                  </p>
                  <p className="text-xs text-sky-400 font-mono mt-1 font-medium">
                    {cockpitRole === "director"
                      ? "+18.4% vs last week • All cleared"
                      : "Financials Director-gated"}
                  </p>
                </div>
                {/* Mini Visual Gradient Bar */}
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-sky-500 to-sky-300 w-3/4 rounded-full" />
                </div>
              </div>

              {/* Telemetry Card 2: Biometric Turnstile Sentinel */}
              <div className="glass-card-interactive rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                  <span>Active Floor Occupancy</span>
                  <Activity className="h-4 w-4 text-sky-400" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <p className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                      {simulatedCheckins}
                    </p>
                    <p className="text-xs text-slate-300 font-mono mt-1">
                      Capacity: 120 athletes
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSimulatedCheckins((c) => c + 1);
                      toast.success("Simulated biometric turnstile entry: Approved");
                    }}
                    className="px-3 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-xs text-sky-200 font-mono font-semibold hover:bg-sky-500/30 transition"
                  >
                    + Tap RFID
                  </button>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${(simulatedCheckins / 120) * 100}%` }}
                  />
                </div>
              </div>

              {/* Telemetry Card 3: Instant Dynamic UPI Gateway */}
              <div className="glass-card-interactive rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-slate-300 text-xs font-medium">
                    <span>Instant Desk Collection</span>
                    <QrCode className="h-4 w-4 text-sky-400" />
                  </div>
                  <p className="font-heading font-bold text-lg text-white mt-3">
                    Dynamic QR Terminal
                  </p>
                  <p className="text-xs text-slate-300 leading-normal mt-1">
                    Auto-attaches member ID & GST tax invoice
                  </p>
                </div>
                <Link
                  to="/dashboard"
                  className="mt-4 inline-flex items-center justify-between text-xs font-semibold text-sky-300 hover:text-white transition"
                >
                  <span>Open Full Dashboard</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 3 Sovereign Pillars (Minimalist, Content-Light Architecture) */}
        <section id="architecture" className="py-16 px-4 sm:px-6 max-w-5xl mx-auto w-full">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-semibold tracking-widest text-sky-400 uppercase">
              Core Architecture
            </span>
            <h2 className="font-heading font-bold text-2xl sm:text-4xl text-white mt-2">
              Engineered for absolute club dominance.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="glass-panel rounded-3xl p-7 border border-white/10 hover:border-sky-500/40 transition group">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 grid place-items-center mb-5 group-hover:scale-110 transition duration-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Biometric Turnstile Sentinel
              </h3>
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                Anti-passback gate synchronization. Validates dues and active pass expiration in
                milliseconds before unlocking physical barriers.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel rounded-3xl p-7 border border-white/10 hover:border-sky-500/40 transition group">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 grid place-items-center mb-5 group-hover:scale-110 transition duration-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <CreditCard className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Autonomous Revenue Ledger
              </h3>
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                Dynamic UPI collection, single-page GST invoices, and automated WhatsApp dues reminders
                without manual front desk friction.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel rounded-3xl p-7 border border-white/10 hover:border-sky-500/40 transition group">
              <div className="h-10 w-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-400 grid place-items-center mb-5 group-hover:scale-110 transition duration-300 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
                <Crown className="h-5 w-5" />
              </div>
              <h3 className="font-heading font-bold text-lg text-white">
                Executive Dual-Role RBAC
              </h3>
              <p className="text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
                Clean division of authority. Directors see full financial telemetry; Front Desk staff
                operate fast check-ins and member renewals safely.
              </p>
            </div>
          </div>
        </section>

        {/* Executive Access Gateway (Frosted Glass Auth Card) */}
        <section id="gateway" className="py-16 px-4 sm:px-6 max-w-md mx-auto w-full">
          <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 border border-sky-500/30 shadow-[0_20px_80px_rgba(0,0,0,0.7)]">
            <div className="text-center mb-6">
              <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase">
                Direct Console Access
              </span>
              <h3 className="font-heading font-bold text-2xl text-white mt-1">
                Executive Portal
              </h3>
            </div>

            {/* Minimal Role Tabs */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab("admin")}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === "admin"
                    ? "bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Crown className="h-3.5 w-3.5" />
                <span>Director</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reception")}
                className={`py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  activeTab === "reception"
                    ? "bg-sky-500 text-white shadow-[0_0_20px_rgba(56,189,248,0.4)]"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span>Front Desk</span>
              </button>
            </div>

            {/* Director Form */}
            {activeTab === "admin" && (
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                    Director Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={adminIdentifier}
                      onChange={(e) => setAdminIdentifier(e.target.value)}
                      className="w-full rounded-xl bg-black/50 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-sky-400 transition"
                      placeholder="admin@gym.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                    Security Passcode
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showAdminPass ? "text" : "password"}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-xl bg-black/50 border border-white/15 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-sky-400 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showAdminPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full glass-button-primary py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-2 shadow-[0_0_25px_rgba(56,189,248,0.35)]"
                >
                  <Crown className="h-4 w-4" />
                  <span>{adminLoading ? "Authorizing..." : "Authenticate as Director"}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleQuickDirectorDemo}
                    className="text-xs sm:text-sm text-sky-400 hover:text-sky-300 underline font-semibold"
                  >
                    1-Click Instant Director Demo
                  </button>
                </div>
              </form>
            )}

            {/* Reception Form */}
            {activeTab === "reception" && (
              <form onSubmit={handleReceptionLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                    Desk Operator ID
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={receptionIdentifier}
                      onChange={(e) => setReceptionIdentifier(e.target.value)}
                      className="w-full rounded-xl bg-black/50 border border-white/15 pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-sky-400 transition"
                      placeholder="reception@gym.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
                    Terminal Passcode
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type={showReceptionPass ? "text" : "password"}
                      required
                      value={receptionPassword}
                      onChange={(e) => setReceptionPassword(e.target.value)}
                      className="w-full rounded-xl bg-black/50 border border-white/15 pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-400 outline-none focus:border-sky-400 transition"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowReceptionPass(!showReceptionPass)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                    >
                      {showReceptionPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={receptionLoading}
                  className="w-full glass-button-primary py-3 rounded-xl text-xs sm:text-sm font-semibold tracking-wide flex items-center justify-center gap-2 mt-2 shadow-[0_0_25px_rgba(56,189,248,0.35)]"
                >
                  <Headphones className="h-4 w-4" />
                  <span>{receptionLoading ? "Opening Desk..." : "Launch Front Desk"}</span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={handleQuickReceptionDemo}
                    className="text-xs sm:text-sm text-sky-400 hover:text-sky-300 underline font-semibold"
                  >
                    1-Click Instant Reception Demo
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Minimal Luxury Footer */}
        <footer className="mt-auto border-t border-white/5 py-8 px-4 text-center text-xs text-zinc-500">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-white text-sm">PEAKREP OS</span>
              <span>• Sovereign Fitness Club Infrastructure</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-400 text-xs">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                <span>Operational</span>
              </span>
              <span>•</span>
              <a href="#gateway" className="hover:text-white transition">
                Portal Login
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
