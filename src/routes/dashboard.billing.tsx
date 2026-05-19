import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/billing")({
  component: Billing,
});

function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="display text-4xl">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your Repsheet subscription.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6 md:col-span-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">This month</p>
          <p className="mt-2 font-serif text-5xl">₹1,540</p>
          <p className="text-sm text-muted-foreground">154 active members × ₹10</p>
          <div className="mt-6 flex items-center gap-2 text-sm text-emerald">
            <CheckCircle2 className="h-4 w-4" />
            Subscription active · auto-renews 1 Jun
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Next invoice</p>
          <p className="mt-2 font-serif text-3xl">₹1,640</p>
          <p className="text-sm text-muted-foreground">Est. 164 active · 1 Jun 2026</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-medium">Payment history</h2>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {[
              ["1 May 2026", "April · 148 members", "₹1,480", "Paid"],
              ["1 Apr 2026", "March · 141 members", "₹1,410", "Paid"],
              ["1 Mar 2026", "February · 132 members", "₹1,320", "Paid"],
              ["1 Feb 2026", "January · 124 members", "₹1,240", "Paid"],
            ].map(([d, l, a, s]) => (
              <tr key={d}>
                <td className="px-5 py-3 text-muted-foreground">{d}</td>
                <td className="px-5 py-3">{l}</td>
                <td className="px-5 py-3 font-mono">{a}</td>
                <td className="px-5 py-3 text-right">
                  <span className="inline-flex rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs text-accent-foreground">
                    {s}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}