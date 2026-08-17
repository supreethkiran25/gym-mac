import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  UserCheck,
  UserMinus,
  Search,
  Flame,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
} from "lucide-react";
import { useGymStore, Member } from "../lib/gym-store";
import { AttendanceHeatmap } from "../components/dashboard/AttendanceHeatmap";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/attendance")({
  component: AttendanceSystem,
});

function AttendanceSystem() {
  const {
    members,
    checkInMember,
    checkOutMember,
    setIsCheckInOpen,
    setSelectedMember360,
    setIsMember360Open,
    settings,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"live" | "heatmap" | "history">("live");
  const [liveSearch, setLiveSearch] = useState("");

  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const totalCapacity = 80;
  const occupancyRate = Math.round((insideMembers.length / totalCapacity) * 100);

  const filteredInside = insideMembers.filter((m) =>
    m.name.toLowerCase().includes(liveSearch.toLowerCase()) ||
    m.phone.includes(liveSearch) ||
    m.plan.toLowerCase().includes(liveSearch.toLowerCase())
  );

  const handleQuickCheckOut = (m: Member) => {
    checkOutMember(m.id);
    toast.info(`Checked OUT ${m.name}`);
  };

  const handleOpen360 = (m: Member) => {
    setSelectedMember360(m);
    setIsMember360Open(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Live Attendance & Floor Biometrics</h1>
            <span className="rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
              {insideMembers.length} Active Now
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Realtime member check-ins, floor occupancy tracking, and 30-day rush heatmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented View Switcher */}
          <div className="flex rounded-xl border border-border bg-surface p-1">
            <button
              onClick={() => setActiveTab("live")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "live"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Live Floor ({insideMembers.length})
            </button>
            <button
              onClick={() => setActiveTab("heatmap")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "heatmap"
                  ? "bg-foreground text-background shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Rush Heatmap
            </button>
          </div>

          <button
            onClick={() => setIsCheckInOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
          >
            <UserCheck className="h-4 w-4" /> Instant Check-In
          </button>
        </div>
      </div>

      {/* Live Floor Vitals Gauge Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Floor Capacity Gauge</span>
            <span className="font-mono">{insideMembers.length} / {totalCapacity}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tracking-tight">{occupancyRate}%</span>
            <span className="text-xs text-emerald font-medium">Optimal density</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                occupancyRate >= 85 ? "bg-rose-500" : occupancyRate >= 60 ? "bg-amber-500" : "bg-emerald"
              }`}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Today's Total Check-Ins</span>
            <CheckCircle2 className="h-4 w-4 text-emerald" />
          </div>
          <p className="text-3xl font-bold font-mono tracking-tight">142 visits</p>
          <p className="text-xs text-emerald flex items-center gap-1">
            <ArrowUpRight className="h-3.5 w-3.5" /> +14.2% vs same day last week
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold">Upcoming Peak Rush</span>
            <Flame className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-3xl font-bold tracking-tight">6:00 – 8:30 PM</p>
          <p className="text-xs text-muted-foreground">
            Est. ~76 members expected · 3 coaches on duty
          </p>
        </div>
      </div>

      {/* Main View Switching */}
      {activeTab === "live" ? (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
          {/* Live Floor Header & Fast Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold tracking-tight">Currently On Gym Floor</h2>
              <p className="text-xs text-muted-foreground">
                Members actively checked in via access gate or manual check-in
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search active members inside..."
                value={liveSearch}
                onChange={(e) => setLiveSearch(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas pl-10 pr-3 py-2 text-xs outline-none focus:border-emerald"
              />
            </div>
          </div>

          {/* Floor Grid Cards */}
          {filteredInside.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredInside.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleOpen360(m)}
                  className="rounded-2xl border border-border/80 bg-canvas p-4 space-y-3 hover:border-emerald/40 hover:shadow-sm cursor-pointer transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald text-white font-bold text-xs">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-foreground hover:text-emerald">
                          {m.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">{m.plan}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-soft text-accent-foreground px-2 py-0.5 text-[10px] font-mono font-medium">
                      In {m.checkInTime || "Morning"}
                    </span>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-1 border-t border-border/60 pt-2.5">
                    <div className="flex justify-between">
                      <span>Trainer:</span>
                      <span className="font-medium text-foreground">{m.assignedTrainer || "Open Floor"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goal:</span>
                      <span className="font-medium text-foreground truncate max-w-[120px]">{m.healthGoal || "General Fitness"}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleQuickCheckOut(m);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-surface py-1.5 text-xs font-medium hover:bg-muted text-muted-foreground hover:text-foreground transition"
                  >
                    <UserMinus className="h-3.5 w-3.5" /> Check Out
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-xl border border-dashed border-border bg-canvas/40">
              <Users className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-semibold">No members checked in right now</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click "+ Instant Check-In" to check in members arriving at the floor.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Visual Heatmap Tab */
        <AttendanceHeatmap />
      )}
    </div>
  );
}
