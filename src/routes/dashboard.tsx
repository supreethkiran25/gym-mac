import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BellRing,
  Receipt,
  Settings,
  Search,
  Plus,
} from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/members", label: "Members", icon: Users },
  { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { to: "/dashboard/reminders", label: "Reminders", icon: BellRing },
  { to: "/dashboard/billing", label: "Billing", icon: Receipt },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen w-full bg-canvas text-foreground">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface/40 md:flex">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background">
            <span className="font-serif text-lg leading-none">R</span>
          </div>
          <div className="leading-tight">
            <p className="text-sm font-medium">Iron House</p>
            <p className="text-[11px] text-muted-foreground">Mumbai · Andheri</p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-4">
          {nav.map((item) => {
            const active =
              item.to === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mb-0.5 flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">154 active members</p>
          <p>Bill this month · ₹1,540</p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/80 px-6 py-3 backdrop-blur">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search members, payments…"
              className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm outline-none focus:border-emerald"
            />
          </div>
          <Link
            to="/dashboard/members"
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> New member
          </Link>
        </header>
        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}