import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  KeyRound,
  User,
  Calendar,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Search,
  Filter,
  Check,
  X,
  History,
  ShieldCheck,
  Sparkles,
  BookmarkCheck,
  UserMinus,
  RefreshCcw,
} from "lucide-react";
import { useGymStore, Locker, LockerStatus } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/lockers")({
  component: LockerRegistryPage,
});

function LockerRegistryPage() {
  const {
    lockers,
    members,
    staff,
    settings,
    assignLocker,
    reserveLocker,
    releaseLocker,
    markLockerMaintenance,
    completeLockerRepair,
  } = useGymStore();

  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [search, setSearch] = useState("");

  // Modals & Panels State
  const [assignModalLocker, setAssignModalLocker] = useState<Locker | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [durationDays, setDurationDays] = useState(30);

  const [reserveModalLocker, setReserveModalLocker] = useState<Locker | null>(null);
  const [reserveName, setReserveName] = useState("");
  const [reserveNote, setReserveNote] = useState("");

  const [maintenanceModalLocker, setMaintenanceModalLocker] = useState<Locker | null>(null);
  const [maintenanceIssue, setMaintenanceIssue] = useState("");
  const [maintenanceDate, setMaintenanceDate] = useState(() => new Date().toISOString().split("T")[0]);

  const [repairModalLocker, setRepairModalLocker] = useState<Locker | null>(null);
  const [repairNotes, setRepairNotes] = useState("Lock cylinder replaced and interior sanitized.");
  const [repairedBy, setRepairedBy] = useState(staff[0]?.name || "Duty Technician");

  const [historyDrawerLocker, setHistoryDrawerLocker] = useState<Locker | null>(null);

  // Status Metrics
  const totalLockers = lockers.length;
  const availableCount = lockers.filter((l) => l.status === "Available").length;
  const occupiedCount = lockers.filter((l) => l.status === "Occupied").length;
  const reservedCount = lockers.filter((l) => l.status === "Reserved").length;
  const maintenanceCount = lockers.filter((l) => l.status === "Under Maintenance").length;
  const expiredCount = lockers.filter((l) => l.status === "Expired").length;

  const filteredLockers = lockers.filter((l) => {
    if (selectedSection !== "All" && l.section !== selectedSection) return false;
    if (selectedStatus !== "All" && l.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const numMatch = l.number.toString().includes(q);
      const nameMatch = l.assignedMemberName?.toLowerCase().includes(q);
      const reservedMatch = l.reservedFor?.toLowerCase().includes(q);
      const issueMatch = l.maintenanceIssue?.toLowerCase().includes(q);
      return numMatch || nameMatch || reservedMatch || issueMatch;
    }
    return true;
  });

  // Handlers
  const handleOpenAssign = (locker: Locker) => {
    setAssignModalLocker(locker);
    setSelectedMemberId(members[0]?.id || "");
    setDurationDays(30);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalLocker || !selectedMemberId) return;

    const targetMember = members.find((m) => m.id === selectedMemberId);
    if (!targetMember) return;

    assignLocker(assignModalLocker.number, targetMember.id, targetMember.name, durationDays);
    toast.success(`Locker #${assignModalLocker.number} assigned to ${targetMember.name}!`);
    setAssignModalLocker(null);
  };

  const handleOpenReserve = (locker: Locker) => {
    setReserveModalLocker(locker);
    setReserveName("");
    setReserveNote("");
  };

  const handleConfirmReserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveModalLocker || !reserveName.trim()) return;

    reserveLocker(reserveModalLocker.number, reserveName.trim(), reserveNote.trim());
    toast.success(`Locker #${reserveModalLocker.number} reserved for ${reserveName}!`);
    setReserveModalLocker(null);
  };

  const handleOpenMaintenance = (locker: Locker) => {
    setMaintenanceModalLocker(locker);
    setMaintenanceIssue("");
    setMaintenanceDate(new Date().toISOString().split("T")[0]);
  };

  const handleConfirmMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceModalLocker || !maintenanceIssue.trim()) return;

    markLockerMaintenance(maintenanceModalLocker.number, maintenanceIssue.trim(), maintenanceDate);
    toast.warning(`Locker #${maintenanceModalLocker.number} marked Under Maintenance.`);
    setMaintenanceModalLocker(null);
  };

  const handleOpenRepair = (locker: Locker) => {
    setRepairModalLocker(locker);
    setRepairNotes("Mechanism repaired and tested. Locker sanitized.");
    setRepairedBy(staff[0]?.name || "Duty Technician");
  };

  const handleConfirmRepair = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repairModalLocker) return;

    completeLockerRepair(repairModalLocker.number, repairNotes.trim(), repairedBy.trim());
    toast.success(`Locker #${repairModalLocker.number} repaired & restored to Available status!`);
    setRepairModalLocker(null);
  };

  const handleRelease = (locker: Locker) => {
    if (window.confirm(`Release Locker #${locker.number} and make it available?`)) {
      releaseLocker(locker.number);
      toast.info(`Locker #${locker.number} is now Available.`);
    }
  };

  const getStatusBadge = (status: LockerStatus) => {
    switch (status) {
      case "Available":
        return "bg-emerald-soft text-accent-foreground border-emerald/30";
      case "Occupied":
        return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Reserved":
        return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Under Maintenance":
        return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Expired":
        return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Locker Registry & Maintenance</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {totalLockers} Total Lockers
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Complete locker allocation lifecycle, member assignments, reservation holds, and maintenance repair workflows.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1">
          {["All", "Men's Locker Room", "Women's Locker Room", "Executive VIP"].map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedSection === sec
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {sec.replace(" Locker Room", "")}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div
          onClick={() => setSelectedStatus(selectedStatus === "Available" ? "All" : "Available")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatus === "Available"
              ? "border-emerald bg-emerald-soft/10 ring-2 ring-emerald"
              : "border-border bg-surface hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Available</span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{availableCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Ready to assign</p>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "Occupied" ? "All" : "Occupied")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatus === "Occupied"
              ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500"
              : "border-border bg-surface hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Occupied</span>
            <User className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{occupiedCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Assigned to members</p>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "Reserved" ? "All" : "Reserved")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatus === "Reserved"
              ? "border-purple-500 bg-purple-500/10 ring-2 ring-purple-500"
              : "border-border bg-surface hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Reserved</span>
            <BookmarkCheck className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{reservedCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">On VIP / Guest hold</p>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "Under Maintenance" ? "All" : "Under Maintenance")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatus === "Under Maintenance"
              ? "border-amber-500 bg-amber-500/10 ring-2 ring-amber-500"
              : "border-border bg-surface hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Maintenance</span>
            <Wrench className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{maintenanceCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Repairs in progress</p>
        </div>

        <div
          onClick={() => setSelectedStatus(selectedStatus === "Expired" ? "All" : "Expired")}
          className={`cursor-pointer rounded-2xl border p-4 transition ${
            selectedStatus === "Expired"
              ? "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500"
              : "border-border bg-surface hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Expired</span>
            <Clock className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-foreground mt-2">{expiredCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Term overdue</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by locker #, member name, or issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-canvas text-xs outline-none focus:border-emerald"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedStatus !== "All" && (
            <button
              onClick={() => setSelectedStatus("All")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1"
            >
              <X className="h-3 w-3" /> Clear Status Filter
            </button>
          )}
          <span className="text-xs text-muted-foreground font-mono">
            Showing {filteredLockers.length} of {totalLockers}
          </span>
        </div>
      </div>

      {/* Locker Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredLockers.map((l) => (
          <div
            key={l.id}
            className={`rounded-2xl border bg-surface p-5 space-y-3.5 shadow-2xs transition hover:border-foreground/40 flex flex-col justify-between ${
              l.status === "Under Maintenance"
                ? "border-amber-500/40 bg-amber-500/5"
                : l.status === "Occupied"
                ? "border-blue-500/30"
                : l.status === "Reserved"
                ? "border-purple-500/30"
                : "border-border"
            }`}
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-canvas border border-border text-foreground font-bold font-mono text-base">
                    #{l.number}
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">
                      Locker #{l.number}
                    </h3>
                    <p className="text-[10px] text-muted-foreground">{l.section}</p>
                  </div>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${getStatusBadge(l.status)}`}>
                  {l.status}
                </span>
              </div>

              {/* Card Body Details */}
              <div className="mt-3.5 space-y-1.5 text-xs">
                {l.status === "Occupied" && (
                  <div className="rounded-xl border border-border bg-canvas p-2.5 space-y-1">
                    <p className="text-muted-foreground text-[10px] font-medium">Assigned Member</p>
                    <p className="font-bold text-foreground truncate">{l.assignedMemberName}</p>
                    {l.expiresOn && (
                      <p className="text-[10px] font-mono text-muted-foreground">Expires: {l.expiresOn}</p>
                    )}
                  </div>
                )}

                {l.status === "Reserved" && (
                  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-2.5 space-y-1">
                    <p className="text-purple-600 dark:text-purple-400 text-[10px] font-medium">Reserved Holder</p>
                    <p className="font-bold text-foreground truncate">{l.reservedFor}</p>
                  </div>
                )}

                {l.status === "Under Maintenance" && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-1">
                    <p className="text-amber-600 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1">
                      <Wrench className="h-3 w-3" /> Reported Issue
                    </p>
                    <p className="font-medium text-foreground text-[11px]">{l.maintenanceIssue || "General Inspection"}</p>
                    {l.maintenanceDate && (
                      <p className="text-[10px] font-mono text-muted-foreground">Reported on: {l.maintenanceDate}</p>
                    )}
                  </div>
                )}

                {l.status === "Available" && (
                  <div className="rounded-xl border border-dashed border-border bg-canvas p-2.5 text-center">
                    <p className="text-[11px] text-muted-foreground">Available for immediate assignment or hold.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card Action Buttons */}
            <div className="pt-3 border-t border-border flex items-center gap-1.5 flex-wrap">
              {l.status === "Available" && (
                <>
                  <button
                    onClick={() => handleOpenAssign(l)}
                    className="flex-1 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition text-center"
                  >
                    Assign Member
                  </button>
                  <button
                    onClick={() => handleOpenReserve(l)}
                    className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition"
                    title="Reserve for VIP/Hold"
                  >
                    Reserve
                  </button>
                  <button
                    onClick={() => handleOpenMaintenance(l)}
                    className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition"
                    title="Report Issue / Maintenance"
                  >
                    <Wrench className="h-4 w-4" />
                  </button>
                </>
              )}

              {l.status === "Occupied" && (
                <>
                  <button
                    onClick={() => handleRelease(l)}
                    className="flex-1 py-1.5 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition text-center"
                  >
                    Release Locker
                  </button>
                  <button
                    onClick={() => handleOpenMaintenance(l)}
                    className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 transition"
                    title="Report Maintenance Issue"
                  >
                    <Wrench className="h-4 w-4" />
                  </button>
                </>
              )}

              {l.status === "Reserved" && (
                <>
                  <button
                    onClick={() => handleOpenAssign(l)}
                    className="flex-1 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition text-center"
                  >
                    Activate Assignment
                  </button>
                  <button
                    onClick={() => handleRelease(l)}
                    className="px-2.5 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition"
                  >
                    Cancel Hold
                  </button>
                </>
              )}

              {l.status === "Under Maintenance" && (
                <button
                  onClick={() => handleOpenRepair(l)}
                  className="w-full py-2 rounded-xl bg-emerald text-white text-xs font-bold hover:bg-emerald/90 transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Mark as Repaired & Restore</span>
                </button>
              )}

              {/* History Button */}
              <button
                onClick={() => setHistoryDrawerLocker(l)}
                className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition ml-auto"
                title="View History & Repair Logs"
              >
                <History className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 1. Assign Locker Modal */}
      {assignModalLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background font-mono font-bold text-sm">
                  #{assignModalLocker.number}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Assign Locker #{assignModalLocker.number}</h3>
                  <p className="text-[11px] text-muted-foreground">{assignModalLocker.section}</p>
                </div>
              </div>
              <button onClick={() => setAssignModalLocker(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Select Member *</label>
                <select
                  required
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  <option value="" disabled>Choose a member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan} • {m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Allocation Duration (Days)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={365}
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs font-mono outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssignModalLocker(null)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Reserve Locker Modal */}
      {reserveModalLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500 text-white font-mono font-bold text-sm">
                  #{reserveModalLocker.number}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Reserve Locker #{reserveModalLocker.number}</h3>
                  <p className="text-[11px] text-muted-foreground">Place locker on VIP or prospective member hold</p>
                </div>
              </div>
              <button onClick={() => setReserveModalLocker(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReserve} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Reserved Holder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Guest or Prospect Lead"
                  value={reserveName}
                  onChange={(e) => setReserveName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Reservation Note</label>
                <textarea
                  rows={2}
                  placeholder="Reason or expected conversion date..."
                  value={reserveNote}
                  onChange={(e) => setReserveNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-2.5 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReserveModalLocker(null)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  Reserve Locker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Mark for Maintenance Modal */}
      {maintenanceModalLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-white font-mono font-bold text-sm">
                  #{maintenanceModalLocker.number}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Report Maintenance Issue</h3>
                  <p className="text-[11px] text-muted-foreground">Locker #{maintenanceModalLocker.number}</p>
                </div>
              </div>
              <button onClick={() => setMaintenanceModalLocker(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmMaintenance} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Issue / Defect Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Electronic lock key unresponsive, hinge loose, needs sanitization..."
                  value={maintenanceIssue}
                  onChange={(e) => setMaintenanceIssue(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-2.5 text-xs outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Date Reported</label>
                <input
                  type="date"
                  required
                  value={maintenanceDate}
                  onChange={(e) => setMaintenanceDate(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMaintenanceModalLocker(null)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 shadow-xs"
                >
                  Mark Under Maintenance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Complete Repair & Restore Workflow Modal */}
      {repairModalLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald text-white font-mono font-bold text-sm">
                  #{repairModalLocker.number}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Mark as Repaired & Restore Locker</h3>
                  <p className="text-[11px] text-emerald font-semibold">Will automatically return to "Available" status</p>
                </div>
              </div>
              <button onClick={() => setRepairModalLocker(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-foreground space-y-0.5">
              <p className="font-semibold text-amber-600 dark:text-amber-400">Original Reported Issue:</p>
              <p className="text-muted-foreground">{repairModalLocker.maintenanceIssue || "General Maintenance"}</p>
            </div>

            <form onSubmit={handleConfirmRepair} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Resolution & Repair Notes *</label>
                <textarea
                  required
                  rows={2}
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-2.5 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Repaired By Staff / Technician</label>
                <input
                  type="text"
                  required
                  value={repairedBy}
                  onChange={(e) => setRepairedBy(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setRepairModalLocker(null)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald text-white font-bold hover:bg-emerald/90 shadow-xs flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" />
                  <span>Confirm Repair & Make Available</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Locker History & Audit Log Drawer */}
      {historyDrawerLocker && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setHistoryDrawerLocker(null)}
        >
          <div
            className="w-full max-w-lg bg-surface h-full border-l border-border p-6 shadow-2xl space-y-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background font-mono font-bold text-base">
                  #{historyDrawerLocker.number}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Locker #{historyDrawerLocker.number} Audit Log</h3>
                  <p className="text-xs text-muted-foreground">{historyDrawerLocker.section} • Status: {historyDrawerLocker.status}</p>
                </div>
              </div>
              <button
                onClick={() => setHistoryDrawerLocker(null)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Repair History Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Wrench className="h-3.5 w-3.5 text-emerald" />
                <span>Maintenance & Repair History</span>
              </h4>

              {historyDrawerLocker.repairHistory.length > 0 ? (
                <div className="space-y-2">
                  {historyDrawerLocker.repairHistory.map((rep) => (
                    <div key={rep.id} className="p-3 rounded-xl border border-border bg-canvas text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{rep.issue}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{rep.repairedAt}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{rep.notes}</p>
                      <p className="text-[10px] text-emerald font-medium">Repaired by: {rep.repairedBy}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic py-2">No historical repair records logged.</p>
              )}
            </div>

            {/* General History Events */}
            <div className="space-y-3 pt-4 border-t border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <History className="h-3.5 w-3.5 text-blue-500" />
                <span>Operational Activity History</span>
              </h4>

              <div className="space-y-2">
                {historyDrawerLocker.history.map((h) => (
                  <div key={h.id} className="p-3 rounded-xl border border-border bg-canvas text-xs space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{h.action}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{h.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{h.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
