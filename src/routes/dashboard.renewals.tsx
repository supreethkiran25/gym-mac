import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  RotateCw,
  Search,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  ShieldCheck,
  Send,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/renewals")({
  component: RenewalsPage,
  head: () => ({
    meta: [{ title: "Membership Renewals & Retentions | PEAKREP Gym OS" }],
  }),
});

function RenewalsPage() {
  const {
    members,
    renewals,
    settings,
    setIsRenewModalOpen,
    setSelectedMemberForRenewal,
  } = useGymStore();

  const [filterTab, setFilterTab] = useState<"expiring" | "expired" | "all" | "history">("expiring");
  const [search, setSearch] = useState("");

  const expiringMembers = members.filter((m) => m.status === "Expiring");
  const expiredMembers = members.filter((m) => m.status === "Expired");
  const partialMembers = members.filter((m) => m.due > 0);

  let displayedMembers = members;
  if (filterTab === "expiring") displayedMembers = expiringMembers;
  else if (filterTab === "expired") displayedMembers = expiredMembers;

  if (search) {
    displayedMembers = displayedMembers.filter(
      (m) =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.phone.includes(search) ||
        m.plan.toLowerCase().includes(search.toLowerCase())
    );
  }

  const handleOpenRenew = (m: Member) => {
    setSelectedMemberForRenewal(m);
    setIsRenewModalOpen(true);
  };

  const handleSendReminderWhatsApp = (m: Member) => {
    const text = encodeURIComponent(
      `Hi ${m.name}, your ${m.plan} membership at ${settings.name} ${
        m.status === "Expired" ? "expired on" : "is expiring on"
      } ${m.expiry}. Renew today to keep your fitness momentum going!`
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Sent WhatsApp renewal reminder to ${m.name}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Subscription Lifecycle & Retention Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Membership Renewals
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Identify expiring subscriptions, grant grace days, collect renewal payments, and retain gym members.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-amber-500/30 bg-amber-950/10 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
            <span>Expiring Within 7 Days</span>
            <Clock className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">{expiringMembers.length}</div>
          <p className="text-[11px] text-muted-foreground">High-priority renewal candidates</p>
        </div>

        <div className="rounded-3xl border border-rose-500/30 bg-rose-950/10 p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold">
            <span>Already Expired (Past Due)</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">{expiredMembers.length}</div>
          <p className="text-[11px] text-muted-foreground">Turnstile entry locked awaiting payment</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Renewals Logged</span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">{renewals.length}</div>
          <p className="text-[11px] text-muted-foreground">Successfully retained members</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex rounded-2xl bg-surface border border-border p-1 text-xs font-semibold">
          <button
            onClick={() => setFilterTab("expiring")}
            className={`px-4 py-2 rounded-xl transition ${
              filterTab === "expiring" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Expiring Soon ({expiringMembers.length})
          </button>
          <button
            onClick={() => setFilterTab("expired")}
            className={`px-4 py-2 rounded-xl transition ${
              filterTab === "expired" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Expired ({expiredMembers.length})
          </button>
          <button
            onClick={() => setFilterTab("all")}
            className={`px-4 py-2 rounded-xl transition ${
              filterTab === "all" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setFilterTab("history")}
            className={`px-4 py-2 rounded-xl transition ${
              filterTab === "history" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Renewal Log ({renewals.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search renewals..."
            className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2 text-xs focus:border-foreground focus:outline-hidden"
          />
        </div>
      </div>

      {/* Table Content */}
      {filterTab === "history" ? (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Renewal Transactions Log</h3>
          {renewals.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">No renewal records logged yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-canvas text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Member</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">New Expiry</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Processed By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {renewals.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/40">
                      <td className="p-3 font-mono">{r.date}</td>
                      <td className="p-3 font-bold text-foreground">{r.memberName}</td>
                      <td className="p-3">{r.planName}</td>
                      <td className="p-3 font-bold text-emerald">{r.newExpiry}</td>
                      <td className="p-3 font-mono font-bold">
                        {settings.currencySymbol}
                        {r.amount.toLocaleString("en-IN")} ({r.paymentMethod})
                      </td>
                      <td className="p-3 text-muted-foreground">{r.processedBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {filterTab === "expiring"
                ? "Expiring Soon Queue"
                : filterTab === "expired"
                ? "Expired Subscriptions"
                : "Active Members Directory"}
            </h3>
            <span className="text-xs text-muted-foreground">{displayedMembers.length} Members Listed</span>
          </div>

          {displayedMembers.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <CheckCircle2 className="h-8 w-8 text-emerald mx-auto" />
              <p className="text-xs font-semibold text-foreground">No members in this queue</p>
              <p className="text-[11px] text-muted-foreground">All subscriptions are up to date.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-canvas text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="p-3">Member</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Current Plan</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayedMembers.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/40 transition">
                      <td className="p-3 font-bold text-foreground">{m.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{m.phone}</td>
                      <td className="p-3">{m.plan}</td>
                      <td className="p-3 font-mono font-semibold">{m.expiry}</td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            m.status === "Active"
                              ? "bg-emerald-500/20 text-emerald"
                              : m.status === "Expiring"
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                              : m.status === "Frozen"
                              ? "bg-blue-500/20 text-blue-500"
                              : "bg-rose-500/20 text-rose-500"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleSendReminderWhatsApp(m)}
                            className="p-1.5 rounded-xl border border-border bg-canvas hover:bg-muted text-muted-foreground hover:text-emerald transition"
                            title="Send WhatsApp Reminder"
                          >
                            <Send className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenRenew(m)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                          >
                            <RotateCw className="h-3 w-3" />
                            <span>Renew / Extend</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
