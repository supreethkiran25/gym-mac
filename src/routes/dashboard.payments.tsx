import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CreditCard,
  Download,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  FileText,
  Send,
  Calendar,
  Layers,
  Sparkles,
  PieChart as PieIcon,
  ShieldCheck,
} from "lucide-react";
import { useGymStore, Payment } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payments")({
  component: CFODashboard,
});

const CASHFLOW_DATA = [
  { month: "Jan", inflow: 490000, outflow: 210000, profit: 280000 },
  { month: "Feb", inflow: 520000, outflow: 215000, profit: 305000 },
  { month: "Mar", inflow: 560000, outflow: 230000, profit: 330000 },
  { month: "Apr", inflow: 615000, outflow: 245000, profit: 370000 },
  { month: "May", inflow: 685000, outflow: 260000, profit: 425000 },
  { month: "Jun (Est)", inflow: 740000, outflow: 270000, profit: 470000 },
];

function CFODashboard() {
  const {
    payments,
    members,
    settings,
    setIsRecordPaymentOpen,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
    sendAllReminders,
  } = useGymStore();

  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const membershipRev = payments
    .filter((p) => p.category === "Membership" || !p.category)
    .reduce((sum, p) => sum + p.amount, 0);
  const ptRev = payments
    .filter((p) => p.category === "Personal Training")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = members.reduce((sum, m) => sum + m.due, 0);
  const projectedMRR = Math.round(membershipRev * 1.14);

  const filteredPayments = payments.filter((p) => {
    if (categoryFilter === "All") return true;
    return p.category === categoryFilter || p.method === categoryFilter;
  });

  const exportCSV = () => {
    if (payments.length === 0) {
      toast.error("No payments to export");
      return;
    }
    const headers = ["Invoice#", "Date", "Member", "Category", "Method", "Amount", "Status", "Notes"];
    const rows = payments.map((p) => [
      p.invoiceNumber,
      p.date,
      `"${p.member}"`,
      p.category || "Membership",
      p.method,
      p.amount,
      p.status,
      `"${p.notes || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encoded);
    link.setAttribute("download", `gym_cfo_ledger_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded CFO financial ledger CSV!");
  };

  const handleOpenInvoice = (p: Payment) => {
    setActiveInvoicePayment(p);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">CFO Financial Command</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Live Ledger
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Cashflow forecasting, membership vs PT breakdown, invoices, and automated reminder queues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold hover:bg-muted transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => setIsRecordPaymentOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
          >
            <Plus className="h-4 w-4" /> Record Payment
          </button>
        </div>
      </div>

      {/* CFO Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Monthly Inflow Collected</span>
          <p className="text-2xl font-bold font-mono tracking-tight">
            {settings.currencySymbol}{totalCollected.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center gap-1 text-xs text-emerald font-medium">
            <ArrowUpRight className="h-3.5 w-3.5" /> +16.8% vs last month
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Membership vs PT Revenue</span>
          <div className="flex items-baseline justify-between text-xs pt-1">
            <span>Memberships:</span>
            <span className="font-mono font-bold text-foreground">
              {settings.currencySymbol}{membershipRev.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span>Personal Training:</span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              {settings.currencySymbol}{ptRev.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Outstanding Pending Dues</span>
          <p className="text-2xl font-bold font-mono tracking-tight text-warn">
            {settings.currencySymbol}{totalOutstanding.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{members.filter((m) => m.due > 0).length} members pending</span>
            <button
              onClick={() => {
                sendAllReminders();
                toast.success("Queued automated WhatsApp/SMS reminders!");
              }}
              className="text-emerald font-semibold hover:underline"
            >
              Batch Nudge
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <span className="text-xs font-semibold text-muted-foreground">Forecasted MRR (Next Month)</span>
          <p className="text-2xl font-bold font-mono tracking-tight text-foreground">
            {settings.currencySymbol}{projectedMRR.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground">
            Estimated ~91% renewal retention rate
          </p>
        </div>
      </div>

      {/* Cash Flow Visualization (Inflows vs Outflows vs Net Profit) */}
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Cash Flow & Profit Trajectory</h3>
            <p className="text-xs text-muted-foreground">
              Gross Inflow, Operational Outflow (Rent + Salaries + Maintenance), and Net Operating Profit
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald"></span> Gross Inflow
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Operating Outflow
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Net Profit
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CASHFLOW_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs font-mono" />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-xs font-mono"
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  fontSize: 12,
                }}
                formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`]}
              />
              <Bar dataKey="inflow" fill="oklch(0.58 0.14 162)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Itemized Transactions & Invoices Table */}
      <div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold tracking-tight">Payment Ledger & Invoices</h3>
            <p className="text-xs text-muted-foreground">
              Authenticated transaction logs with downloadable GST tax receipts
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(["All", "Membership", "Personal Training", "UPI", "Card", "Cash"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition border ${
                  categoryFilter === cat
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-canvas text-left uppercase text-muted-foreground font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/40 transition">
                  <td className="py-3.5 px-4 font-mono font-semibold text-foreground">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{p.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">{p.member}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-muted px-2 py-0.5 font-medium">
                      {p.category || "Membership"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{p.method}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.status === "Paid"
                          ? "bg-emerald-soft text-accent-foreground"
                          : "bg-warn/15 text-warn"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                    {settings.currencySymbol}{p.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOpenInvoice(p)}
                      className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg bg-canvas border border-border px-2.5 py-1 hover:bg-muted hover:text-foreground transition"
                    >
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}