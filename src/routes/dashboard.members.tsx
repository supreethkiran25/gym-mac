import { createFileRoute } from "@tanstack/react-router";
import { Filter, Plus } from "lucide-react";

export const Route = createFileRoute("/dashboard/members")({
  component: Members,
});

type Status = "Active" | "Expiring" | "Expired" | "Partial";

const members: {
  name: string;
  phone: string;
  plan: string;
  expiry: string;
  status: Status;
  due: number;
}[] = [
  { name: "Aarav Sharma", phone: "+91 98201 12233", plan: "Monthly", expiry: "21 May 2026", status: "Expiring", due: 0 },
  { name: "Mehul Patel", phone: "+91 97401 88123", plan: "Quarterly", expiry: "23 May 2026", status: "Partial", due: 1200 },
  { name: "Riya Kapoor", phone: "+91 99876 12390", plan: "Annual", expiry: "25 May 2027", status: "Active", due: 0 },
  { name: "Kabir Nair", phone: "+91 90220 33445", plan: "Half-yearly", expiry: "27 May 2026", status: "Active", due: 0 },
  { name: "Tara Iyer", phone: "+91 98112 99831", plan: "Monthly", expiry: "12 May 2026", status: "Expired", due: 2400 },
  { name: "Aditya Rao", phone: "+91 99008 21100", plan: "Monthly", expiry: "02 Jun 2026", status: "Active", due: 0 },
  { name: "Sneha Verma", phone: "+91 98700 55812", plan: "Quarterly", expiry: "10 Jun 2026", status: "Active", due: 0 },
  { name: "Rohan Das", phone: "+91 99220 71200", plan: "Monthly", expiry: "08 May 2026", status: "Expired", due: 1800 },
];

const statusStyles: Record<Status, string> = {
  Active: "bg-emerald-soft text-accent-foreground",
  Expiring: "bg-warn/15 text-warn",
  Expired: "bg-danger/10 text-danger",
  Partial: "bg-foreground/10 text-foreground",
};

function Members() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display text-4xl">Members</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {members.length} members · {members.filter((m) => m.due > 0).length} with pending dues
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-muted">
            <Filter className="h-4 w-4" /> Filter
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background hover:opacity-90">
            <Plus className="h-4 w-4" /> Add member
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">Member</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Expiry</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 text-right font-medium">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {members.map((m) => (
              <tr key={m.name} className="hover:bg-muted/40">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-soft text-sm font-medium text-accent-foreground">
                      {m.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.phone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{m.plan}</td>
                <td className="px-5 py-4 text-muted-foreground">{m.expiry}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-right font-mono">
                  {m.due > 0 ? (
                    <span className="text-warn">₹{m.due.toLocaleString("en-IN")}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}