import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  component: Settings,
});

function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gym profile, staff and reminder preferences.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Gym profile" desc="Logo, name, address and contact." />
        <Card title="Staff & roles" desc="Invite staff and manage access." />
        <Card title="Reminder templates" desc="Customise WhatsApp / SMS / email copy." />
        <Card title="Membership plans" desc="Prices, durations and offers." />
      </div>
    </div>
  );
}

function Card({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      <button className="mt-4 text-xs text-emerald hover:underline">Configure →</button>
    </div>
  );
}