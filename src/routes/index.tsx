import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Radio,
  Users,
  TrendingUp,
  Dumbbell,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "PEAKREP — Enterprise Gym Operating System" },
      {
        name: "description",
        content:
          "Track members, installment billing, lockers, workout programs, and multi-channel broadcast messaging in one enterprise dashboard.",
      },
    ],
  }),
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <LogosStrip />
      <Problem />
      <Features />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background font-mono font-bold text-sm">
            PR
          </div>
          <span className="text-base font-bold tracking-wider uppercase text-foreground">PEAKREP</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#testimonials" className="hover:text-foreground">Directors</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-4 py-2 text-xs font-semibold text-background transition hover:opacity-90 shadow-xs"
          >
            Launch OS
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-emerald/10 blur-3xl" />
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
            Enterprise Gym Operating System
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground">
            Never miss a gym <em className="text-emerald not-italic">payment</em> again.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-sm sm:text-base text-muted-foreground md:text-lg">
            Complete member records, multi-installment billing engine, locker maintenance lifecycle, workout builder, and broadcast center.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 shadow-xs"
            >
              Open Dashboard
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogosStrip() {
  return (
    <section className="border-b border-border/60 py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Built for modern fitness centers & studios
      </p>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 text-muted-foreground">
        {["GOLD'S GYM", "Pulse Club", "Apex Strength", "Iron House", "Forge Athletic"].map((n) => (
          <span key={n} className="font-bold tracking-wider text-base opacity-80">
            {n}
          </span>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    "Who made a partial installment payment?",
    "Which memberships expire in 3 days?",
    "Which lockers need maintenance repair?",
    "How much total contracted revenue is still pending?",
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald font-bold">The Operational Problem</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Gym revenue leaks through disconnected spreadsheets.
          </h2>
        </div>
        <div className="space-y-4">
          {items.map((q) => (
            <div key={q} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-rose-500" />
              <p className="text-sm font-medium">{q}</p>
            </div>
          ))}
          <p className="pt-2 text-xs text-muted-foreground">
            PEAKREP answers every operational question on one single screen with automated dues formulas and broadcast communications.
          </p>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Users, title: "Member Directory & Attendance", body: "Profiles, photo avatars, health goals, QR check-ins and attendance history." },
    { icon: CreditCard, title: "Installment Billing Engine", body: "Mathematical recognition (Pending = Total Plan Fee − Collected) with invoice generation." },
    { icon: Radio, title: "Broadcast Messaging Center", body: "Dispatches announcements, dues alerts, closures, and promos across WhatsApp, SMS, and In-App." },
    { icon: KeyRound, title: "Locker Maintenance Workflow", body: "5-state lifecycle with maintenance logging and automatic restore to Available after repair." },
    { icon: Dumbbell, title: "Workout & Diet Builders", body: "Custom exercise splits, macro nutrition charts, and 1-click WhatsApp formatted sharing." },
    { icon: ShieldCheck, title: "Multi-Location & Local Storage Sync", body: "Continuous real-time sync across all browser tabs and offline JSON database backup." },
  ];
  return (
    <section id="features" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald font-bold">Enterprise Capabilities</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Engineered for high-volume gym management.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {feats.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6 space-y-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-soft text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald font-bold">Pricing</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Fair, transparent operating pricing.</h2>
        <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-muted-foreground">
          No seat limits, no hidden fees, cancel any time.
        </p>
        <div className="mx-auto mt-12 max-w-md rounded-3xl border border-border bg-surface p-8 text-left space-y-6 shadow-xl">
          <div className="flex items-baseline justify-between">
            <span className="font-bold text-lg uppercase tracking-wider">PEAKREP OS</span>
            <span className="text-xs text-muted-foreground">All-in-one</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-5xl font-bold tracking-tight">₹10</span>
            <span className="text-xs text-muted-foreground">/ active member / month</span>
          </div>
          <ul className="space-y-3 text-xs">
            {[
              "Unlimited staff & trainer logins",
              "Installment calculations & due tracking",
              "Multi-channel broadcast messaging",
              "Locker registry & repair workflows",
              "Workout & diet program builders",
              "Real-time multi-tab database sync",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Link to="/dashboard" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-xs font-semibold text-background hover:opacity-90 shadow-xs">
            Launch PeakRep Dashboard <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "We recovered ₹62,000 in unpaid dues in our first month. PeakRep pays for itself ten times over.", a: "Karan Johar", r: "Director, Gold's Gym Mysore" },
    { q: "Our front desk staff understands the installment ledger instantly. Zero training required.", a: "Sneha Reddy", r: "Manager, Pulse Club" },
    { q: "The locker maintenance workflow and broadcast alerts have made facility management flawless.", a: "Vikram Anand", r: "Founder, Apex Strength" },
  ];
  return (
    <section id="testimonials" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald font-bold">Directors & Owners</p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-12">Trusted by gym directors.</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {t.map((x) => (
            <figure key={x.a} className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-7 space-y-4">
              <blockquote className="text-sm font-medium leading-relaxed text-foreground">"{x.q}"</blockquote>
              <figcaption className="text-xs pt-3 border-t border-border">
                <div className="font-bold text-foreground">{x.a}</div>
                <div className="text-muted-foreground">{x.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-b border-border/60 bg-foreground text-background">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight">
          Stop chasing dues. <em className="text-emerald not-italic">Run your gym on PeakRep.</em>
        </h2>
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-background px-6 py-3.5 text-xs font-bold text-foreground hover:opacity-90 shadow-xl">
            Open Gym Dashboard <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 text-xs text-muted-foreground md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-lg bg-foreground text-background font-mono font-bold text-xs">
          PR
        </div>
        <span>© {new Date().getFullYear()} PEAKREP Gym Operating System</span>
      </div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-foreground">Privacy</a>
        <a href="#" className="hover:text-foreground">Terms</a>
        <a href="mailto:mysore@goldsgym.in" className="hover:text-foreground">Contact</a>
      </div>
    </footer>
  );
}