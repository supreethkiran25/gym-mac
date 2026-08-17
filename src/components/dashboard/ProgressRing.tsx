import React from "react";
import { cn } from "../../lib/utils";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  className?: string;
  label?: string | React.ReactNode;
  showPercent?: boolean;
}

export function ProgressRing({
  value,
  size = 48,
  strokeWidth = 3.5,
  color = "#10b981",
  backgroundColor,
  className,
  label,
  showPercent = false,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor || "rgba(255, 255, 255, 0.08)"}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {(label !== undefined || showPercent) && (
        <span className="absolute text-[10px] font-mono font-bold tabular-nums text-foreground">
          {label ?? `${Math.round(clampedValue)}%`}
        </span>
      )}
    </div>
  );
}

interface ConcentricBiometricRingsProps {
  size?: number;
  floorOccupancy: number; // % of capacity
  revenueTarget: number; // % of target
  retentionRate: number; // % of active retention
  className?: string;
}

export function ConcentricBiometricRings({
  size = 110,
  floorOccupancy,
  revenueTarget,
  retentionRate,
  className,
}: ConcentricBiometricRingsProps) {
  const strokeWidth = 7;
  const spacing = 3;

  const r1 = (size - strokeWidth) / 2;
  const r2 = r1 - strokeWidth - spacing;
  const r3 = r2 - strokeWidth - spacing;

  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;

  const offset1 = c1 - (Math.min(100, Math.max(0, floorOccupancy)) / 100) * c1;
  const offset2 = c2 - (Math.min(100, Math.max(0, revenueTarget)) / 100) * c2;
  const offset3 = c3 - (Math.min(100, Math.max(0, retentionRate)) / 100) * c3;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Ring 1 - Floor Occupancy (Emerald) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          fill="none"
          stroke="rgba(16, 185, 129, 0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r1}
          fill="none"
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={c1}
          strokeDashoffset={offset1}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />

        {/* Ring 2 - Revenue Target (Purple) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          fill="none"
          stroke="rgba(168, 85, 247, 0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r2}
          fill="none"
          stroke="#a855f7"
          strokeWidth={strokeWidth}
          strokeDasharray={c2}
          strokeDashoffset={offset2}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out delay-100"
        />

        {/* Ring 3 - Retention (Blue) */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r3}
          fill="none"
          stroke="rgba(59, 130, 246, 0.15)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r3}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={strokeWidth}
          strokeDasharray={c3}
          strokeDashoffset={offset3}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out delay-200"
        />
      </svg>
    </div>
  );
}
