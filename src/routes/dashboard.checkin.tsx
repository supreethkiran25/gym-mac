import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  QrCode,
  Search,
  Users,
  Clock,
  LogOut,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  Lock,
  Unlock,
  X,
  FileCheck2,
  Activity,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { AccessDecision } from "../lib/access-engine";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/checkin")({
  component: CheckInPage,
  head: () => ({
    meta: [{ title: "Floor Check-In & Attendance | PEAKREP Gym OS" }],
  }),
});

interface LastDecisionState {
  type: "success" | "denied";
  member: Member;
  decision: string;
  reason: string;
  timestamp: string;
}

function CheckInPage() {
  const {
    members,
    checkOutMember,
    currentUser,
    evaluateAndCheckInMember,
    locations,
  } = useGymStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [simulatedScanActive, setSimulatedScanActive] = useState(false);
  const [lastDecision, setLastDecision] = useState<LastDecisionState | null>(null);
  const [overrideCandidate, setOverrideCandidate] = useState<{ member: Member; reason: string } | null>(null);
  const [overrideNote, setOverrideNote] = useState("");

  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const outsideMembers = members.filter((m) => !m.isCurrentlyInside);

  const gymCapacity = locations[0]?.capacity || 150;
  const occupancyPercent = Math.min(100, Math.round((insideMembers.length / gymCapacity) * 100));

  const filteredMembers = searchQuery
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  const handleQuickCheckIn = (m: Member, explicitOverride?: string) => {
    const res = evaluateAndCheckInMember(
      m.id,
      explicitOverride ? { isOverride: true, overrideReason: explicitOverride } : undefined,
    );
    if (res.allowed) {
      setLastDecision({
        type: "success",
        member: m,
        decision: res.code,
        reason: res.message,
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.success(explicitOverride ? `✓ Overridden Entry Granted: ${m.name}` : `✓ Access Authorized: ${m.name}`);
      setSearchQuery("");
      setOverrideCandidate(null);
      setOverrideNote("");
    } else {
      setLastDecision({
        type: "denied",
        member: m,
        decision: res.code,
        reason: res.message,
        timestamp: new Date().toLocaleTimeString(),
      });
      toast.error(`Access Denied: ${res.message}`);
      if (res.code !== "ALREADY_INSIDE" && res.code !== "NOT_FOUND") {
        setOverrideCandidate({ member: m, reason: res.message });
      }
    }
  };

  const handleSimulateScan = () => {
    setSimulatedScanActive(true);
    setTimeout(() => {
      setSimulatedScanActive(false);
      const candidates = outsideMembers.filter(
        (m) => m.status === "Active" || m.status === "Expiring" || m.status === "Partial",
      );
      if (candidates.length > 0) {
        const randomMember = candidates[Math.floor(Math.random() * candidates.length)];
        handleQuickCheckIn(randomMember);
      } else {
        toast.info("All eligible members are already inside.");
      }
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Floor Turnstile & Authoritative Gate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
            Turnstile & Check-In Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Real-time biometric/barcode access control, anti-passback enforcement, and audited staff overrides.
          </p>
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={simulatedScanActive}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 text-xs font-bold transition shadow-lg shrink-0 disabled:opacity-50 cursor-pointer"
        >
          <QrCode className={`h-4 w-4 ${simulatedScanActive ? "animate-spin" : ""}`} />
          <span>{simulatedScanActive ? "Scanning QR Token..." : "Simulate Turnstile QR Scan"}</span>
        </button>
      </div>

      {/* Decision Status Banner (Real-time Gate Telemetry) */}
      {lastDecision && (
        <div
          className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 ${
            lastDecision.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                lastDecision.type === "success" ? "bg-emerald-500/20" : "bg-rose-500/20"
              }`}
            >
              {lastDecision.type === "success" ? (
                <Unlock className="h-5 w-5 text-emerald-400" />
              ) : (
                <Lock className="h-5 w-5 text-rose-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">
                  {lastDecision.type === "success" ? "GATE OPENED" : "GATE LOCKED"}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-white/10 uppercase">
                  {lastDecision.decision}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {lastDecision.timestamp}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                <span className="font-semibold text-white">{lastDecision.member.name}</span> —{" "}
                {lastDecision.reason}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lastDecision.type === "denied" && (
              <button
                onClick={() => setOverrideCandidate({ member: lastDecision.member, reason: lastDecision.reason })}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold cursor-pointer transition"
              >
                Audited Override
              </button>
            )}
            <button
              onClick={() => setLastDecision(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hero Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Currently Inside Floor</span>
            <Users className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{insideMembers.length}</div>
          <p className="text-[11px] text-slate-500">Live active workouts on gym floor</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Floor Occupancy Load</span>
            <Activity className="h-4 w-4 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white font-mono">{occupancyPercent}%</span>
            <span className="text-xs text-slate-500">of {gymCapacity} cap</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                occupancyPercent > 85 ? "bg-rose-500" : occupancyPercent > 65 ? "bg-amber-500" : "bg-sky-500"
              }`}
              style={{ width: `${occupancyPercent}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Enrolled Directory</span>
            <UserCheck className="h-4 w-4 text-slate-300" />
          </div>
          <div className="text-3xl font-bold text-white font-mono">{members.length}</div>
          <p className="text-[11px] text-slate-500">Active & registered members</p>
        </div>

        <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Gate Operator Session</span>
            <ShieldCheck className="h-4 w-4 text-sky-400" />
          </div>
          <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
          <p className="text-[11px] text-slate-500">
            Role: <span className="font-semibold uppercase text-sky-400">{currentUser.role}</span>
          </p>
        </div>
      </div>

      {/* Main Check-In Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Search & 1-Click Check In (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-6 space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Fast Search & Floor Entry
              </h3>
              <span className="text-[10px] font-mono text-slate-500">
                Search by Name, Phone, or ID
              </span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type member name, phone (e.g. 9876), or member ID..."
                className="w-full rounded-2xl border border-white/10 bg-[#05080f] pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-hidden"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filtered Search Results */}
            {searchQuery && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <p className="text-xs font-semibold text-slate-400">
                  Found {filteredMembers.length} Matching Members:
                </p>
                {filteredMembers.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No member matches found.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/20 transition text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{m.name}</span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                m.status === "Active"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : m.status === "Expiring"
                                    ? "bg-amber-500/20 text-amber-400"
                                    : m.status === "Frozen"
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {m.status}
                            </span>
                            {m.due > 0 && (
                              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-400 text-[10px]">
                                Due ₹{m.due.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {m.phone} · {m.plan} (Exp: {m.expiry})
                          </p>
                        </div>

                        {m.isCurrentlyInside ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-bold text-[11px]">
                            Inside ({m.checkInTime || "Now"})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickCheckIn(m)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Check In</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Check-in from Outside Members Roster */}
            {!searchQuery && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-slate-400">
                  Recent Outside Members (1-Click Entry):
                </p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {outsideMembers.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-white/5 bg-white/[0.02] text-xs hover:border-white/15 transition"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>{m.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded-md text-[10px] ${
                              m.status === "Active"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : m.status === "Expiring"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-slate-500/20 text-slate-400"
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {m.phone} · {m.plan}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickCheckIn(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 font-semibold hover:bg-white/10 transition text-slate-200 cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-sky-400" />
                        <span>Check In</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Currently Inside Roster (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-white/5 bg-[#0a0d14]/70 p-6 space-y-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inside Gym Now ({insideMembers.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Live Attendance Roster
              </span>
            </div>

            {insideMembers.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Clock className="h-8 w-8 text-slate-600 mx-auto opacity-40" />
                <p className="text-xs font-semibold text-slate-400">No members currently inside</p>
                <p className="text-[11px] text-slate-500">
                  Use the search box or scan QR to check in members.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {insideMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-white/5 bg-white/[0.02] text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">{m.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>In at: {m.checkInTime || "Morning"}</span>
                        {m.assignedTrainer && <span>· Trainer: {m.assignedTrainer}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        checkOutMember(m.id);
                        toast.info(`Checked out ${m.name}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 font-semibold hover:bg-rose-500/20 transition text-xs cursor-pointer"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>Check Out</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Audited Manual Override Modal */}
      {overrideCandidate && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-bold text-sm text-white">Audited Access Override</h3>
              </div>
              <button
                onClick={() => setOverrideCandidate(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <div className="font-bold text-white text-sm">{overrideCandidate.member.name}</div>
                <p className="text-slate-400">
                  Plan: {overrideCandidate.member.plan} · Status:{" "}
                  <span className="text-amber-400 font-semibold">{overrideCandidate.member.status}</span>
                </p>
                <p className="text-rose-400 font-mono text-[11px]">
                  Access Rejection Reason: {overrideCandidate.reason}
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Mandatory Override Justification / Reason:
                </label>
                <textarea
                  rows={3}
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="e.g. Director authorized trial extension, offline payment promised today, card issue..."
                  className="w-full rounded-2xl border border-white/10 bg-[#05080f] p-3 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-hidden"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                <FileCheck2 className="inline h-3.5 w-3.5 mr-1" />
                This override will be logged in the immutable attendance audit trail with operator{" "}
                <span className="font-semibold text-white">{currentUser.name}</span>.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOverrideCandidate(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-slate-300 text-xs font-semibold hover:bg-white/5 cursor-pointer"
              >
                Cancel Rejection
              </button>
              <button
                type="button"
                disabled={!overrideNote.trim()}
                onClick={() => handleQuickCheckIn(overrideCandidate.member, overrideNote.trim())}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold disabled:opacity-50 transition cursor-pointer shadow-md"
              >
                Confirm Audited Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

