import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Building,
  User,
  QrCode,
  Layers,
  ChevronDown,
  X,
  Receipt,
} from "lucide-react";
import { useGymStore, Payment, Member } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsAndRevenueEngine,
});

function PaymentsAndRevenueEngine() {
  const {
    payments,
    members,
    settings,
    recordPayment,
    setIsRecordPaymentOpen,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
    openUPIQRModal,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Record Installment Modal State
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState(members[0]?.id || "");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentMethod, setInstallmentMethod] = useState<"UPI" | "Cash" | "Card" | "Bank">("UPI");
  const [installmentNumber, setInstallmentNumber] = useState(1);
  const [totalInstallmentsEst, setTotalInstallmentsEst] = useState(2);
  const [installmentDate, setInstallmentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [installmentNotes, setInstallmentNotes] = useState("");

  const targetMember = members.find((m) => m.id === targetMemberId);

  // Revenue Analytics & Accurate Metrics
  // Expected Revenue = Sum of plan prices of all members
  const expectedRevenue = members.reduce((sum, m) => sum + (m.planPrice || 0), 0);

  // Collected Revenue = Sum of all payments received
  const collectedRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  // Pending Revenue = Sum of all unpaid member dues (Pending = Membership amount - Total collected)
  const pendingRevenue = members.reduce((sum, m) => sum + Math.max(0, (m.planPrice || 0) - (m.collectedAmount || 0)), 0);

  // Overdue members count
  const overdueMembersCount = members.filter((m) => m.due > 0).length;

  // Today's collections
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCollected = payments
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  // Current Month collections
  const currentMonthPrefix = todayStr.slice(0, 7); // e.g. "2026-05"
  const monthlyCollected = payments
    .filter((p) => p.date.startsWith(currentMonthPrefix))
    .reduce((sum, p) => sum + p.amount, 0);

  // Current Year collections
  const currentYearPrefix = todayStr.slice(0, 4); // e.g. "2026"
  const annualCollected = payments
    .filter((p) => p.date.startsWith(currentYearPrefix))
    .reduce((sum, p) => sum + p.amount, 0);

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (methodFilter !== "All" && p.method !== methodFilter) return false;
    if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
    if (statusFilter !== "All" && p.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchMember = p.member.toLowerCase().includes(q);
      const matchInvoice = p.invoiceNumber.toLowerCase().includes(q);
      const matchNotes = p.notes?.toLowerCase().includes(q);
      return matchMember || matchInvoice || matchNotes;
    }
    return true;
  });

  const handleOpenInstallmentModal = (member?: Member) => {
    if (member) {
      setTargetMemberId(member.id);
      const nextInstNum = (member.installments?.length || 0) + 1;
      setInstallmentNumber(nextInstNum);
      setInstallmentAmount(member.due > 0 ? member.due.toString() : "2000");
      setTotalInstallmentsEst(nextInstNum + 1);
    } else {
      setTargetMemberId(members[0]?.id || "");
      setInstallmentNumber(1);
      setInstallmentAmount("2000");
      setTotalInstallmentsEst(2);
    }
    setIsInstallmentModalOpen(true);
  };

  const handleConfirmInstallmentPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const paidNum = parseFloat(installmentAmount);
    if (!targetMember || isNaN(paidNum) || paidNum <= 0) {
      toast.error("Please specify a valid payment amount");
      return;
    }

    recordPayment({
      memberId: targetMember.id,
      member: targetMember.name,
      date: installmentDate,
      method: installmentMethod,
      amount: paidNum,
      category: "Membership",
      installmentNumber,
      totalInstallments: totalInstallmentsEst,
      notes: installmentNotes.trim() || `Installment ${installmentNumber} of ${totalInstallmentsEst} for ${targetMember.plan}`,
    });

    toast.success(`Logged ${settings.currencySymbol}${paidNum.toLocaleString("en-IN")} via ${installmentMethod} for ${targetMember.name}!`);
    setIsInstallmentModalOpen(false);
  };

  const handleViewInvoice = (payment: Payment) => {
    setActiveInvoicePayment(payment);
    setIsInvoiceModalOpen(true);
  };

  const handleExportCSV = () => {
    const headers = ["Invoice #", "Member", "Date", "Method", "Category", "Amount", "Installment", "Status", "Notes"];
    const rows = filteredPayments.map((p) => [
      p.invoiceNumber,
      `"${p.member}"`,
      p.date,
      p.method,
      p.category,
      p.amount,
      p.installmentIndex ? `${p.installmentIndex}/${p.totalInstallments || 1}` : "Full",
      p.status,
      `"${p.notes || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `peakrep_financial_ledger_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Financial ledger exported to CSV!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Finances & Payment Engine</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Live Ledger
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Multi-installment billing engine, automated due calculation formula (<code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">Pending = Plan Fee − Total Collected</code>), and financial receipts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold hover:bg-muted transition"
          >
            <Download className="h-4 w-4 text-muted-foreground" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => handleOpenInstallmentModal()}
            className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Record Installment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Revenue & Installment Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Expected Revenue */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Expected Revenue</span>
            <Building className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{expectedRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">Total contracted membership value</p>
        </div>

        {/* Collected Revenue */}
        <div className="rounded-2xl border border-emerald/30 bg-emerald-soft/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald">Total Collected</span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{collectedRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">Recognized payments in ledger</p>
        </div>

        {/* Pending Revenue */}
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Pending Dues</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{pendingRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">{overdueMembersCount} member(s) with unpaid balance</p>
        </div>

        {/* Collections Breakdown: Today, Month, Year */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Collections Velocity</span>
            <TrendingUp className="h-4 w-4 text-emerald" />
          </div>
          <div className="space-y-1 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Today:</span>
              <span className="font-bold text-foreground">{settings.currencySymbol}{todayCollected.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">This Month:</span>
              <span className="font-bold text-foreground">{settings.currencySymbol}{monthlyCollected.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Dues Fast-Action Ledger */}
      {overdueMembersCount > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Pending Installments Awaiting Collection ({overdueMembersCount})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {members.filter((m) => m.due > 0).map((m) => (
              <div key={m.id} className="rounded-xl border border-border bg-surface p-3.5 space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-foreground text-sm">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground">{m.plan} • Total: {settings.currencySymbol}{m.planPrice.toLocaleString("en-IN")}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 text-[11px] font-mono">
                      Due: {settings.currencySymbol}{m.due.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground font-mono">
                    Collected: {settings.currencySymbol}{m.collectedAmount.toLocaleString("en-IN")} ({(m.installments || []).length} installment(s) paid)
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => handleOpenInstallmentModal(m)}
                    className="flex-1 py-1.5 rounded-lg bg-foreground text-background font-semibold text-xs hover:opacity-90 transition text-center"
                  >
                    Collect Installment
                  </button>
                  <button
                    onClick={() => openUPIQRModal(m.due, m.name, `Membership Due - ${m.plan}`)}
                    className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition"
                  >
                    <QrCode className="h-3.5 w-3.5 text-emerald" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by invoice #, member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-canvas text-xs outline-none focus:border-emerald"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
          >
            <option value="All">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Bank">Bank Transfer</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
          >
            <option value="All">All Categories</option>
            <option value="Membership">Membership</option>
            <option value="Personal Training">Personal Training</option>
            <option value="Registration">Registration</option>
          </select>

          <span className="text-xs text-muted-foreground font-mono shrink-0 ml-1">
            {filteredPayments.length} Records
          </span>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Member Name</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Installment</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/30 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {p.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-foreground">
                    {p.member}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground font-mono">
                    {p.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-canvas border border-border px-2 py-0.5 font-mono text-[11px] font-semibold">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">
                    {p.category}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                    {p.installmentIndex ? (
                      <span className="rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 font-bold">
                        Installment #{p.installmentIndex}
                      </span>
                    ) : (
                      "Full Payment"
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground text-sm">
                    {settings.currencySymbol}{p.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => handleViewInvoice(p)}
                      className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition"
                      title="View & Print Official Receipt"
                    >
                      <Receipt className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                    No payment records match the current filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Installment Modal */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Record Membership Installment</h3>
                  <p className="text-[11px] text-muted-foreground">Log partial or full dues with automatic balance updates</p>
                </div>
              </div>
              <button onClick={() => setIsInstallmentModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmInstallmentPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Select Member *</label>
                <select
                  required
                  value={targetMemberId}
                  onChange={(e) => {
                    setTargetMemberId(e.target.value);
                    const m = members.find((x) => x.id === e.target.value);
                    if (m) {
                      setInstallmentAmount(m.due > 0 ? m.due.toString() : "2000");
                      setInstallmentNumber((m.installments?.length || 0) + 1);
                    }
                  }}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Plan: {m.plan} • Due: {settings.currencySymbol}{m.due})
                    </option>
                  ))}
                </select>
              </div>

              {targetMember && (
                <div className="p-3 rounded-xl border border-border bg-canvas text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Total Plan Fee:</span>
                    <span className="font-bold text-foreground">{settings.currencySymbol}{targetMember.planPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Previously Collected:</span>
                    <span className="font-bold text-emerald">{settings.currencySymbol}{targetMember.collectedAmount.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground border-t border-border pt-1">
                    <span>Outstanding Due:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400">{settings.currencySymbol}{targetMember.due.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Installment Amount ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald font-bold"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Payment Method</label>
                  <select
                    value={installmentMethod}
                    onChange={(e) => setInstallmentMethod(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Installment Index</label>
                  <input
                    type="number"
                    min={1}
                    value={installmentNumber}
                    onChange={(e) => setInstallmentNumber(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={installmentDate}
                    onChange={(e) => setInstallmentDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Notes / Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref #93847291 or Cash receipt"
                  value={installmentNotes}
                  onChange={(e) => setInstallmentNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsInstallmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  Confirm & Update Dues
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}