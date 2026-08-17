import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  KeyRound,
  Plus,
  UserCheck,
  UserX,
  ShieldCheck,
  Calendar,
  X,
  Search,
  CheckCircle2,
} from "lucide-react";
import { useGymStore, Locker } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/lockers")({
  component: LockerManagement,
});

function LockerManagement() {
  const {
    lockers,
    members,
    assignLocker,
    releaseLocker,
  } = useGymStore();

  const [selectedSection, setSelectedSection] = useState<string>("All");
  const [assigningLocker, setAssigningLocker] = useState<Locker | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || "");

  const availableCount = lockers.filter((l) => l.status === "Available").length;
  const occupiedCount = lockers.filter((l) => l.status === "Occupied").length;

  const filteredLockers = lockers.filter((l) => {
    if (selectedSection === "All") return true;
    return l.section === selectedSection;
  });

  const handleAssignConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningLocker || !selectedMemberId) return;

    const memberObj = members.find((m) => m.id === selectedMemberId);
    if (!memberObj) return;

    assignLocker(assigningLocker.number, memberObj.id, memberObj.name);
    toast.success(`Assigned Locker #${assigningLocker.number} to ${memberObj.name}!`);
    setAssigningLocker(null);
  };

  const handleRelease = (locker: Locker) => {
    releaseLocker(locker.number);
    toast.info(`Released Locker #${locker.number}. Key returned to front desk.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Locker & Key Registry</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {availableCount} Available Lockers
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Visual floor locker assignment, key security tracking, and rental validity management.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-emerald">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald"></span> Available ({availableCount})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Occupied ({occupiedCount})
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-500">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Maintenance
          </span>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(["All", "Men's Locker Room", "Women's Locker Room", "Executive VIP"] as const).map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition border ${
              selectedSection === sec
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Visual Locker Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredLockers.map((locker) => {
          const isOccupied = locker.status === "Occupied";
          const isMaintenance = locker.status === "Maintenance";

          return (
            <div
              key={locker.id}
              className={`rounded-2xl border p-4 flex flex-col justify-between transition relative shadow-2xs ${
                isMaintenance
                  ? "border-amber-500/40 bg-amber-500/5 opacity-80"
                  : isOccupied
                  ? "border-blue-500/30 bg-surface"
                  : "border-emerald/40 bg-emerald-soft/10 hover:border-emerald"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold text-foreground">
                    #{locker.number}
                  </span>
                  <KeyRound
                    className={`h-4 w-4 ${
                      isMaintenance ? "text-amber-500" : isOccupied ? "text-blue-500" : "text-emerald"
                    }`}
                  />
                </div>

                <div className="mt-2 text-xs">
                  {isOccupied ? (
                    <div className="space-y-0.5">
                      <p className="font-bold text-foreground truncate">{locker.assignedMemberName}</p>
                      <p className="text-[10px] text-muted-foreground">Expires: {locker.expiresOn}</p>
                    </div>
                  ) : isMaintenance ? (
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      Under Repair
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald font-semibold">Available Key</p>
                  )}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-border/60">
                {isOccupied ? (
                  <button
                    onClick={() => handleRelease(locker)}
                    className="w-full py-1 rounded-lg border border-border bg-canvas text-[11px] font-medium text-muted-foreground hover:text-danger hover:bg-muted transition flex items-center justify-center gap-1"
                  >
                    <UserX className="h-3 w-3" /> Release
                  </button>
                ) : !isMaintenance ? (
                  <button
                    onClick={() => {
                      setAssigningLocker(locker);
                      setSelectedMemberId(members[0]?.id || "");
                    }}
                    className="w-full py-1 rounded-lg bg-foreground text-background text-[11px] font-semibold hover:opacity-90 transition flex items-center justify-center gap-1"
                  >
                    <UserCheck className="h-3 w-3" /> Assign
                  </button>
                ) : (
                  <span className="block text-center text-[10px] text-muted-foreground">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Locker Modal */}
      {assigningLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">Assign Locker #{assigningLocker.number}</h3>
              <button onClick={() => setAssigningLocker(null)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAssignConfirm} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Select Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl border border-border bg-canvas text-muted-foreground text-[11px]">
                <p>Location: <b>{assigningLocker.section}</b></p>
                <p className="mt-0.5">Rental validity: 30 days automatically added to member profile.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssigningLocker(null)}
                  className="px-4 py-2 rounded-xl border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  Assign Locker Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
