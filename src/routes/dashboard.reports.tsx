import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useGymStore } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reports")({
  component: ReportsPage,
  head: () => ({
    meta: [{ title: "Executive Reports Center | PEAKREP Gym OS" }],
  }),
});

function ReportsPage() {
  const { members, payments, staff, settings, currentUser, systemLogs } = useGymStore();
  const [reportType, setReportType] = useState<"financial" | "members" | "attendance" | "staff">("financial");
  const [dateRange, setDateRange] = useState("this_month");

  const isAdmin = currentUser.role === "admin";

  // Financial calculations
  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalDues = members.reduce((sum, m) => sum + m.due, 0);
  const activeCount = members.filter((m) => m.status === "Active" || m.status === "Expiring").length;

  const handleExportCSV = () => {
    let csvContent = "";
    let filename = "";

    if (reportType === "financial") {
      if (!isAdmin) {
        toast.error("Financial report exports are restricted to Gym Owner (Admin) accounts.");
        return;
      }
      csvContent = "InvoiceNumber,Date,Member,Category,Method,Amount,Status\n" +
        payments.map((p) => `"${p.invoiceNumber}","${p.date}","${p.member}","${p.category}","${p.method}",${p.amount},"${p.status}"`).join("\n");
      filename = `financial_report_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (reportType === "members") {
      csvContent = "ID,Name,Phone,Email,Plan,PlanPrice,Collected,Due,JoinDate,Expiry,Status\n" +
        members.map((m) => `"${m.id}","${m.name}","${m.phone}","${m.email}","${m.plan}",${m.planPrice},${m.collectedAmount},${m.due},"${m.joinDate}","${m.expiry}","${m.status}"`).join("\n");
      filename = `member_directory_report_${new Date().toISOString().split("T")[0]}.csv`;
    } else if (reportType === "attendance") {
      csvContent = "ID,Timestamp,Actor,Action,Details\n" +
        systemLogs.filter((l) => l.category === "Attendance").map((l) => `"${l.id}","${l.timestamp}","${l.userName}","${l.action}","${l.details}"`).join("\n");
      filename = `attendance_log_report_${new Date().toISOString().split("T")[0]}.csv`;
    } else {
      csvContent = "ID,Name,Role,Phone,Salary,Shift,Status\n" +
        staff.map((s) => `"${s.id}","${s.name}","${s.role}","${s.phone}",${s.salary},"${s.shift}","${s.status}"`).join("\n");
      filename = `staff_payroll_report_${new Date().toISOString().split("T")[0]}.csv`;
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} successfully!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Audit & Business Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Reports & Analytics Export
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Generate financial balance sheets, member census logs, attendance logs, and staff payroll reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition shadow-xs"
          >
            <Printer className="h-4 w-4" />
            <span>Print View</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-foreground text-background px-4 py-2.5 text-xs font-bold transition hover:opacity-90 shadow-md"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex flex-wrap gap-2 rounded-2xl bg-surface border border-border p-1.5 text-xs font-semibold">
        <button
          onClick={() => setReportType("financial")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            reportType === "financial" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Financial & Collections</span>
          {!isAdmin && <Lock className="h-3 w-3 text-rose-500" />}
        </button>
        <button
          onClick={() => setReportType("members")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            reportType === "members" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Member Census & Plans</span>
        </button>
        <button
          onClick={() => setReportType("attendance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            reportType === "attendance" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Floor Attendance Roster</span>
        </button>
        <button
          onClick={() => setReportType("staff")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
            reportType === "staff" ? "bg-foreground text-background shadow-xs font-bold" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff & Payroll Records</span>
          {!isAdmin && <Lock className="h-3 w-3 text-rose-500" />}
        </button>
      </div>

      {/* Reception Restriction Alert on Financials */}
      {!isAdmin && (reportType === "financial" || reportType === "staff") && (
        <div className="p-4 rounded-3xl border border-rose-500/30 bg-rose-950/15 text-foreground space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
            <Lock className="h-4 w-4" />
            <span>Restricted to Admin (Gym Owner) Role</span>
          </div>
          <p className="text-muted-foreground">
            Front Desk (Reception) accounts cannot export detailed financial balance sheets or staff payroll data.
            Please switch to Admin view using the top badge switcher to preview these reports.
          </p>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-border bg-surface p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Total Revenue Collected</span>
          <div className="text-2xl font-bold font-mono text-foreground">
            {isAdmin ? `${settings.currencySymbol}${totalCollected.toLocaleString("en-IN")}` : "••••••"}
          </div>
          <p className="text-[11px] text-muted-foreground">{payments.length} successful transactions</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Outstanding Pending Dues</span>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {settings.currencySymbol}
            {totalDues.toLocaleString("en-IN")}
          </div>
          <p className="text-[11px] text-muted-foreground">From installment subscriptions</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Active Enrolled Members</span>
          <div className="text-2xl font-bold font-mono text-emerald">{activeCount}</div>
          <p className="text-[11px] text-muted-foreground">Eligible for gym floor access</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 space-y-1">
          <span className="text-xs text-muted-foreground">Total Staff Roster</span>
          <div className="text-2xl font-bold font-mono text-foreground">{staff.length}</div>
          <p className="text-[11px] text-muted-foreground">Coaches, trainers & managers</p>
        </div>
      </div>

      {/* Report Table Display */}
      <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
              {reportType === "financial"
                ? "Financial Ledger Breakdown"
                : reportType === "members"
                ? "Member Roster & Subscription Data"
                : reportType === "attendance"
                ? "Gate Attendance Log"
                : "Staff Payroll & Attendance"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live database records as of {new Date().toLocaleDateString("en-IN")}
            </p>
          </div>
        </div>

        {reportType === "financial" && isAdmin && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-canvas text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Member</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="p-3 font-mono font-bold">{p.invoiceNumber}</td>
                    <td className="p-3 font-mono">{p.date}</td>
                    <td className="p-3 font-bold text-foreground">{p.member}</td>
                    <td className="p-3">{p.category}</td>
                    <td className="p-3">{p.method}</td>
                    <td className="p-3 font-mono font-bold text-foreground">
                      {settings.currencySymbol}
                      {p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === "Paid"
                            ? "bg-emerald-500/20 text-emerald"
                            : p.status === "Refunded"
                            ? "bg-rose-500/20 text-rose-500"
                            : "bg-amber-500/20 text-amber-500"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "members" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-canvas text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Member</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Plan Fee</th>
                  <th className="p-3">Collected</th>
                  <th className="p-3">Due</th>
                  <th className="p-3">Expiry</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/40">
                    <td className="p-3 font-bold text-foreground">{m.name}</td>
                    <td className="p-3 font-mono text-muted-foreground">{m.phone}</td>
                    <td className="p-3">{m.plan}</td>
                    <td className="p-3 font-mono">
                      {settings.currencySymbol}
                      {m.planPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-mono text-emerald">
                      {settings.currencySymbol}
                      {m.collectedAmount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-mono text-amber-500">
                      {settings.currencySymbol}
                      {m.due.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3 font-mono">{m.expiry}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          m.status === "Active"
                            ? "bg-emerald-500/20 text-emerald"
                            : m.status === "Expiring"
                            ? "bg-amber-500/20 text-amber-500"
                            : m.status === "Frozen"
                            ? "bg-blue-500/20 text-blue-500"
                            : "bg-rose-500/20 text-rose-500"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "attendance" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-canvas text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Operator</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {systemLogs
                  .filter((l) => l.category === "Attendance")
                  .map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="p-3 font-mono">{l.timestamp}</td>
                      <td className="p-3 font-semibold text-foreground">{l.userName}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald font-bold text-[10px]">
                          {l.action}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{l.details}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === "staff" && isAdmin && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-canvas text-[10px] uppercase text-muted-foreground">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Monthly Salary</th>
                  <th className="p-3">Shift</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/40">
                    <td className="p-3 font-bold text-foreground">{s.name}</td>
                    <td className="p-3">{s.role}</td>
                    <td className="p-3 font-mono text-muted-foreground">{s.phone}</td>
                    <td className="p-3 font-mono font-bold">
                      {settings.currencySymbol}
                      {s.salary.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3">{s.shift}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald font-bold text-[10px]">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
