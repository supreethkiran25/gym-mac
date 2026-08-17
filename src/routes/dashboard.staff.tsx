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
} from "lucide-react";
import { useGymStore, StaffMember } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/staff")({
  component: StaffManager,
});

function StaffManager() {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    payStaffSalary,
    toggleStaffStatus,
    approveLeaveRequest,
    settings,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Head Coach" | "Personal Trainer" | "Nutritionist" | "Front Desk Manager" | "Floor Trainer">("Personal Trainer");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState(45000);
  const [shift, setShift] = useState("Morning 6:00 AM - 2:00 PM");
  const [status, setStatus] = useState<"On Floor" | "Off Duty" | "On Leave">("On Floor");

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
      toast.success(`Updated staff details for ${name}!`);
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

  const handleDisburseSalary = (s: StaffMember) => {
    payStaffSalary(s.id);
    toast.success(`Disbursed salary of ${settings.currencySymbol}${s.salary.toLocaleString("en-IN")} to ${s.name}!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Staff & Payroll Management</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {staff.filter((s) => s.status === "On Floor").length} On Floor Duty
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Manage trainers, front desk managers, shift schedules, 1-click salary disbursement, and leaves.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Staff Member</span>
        </button>
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
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs outline-none focus:border-emerald"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Head Coach", "Personal Trainer", "Nutritionist", "Front Desk Manager"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition border ${
                filterRole === r
                  ? "bg-foreground text-background border-foreground shadow-xs"
                  : "border-border bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-border bg-surface p-5 space-y-4 hover:border-foreground/40 transition shadow-2xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background font-bold text-xs">
                    {s.avatar || s.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{s.name}</h3>
                    <p className="text-xs font-medium text-emerald">{s.role}</p>
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
                      ? "bg-emerald-soft text-accent-foreground border-emerald/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {s.status}
                </button>
              </div>

              {/* Staff Details */}
              <div className="rounded-xl border border-border bg-canvas/80 p-3 text-xs space-y-1.5">
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
                    <DollarSign className="h-3.5 w-3.5 text-muted-foreground" /> Salary:
                  </span>
                  <span className="font-bold text-foreground font-mono">
                    {settings.currencySymbol}{s.salary.toLocaleString("en-IN")} / mo
                  </span>
                </div>
                {s.assignedClientsCount > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground pt-1 border-t border-border/40">
                    <span>Active PT Clients:</span>
                    <span className="font-semibold text-purple-600 dark:text-purple-400">
                      {s.assignedClientsCount} Clients
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  title="Edit Staff Member"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteStaff(s.id, s.name)}
                  className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                  title="Delete Staff Member"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                onClick={() => handleDisburseSalary(s)}
                className="inline-flex items-center gap-1 text-xs font-semibold rounded-xl bg-foreground text-background px-3 py-1.5 hover:opacity-90 transition"
              >
                <DollarSign className="h-3.5 w-3.5 text-emerald" />
                <span>Pay Salary</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Staff Modal */}
      {(isAddModalOpen || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">
                {editingStaff ? `Edit ${editingStaff.name}` : "Add Staff Member"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStaff(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Role / Title</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Head Coach">Head Coach</option>
                    <option value="Personal Trainer">Personal Trainer</option>
                    <option value="Nutritionist">Nutritionist</option>
                    <option value="Front Desk Manager">Front Desk Manager</option>
                    <option value="Floor Trainer">Floor Trainer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="On Floor">On Floor</option>
                    <option value="Off Duty">Off Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="45000"
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Shift Hours</label>
                <input
                  type="text"
                  placeholder="e.g. Morning 6:00 AM - 2:00 PM"
                  value={shift}
                  onChange={(e) => setShift(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="vikram@gymflow.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStaff(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  {editingStaff ? "Save Changes" : "Add Staff"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
