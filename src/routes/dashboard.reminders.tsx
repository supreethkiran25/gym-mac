import { createFileRoute } from "@tanstack/react-router";
import { BellRing, MessageCircle, Mail, Phone } from "lucide-react";

export const Route = createFileRoute("/dashboard/reminders")({
  component: Reminders,
});

const queue = [
  { name: "Tara Iyer", reason: "Membership expired", channel: "WhatsApp", time: "Today, 9:00 AM" },
  { name: "Rohan Das", reason: "Pending due ₹1,800", channel: "SMS", time: "Today, 9:00 AM" },
  { name: "Aarav Sharma", reason: "Renewal in 2 days", channel: "WhatsApp", time: "Tomorrow, 10:00 AM" },
  { name: "Mehul Patel", reason: "Partial payment ₹1,200", channel: "Email", time: "Tomorrow, 10:00 AM" },
];

const channelIcon = { WhatsApp: MessageCircle, SMS: Phone, Email: Mail } as const;

function Reminders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl">Reminders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automated nudges for renewals, dues and partial payments.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["Sent this week", "84", "100% delivered"],
          ["Scheduled", "37", "next 7 days"],
          ["Engagement", "62%", "replied or paid"],
        ].map(([l, v, s]) => (
          <div key={l} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 font-serif text-3xl">{v}</p>
            <p className="text-xs text-muted-foreground">{s}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <BellRing className="h-4 w-4 text-emerald" />
            <h2 className="text-sm font-medium">Pending queue</h2>
          </div>
          <button className="text-xs text-muted-foreground hover:text-foreground">
            Send all now
          </button>
        </div>
        <ul className="divide-y divide-border">
          {queue.map((q) => {
            const Icon = channelIcon[q.channel as keyof typeof channelIcon];
            return (
              <li key={q.name} className="flex items-center justify-between px-5 py-4">
                <div>
                  <p className="text-sm font-medium">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.reason}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    {q.channel}
                  </span>
                  <span>{q.time}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}