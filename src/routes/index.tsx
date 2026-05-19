import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  BellRing,
  Users,
  TrendingUp,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Repsheet — Never Miss a Gym Payment Again" },
      {
        name: "description",
        content:
          "Track members, payments, partial dues and renewals in one premium dashboard built for modern gyms.",
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
      <DashboardPreview />
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
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background">
            <span className="font-serif text-lg leading-none">R</span>
          </div>
          <span className="text-[15px] font-medium tracking-tight">Repsheet</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#preview" className="hover:text-foreground">Product</a>
          <a href="#pricing" className="hover:text-foreground">Pricing</a>
          <a href="#testimonials" className="hover:text-foreground">Customers</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/dashboard"
            className="hidden rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground md:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3.5 py-1.5 text-sm font-medium text-background transition hover:opacity-90"
          >
            Start free
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
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
            Built for independent gyms and studios
          </div>
          <h1 className="display text-5xl md:text-7xl">
            Never miss a gym <em className="text-emerald not-italic">payment</em> again.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Track memberships, payments, partial dues and renewals from one calm,
            premium dashboard. No more spreadsheets, no more leakage.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
            >
              Open dashboard <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="#preview"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium hover:bg-muted"
            >
              See the product
            </a>
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            ₹10 / active member / month · No card required to start
          </p>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)]">
        <div className="rounded-xl border border-border bg-canvas">
          <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
            <span className="ml-3 text-xs text-muted-foreground">repsheet.app / overview</span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-4">
            <MiniStat label="Active members" value="1,284" delta="+38" />
            <MiniStat label="Pending dues" value="₹84,200" delta="12 members" tone="warn" />
            <MiniStat label="MRR" value="₹4.8L" delta="+12.4%" />
            <MiniStat label="Retention" value="91%" delta="+2.1%" />
            <div className="md:col-span-3 rounded-lg border border-border bg-surface p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Revenue · last 6 months</p>
                <span className="text-xs text-muted-foreground">Monthly</span>
              </div>
              <FauxChart />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-sm font-medium">Upcoming renewals</p>
              <ul className="mt-3 space-y-3 text-sm">
                {[
                  ["Aarav S.", "2 days"],
                  ["Mehul P.", "4 days"],
                  ["Riya K.", "6 days"],
                  ["Kabir N.", "1 week"],
                ].map(([n, d]) => (
                  <li key={n} className="flex items-center justify-between">
                    <span>{n}</span>
                    <span className="text-muted-foreground">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl tracking-tight">{value}</p>
      <p className={`mt-1 text-xs ${tone === "warn" ? "text-warn" : "text-emerald"}`}>{delta}</p>
    </div>
  );
}

function FauxChart() {
  const bars = [38, 52, 44, 68, 74, 86];
  return (
    <div className="flex h-32 items-end gap-3">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="w-full rounded-t-sm bg-emerald/80" style={{ height: `${h}%` }} />
          <span className="text-[10px] text-muted-foreground">
            {["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function LogosStrip() {
  return (
    <section className="border-b border-border/60 py-10">
      <p className="mb-6 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        Trusted by independent gyms across India
      </p>
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-6 text-muted-foreground">
        {["IRON HOUSE", "Pulse Club", "Apex Strength", "The Lift Co.", "Forge Athletic"].map((n) => (
          <span key={n} className="font-serif text-xl italic">
            {n}
          </span>
        ))}
      </div>
    </section>
  );
}

function Problem() {
  const items = [
    "Who paid this month — and who didn't?",
    "Who's on a partial payment?",
    "Which memberships expire next week?",
    "How much revenue did we actually collect?",
  ];
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2">
        <div>
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald">The problem</p>
          <h2 className="display text-4xl md:text-5xl">
            Gym revenue leaks through the cracks of a spreadsheet.
          </h2>
        </div>
        <div className="space-y-4">
          {items.map((q) => (
            <div key={q} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-4">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-danger" />
              <p className="text-[15px]">{q}</p>
            </div>
          ))}
          <p className="pt-2 text-sm text-muted-foreground">
            Repsheet answers all of them on one screen — and reminds your members for you.
          </p>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const feats = [
    { icon: Users, title: "Member records, done right", body: "Profiles, IDs, photos, medical notes and full history — searchable and exportable." },
    { icon: CreditCard, title: "Partial payments tracked", body: "Record any amount. We calculate the balance and chase it for you." },
    { icon: BellRing, title: "Automated reminders", body: "Renewal and due nudges over WhatsApp, SMS and email — without lifting a finger." },
    { icon: TrendingUp, title: "Revenue you can see", body: "MRR, ARR, retention and collection — clean charts, no spreadsheet acrobatics." },
    { icon: Sparkles, title: "Future ready", body: "QR check-ins, trainer plans, diet & AI insights all on the same data model." },
    { icon: CheckCircle2, title: "Built to feel calm", body: "Premium, minimal UI your staff understands without a single training session." },
  ];
  return (
    <section id="features" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-14 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald">Features</p>
          <h2 className="display text-4xl md:text-5xl">Everything your front desk wishes it had.</h2>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {feats.map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-surface p-7">
              <div className="mb-5 grid h-9 w-9 place-items-center rounded-md bg-emerald-soft text-accent-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="text-[15px] font-medium">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section id="preview" className="border-b border-border/60 bg-muted/40">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald">Product</p>
          <h2 className="display text-4xl md:text-5xl">One dashboard. The whole gym.</h2>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="border-b border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald">Pricing</p>
        <h2 className="display text-4xl md:text-5xl">Pay only for active members.</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          No seats, no per-staff fees, no setup cost. Cancel any time.
        </p>
        <div className="mx-auto mt-12 max-w-md rounded-2xl border border-border bg-surface p-8 text-left">
          <div className="flex items-baseline justify-between">
            <span className="font-serif text-xl">Repsheet</span>
            <span className="text-xs text-muted-foreground">Usage based</span>
          </div>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-serif text-6xl tracking-tight">₹10</span>
            <span className="text-sm text-muted-foreground">/ active member / month</span>
          </div>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Unlimited staff accounts",
              "Partial-payment & dues tracking",
              "WhatsApp, SMS & email reminders",
              "Revenue, retention & growth analytics",
              "Export PDF / Excel reports",
              "Priority support",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald" />
                {f}
              </li>
            ))}
          </ul>
          <Link to="/dashboard" className="mt-8 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90">
            Start free <ArrowUpRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-center text-xs text-muted-foreground">First 30 active members free, forever.</p>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const t = [
    { q: "We recovered ₹62,000 in unpaid dues in our first month. Repsheet pays for itself ten times over.", a: "Karan M.", r: "Owner, Iron House Gym" },
    { q: "Our front desk staff actually likes using it. That alone is a miracle.", a: "Sneha R.", r: "Manager, Pulse Club" },
    { q: "Renewals used to slip every month. Now reminders just go out on their own.", a: "Vikram A.", r: "Founder, Apex Strength" },
  ];
  return (
    <section id="testimonials" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-emerald">Customers</p>
        <h2 className="display mb-12 text-4xl md:text-5xl">Loved by gym owners.</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {t.map((x) => (
            <figure key={x.a} className="flex flex-col justify-between rounded-xl border border-border bg-surface p-7">
              <blockquote className="font-serif text-xl leading-snug">"{x.q}"</blockquote>
              <figcaption className="mt-6 text-sm">
                <div className="font-medium">{x.a}</div>
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
      <div className="mx-auto max-w-5xl px-6 py-24 text-center">
        <h2 className="display text-5xl md:text-6xl">
          Stop chasing payments. <em className="text-emerald not-italic">Start running your gym.</em>
        </h2>
        <Link to="/dashboard" className="mt-10 inline-flex items-center gap-1.5 rounded-md bg-background px-5 py-3 text-sm font-medium text-foreground hover:opacity-90">
          Open your dashboard <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center">
      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded bg-foreground text-background">
          <span className="font-serif text-sm leading-none">R</span>
        </div>
        <span>© {new Date().getFullYear()} Repsheet</span>
      </div>
      <div className="flex gap-6">
        <a href="#" className="hover:text-foreground">Privacy</a>
        <a href="#" className="hover:text-foreground">Terms</a>
        <a href="mailto:hello@repsheet.app" className="hover:text-foreground">Contact</a>
      </div>
    </footer>
  );
}