import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface LiveClockProps {
  showDate?: boolean;
  showSeconds?: boolean;
  variant?: "badge" | "hero" | "minimal";
  className?: string;
}

export function LiveClock({
  showDate = true,
  showSeconds = true,
  variant = "badge",
  className = "",
}: LiveClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial client time immediately on mount
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    // Avoid SSR hydration mismatch
    return null;
  }

  const timeString = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: true,
  });

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (variant === "hero") {
    return (
      <div className={`flex flex-wrap items-center gap-2 font-mono ${className}`}>
        <div className="flex items-center gap-1.5 rounded-full bg-surface border border-border px-3 py-1 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
          </span>
          <span className="text-foreground font-bold">{timeString}</span>
        </div>
        {showDate && <span className="text-xs text-muted-foreground font-sans">{dateString}</span>}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={`inline-flex items-center gap-1.5 font-mono text-xs ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald shrink-0" />
        <span className="font-semibold text-foreground">{timeString}</span>
        {showDate && <span className="text-muted-foreground">· {dateString}</span>}
      </div>
    );
  }

  // Default "badge" variant
  return (
    <div
      className={`hidden sm:inline-flex items-center gap-2 rounded-xl border border-border bg-canvas px-3 py-1.5 text-xs text-foreground font-mono shadow-2xs ${className}`}
      title="Real-Time System Clock"
    >
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald"></span>
        </span>
        <span className="font-bold tracking-tight">{timeString}</span>
      </div>
      {showDate && (
        <span className="text-[11px] text-muted-foreground border-l border-border pl-2 font-sans">
          {dateString}
        </span>
      )}
    </div>
  );
}
