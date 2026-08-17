import React from "react";
import {
  AlertTriangle,
  TrendingUp,
  Dumbbell,
  Zap,
  CheckCircle2,
  X,
  ArrowRight,
  Activity,
} from "lucide-react";
import { useGymStore, SmartInsight } from "../../lib/gym-store";
import { toast } from "sonner";

export function SmartInsightCard({ insight }: { insight: SmartInsight }) {
  const { executeInsightAction, dismissInsight } = useGymStore();

  const handleAction = () => {
    executeInsightAction(insight);
    toast.success(`Executed: "${insight.actionLabel}"`);
  };

  const getStyle = () => {
    switch (insight.type) {
      case "warning":
        return {
          icon: AlertTriangle,
          borderColor: "border-amber-500/30 dark:border-amber-500/20",
          bgColor: "bg-amber-500/5",
          iconColor: "text-amber-500 bg-amber-500/10",
          tagColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
        };
      case "opportunity":
        return {
          icon: TrendingUp,
          borderColor: "border-emerald/30 dark:border-emerald/20",
          bgColor: "bg-emerald/5",
          iconColor: "text-emerald bg-emerald-soft",
          tagColor: "bg-emerald-soft text-accent-foreground",
        };
      case "alert":
        return {
          icon: Dumbbell,
          borderColor: "border-rose-500/30 dark:border-rose-500/20",
          bgColor: "bg-rose-500/5",
          iconColor: "text-rose-500 bg-rose-500/10",
          tagColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
        };
      case "info":
      default:
        return {
          icon: Zap,
          borderColor: "border-blue-500/30 dark:border-blue-500/20",
          bgColor: "bg-blue-500/5",
          iconColor: "text-blue-500 bg-blue-500/10",
          tagColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
        };
    }
  };

  const s = getStyle();
  const Icon = s.icon;

  return (
    <div
      className={`relative flex flex-col justify-between rounded-2xl border p-5 transition hover:shadow-md ${s.borderColor} ${s.bgColor}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`grid h-8 w-8 place-items-center rounded-xl ${s.iconColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${s.tagColor}`}>
            {insight.metricChange}
          </span>
        </div>
        <button
          onClick={() => dismissInsight(insight.id)}
          title="Dismiss alert"
          className="p-1 rounded-md text-muted-foreground hover:bg-muted transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{insight.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{insight.description}</p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50">
        <button
          onClick={handleAction}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition group"
        >
          <span>{insight.actionLabel}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
        </button>
      </div>
    </div>
  );
}
