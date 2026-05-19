import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/payments")({
  component: Payments,
});

const payments = [
  { date: "19 May", member: "Aarav Sharma", method: "UPI", amount: 1500, status: "Paid" },
  { date: "19 May", member: "Mehul Patel", method: "Cash", amount: 1200, status: "Partial" },
  { date: "18 May", member: "Riya Kapoor", method: "Card", amount: 12000, status: "Paid" },
  { date: "18 May", member: "Tara Iyer", method: "—", amount: 2400, status: "Overdue" },
  { date: "17 May", member: "Sneha Verma", method: "Bank", amount: 4500, status: "Paid" },
  { date: "17 May", member: "Rohan Das", method: "—", amount: 1800, status: "Overdue" },
] as const;

const statusStyles: Record<string, string> = {
  Paid: "bg-emerald-soft text-accent-foreground",
  Partial: "bg-warn/15 text-warn",
  Overdue: "bg-danger/10 text-danger",
  Pending: "bg-foreground/10 text-foreground",
};

function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display text-4xl">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record full or partial payments and track dues.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-muted">
            <Download className="h-4 w-4" /> Export
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90">
            <Plus className="h-4 w-4" /> Record payment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Collected today", "₹21,600"],
          ["This week", "₹1.42L"],
          ["This month", "₹4.82L"],
          ["Outstanding", "₹84,200"],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-1 font-serif text-2xl tracking-tight">{v}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p, i) => (
              <tr key={i} className="hover:bg-muted/40">
                <td className="px-5 py-4 text-muted-foreground">{p.date}</td>
                <td className="px-5 py-4 font-medium">{p.member}</td>
                <td className="px-5 py-4 text-muted-foreground">{p.method}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[p.status]}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono">
                  ₹{p.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}