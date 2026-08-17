import React, { useState } from "react";
import { Flame, Clock, Users, Calendar, ArrowUpRight } from "lucide-react";
import { useGymStore } from "../../lib/gym-store";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = [
  "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
  "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM",
  "6 PM", "7 PM", "8 PM", "9 PM",
];

// 7 x 16 occupancy percentage simulation
const HEATMAP_MATRIX: number[][] = [
  // Mon
  [65, 88, 92, 70, 45, 30, 25, 20, 22, 35, 60, 85, 96, 90, 75, 40],
  // Tue
  [60, 84, 90, 68, 40, 28, 24, 18, 20, 38, 62, 88, 98, 92, 78, 42],
  // Wed
  [70, 92, 95, 75, 50, 32, 28, 22, 25, 42, 65, 90, 99, 94, 80, 45],
  // Thu
  [62, 82, 88, 65, 42, 30, 25, 20, 22, 40, 60, 84, 95, 88, 72, 38],
  // Fri
  [68, 86, 91, 72, 48, 35, 30, 25, 28, 45, 68, 92, 94, 82, 60, 30],
  // Sat
  [40, 65, 85, 95, 98, 90, 75, 60, 50, 45, 52, 60, 65, 50, 35, 20],
  // Sun
  [30, 50, 75, 88, 92, 85, 65, 50, 40, 35, 38, 42, 45, 30, 20, 10],
];

export function AttendanceHeatmap() {
  const { members } = useGymStore();
  const [selectedCell, setSelectedCell] = useState<{ day: string; hour: string; value: number } | null>({
    day: "Mon",
    hour: "6 PM",
    value: 96,
  });

  const getHeatColor = (val: number) => {
    if (val >= 90) return "bg-rose-500 text-white font-semibold";
    if (val >= 75) return "bg-amber-500 text-white font-medium";
    if (val >= 50) return "bg-emerald text-white";
    if (val >= 25) return "bg-emerald/30 text-foreground";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight">Occupancy & Floor Rush Heatmap</h2>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Live Biometrics
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hourly density analysis based on member check-in frequency over the past 30 days
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>Low</span>
          <div className="flex items-center gap-1">
            <div className="h-3.5 w-3.5 rounded bg-muted" />
            <div className="h-3.5 w-3.5 rounded bg-emerald/30" />
            <div className="h-3.5 w-3.5 rounded bg-emerald" />
            <div className="h-3.5 w-3.5 rounded bg-amber-500" />
            <div className="h-3.5 w-3.5 rounded bg-rose-500" />
          </div>
          <span>Peak (95%+)</span>
        </div>
      </div>

      {/* Interactive Heatmap Matrix */}
      <div className="overflow-x-auto">
        <div className="min-w-[650px] space-y-1.5">
          {/* Hour Labels */}
          <div className="grid grid-cols-[60px_repeat(16,1fr)] gap-1 text-[10px] text-muted-foreground font-mono text-center">
            <div />
            {HOURS.map((h) => (
              <div key={h} className="truncate">
                {h}
              </div>
            ))}
          </div>

          {/* Days and Heat Cells */}
          {DAYS.map((day, dIdx) => (
            <div key={day} className="grid grid-cols-[60px_repeat(16,1fr)] gap-1 items-center">
              <span className="text-xs font-semibold text-muted-foreground">{day}</span>
              {HOURS.map((hour, hIdx) => {
                const val = HEATMAP_MATRIX[dIdx][hIdx];
                const isSelected =
                  selectedCell?.day === day && selectedCell?.hour === hour;
                return (
                  <button
                    key={hour}
                    onClick={() => setSelectedCell({ day, hour, value: val })}
                    title={`${day} @ ${hour}: ~${val}% floor capacity`}
                    className={`h-8 rounded-lg text-[10px] font-mono transition-all flex items-center justify-center ${getHeatColor(
                      val
                    )} ${
                      isSelected
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-105 z-10"
                        : "hover:opacity-85 hover:scale-102"
                    }`}
                  >
                    {val}%
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Cell Snapshot */}
      {selectedCell && (
        <div className="rounded-xl border border-border bg-canvas p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`grid h-10 w-10 place-items-center rounded-xl font-bold font-mono text-sm ${getHeatColor(
                selectedCell.value
              )}`}
            >
              {selectedCell.value}%
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Peak Slot Snapshot · {selectedCell.day} at {selectedCell.hour}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {selectedCell.value >= 85
                  ? "🔥 High Peak Floor Rush (Recommended: 3 Trainers on Duty)"
                  : selectedCell.value >= 50
                  ? "⚡ Moderate Activity (Standard Floor Supervision)"
                  : "🧘 Low Density (Optimal for Personal Training & Assessments)"}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-mono font-semibold">
              Est. ~{Math.round((selectedCell.value / 100) * 80)} members on floor
            </p>
            <p className="text-[11px] text-muted-foreground">Gym Max Capacity: 80</p>
          </div>
        </div>
      )}
    </div>
  );
}
