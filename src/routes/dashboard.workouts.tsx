import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Dumbbell,
  Utensils,
  Plus,
  Share2,
  UserCheck,
  Flame,
  CheckCircle2,
  Clock,
  ChevronDown,
  X,
} from "lucide-react";
import { useGymStore, WorkoutProgram, DietPlan } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/workouts")({
  component: WorkoutAndDietHub,
});

function WorkoutAndDietHub() {
  const {
    workoutPrograms,
    dietPlans,
    members,
    assignWorkoutToMember,
    assignDietToMember,
    settings,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"workouts" | "diets">("workouts");
  const [assigningProgram, setAssigningProgram] = useState<{ type: "workout" | "diet"; id: string; title: string } | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState(members[0]?.id || "");

  const handleShareWhatsApp = (title: string, details: string) => {
    const text = encodeURIComponent(`*${settings.name} Personalized Program*\n\n📋 *${title}*\n\n${details}\n\nTrain hard & stay consistent!`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success(`Generated WhatsApp share link for ${title}`);
  };

  const handleAssignConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningProgram || !selectedMemberId) return;

    if (assigningProgram.type === "workout") {
      assignWorkoutToMember(selectedMemberId, assigningProgram.id);
    } else {
      assignDietToMember(selectedMemberId, assigningProgram.id);
    }

    const memberObj = members.find((m) => m.id === selectedMemberId);
    toast.success(`Assigned ${assigningProgram.title} to ${memberObj?.name || "Member"}!`);
    setAssigningProgram(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workout & Diet Programs</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Trainerize Grade
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Assign custom splits and macro diet plans to members, visible in Member 360 and shareable via WhatsApp.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-border bg-surface p-1">
          <button
            onClick={() => setActiveTab("workouts")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "workouts"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Dumbbell className="h-3.5 w-3.5" />
            <span>Workout Splits ({workoutPrograms.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("diets")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeTab === "diets"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Utensils className="h-3.5 w-3.5" />
            <span>Nutrition & Macros ({dietPlans.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === "workouts" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workoutPrograms.map((wo) => (
            <div
              key={wo.id}
              className="rounded-2xl border border-border bg-surface p-6 space-y-4 hover:border-foreground/40 transition shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                      {wo.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{wo.daysPerWeek} Days / Week</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1.5">{wo.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{wo.focus}</p>
                </div>
                <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-mono font-semibold">
                  {members.filter((m) => m.assignedWorkout === wo.title).length} Enrolled
                </span>
              </div>

              {/* Routine Days Preview */}
              <div className="space-y-2 rounded-xl border border-border bg-canvas p-3 text-xs">
                {wo.routine.map((r, i) => (
                  <div key={i} className="space-y-1">
                    <p className="font-semibold text-foreground">{r.day}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {r.exercises.map((e) => `${e.name} (${e.sets}x${e.reps})`).join(" • ")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() =>
                    handleShareWhatsApp(
                      wo.title,
                      wo.routine
                        .map(
                          (r) =>
                            `*${r.day}*\n` +
                            r.exercises.map((e) => `• ${e.name}: ${e.sets} sets of ${e.reps}`).join("\n")
                        )
                        .join("\n\n")
                    )
                  }
                  className="flex-1 py-2 rounded-xl border border-border bg-canvas text-xs font-semibold hover:bg-muted transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald" />
                  <span>WhatsApp Share</span>
                </button>

                <button
                  onClick={() =>
                    setAssigningProgram({ type: "workout", id: wo.id, title: wo.title })
                  }
                  className="flex-1 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald" />
                  <span>Assign to Member</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dietPlans.map((diet) => (
            <div
              key={diet.id}
              className="rounded-2xl border border-border bg-surface p-6 space-y-4 hover:border-foreground/40 transition shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                      {diet.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald">{diet.calorieTarget} kcal</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1.5">{diet.title}</h3>
                </div>
                <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-mono font-semibold">
                  {members.filter((m) => m.assignedDiet === diet.title).length} Enrolled
                </span>
              </div>

              {/* Macro Bars */}
              <div className="grid grid-cols-3 gap-2 text-center rounded-xl border border-border bg-canvas p-3 text-xs font-mono">
                <div>
                  <span className="text-muted-foreground text-[10px]">Protein</span>
                  <p className="font-bold text-foreground">{diet.proteinGrams}g</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Carbs</span>
                  <p className="font-bold text-foreground">{diet.carbsGrams}g</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px]">Fats</span>
                  <p className="font-bold text-foreground">{diet.fatsGrams}g</p>
                </div>
              </div>

              {/* Meals Preview */}
              <div className="space-y-1.5 rounded-xl border border-border bg-canvas p-3 text-xs">
                {diet.meals.map((m, i) => (
                  <div key={i} className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold text-foreground truncate">{m.name}:</span>
                    <span className="text-[11px] text-muted-foreground truncate">{m.items.join(", ")}</span>
                    <span className="font-mono text-muted-foreground shrink-0">{m.calories} cal</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() =>
                    handleShareWhatsApp(
                      `${diet.title} (${diet.calorieTarget} kcal)`,
                      `*Macros:* ${diet.proteinGrams}g Protein • ${diet.carbsGrams}g Carbs • ${diet.fatsGrams}g Fats\n\n` +
                        diet.meals
                          .map((m) => `*${m.time} - ${m.name}:*\n` + m.items.map((it) => `• ${it}`).join("\n"))
                          .join("\n\n")
                    )
                  }
                  className="flex-1 py-2 rounded-xl border border-border bg-canvas text-xs font-semibold hover:bg-muted transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald" />
                  <span>WhatsApp Share</span>
                </button>

                <button
                  onClick={() =>
                    setAssigningProgram({ type: "diet", id: diet.id, title: diet.title })
                  }
                  className="flex-1 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald" />
                  <span>Assign to Member</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assigningProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">Assign {assigningProgram.title}</h3>
              <button onClick={() => setAssigningProgram(null)} className="text-muted-foreground">
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

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssigningProgram(null)}
                  className="px-4 py-2 rounded-xl border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  Assign to Member Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
