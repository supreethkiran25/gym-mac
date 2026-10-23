import React, { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CreditCard,
  TrendingUp,
  Scale,
  FileCheck2,
  TrendingDown,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  FileText,
  Building,
  User,
  QrCode,
  Layers,
  ChevronDown,
  X,
  Receipt,
  RotateCcw,
  ShieldAlert,
  Lock,
  Zap,
  Wrench,
  ShoppingBag,
  Megaphone,
  Briefcase,
  Trash2,
  Printer,
} from "lucide-react";
import { useGymStore, Payment, Member, GymExpense, ExpenseCategory } from "../lib/gym-store";
import { RoleGuard } from "../components/dashboard/RoleGuard";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/payments")({
  component: PaymentsRouteWrapper,
  head: () => ({
    meta: [{ title: "Finances, Expenses, Payroll & P&L | PEAKREP Gym OS" }],
  }),
});

function PaymentsRouteWrapper() {
  return (
    <RoleGuard requiredRole="admin" moduleName="Finances, Operating Expenses & P&L Ledger">
      <PaymentsAndRevenueEngine />
    </RoleGuard>
  );
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Building Rent",
  "Electricity & Water",
  "Staff Salary",
  "Equipment Maintenance",
  "Supplements & Inventory",
  "Software & Marketing",
  "Miscellaneous",
];

function PaymentsAndRevenueEngine() {
  const {
    payments,
    expenses,
    members,
    staff,
    settings,
    currentUser,
    recordPayment,
    addExpense,
    deleteExpense,
    payStaffSalary,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
    setSelectedPaymentForRefund,
    setIsRefundModalOpen,
    openUPIQRModal,
    runReconciliation,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"inflow" | "expenses" | "pnl" | "reconciliation">("inflow");

  const reconciliationData = useMemo(() => {
    return runReconciliation();
  }, [payments, members]);

  // Inflow Filters
  const [inflowSearch, setInflowSearch] = useState("");
  const [inflowMethodFilter, setInflowMethodFilter] = useState<string>("All");
  const [inflowStatusFilter, setInflowStatusFilter] = useState<string>("All");

  // Expense Filters
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>("All");
  const [expenseMethodFilter, setExpenseMethodFilter] = useState<string>("All");

  const isAdmin = currentUser.role === "admin";

  // Record Installment / Inflow Modal State
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [targetMemberId, setTargetMemberId] = useState(members[0]?.id || "");
  const [installmentAmount, setInstallmentAmount] = useState("");
  const [installmentMethod, setInstallmentMethod] = useState<"UPI" | "Cash" | "Card" | "Bank">(
    "UPI",
  );
  const [installmentNumber, setInstallmentNumber] = useState(1);
  const [totalInstallmentsEst, setTotalInstallmentsEst] = useState(2);
  const [installmentDate, setInstallmentDate] = useState(
    () => new Date().toISOString().split("T")[0],
  );
  const [installmentNotes, setInstallmentNotes] = useState("");

  // Record Expense Modal State
  const [isRecordExpenseModalOpen, setIsRecordExpenseModalOpen] = useState(false);
  const [expTitle, setExpTitle] = useState("");
  const [expCategory, setExpCategory] = useState<ExpenseCategory>("Building Rent");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [expMethod, setExpMethod] = useState<"UPI" | "Bank Transfer" | "Cash" | "Card" | "Cheque">(
    "Bank Transfer",
  );
  const [expRecipient, setExpRecipient] = useState("");
  const [expReceiptNo, setExpReceiptNo] = useState("");
  const [expNotes, setExpNotes] = useState("");

  // View Expense Voucher Modal State
  const [selectedExpenseVoucher, setSelectedExpenseVoucher] = useState<GymExpense | null>(null);

  const targetMember = members.find((m) => m.id === targetMemberId);

  // Financial Analytics Calculations
  const expectedRevenue = members.reduce((sum, m) => sum + (m.planPrice || 0), 0);
  const totalInflow = payments.reduce(
    (sum, p) => sum + (p.status === "Refunded" ? 0 : p.amount),
    0,
  );
  const totalOutflow = expenses.reduce((sum, e) => sum + (e.status === "Paid" ? e.amount : 0), 0);
  const pendingRevenue = members.reduce(
    (sum, m) => sum + Math.max(0, (m.planPrice || 0) - (m.collectedAmount || 0)),
    0,
  );
  const overdueMembersCount = members.filter((m) => m.due > 0).length;

  // Net Operating Balance (Profit or Loss)
  const netBalance = totalInflow - totalOutflow;
  const isLoss = netBalance < 0;

  // Today's stats
  const todayStr = new Date().toISOString().split("T")[0];
  const todayCollected = payments
    .filter((p) => p.date === todayStr && p.status !== "Refunded")
    .reduce((sum, p) => sum + p.amount, 0);
  const todayExpenses = expenses
    .filter((e) => e.date === todayStr && e.status === "Paid")
    .reduce((sum, e) => sum + e.amount, 0);

  // Filtered Inflows
  const filteredPayments = payments.filter((p) => {
    if (inflowMethodFilter !== "All" && p.method !== inflowMethodFilter) return false;
    if (inflowStatusFilter !== "All" && p.status !== inflowStatusFilter) return false;
    if (inflowSearch.trim()) {
      const q = inflowSearch.toLowerCase();
      const matchMember = p.member.toLowerCase().includes(q);
      const matchInvoice = p.invoiceNumber.toLowerCase().includes(q);
      const matchNotes = p.notes?.toLowerCase().includes(q);
      return matchMember || matchInvoice || matchNotes;
    }
    return true;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    if (expenseCategoryFilter !== "All" && e.category !== expenseCategoryFilter) return false;
    if (expenseMethodFilter !== "All" && e.paymentMethod !== expenseMethodFilter) return false;
    if (expenseSearch.trim()) {
      const q = expenseSearch.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchRecipient = e.recipientName?.toLowerCase().includes(q);
      const matchReceipt = e.receiptNumber?.toLowerCase().includes(q);
      return matchTitle || matchRecipient || matchReceipt;
    }
    return true;
  });

  // Category-wise Expense Breakdown
  const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => {
    const catTotal = expenses
      .filter((e) => e.category === cat && e.status === "Paid")
      .reduce((sum, e) => sum + e.amount, 0);
    const percentage = totalOutflow > 0 ? ((catTotal / totalOutflow) * 100).toFixed(1) : "0";
    return { category: cat, total: catTotal, percentage };
  }).filter((c) => c.total > 0);

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
      notes:
        installmentNotes.trim() ||
        `Installment ${installmentNumber} of ${totalInstallmentsEst} for ${targetMember.plan}`,
    });

    toast.success(
      `Logged ${settings.currencySymbol}${paidNum.toLocaleString("en-IN")} via ${installmentMethod} for ${targetMember.name}!`,
    );
    setIsInstallmentModalOpen(false);
  };

  const handleOpenRecordExpense = () => {
    if (!isAdmin) {
      toast.error("Recording operational expenses is restricted to Gym Owner (Admin).");
      return;
    }
    setExpTitle("");
    setExpCategory("Building Rent");
    setExpAmount("");
    setExpDate(new Date().toISOString().split("T")[0]);
    setExpMethod("Bank Transfer");
    setExpRecipient("");
    setExpReceiptNo("");
    setExpNotes("");
    setIsRecordExpenseModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(expAmount);
    if (!expTitle.trim() || isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid expense title and amount");
      return;
    }

    addExpense({
      title: expTitle.trim(),
      category: expCategory,
      amount: numAmount,
      date: expDate,
      paymentMethod: expMethod,
      status: "Paid",
      recipientName: expRecipient.trim() || "Vendor / Landlord",
      receiptNumber: expReceiptNo.trim() || `EXP-${Date.now().toString().slice(-6)}`,
      notes: expNotes.trim(),
      recordedBy: currentUser.name,
    });

    toast.success(
      `Logged expense of ${settings.currencySymbol}${numAmount.toLocaleString("en-IN")} for ${expTitle}!`,
    );
    setIsRecordExpenseModalOpen(false);
  };

  const handleViewInvoice = (payment: Payment) => {
    setActiveInvoicePayment(payment);
    setIsInvoiceModalOpen(true);
  };

  const handleInitiateRefund = (payment: Payment) => {
    if (!isAdmin) {
      toast.error("Payment refunds are strictly restricted to Gym Owner (Admin) accounts.");
      return;
    }
    setSelectedPaymentForRefund(payment);
    setIsRefundModalOpen(true);
  };

  const handleExportCSV = () => {
    if (!isAdmin) {
      toast.error("Exporting financial ledger is restricted to Admin role.");
      return;
    }

    if (activeTab === "expenses") {
      const headers = [
        "ID",
        "Title",
        "Category",
        "Amount",
        "Date",
        "Payment Method",
        "Recipient",
        "Receipt #",
        "Recorded By",
        "Notes",
      ];
      const rows = filteredExpenses.map((e) => [
        e.id,
        `"${e.title}"`,
        `"${e.category}"`,
        e.amount,
        e.date,
        e.paymentMethod,
        `"${e.recipientName || ""}"`,
        `"${e.receiptNumber || ""}"`,
        `"${e.recordedBy}"`,
        `"${e.notes || ""}"`,
      ]);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `peakrep_expenses_ledger_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Expenses ledger exported to CSV!");
    } else {
      const headers = [
        "Invoice #",
        "Member",
        "Date",
        "Method",
        "Category",
        "Amount",
        "Installment",
        "Status",
        "Notes",
      ];
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
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `peakrep_collections_ledger_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Member collections ledger exported to CSV!");
    }
  };

  const getCategoryIcon = (category: ExpenseCategory) => {
    switch (category) {
      case "Building Rent":
        return <Building className="h-4 w-4 text-brand" />;
      case "Electricity & Water":
        return <Zap className="h-4 w-4 text-brand" />;
      case "Staff Salary":
        return <Briefcase className="h-4 w-4 text-brand" />;
      case "Equipment Maintenance":
        return <Wrench className="h-4 w-4 text-brand" />;
      case "Supplements & Inventory":
        return <ShoppingBag className="h-4 w-4 text-brand" />;
      case "Software & Marketing":
        return <Megaphone className="h-4 w-4 text-brand" />;
      default:
        return <CreditCard className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Financial Cockpit & Cash Flow
            </h1>
            <span className="rounded-full bg-emerald-500/20 text-emerald px-2.5 py-0.5 text-xs font-bold font-mono">
              Live Ledger
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Complete gym financial engine tracking Member Collections (Inflow), Operational Bills &
            Staff Payroll (Outflow), and Net Profit & Loss.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold hover:bg-muted transition text-foreground"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
                <span>Export Ledger</span>
              </button>
              <button
                onClick={handleOpenRecordExpense}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 px-4 py-2 text-xs font-bold hover:bg-rose-500/20 transition shadow-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Record Gym Bill / Expense</span>
              </button>
            </>
          )}
          <button
            onClick={() => handleOpenInstallmentModal()}
            className="flex items-center gap-1.5 rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-bold shadow-md shadow-brand/20 hover:brightness-110 active:scale-[0.98] transition"
          >
            <Plus className="h-4 w-4" />
            <span>Collect Member Dues</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Inflow, Outflow, Net Cash Flow, Pending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Inflow (Revenue Collected) */}
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald">Total Inflow (Collections)</span>
            <div className="flex items-center gap-1 text-emerald">
              <TrendingUp className="h-4 w-4" />
              <span className="text-[10px] font-bold">Revenue</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}
            {totalInflow.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Today:{" "}
              <strong className="text-emerald font-mono">
                {settings.currencySymbol}
                {todayCollected.toLocaleString("en-IN")}
              </strong>
            </span>
            <span>{payments.length} receipts</span>
          </div>
        </div>

        {/* Total Outflow (Expenses & Salaries) */}
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Total Outflow (Expenses & Bills)
            </span>
            <div className="flex items-center gap-1 text-rose-500">
              <TrendingDown className="h-4 w-4" />
              <span className="text-[10px] font-bold">Burn</span>
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}
            {totalOutflow.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Rent, Power, Salaries</span>
            <span>{expenses.length} bills logged</span>
          </div>
        </div>

        {/* Net Cash Flow (Profit or Loss) */}
        <div
          className={`rounded-3xl border p-5 space-y-2 shadow-2xs ${
            isLoss
              ? "border-rose-500/40 bg-rose-950/20 text-foreground"
              : "border-emerald-500/40 bg-emerald-950/20 text-foreground"
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                isLoss ? "text-rose-600 dark:text-rose-400" : "text-emerald"
              }`}
            >
              {isLoss ? "Net Operating Loss" : "Net Operating Profit"}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isLoss
                  ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/20 text-emerald"
              }`}
            >
              {isLoss ? "Outflow > Inflow" : "Profitable"}
            </span>
          </div>
          <p
            className={`text-2xl sm:text-3xl font-black font-mono ${
              isLoss ? "text-rose-600 dark:text-rose-400" : "text-emerald"
            }`}
          >
            {isLoss ? "-" : "+"}
            {settings.currencySymbol}
            {Math.abs(netBalance).toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {isLoss
              ? `Expenses exceed income by ${settings.currencySymbol}${Math.abs(netBalance).toLocaleString("en-IN")}`
              : `Net profit margin of ${((netBalance / (totalInflow || 1)) * 100).toFixed(1)}%`}
          </p>
        </div>

        {/* Pending Member Dues */}
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pending Member Dues
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}
            {pendingRevenue.toLocaleString("en-IN")}
          </p>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{overdueMembersCount} member(s) with dues</span>
            <button
              onClick={() => setActiveTab("inflow")}
              className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              Collect →
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-border pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab("inflow")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === "inflow"
              ? "bg-brand text-brand-foreground shadow-md shadow-brand/20"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowUpRight className="h-4 w-4 text-emerald" />
          <span>Member Fee Inflow & Dues ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition ${
            activeTab === "expenses"
              ? "bg-brand text-brand-foreground shadow-md shadow-brand/20"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <ArrowDownRight className="h-4 w-4 text-rose-500" />
          <span>Gym Expenses, Bills & Payroll ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pnl")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === "pnl"
              ? "bg-brand text-brand-foreground shadow-md shadow-brand/20"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>P&L Statement & Cash Flow</span>
        </button>

        <button
          onClick={() => setActiveTab("reconciliation")}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer ${
            activeTab === "reconciliation"
              ? "bg-brand text-brand-foreground shadow-md shadow-brand/20"
              : "border border-border bg-surface text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scale className="h-4 w-4 text-sky-400" />
          <span>Ledger Reconciliation & Audit ({reconciliationData.matchedCount} Matched)</span>
        </button>
      </div>

      {/* TAB 1: MEMBER FEE INFLOW & DUES */}
      {activeTab === "inflow" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Unpaid Dues Fast-Action Ledger */}
          {overdueMembersCount > 0 && (
            <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Pending Installments Awaiting Collection ({overdueMembersCount})
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {members
                  .filter((m) => m.due > 0)
                  .map((m) => (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-border bg-surface p-4 space-y-2 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-foreground text-sm">{m.name}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {m.plan} • Total: {settings.currencySymbol}
                              {m.planPrice.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <span className="rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 text-[11px] font-mono">
                            Due: {settings.currencySymbol}
                            {m.due.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="mt-2 text-[11px] text-muted-foreground font-mono">
                          Collected: {settings.currencySymbol}
                          {m.collectedAmount.toLocaleString("en-IN")} (
                          {(m.installments || []).length} installment(s) paid)
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center gap-2">
                        <button
                          onClick={() => handleOpenInstallmentModal(m)}
                          className="flex-1 py-1.5 rounded-xl bg-brand text-brand-foreground font-bold text-xs hover:brightness-110 transition text-center"
                        >
                          Collect Installment
                        </button>
                        <button
                          onClick={() =>
                            openUPIQRModal(m.due, m.name, `Membership Due - ${m.plan}`)
                          }
                          className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition"
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by invoice #, member name..."
                value={inflowSearch}
                onChange={(e) => setInflowSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-canvas text-xs outline-hidden focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={inflowMethodFilter}
                onChange={(e) => setInflowMethodFilter(e.target.value)}
                className="rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-hidden focus:border-brand"
              >
                <option value="All">All Payment Methods</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank">Bank Transfer</option>
              </select>

              <select
                value={inflowStatusFilter}
                onChange={(e) => setInflowStatusFilter(e.target.value)}
                className="rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-hidden focus:border-brand"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Partial">Partial Installment</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Member Payments Table */}
          <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="py-3.5 px-4 font-semibold">Receipt / Invoice</th>
                    <th className="py-3.5 px-4 font-semibold">Member</th>
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Method</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Amount Paid</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No transactions found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {p.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-foreground">{p.member}</p>
                          {p.installmentIndex && (
                            <span className="text-[10px] text-muted-foreground">
                              Installment {p.installmentIndex} of {p.totalInstallments || 1}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground font-mono">{p.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-semibold">
                            {p.method}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">{p.category}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-foreground text-sm">
                          {settings.currencySymbol}
                          {p.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              p.status === "Paid"
                                ? "bg-emerald-500/20 text-emerald"
                                : p.status === "Partial"
                                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                  : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleViewInvoice(p)}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="View & Print Official GST Tax Invoice"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                            {isAdmin && p.status !== "Refunded" && (
                              <button
                                onClick={() => handleInitiateRefund(p)}
                                className="p-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Process Refund"
                              >
                                <RotateCcw className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GYM EXPENSES, BILLS & PAYROLL OUTFLOW */}
      {activeTab === "expenses" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Quick Expense Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {expenseByCategory.map((c) => (
              <div
                key={c.category}
                className="rounded-2xl border border-border bg-surface p-4 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {getCategoryIcon(c.category as ExpenseCategory)}
                  <span className="text-[11px] font-semibold truncate">{c.category}</span>
                </div>
                <p className="text-lg font-bold font-mono text-foreground">
                  {settings.currencySymbol}
                  {c.total.toLocaleString("en-IN")}
                </p>
                <div className="text-[10px] text-muted-foreground">
                  {c.percentage}% of total outflow
                </div>
              </div>
            ))}
          </div>

          {/* Filter & Search Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-3xl border border-border bg-surface p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by bill title, vendor, receipt..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-canvas text-xs outline-hidden focus:border-brand"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-hidden focus:border-brand"
              >
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={expenseMethodFilter}
                onChange={(e) => setExpenseMethodFilter(e.target.value)}
                className="rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-hidden focus:border-brand"
              >
                <option value="All">All Payment Methods</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Cheque">Cheque</option>
              </select>

              {isAdmin && (
                <button
                  onClick={handleOpenRecordExpense}
                  className="flex items-center gap-1.5 rounded-xl bg-rose-600 text-white px-3.5 py-2 text-xs font-bold hover:bg-rose-700 transition shadow-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Expense</span>
                </button>
              )}
            </div>
          </div>

          {/* Expenses Table */}
          <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                    <th className="py-3.5 px-4 font-semibold">Expense Title / Vendor</th>
                    <th className="py-3.5 px-4 font-semibold">Category</th>
                    <th className="py-3.5 px-4 font-semibold">Date</th>
                    <th className="py-3.5 px-4 font-semibold">Payment Mode</th>
                    <th className="py-3.5 px-4 font-semibold">Receipt / Ref #</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Logged By</th>
                    <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No expense records found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((e) => (
                      <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-foreground">{e.title}</p>
                          {e.recipientName && (
                            <p className="text-[11px] text-muted-foreground">
                              Payee: {e.recipientName}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(e.category)}
                            <span className="font-medium text-foreground">{e.category}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground font-mono">{e.date}</td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-semibold">
                            {e.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          {e.receiptNumber || "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                          -{settings.currencySymbol}
                          {e.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                          {e.recordedBy}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedExpenseVoucher(e)}
                              className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                              title="View Payment Voucher"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  deleteExpense(e.id);
                                  toast.success(`Removed expense: ${e.title}`);
                                }}
                                className="p-1.5 rounded-lg border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition"
                                title="Delete Expense Record"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PROFIT & LOSS STATEMENT & CASH FLOW */}
      {activeTab === "pnl" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-bold text-foreground">
                  Gym Profit & Loss (P&L) Operating Statement
                </h3>
                <p className="text-xs text-muted-foreground">
                  Comprehensive audit of income inflows versus recurring overheads and payroll.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-soft border border-brand/30 text-brand px-3 py-1 text-xs font-bold">
                  FY 2026-2027
                </span>
              </div>
            </div>

            {/* Inflow vs Outflow Comparison Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gross Inflow */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald uppercase tracking-wider">
                    Gross Inflow (A)
                  </span>
                  <TrendingUp className="h-5 w-5 text-emerald" />
                </div>
                <p className="text-3xl font-black font-mono text-foreground">
                  {settings.currencySymbol}
                  {totalInflow.toLocaleString("en-IN")}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground border-t border-emerald-500/20 pt-2">
                  <div className="flex justify-between">
                    <span>Member Subscriptions:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {settings.currencySymbol}
                      {payments
                        .filter((p) => p.category === "Membership" && p.status !== "Refunded")
                        .reduce((s, p) => s + p.amount, 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personal Training & POS:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {settings.currencySymbol}
                      {payments
                        .filter((p) => p.category !== "Membership" && p.status !== "Refunded")
                        .reduce((s, p) => s + p.amount, 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gross Outflow */}
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Gross Outflow (B)
                  </span>
                  <TrendingDown className="h-5 w-5 text-rose-500" />
                </div>
                <p className="text-3xl font-black font-mono text-foreground">
                  {settings.currencySymbol}
                  {totalOutflow.toLocaleString("en-IN")}
                </p>
                <div className="space-y-1 text-xs text-muted-foreground border-t border-rose-500/20 pt-2">
                  <div className="flex justify-between">
                    <span>Staff Salaries & Payroll:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {settings.currencySymbol}
                      {expenses
                        .filter((e) => e.category === "Staff Salary" && e.status === "Paid")
                        .reduce((s, e) => s + e.amount, 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Facility Rent & Utilities:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {settings.currencySymbol}
                      {expenses
                        .filter(
                          (e) =>
                            (e.category === "Building Rent" ||
                              e.category === "Electricity & Water") &&
                            e.status === "Paid",
                        )
                        .reduce((s, e) => s + e.amount, 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance & Inventory:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {settings.currencySymbol}
                      {expenses
                        .filter(
                          (e) =>
                            e.category !== "Staff Salary" &&
                            e.category !== "Building Rent" &&
                            e.category !== "Electricity & Water" &&
                            e.status === "Paid",
                        )
                        .reduce((s, e) => s + e.amount, 0)
                        .toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Balance (Profit / Loss) */}
              <div
                className={`rounded-2xl border p-5 space-y-3 ${
                  isLoss
                    ? "border-rose-500/40 bg-rose-950/20"
                    : "border-emerald-500/40 bg-emerald-950/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isLoss ? "text-rose-600 dark:text-rose-400" : "text-emerald"
                    }`}
                  >
                    Net Operating {isLoss ? "Loss" : "Profit"} (A - B)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isLoss
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-500/20 text-emerald"
                    }`}
                  >
                    {isLoss ? "Deficit" : "Surplus"}
                  </span>
                </div>
                <p
                  className={`text-3xl font-black font-mono ${
                    isLoss ? "text-rose-600 dark:text-rose-400" : "text-emerald"
                  }`}
                >
                  {isLoss ? "-" : "+"}
                  {settings.currencySymbol}
                  {Math.abs(netBalance).toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-muted-foreground border-t border-border pt-2">
                  {isLoss
                    ? "The gym is currently operating at a cash deficit. Recover pending member dues or grow recurring subscriptions to attain positive operational cash flow."
                    : "The gym is operating profitably with cash reserves remaining after paying overheads."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FINANCIAL RECONCILIATION & AUDIT */}
      {activeTab === "reconciliation" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                TOTAL GROSS AUDITED
              </span>
              <p className="text-2xl font-bold font-mono text-white">
                {settings.currencySymbol}{reconciliationData.totalGrossReconciled.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500">All registered inflows</p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                MATCHED LEDGER
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {reconciliationData.matchedCount}
              </p>
              <p className="text-[11px] text-slate-500">100% Reconciled to invoices</p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                DISCREPANCIES
              </span>
              <p className={`text-2xl font-bold font-mono ${reconciliationData.discrepancyCount > 0 ? "text-rose-400" : "text-slate-400"}`}>
                {reconciliationData.discrepancyCount}
              </p>
              <p className="text-[11px] text-slate-500">Unmatched / Over-refunds</p>
            </div>

            <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
                NET SETTLED
              </span>
              <p className="text-2xl font-bold font-mono text-sky-400">
                {settings.currencySymbol}{reconciliationData.totalNetReconciled.toLocaleString("en-IN")}
              </p>
              <p className="text-[11px] text-slate-500">Inflows minus refunds</p>
            </div>
          </div>

          {/* Audit Table */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0d14]/70 p-6 space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-heading font-black uppercase tracking-wider text-white">
                  Payment Ledger vs Invoices Reconciliation
                </h3>
                <p className="text-xs text-slate-400">
                  Cross-audits each payment transaction against member collected records and tax invoices.
                </p>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Audit Status: Balanced
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#05080f]">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/5 border-b border-white/5 text-slate-400 text-[10px] uppercase font-mono">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Member</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Refunded</th>
                    <th className="p-3">Net Settled</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {reconciliationData.items.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="p-3 font-mono text-[11px] text-slate-400">{item.date}</td>
                      <td className="p-3 font-mono font-bold text-sky-400">{item.invoiceNumber}</td>
                      <td className="p-3 font-medium text-white">{item.memberName}</td>
                      <td className="p-3 font-mono text-white">
                        {settings.currencySymbol}{item.paymentAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3 font-mono text-rose-400">
                        {item.totalRefunded > 0 ? `-${settings.currencySymbol}${item.totalRefunded}` : "—"}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-400">
                        {settings.currencySymbol}{item.netAmount.toLocaleString("en-IN")}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === "Matched"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 max-w-xs truncate">
                        {item.details}
                      </td>
                    </tr>
                  ))}
                  {reconciliationData.items.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-xs text-slate-500">
                        No transactions recorded for reconciliation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECORD INSTALLMENT / PAYMENT MODAL */}
      {isInstallmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-bold text-foreground">Record Member Payment</h3>
              </div>
              <button
                onClick={() => setIsInstallmentModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmInstallmentPayment} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Select Member
                </label>
                <select
                  value={targetMemberId}
                  onChange={(e) => {
                    const selId = e.target.value;
                    setTargetMemberId(selId);
                    const m = members.find((x) => x.id === selId);
                    if (m) {
                      setInstallmentAmount(m.due > 0 ? m.due.toString() : "2000");
                      const nextInst = (m.installments?.length || 0) + 1;
                      setInstallmentNumber(nextInst);
                      setTotalInstallmentsEst(nextInst + 1);
                    }
                  }}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-medium outline-hidden focus:border-brand"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan} — Due: {settings.currencySymbol}
                      {m.due.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Amount to Collect ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    value={installmentAmount}
                    onChange={(e) => setInstallmentAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-mono font-bold outline-hidden focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Payment Method
                  </label>
                  <select
                    value={installmentMethod}
                    onChange={(e) =>
                      setInstallmentMethod(e.target.value as "UPI" | "Cash" | "Card" | "Bank")
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-semibold outline-hidden focus:border-brand"
                  >
                    <option value="UPI">UPI / GPay / PhonePe</option>
                    <option value="Cash">Cash at Front Desk</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Bank">Bank NEFT / IMPS</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Installment #
                  </label>
                  <input
                    type="number"
                    value={installmentNumber}
                    onChange={(e) => setInstallmentNumber(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Total Installments Est.
                  </label>
                  <input
                    type="number"
                    value={totalInstallmentsEst}
                    onChange={(e) => setTotalInstallmentsEst(parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={installmentDate}
                  onChange={(e) => setInstallmentDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Notes / Transaction Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref # 9928103, 1st installment"
                  value={installmentNotes}
                  onChange={(e) => setInstallmentNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsInstallmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand text-brand-foreground font-bold shadow-md shadow-brand/20 hover:brightness-110 transition"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE / BILL MODAL */}
      {isRecordExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-5 w-5 text-rose-500" />
                <h3 className="text-sm font-bold text-foreground">
                  Record Gym Operational Expense / Bill
                </h3>
              </div>
              <button
                onClick={() => setIsRecordExpenseModalOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Expense Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Facility Rent, BESCOM Electricity Bill"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-medium outline-hidden focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Category</label>
                  <select
                    value={expCategory}
                    onChange={(e) =>
                      setExpCategory(e.target.value as (typeof EXPENSE_CATEGORIES)[number])
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-semibold outline-hidden focus:border-brand"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Amount ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 65000"
                    value={expAmount}
                    onChange={(e) => setExpAmount(e.target.value)}
                    required
                    min="1"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-mono font-bold outline-hidden focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expMethod}
                    onChange={(e) =>
                      setExpMethod(
                        e.target.value as "Bank Transfer" | "UPI" | "Cash" | "Card" | "Cheque",
                      )
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground outline-hidden focus:border-brand"
                  >
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI / PhonePe / GPay</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={expDate}
                    onChange={(e) => setExpDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Payee / Vendor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Habitat Properties, BESCOM"
                    value={expRecipient}
                    onChange={(e) => setExpRecipient(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Bill / Receipt #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RENT-MAY-26"
                    value={expReceiptNo}
                    onChange={(e) => setExpReceiptNo(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Notes / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional billing context..."
                  value={expNotes}
                  onChange={(e) => setExpNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsRecordExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW EXPENSE VOUCHER MODAL */}
      {selectedExpenseVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-bold text-foreground">Official Payment Voucher</h3>
              </div>
              <button
                onClick={() => setSelectedExpenseVoucher(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-canvas p-5 space-y-4 text-xs font-mono">
              <div className="flex items-start justify-between border-b border-border pb-3">
                <div>
                  <h4 className="font-bold text-foreground text-sm uppercase">{settings.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{settings.location}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground">Voucher Ref:</span>
                  <p className="font-bold text-foreground">
                    {selectedExpenseVoucher.receiptNumber || selectedExpenseVoucher.id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-[10px]">Expense Title:</span>
                  <p className="font-bold text-foreground">{selectedExpenseVoucher.title}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Category:</span>
                  <p className="font-bold text-foreground">{selectedExpenseVoucher.category}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Recipient / Payee:</span>
                  <p className="font-bold text-foreground">
                    {selectedExpenseVoucher.recipientName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Payment Date & Mode:</span>
                  <p className="font-bold text-foreground">
                    {selectedExpenseVoucher.date} • {selectedExpenseVoucher.paymentMethod}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface p-3 flex items-center justify-between">
                <span className="font-bold text-foreground">Total Disbursed:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 text-base">
                  {settings.currencySymbol}
                  {selectedExpenseVoucher.amount.toLocaleString("en-IN")}
                </span>
              </div>

              {selectedExpenseVoucher.notes && (
                <div className="text-muted-foreground text-[11px]">
                  <strong>Notes:</strong> {selectedExpenseVoucher.notes}
                </div>
              )}

              <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
                <span>Authorized by: {selectedExpenseVoucher.recordedBy}</span>
                <span>Status: {selectedExpenseVoucher.status}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition text-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Voucher</span>
              </button>
              <button
                onClick={() => setSelectedExpenseVoucher(null)}
                className="px-4 py-2 rounded-xl bg-brand text-brand-foreground text-xs font-bold hover:brightness-110 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
