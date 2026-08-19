import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  QrCode,
  Search,
  Users,
  Clock,
  LogOut,
  CalendarCheck,
  Zap,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/checkin")({
  component: CheckInPage,
  head: () => ({
    meta: [{ title: "Floor Check-In & Attendance | PEAKREP Gym OS" }],
  }),
});

function CheckInPage() {
  const { members, checkInMember, checkOutMember, currentUser } = useGymStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [simulatedScanActive, setSimulatedScanActive] = useState(false);

  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const outsideMembers = members.filter((m) => !m.isCurrentlyInside);

  const filteredMembers = searchQuery
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.phone.includes(searchQuery) ||
          m.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleQuickCheckIn = (m: Member) => {
    if (m.status === "Expired") {
      toast.error(`Cannot check in ${m.name}: Membership has expired. Please renew first!`);
      return;
    }
    if (m.status === "Frozen") {
      toast.error(`Cannot check in ${m.name}: Membership is frozen until ${m.freezeUntil}.`);
      return;
    }

    checkInMember(m.id);
    toast.success(`✓ Checked in ${m.name} at Floor Turnstile!`);
    setSearchQuery("");
  };

  const handleSimulateScan = () => {
    setSimulatedScanActive(true);
    setTimeout(() => {
      setSimulatedScanActive(false);
      const candidates = outsideMembers.filter((m) => m.status === "Active" || m.status === "Expiring" || m.status === "Partial");
      if (candidates.length > 0) {
        const randomMember = candidates[Math.floor(Math.random() * candidates.length)];
        handleQuickCheckIn(randomMember);
      } else {
        toast.info("All active members are already checked in.");
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald">
              Floor Turnstile & Attendance Gate
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            Member Check-In Center
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Instant barcode/QR turnstile access, real-time live gym capacity, and attendance roster.
          </p>
        </div>

        <button
          onClick={handleSimulateScan}
          disabled={simulatedScanActive}
          className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 text-xs font-bold transition shadow-lg shrink-0 disabled:opacity-50"
        >
          <QrCode className={`h-4 w-4 ${simulatedScanActive ? "animate-spin" : ""}`} />
          <span>{simulatedScanActive ? "Scanning QR..." : "Simulate Turnstile QR Scan"}</span>
        </button>
      </div>

      {/* Hero Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Currently Inside Floor</span>
            <Users className="h-4 w-4 text-emerald" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">{insideMembers.length}</div>
          <p className="text-[11px] text-muted-foreground">Live active workouts on gym floor</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Enrolled Directory</span>
            <UserCheck className="h-4 w-4 text-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">{members.length}</div>
          <p className="text-[11px] text-muted-foreground">Active & registered members</p>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Gate Operator Session</span>
            <ShieldCheck className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-sm font-bold text-foreground truncate">{currentUser.name}</div>
          <p className="text-[11px] text-muted-foreground">
            Role: <span className="font-semibold uppercase">{currentUser.role}</span>
          </p>
        </div>
      </div>

      {/* Main Check-In Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Search & 1-Click Check In (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                Fast Search & Floor Entry
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">Search by Name, Phone, or ID</span>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type member name or mobile number..."
                className="w-full rounded-2xl border border-border bg-canvas pl-10 pr-4 py-3 text-sm focus:border-foreground focus:outline-hidden"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-3.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Filtered Search Results */}
            {searchQuery && (
              <div className="space-y-2 pt-2 animate-in fade-in">
                <p className="text-xs font-semibold text-muted-foreground">
                  Found {filteredMembers.length} Matching Members:
                </p>
                {filteredMembers.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No member matches found.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {filteredMembers.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 rounded-2xl border border-border bg-canvas hover:border-foreground/40 transition text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-foreground flex items-center gap-2">
                            <span>{m.name}</span>
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
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
                          </div>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {m.phone} · {m.plan} (Exp: {m.expiry})
                          </p>
                        </div>

                        {m.isCurrentlyInside ? (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald font-bold text-[11px]">
                            Inside ({m.checkInTime || "Now"})
                          </span>
                        ) : (
                          <button
                            onClick={() => handleQuickCheckIn(m)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-foreground text-background font-bold text-xs hover:opacity-90 transition"
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
                <p className="text-xs font-semibold text-muted-foreground">Recent Outside Members (1-Click Entry):</p>
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {outsideMembers.slice(0, 5).map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-border bg-canvas text-xs"
                    >
                      <div>
                        <div className="font-bold text-foreground">{m.name}</div>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {m.phone} · {m.plan}
                        </p>
                      </div>
                      <button
                        onClick={() => handleQuickCheckIn(m)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface font-semibold hover:bg-muted transition text-foreground"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald" />
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
          <div className="rounded-3xl border border-border bg-surface p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald animate-ping" />
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Inside Gym Now ({insideMembers.length})
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">Live Attendance Roster</span>
            </div>

            {insideMembers.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <Clock className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
                <p className="text-xs font-semibold text-foreground">No members currently inside</p>
                <p className="text-[11px] text-muted-foreground">Use the search box or scan QR to check in members.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {insideMembers.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-canvas text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-foreground">{m.name}</div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>In at: {m.checkInTime || "Morning"}</span>
                        {m.assignedTrainer && <span>· Trainer: {m.assignedTrainer}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        checkOutMember(m.id);
                        toast.info(`Checked out ${m.name}`);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-surface text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/10 transition text-xs"
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
    </div>
  );
}
