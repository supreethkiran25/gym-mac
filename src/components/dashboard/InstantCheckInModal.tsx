import React, { useState } from "react";
import {
  X,
  Search,
  UserCheck,
  UserMinus,
  CheckCircle2,
  Clock,
  Flame,
  Users,
  ArrowRight,
} from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";
import { toast } from "sonner";

export function InstantCheckInModal() {
  const {
    isCheckInOpen,
    setIsCheckInOpen,
    members,
    checkInMember,
    checkOutMember,
    settings,
  } = useGymStore();

  const [search, setSearch] = useState("");

  if (!isCheckInOpen) return null;

  const currentInside = members.filter((m) => m.isCurrentlyInside);
  const totalInside = currentInside.length;

  const filteredMembers = search.trim()
    ? members.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.phone.includes(search) ||
          m.plan.toLowerCase().includes(search.toLowerCase())
      )
    : members.slice(0, 8);

  const handleCheckIn = (m: Member) => {
    checkInMember(m.id);
    toast.success(`Checked IN ${m.name} to gym floor!`);
  };

  const handleCheckOut = (m: Member) => {
    checkOutMember(m.id);
    toast.info(`Checked OUT ${m.name}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-surface">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-soft text-accent-foreground">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold">Live Floor Check-In</h2>
                <span className="rounded-full bg-emerald/15 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald">
                  {totalInside} on floor
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Instant 1-click member check-in & access gate validation
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCheckInOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="p-4 border-b border-border bg-canvas">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoFocus
              placeholder="Search member by name, phone or plan for 1-click check-in..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald transition"
            />
          </div>
        </div>

        {/* Member Directory List */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-2 divide-y divide-border/40">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((m) => (
              <div
                key={m.id}
                className="pt-2 flex items-center justify-between gap-3 rounded-xl p-2.5 hover:bg-muted/50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${
                      m.isCurrentlyInside
                        ? "bg-emerald text-white"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          m.status === "Active"
                            ? "bg-emerald-soft text-accent-foreground"
                            : m.status === "Expiring"
                            ? "bg-warn/15 text-warn"
                            : "bg-danger/10 text-danger"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.plan} · {m.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {m.isCurrentlyInside ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald font-medium hidden sm:inline">
                        In since {m.checkInTime || "Morning"}
                      </span>
                      <button
                        onClick={() => handleCheckOut(m)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-canvas px-3 py-1.5 text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      >
                        <UserMinus className="h-3.5 w-3.5" /> Check Out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(m)}
                      disabled={m.status === "Expired"}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        m.status === "Expired"
                          ? "bg-muted text-muted-foreground cursor-not-allowed opacity-60"
                          : "bg-foreground text-background hover:opacity-90"
                      }`}
                    >
                      <UserCheck className="h-3.5 w-3.5" /> Check In
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="py-8 text-center text-xs text-muted-foreground">
              No matching members found for "{search}"
            </p>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3 text-xs text-muted-foreground">
          <span>{totalInside} members currently inside</span>
          <span>Press <b>ESC</b> to close</span>
        </div>
      </div>
    </div>
  );
}
