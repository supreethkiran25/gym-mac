import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Plus,
  Phone,
  Mail,
  DollarSign,
  Clock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  Search,
  UserCheck,
  Award,
  Briefcase,
  Printer,
  TrendingDown,
  Receipt,
  FileCheck,
} from "lucide-react";
import { useGymStore, StaffMember } from "../lib/gym-store";
import { toast } from "sonner";

import { RoleGuard } from "../components/dashboard/RoleGuard";

export const Route = createFileRoute("/dashboard/staff")({
  component: StaffManagerRoute,
  head: () => ({
    meta: [{ title: "Staff & Payroll Management | PEAKREP Gym OS" }],
  }),
});

function StaffManagerRoute() {
  return (
    <RoleGuard requiredRole="admin" moduleName="Staff & Payroll Management">
      <StaffManager />
    </RoleGuard>
  );
}

function StaffManager() {
  const {
    staff,
    expenses,
    addStaff,
    updateStaff,
    deleteStaff,
    payStaffSalary,
    toggleStaffStatus,
    settings,
    currentUser,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Salary Disbursement Modal State
  const [salaryTargetStaff, setSalaryTargetStaff] = useState<StaffMember | null>(null);
  const [salaryMethod, setSalaryMethod] = useState<"UPI" | "Bank Transfer" | "Cash" | "Cheque">("Bank Transfer");
  const [salaryBonus, setSalaryBonus] = useState("0");
  const [salaryDeduction, setSalaryDeduction] = useState("0");
  const [salaryNotes, setSalaryNotes] = useState("");

  // View Salary Slip Modal State
  const [viewSalarySlip, setViewSalarySlip] = useState<{
    staff: StaffMember;
    amount: number;
    date: string;
    method: string;
    receiptNo: string;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Head Coach" | "Personal Trainer" | "Nutritionist" | "Front Desk Manager" | "Floor Trainer">("Personal Trainer");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState(45000);
  const [shift, setShift] = useState("Morning 6:00 AM - 2:00 PM");
  const [status, setStatus] = useState<"On Floor" | "Off Duty" | "On Leave">("On Floor");

  // Payroll Analytics
  const totalMonthlyLiability = staff.reduce((sum, s) => sum + s.salary, 0);
  const currentMonthStr = new Date().toISOString().slice(0, 7); // "2026-05"
  
  // Paid staff in current month
  const disbursedThisMonth = expenses
    .filter((e) => e.category === "Staff Salary" && e.status === "Paid" && e.date.startsWith(currentMonthStr))
    .reduce((sum, e) => sum + e.amount, 0);

  const remainingPayroll = Math.max(0, totalMonthlyLiability - disbursedThisMonth);

  const filteredStaff = staff.filter((s) => {
    const matches =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search);
    if (!matches) return false;
    if (filterRole === "All") return true;
    return s.role === filterRole;
  });

  const handleOpenAdd = () => {
    setName("");
    setRole("Personal Trainer");
    setPhone("+91 ");
    setEmail("");
    setSalary(45000);
    setShift("Morning 6:00 AM - 2:00 PM");
    setStatus("On Floor");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setPhone(s.phone);
    setEmail(s.email);
    setSalary(s.salary);
    setShift(s.shift);
    setStatus(s.status);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        salary: Number(salary),
        shift: shift.trim(),
        status,
      });
      toast.success(`Updated staff profile for ${name}!`);
      setEditingStaff(null);
    } else {
      addStaff({
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        salary: Number(salary),
        shift: shift.trim(),
        status,
        avatar: name.slice(0, 2).toUpperCase(),
      });
      toast.success(`Added new staff member: ${name}!`);
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteStaff = (id: string, staffName: string) => {
    if (window.confirm(`Are you sure you want to delete "${staffName}" from staff records?`)) {
      deleteStaff(id);
      toast.success(`Removed ${staffName} from staff records.`);
    }
  };

  const handleOpenPayModal = (s: StaffMember) => {
    setSalaryTargetStaff(s);
    setSalaryMethod("Bank Transfer");
    setSalaryBonus("0");
    setSalaryDeduction("0");
    setSalaryNotes("");
  };

  const handleConfirmDisburseSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salaryTargetStaff) return;

    const bonusNum = parseFloat(salaryBonus) || 0;
    const deductionNum = parseFloat(salaryDeduction) || 0;
    const netSalary = Math.max(0, salaryTargetStaff.salary + bonusNum - deductionNum);

    payStaffSalary(
      salaryTargetStaff.id,
      salaryMethod,
      salaryNotes.trim() || `Monthly Salary + Bonus: ₹${bonusNum} - Deductions: ₹${deductionNum}`
    );

    toast.success(
      `Disbursed salary of ${settings.currencySymbol}${netSalary.toLocaleString("en-IN")} to ${salaryTargetStaff.name}! Recorded in Financial Outflow Ledger.`
    );

    const todayStr = new Date().toISOString().split("T")[0];
    setViewSalarySlip({
      staff: salaryTargetStaff,
      amount: netSalary,
      date: todayStr,
      method: salaryMethod,
      receiptNo: `PAY-${Date.now().toString().slice(-6)}`,
    });

    setSalaryTargetStaff(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Staff & Payroll Management</h1>
            <span className="rounded-full bg-emerald-500/20 text-emerald px-2.5 py-0.5 text-xs font-bold font-mono">
              {staff.filter((s) => s.status === "On Floor").length} On Floor Duty
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage trainers, front desk managers, shift rosters, 1-click salary disbursements, and automatic expense ledger logging.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-bold hover:brightness-110 transition shadow-md shadow-brand/20 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Payroll KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Monthly Liability */}
        <div className="rounded-3xl border border-border bg-surface p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Monthly Payroll Liability</span>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{totalMonthlyLiability.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">Across {staff.length} registered staff members</p>
        </div>

        {/* Disbursed This Month */}
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald">Disbursed This Month</span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{disbursedThisMonth.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">Logged as Operational Expense Outflow</p>
        </div>

        {/* Remaining Payroll Balance */}
        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Remaining Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {settings.currencySymbol}{remainingPayroll.toLocaleString("en-IN")}
          </p>
          <p className="text-[11px] text-muted-foreground">Awaiting payroll clearance</p>
        </div>

        {/* Active Duty Staff */}
        <div className="rounded-3xl border border-border bg-surface p-5 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Gym Staff Active</span>
            <UserCheck className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {staff.filter((s) => s.status === "On Floor").length} / {staff.length}
          </p>
          <p className="text-[11px] text-muted-foreground">Available on gym floor right now</p>
        </div>
      </div>

      {/* Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search staff by name, role or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs outline-hidden focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Head Coach", "Personal Trainer", "Nutritionist", "Front Desk Manager", "Floor Trainer"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border ${
                filterRole === r
                  ? "bg-brand text-brand-foreground border-brand shadow-xs"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid */}
      {filteredStaff.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">No Staff Members Registered</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Add head coaches, personal trainers, and front desk managers to manage floor duty and payroll.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-bold hover:brightness-110 transition shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add First Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((s) => {
            const hasPaidThisMonth = s.lastPaidDate && s.lastPaidDate.startsWith(currentMonthStr);

            return (
              <div
                key={s.id}
                className="rounded-3xl border border-border bg-surface p-5 space-y-4 hover:border-brand/40 transition shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-brand-foreground font-bold text-xs shadow-xs">
                        {s.avatar || s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                        <p className="text-xs font-medium text-brand">{s.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        toggleStaffStatus(
                          s.id,
                          s.status === "On Floor" ? "Off Duty" : "On Floor"
                        )
                      }
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border transition ${
                        s.status === "On Floor"
                          ? "bg-emerald-500/20 text-emerald border-emerald-500/30"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {s.status}
                    </button>
                  </div>

                  {/* Staff Details */}
                  <div className="rounded-2xl border border-border bg-canvas/80 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Shift:
                      </span>
                      <span className="font-medium text-foreground truncate max-w-[170px]">{s.shift}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Contact:
                      </span>
                      <span className="font-medium text-foreground font-mono">{s.phone}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Monthly Salary:
                      </span>
                      <span className="font-bold text-foreground font-mono">
                        {settings.currencySymbol}{s.salary.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Payroll Status Badge */}
                    <div className="pt-2 border-t border-border flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">Current Month:</span>
                      {hasPaidThisMonth ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald bg-emerald-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Paid on {s.lastPaidDate}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                          <Clock className="h-3 w-3" /> Unpaid
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      title="Edit Staff Member"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteStaff(s.id, s.name)}
                      className="p-1.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition"
                      title="Delete Staff Member"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleOpenPayModal(s)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold rounded-xl bg-brand text-brand-foreground px-3.5 py-1.5 shadow-xs hover:brightness-110 active:scale-[0.98] transition"
                  >
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{hasPaidThisMonth ? "Pay Again / Bonus" : "Pay Salary"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DISBURSE SALARY MODAL */}
      {salaryTargetStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-brand" />
                <h3 className="text-sm font-bold text-foreground">Disburse Staff Salary</h3>
              </div>
              <button
                onClick={() => setSalaryTargetStaff(null)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDisburseSalary} className="space-y-4 text-xs">
              <div className="rounded-2xl border border-border bg-surface p-3.5 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground text-sm">{salaryTargetStaff.name}</span>
                  <span className="text-brand font-semibold">{salaryTargetStaff.role}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Monthly Contract:</span>
                  <span className="font-mono font-bold text-foreground">
                    {settings.currencySymbol}{salaryTargetStaff.salary.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Performance Bonus ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={salaryBonus}
                    onChange={(e) => setSalaryBonus(e.target.value)}
                    min="0"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Leave Deductions ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    value={salaryDeduction}
                    onChange={(e) => setSalaryDeduction(e.target.value)}
                    min="0"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Payment Method</label>
                <select
                  value={salaryMethod}
                  onChange={(e) => setSalaryMethod(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-semibold outline-hidden focus:border-brand"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cash">Cash Disbursement</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Notes / Voucher Reference</label>
                <input
                  type="text"
                  placeholder="e.g. May 2026 Salary + PT Incentive"
                  value={salaryNotes}
                  onChange={(e) => setSalaryNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2"
                />
              </div>

              {/* Net Payout Summary */}
              <div className="rounded-2xl border border-brand/30 bg-brand-soft/20 p-3.5 flex items-center justify-between">
                <span className="font-bold text-brand">Net Payout Amount:</span>
                <span className="text-lg font-black font-mono text-foreground">
                  {settings.currencySymbol}
                  {(
                    Math.max(
                      0,
                      salaryTargetStaff.salary + (parseFloat(salaryBonus) || 0) - (parseFloat(salaryDeduction) || 0)
                    )
                  ).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setSalaryTargetStaff(null)}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand text-brand-foreground font-bold shadow-md shadow-brand/20 hover:brightness-110 transition"
                >
                  Confirm & Disburse Salary
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SALARY PAYMENT VOUCHER / SLIP MODAL */}
      {viewSalarySlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald" />
                <h3 className="text-sm font-bold text-foreground">Staff Salary Disbursement Slip</h3>
              </div>
              <button
                onClick={() => setViewSalarySlip(null)}
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
                  <span className="text-[10px] text-muted-foreground">Salary Slip #:</span>
                  <p className="font-bold text-foreground">{viewSalarySlip.receiptNo}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground text-[10px]">Staff Name:</span>
                  <p className="font-bold text-foreground">{viewSalarySlip.staff.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Role / Designation:</span>
                  <p className="font-bold text-foreground">{viewSalarySlip.staff.role}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Payment Date:</span>
                  <p className="font-bold text-foreground">{viewSalarySlip.date}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Mode of Payment:</span>
                  <p className="font-bold text-foreground">{viewSalarySlip.method}</p>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-center justify-between">
                <span className="font-bold text-emerald">Total Net Salary Paid:</span>
                <span className="font-black text-foreground text-lg">
                  {settings.currencySymbol}{viewSalarySlip.amount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="text-[10px] text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
                <span>Disbursed by: {currentUser.name} (Admin)</span>
                <span className="text-emerald font-bold">STATUS: CLEARED</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition text-xs font-semibold"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Salary Slip</span>
              </button>
              <button
                onClick={() => setViewSalarySlip(null)}
                className="px-4 py-2 rounded-xl bg-brand text-brand-foreground text-xs font-bold hover:brightness-110 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {(isAddModalOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingStaff ? `Edit ${editingStaff.name}` : "Add Staff Member"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStaff(null);
                }}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground font-medium outline-hidden focus:border-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Role / Designation</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-foreground outline-hidden focus:border-brand"
                  >
                    <option value="Head Coach">Head Coach</option>
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Nutritionist">Nutritionist</option>
                    <option value="Front Desk Manager">Front Desk Manager</option>
                    <option value="Floor Trainer">Floor Trainer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Monthly Salary ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    required
                    min="0"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono font-bold text-foreground outline-hidden focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="marcus@gym.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Assigned Shift Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Morning 06:00 AM – 02:30 PM"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand text-brand-foreground font-bold shadow-md shadow-brand/20 hover:brightness-110 transition"
                >
                  {editingStaff ? "Update Profile" : "Save Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
