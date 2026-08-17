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
  Copy,
  Trash2,
  Edit2,
  Archive,
  Search,
  Filter,
  Check,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  useGymStore,
  WorkoutProgram,
  DietPlan,
  WorkoutRoutineDay,
  WorkoutExercise,
  DietMeal,
  Member,
} from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/workouts")({
  component: WorkoutAndDietHub,
});

function WorkoutAndDietHub() {
  const {
    workoutPrograms,
    dietPlans,
    members,
    settings,
    addWorkoutProgram,
    updateWorkoutProgram,
    duplicateWorkoutProgram,
    deleteWorkoutProgram,
    archiveWorkoutProgram,
    addDietPlan,
    updateDietPlan,
    duplicateDietPlan,
    deleteDietPlan,
    archiveDietPlan,
    assignProgramToMember,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"workouts" | "diets" | "assignments">("workouts");
  const [search, setSearch] = useState("");

  // Assignment Modal State
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignMemberId, setAssignMemberId] = useState(members[0]?.id || "");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(workoutPrograms[0]?.id || "");
  const [selectedDietId, setSelectedDietId] = useState(dietPlans[0]?.id || "");
  const [assignmentNote, setAssignmentNote] = useState("");

  // Workout Builder State
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutProgram | null>(null);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [workoutCategory, setWorkoutCategory] = useState<WorkoutProgram["category"]>("Hypertrophy");
  const [workoutLevel, setWorkoutLevel] = useState<WorkoutProgram["level"]>("Intermediate");
  const [workoutDays, setWorkoutDays] = useState(4);
  const [workoutDurationWeeks, setWorkoutDurationWeeks] = useState(8);
  const [workoutFocus, setWorkoutFocus] = useState("");
  const [routineDays, setRoutineDays] = useState<WorkoutRoutineDay[]>([
    {
      day: "Day 1: Upper Body Power",
      focus: "Chest, Back & Shoulders",
      exercises: [
        { id: "ex-1", name: "Incline Dumbbell Press", sets: "4", reps: "8-10", weightTarget: "24 kg DBs", restTime: "90s", instructions: "Control the stretch at bottom." },
        { id: "ex-2", name: "Barbell Bent Over Row", sets: "4", reps: "8-10", weightTarget: "60 kg", restTime: "90s", instructions: "Keep torso at 45 degrees." },
      ],
    },
  ]);

  // Diet Builder State
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [editingDiet, setEditingDiet] = useState<DietPlan | null>(null);
  const [dietTitle, setDietTitle] = useState("");
  const [dietCategory, setDietCategory] = useState<DietPlan["category"]>("High Protein");
  const [dietCalories, setDietCalories] = useState(2200);
  const [dietProtein, setDietProtein] = useState(160);
  const [dietCarbs, setDietCarbs] = useState(220);
  const [dietFats, setDietFats] = useState(60);
  const [dietMeals, setDietMeals] = useState<DietMeal[]>([
    { time: "08:00 AM", name: "Breakfast", items: "3 Whole Eggs, 2 Toast, 1 Banana", quantity: "1 Plate", calories: 500, protein: 28, carbs: 48, fats: 18, instructions: "Drink 500ml water." },
    { time: "01:30 PM", name: "Lunch", items: "150g Chicken / Paneer, 1 cup Brown Rice, Salad", quantity: "1 Bowl", calories: 650, protein: 48, carbs: 65, fats: 14, instructions: "Light olive oil." },
    { time: "08:00 PM", name: "Dinner", items: "Grilled Fish / Tofu, Sauteed Veggies, 2 Roti", quantity: "1 Plate", calories: 550, protein: 40, carbs: 55, fats: 12, instructions: "Low sodium." },
  ]);

  // Handlers for Workout Builder
  const handleOpenCreateWorkout = () => {
    setEditingWorkout(null);
    setWorkoutTitle("");
    setWorkoutCategory("Hypertrophy");
    setWorkoutLevel("Intermediate");
    setWorkoutDays(4);
    setWorkoutDurationWeeks(8);
    setWorkoutFocus("Targeted muscle hypertrophy and progressive strength gains.");
    setRoutineDays([
      {
        day: "Day 1: Upper Body Power",
        focus: "Chest, Back & Shoulders",
        exercises: [
          { id: `ex-${Date.now()}-1`, name: "Incline Dumbbell Press", sets: "4", reps: "8-10", weightTarget: "24 kg DBs", restTime: "90s", instructions: "Full stretch at bottom." },
          { id: `ex-${Date.now()}-2`, name: "Barbell Bent Over Row", sets: "4", reps: "8-10", weightTarget: "60 kg", restTime: "90s", instructions: "Squeeze scapulae." },
        ],
      },
      {
        day: "Day 2: Lower Body & Core",
        focus: "Quads, Hamstrings & Glutes",
        exercises: [
          { id: `ex-${Date.now()}-3`, name: "Barbell Back Squat", sets: "4", reps: "8-10", weightTarget: "80 kg", restTime: "120s", instructions: "Hit parallel depth." },
          { id: `ex-${Date.now()}-4`, name: "Romanian Deadlift", sets: "3", reps: "10-12", weightTarget: "70 kg", restTime: "90s", instructions: "Hinge at hips." },
        ],
      },
    ]);
    setIsWorkoutModalOpen(true);
  };

  const handleOpenEditWorkout = (w: WorkoutProgram) => {
    setEditingWorkout(w);
    setWorkoutTitle(w.title);
    setWorkoutCategory(w.category);
    setWorkoutLevel(w.level);
    setWorkoutDays(w.daysPerWeek);
    setWorkoutDurationWeeks(w.durationWeeks || 8);
    setWorkoutFocus(w.focus);
    setRoutineDays(w.routine);
    setIsWorkoutModalOpen(true);
  };

  const handleSaveWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workoutTitle.trim()) return;

    if (editingWorkout) {
      updateWorkoutProgram(editingWorkout.id, {
        title: workoutTitle.trim(),
        category: workoutCategory,
        level: workoutLevel,
        daysPerWeek: Number(workoutDays),
        durationWeeks: Number(workoutDurationWeeks),
        focus: workoutFocus.trim(),
        routine: routineDays,
      });
      toast.success(`Updated workout split: ${workoutTitle}!`);
    } else {
      addWorkoutProgram({
        title: workoutTitle.trim(),
        category: workoutCategory,
        level: workoutLevel,
        daysPerWeek: Number(workoutDays),
        durationWeeks: Number(workoutDurationWeeks),
        focus: workoutFocus.trim(),
        routine: routineDays,
      });
      toast.success(`Created workout split: ${workoutTitle}!`);
    }
    setIsWorkoutModalOpen(false);
  };

  const handleAddRoutineDay = () => {
    const dayNum = routineDays.length + 1;
    setRoutineDays([
      ...routineDays,
      {
        day: `Day ${dayNum}: Specialized Focus`,
        focus: "Arms & Core",
        exercises: [
          { id: `ex-${Date.now()}`, name: "Cable Bicep Curls", sets: "3", reps: "12-15", weightTarget: "15 kg", restTime: "60s", instructions: "Keep elbows pinned." },
        ],
      },
    ]);
  };

  const handleAddExercise = (dayIndex: number) => {
    const updated = [...routineDays];
    updated[dayIndex].exercises.push({
      id: `ex-${Date.now()}`,
      name: "Exercise Name",
      sets: "3",
      reps: "10-12",
      weightTarget: "Target Weight",
      restTime: "60s",
      instructions: "",
    });
    setRoutineDays(updated);
  };

  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    const updated = [...routineDays];
    updated[dayIndex].exercises.splice(exIndex, 1);
    setRoutineDays(updated);
  };

  // Handlers for Diet Builder
  const handleOpenCreateDiet = () => {
    setEditingDiet(null);
    setDietTitle("");
    setDietCategory("High Protein");
    setDietCalories(2400);
    setDietProtein(175);
    setDietCarbs(230);
    setDietFats(65);
    setDietMeals([
      { time: "07:30 AM", name: "Morning Breakfast", items: "4 Whole Eggs, 2 Whole Wheat Toast, 1 Banana", quantity: "1 Plate", calories: 580, protein: 32, carbs: 54, fats: 22, instructions: "Cook with olive oil spray." },
      { time: "01:30 PM", name: "Power Lunch", items: "200g Grilled Chicken / Soya, 150g Rice, Cucumber Salad", quantity: "1 Bowl", calories: 680, protein: 55, carbs: 70, fats: 14, instructions: "Add lemon and herbs." },
      { time: "08:30 PM", name: "Recovery Dinner", items: "180g Fish / Paneer, 2 Rotis, Steamed Broccoli", quantity: "1 Plate", calories: 600, protein: 45, carbs: 55, fats: 15, instructions: "Light spice." },
    ]);
    setIsDietModalOpen(true);
  };

  const handleOpenEditDiet = (d: DietPlan) => {
    setEditingDiet(d);
    setDietTitle(d.title);
    setDietCategory(d.category);
    setDietCalories(d.calorieTarget);
    setDietProtein(d.proteinGrams);
    setDietCarbs(d.carbsGrams);
    setDietFats(d.fatsGrams);
    setDietMeals(d.meals);
    setIsDietModalOpen(true);
  };

  const handleSaveDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dietTitle.trim()) return;

    if (editingDiet) {
      updateDietPlan(editingDiet.id, {
        title: dietTitle.trim(),
        category: dietCategory,
        calorieTarget: Number(dietCalories),
        proteinGrams: Number(dietProtein),
        carbsGrams: Number(dietCarbs),
        fatsGrams: Number(dietFats),
        meals: dietMeals,
      });
      toast.success(`Updated nutrition plan: ${dietTitle}!`);
    } else {
      addDietPlan({
        title: dietTitle.trim(),
        category: dietCategory,
        calorieTarget: Number(dietCalories),
        proteinGrams: Number(dietProtein),
        carbsGrams: Number(dietCarbs),
        fatsGrams: Number(dietFats),
        meals: dietMeals,
      });
      toast.success(`Created nutrition plan: ${dietTitle}!`);
    }
    setIsDietModalOpen(false);
  };

  const handleAddMeal = () => {
    setDietMeals([
      ...dietMeals,
      {
        time: "05:00 PM",
        name: "Snack / Pre-Workout",
        items: "1 Scoop Whey Protein, 1 Apple, 15g Almonds",
        quantity: "1 Snack",
        calories: 300,
        protein: 26,
        carbs: 30,
        fats: 9,
        instructions: "",
      },
    ]);
  };

  const handleRemoveMeal = (index: number) => {
    const updated = [...dietMeals];
    updated.splice(index, 1);
    setDietMeals(updated);
  };

  // Unified Assignment Handler
  const handleOpenUnifiedAssign = (workoutId?: string, dietId?: string) => {
    if (workoutId) setSelectedWorkoutId(workoutId);
    if (dietId) setSelectedDietId(dietId);
    setAssignMemberId(members[0]?.id || "");
    setAssignmentNote("");
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignMemberId) return;

    assignProgramToMember(assignMemberId, selectedWorkoutId || undefined, selectedDietId || undefined, assignmentNote);
    const targetMember = members.find((m) => m.id === assignMemberId);
    toast.success(`Assigned personalized programs to ${targetMember?.name || "Member"}!`);
    setIsAssignModalOpen(false);
  };

  const handleShareWhatsApp = (title: string, details: string) => {
    const text = encodeURIComponent(`*${settings.name} Personalized Program*\n\n📋 *${title}*\n\n${details}\n\nTrain hard & stay consistent!`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success(`Generated WhatsApp share link for ${title}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Workout & Diet Builder</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Training OS
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Build custom exercise splits, calculate macro meal plans, assign to members in 1-click, and dispatch via WhatsApp.
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {activeTab === "workouts" && (
            <button
              onClick={handleOpenCreateWorkout}
              className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Workout Split</span>
            </button>
          )}
          {activeTab === "diets" && (
            <button
              onClick={handleOpenCreateDiet}
              className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>New Nutrition Plan</span>
            </button>
          )}
          <button
            onClick={() => handleOpenUnifiedAssign()}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold hover:bg-muted transition"
          >
            <UserCheck className="h-4 w-4 text-emerald" />
            <span>Assign to Member</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1 max-w-fit">
        <button
          onClick={() => setActiveTab("workouts")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
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
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "diets"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>Nutrition & Diets ({dietPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "assignments"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Member Assignments ({members.filter((m) => m.assignedWorkout || m.assignedDiet).length})</span>
        </button>
      </div>

      {/* Tab 1: Workout Splits Builder */}
      {activeTab === "workouts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {workoutPrograms.map((wo) => (
            <div
              key={wo.id}
              className={`rounded-2xl border bg-surface p-6 space-y-4 shadow-2xs transition flex flex-col justify-between ${
                wo.isArchived ? "opacity-60 border-dashed" : "border-border hover:border-foreground/40"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                        {wo.category}
                      </span>
                      <span className="text-xs text-muted-foreground">{wo.daysPerWeek} Days / Week</span>
                      <span className="text-xs text-muted-foreground font-mono">• {wo.level}</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-1.5">{wo.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{wo.focus}</p>
                  </div>
                  <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-mono font-semibold shrink-0">
                    {members.filter((m) => m.assignedWorkout === wo.title).length} Enrolled
                  </span>
                </div>

                {/* Routine Days Preview */}
                <div className="mt-4 space-y-2 rounded-xl border border-border bg-canvas p-3.5 text-xs">
                  {wo.routine.map((r, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{r.day}</p>
                        <span className="text-[10px] text-muted-foreground font-mono">{r.focus}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {r.exercises.map((e) => `${e.name} (${e.sets}×${e.reps}${e.weightTarget ? ` • ${e.weightTarget}` : ""})`).join(" • ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditWorkout(wo)}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Edit Split"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      duplicateWorkoutProgram(wo.id);
                      toast.success(`Duplicated ${wo.title}`);
                    }}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Duplicate Split"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      archiveWorkoutProgram(wo.id);
                      toast.info(wo.isArchived ? "Unarchived split" : "Archived split");
                    }}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title={wo.isArchived ? "Unarchive" : "Archive"}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${wo.title}" workout program?`)) {
                        deleteWorkoutProgram(wo.id);
                        toast.success("Deleted program");
                      }
                    }}
                    className="p-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleShareWhatsApp(
                        wo.title,
                        wo.routine
                          .map(
                            (r) =>
                              `*${r.day} (${r.focus})*\n` +
                              r.exercises.map((e) => `• ${e.name}: ${e.sets} sets × ${e.reps}${e.weightTarget ? ` (${e.weightTarget})` : ""}`).join("\n")
                          )
                          .join("\n\n")
                      )
                    }
                    className="px-3 py-1.5 rounded-xl border border-border bg-canvas text-xs font-semibold hover:bg-muted transition flex items-center gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleOpenUnifiedAssign(wo.id, undefined)}
                    className="px-4 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Assign</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Nutrition & Diet Plans */}
      {activeTab === "diets" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dietPlans.map((diet) => (
            <div
              key={diet.id}
              className={`rounded-2xl border bg-surface p-6 space-y-4 shadow-2xs transition flex flex-col justify-between ${
                diet.isArchived ? "opacity-60 border-dashed" : "border-border hover:border-foreground/40"
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                        {diet.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald">{diet.calorieTarget} kcal Target</span>
                    </div>
                    <h3 className="text-base font-bold text-foreground mt-1.5">{diet.title}</h3>
                  </div>
                  <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-mono font-semibold shrink-0">
                    {members.filter((m) => m.assignedDiet === diet.title).length} Enrolled
                  </span>
                </div>

                {/* Macro Split Summary */}
                <div className="grid grid-cols-3 gap-2 text-center rounded-xl border border-border bg-canvas p-3 text-xs font-mono mt-3">
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
                <div className="mt-3 space-y-2 rounded-xl border border-border bg-canvas p-3.5 text-xs">
                  {diet.meals.map((m, i) => (
                    <div key={i} className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-foreground truncate">{m.time} - {m.name}:</span>
                      <span className="text-[11px] text-muted-foreground truncate">{m.items}</span>
                      <span className="font-mono text-muted-foreground shrink-0">{m.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditDiet(diet)}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Edit Nutrition Plan"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      duplicateDietPlan(diet.id);
                      toast.success(`Duplicated ${diet.title}`);
                    }}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title="Duplicate Nutrition Plan"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      archiveDietPlan(diet.id);
                      toast.info(diet.isArchived ? "Unarchived diet plan" : "Archived diet plan");
                    }}
                    className="p-2 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                    title={diet.isArchived ? "Unarchive" : "Archive"}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Delete "${diet.title}" diet plan?`)) {
                        deleteDietPlan(diet.id);
                        toast.success("Deleted diet plan");
                      }
                    }}
                    className="p-2 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleShareWhatsApp(
                        `${diet.title} (${diet.calorieTarget} kcal)`,
                        `*Macros:* ${diet.proteinGrams}g Protein • ${diet.carbsGrams}g Carbs • ${diet.fatsGrams}g Fats\n\n` +
                          diet.meals
                            .map((m) => `*${m.time} - ${m.name}:*\n` + `• ${m.items} (${m.calories} kcal)`)
                            .join("\n\n")
                      )
                    }
                    className="px-3 py-1.5 rounded-xl border border-border bg-canvas text-xs font-semibold hover:bg-muted transition flex items-center gap-1.5"
                  >
                    <Share2 className="h-3.5 w-3.5 text-emerald" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleOpenUnifiedAssign(undefined, diet.id)}
                    className="px-4 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Assign</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Member Program Assignments */}
      {activeTab === "assignments" && (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Active Member Training & Diet Rosters</h3>
            <span className="text-xs text-muted-foreground font-mono">
              {members.filter((m) => m.assignedWorkout || m.assignedDiet).length} Members with Active Programs
            </span>
          </div>

          <div className="divide-y divide-border rounded-xl border border-border bg-canvas overflow-hidden">
            {members.map((m) => (
              <div key={m.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/20 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{m.name}</span>
                    <span className="rounded-full bg-emerald-soft text-accent-foreground px-2 py-0.2 text-[10px] font-semibold">
                      {m.plan}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="h-3 w-3 text-emerald" />
                      Workout: <strong className="text-foreground">{m.assignedWorkout || "Not Assigned"}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Utensils className="h-3 w-3 text-emerald" />
                      Diet: <strong className="text-foreground">{m.assignedDiet || "Not Assigned"}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssignMemberId(m.id);
                      setIsAssignModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-foreground text-background font-semibold hover:opacity-90 transition"
                  >
                    Adjust Assignment
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workout Builder Modal */}
      {isWorkoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
                  <Dumbbell className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {editingWorkout ? `Edit ${editingWorkout.title}` : "Create Professional Workout Split"}
                </h3>
              </div>
              <button onClick={() => setIsWorkoutModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorkout} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Program Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5-Day Hypertrophy Split"
                    value={workoutTitle}
                    onChange={(e) => setWorkoutTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Training Category</label>
                  <select
                    value={workoutCategory}
                    onChange={(e) => setWorkoutCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Hypertrophy">Hypertrophy (Muscle Growth)</option>
                    <option value="Strength">Strength & Power</option>
                    <option value="Fat Loss">Fat Loss & Conditioning</option>
                    <option value="Functional">Functional Mobility</option>
                    <option value="Endurance">Endurance & Stamina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Difficulty Level</label>
                  <select
                    value={workoutLevel}
                    onChange={(e) => setWorkoutLevel(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Days / Week</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={workoutDays}
                    onChange={(e) => setWorkoutDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Duration (Weeks)</label>
                  <input
                    type="number"
                    min={1}
                    max={52}
                    value={workoutDurationWeeks}
                    onChange={(e) => setWorkoutDurationWeeks(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Focus & Primary Objective</label>
                <input
                  type="text"
                  placeholder="e.g. Progressive overload on compound lifts..."
                  value={workoutFocus}
                  onChange={(e) => setWorkoutFocus(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              {/* Routine Days Builder */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Split Routine & Exercise Builder</h4>
                  <button
                    type="button"
                    onClick={handleAddRoutineDay}
                    className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Training Day
                  </button>
                </div>

                {routineDays.map((day, dIdx) => (
                  <div key={dIdx} className="p-3.5 rounded-xl border border-border bg-canvas space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Day Name e.g. Day 1: Chest & Triceps"
                        value={day.day}
                        onChange={(e) => {
                          const updated = [...routineDays];
                          updated[dIdx].day = e.target.value;
                          setRoutineDays(updated);
                        }}
                        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-bold outline-none focus:border-emerald"
                      />
                      <input
                        type="text"
                        placeholder="Day Focus e.g. Pushing movement patterns"
                        value={day.focus}
                        onChange={(e) => {
                          const updated = [...routineDays];
                          updated[dIdx].focus = e.target.value;
                          setRoutineDays(updated);
                        }}
                        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs outline-none focus:border-emerald"
                      />
                    </div>

                    {/* Exercises in Day */}
                    <div className="space-y-2">
                      {day.exercises.map((ex, eIdx) => (
                        <div key={ex.id || eIdx} className="grid grid-cols-12 gap-2 items-center bg-surface p-2 rounded-lg border border-border text-[11px]">
                          <input
                            type="text"
                            placeholder="Exercise Name"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...routineDays];
                              updated[dIdx].exercises[eIdx].name = e.target.value;
                              setRoutineDays(updated);
                            }}
                            className="col-span-4 rounded border border-border bg-canvas px-2 py-1 outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Sets"
                            value={ex.sets}
                            onChange={(e) => {
                              const updated = [...routineDays];
                              updated[dIdx].exercises[eIdx].sets = e.target.value;
                              setRoutineDays(updated);
                            }}
                            className="col-span-2 rounded border border-border bg-canvas px-2 py-1 outline-none font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Reps"
                            value={ex.reps}
                            onChange={(e) => {
                              const updated = [...routineDays];
                              updated[dIdx].exercises[eIdx].reps = e.target.value;
                              setRoutineDays(updated);
                            }}
                            className="col-span-2 rounded border border-border bg-canvas px-2 py-1 outline-none font-mono"
                          />
                          <input
                            type="text"
                            placeholder="Weight / Notes"
                            value={ex.weightTarget || ""}
                            onChange={(e) => {
                              const updated = [...routineDays];
                              updated[dIdx].exercises[eIdx].weightTarget = e.target.value;
                              setRoutineDays(updated);
                            }}
                            className="col-span-3 rounded border border-border bg-canvas px-2 py-1 outline-none text-[10px]"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExercise(dIdx, eIdx)}
                            className="col-span-1 text-rose-500 hover:text-rose-600 grid place-items-center"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddExercise(dIdx)}
                        className="text-[11px] text-muted-foreground hover:text-foreground font-semibold flex items-center gap-1 mt-1"
                      >
                        <Plus className="h-3 w-3" /> Add Exercise
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsWorkoutModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  {editingWorkout ? "Save Workout Split" : "Create Workout Split"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diet Builder Modal */}
      {isDietModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
                  <Utensils className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  {editingDiet ? `Edit ${editingDiet.title}` : "Create Nutrition & Macro Diet Plan"}
                </h3>
              </div>
              <button onClick={() => setIsDietModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDiet} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Plan Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2400 kcal Lean Bulk Diet"
                    value={dietTitle}
                    onChange={(e) => setDietTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Diet Category</label>
                  <select
                    value={dietCategory}
                    onChange={(e) => setDietCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="High Protein">High Protein Muscle</option>
                    <option value="Muscle Gain">Clean Bulk & Strength</option>
                    <option value="Calorie Deficit">Calorie Deficit Shred</option>
                    <option value="Ketogenic Shred">Ketogenic Cut</option>
                  </select>
                </div>
              </div>

              {/* Macro Targets */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Calories (kcal)</label>
                  <input
                    type="number"
                    value={dietCalories}
                    onChange={(e) => setDietCalories(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-2.5 py-1.5 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Protein (g)</label>
                  <input
                    type="number"
                    value={dietProtein}
                    onChange={(e) => setDietProtein(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-2.5 py-1.5 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Carbs (g)</label>
                  <input
                    type="number"
                    value={dietCarbs}
                    onChange={(e) => setDietCarbs(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-2.5 py-1.5 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Fats (g)</label>
                  <input
                    type="number"
                    value={dietFats}
                    onChange={(e) => setDietFats(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-2.5 py-1.5 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>
              </div>

              {/* Meals Builder */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-foreground">Meal Schedule & Foods</h4>
                  <button
                    type="button"
                    onClick={handleAddMeal}
                    className="text-xs font-semibold text-emerald hover:underline flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Meal
                  </button>
                </div>

                {dietMeals.map((meal, mIdx) => (
                  <div key={mIdx} className="p-3 rounded-xl border border-border bg-canvas space-y-2">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Time e.g. 08:00 AM"
                        value={meal.time}
                        onChange={(e) => {
                          const updated = [...dietMeals];
                          updated[mIdx].time = e.target.value;
                          setDietMeals(updated);
                        }}
                        className="col-span-3 rounded border border-border bg-surface px-2 py-1 text-xs outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Meal Name e.g. Breakfast Fuel"
                        value={meal.name}
                        onChange={(e) => {
                          const updated = [...dietMeals];
                          updated[mIdx].name = e.target.value;
                          setDietMeals(updated);
                        }}
                        className="col-span-5 rounded border border-border bg-surface px-2 py-1 text-xs font-bold outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Calories"
                        value={meal.calories}
                        onChange={(e) => {
                          const updated = [...dietMeals];
                          updated[mIdx].calories = Number(e.target.value);
                          setDietMeals(updated);
                        }}
                        className="col-span-3 rounded border border-border bg-surface px-2 py-1 text-xs font-mono outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(mIdx)}
                        className="col-span-1 text-rose-500 hover:text-rose-600 grid place-items-center"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Food Items (e.g. 4 Whole Eggs, 2 Toast, 1 Banana)"
                      value={meal.items}
                      onChange={(e) => {
                        const updated = [...dietMeals];
                        updated[mIdx].items = e.target.value;
                        setDietMeals(updated);
                      }}
                      className="w-full rounded border border-border bg-surface px-2.5 py-1.5 text-xs outline-none"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsDietModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  {editingDiet ? "Save Nutrition Plan" : "Create Nutrition Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unified Assignment Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">Assign Programs to Member</h3>
                  <p className="text-[11px] text-muted-foreground">Select Workout and/or Nutrition Plan</p>
                </div>
              </div>
              <button onClick={() => setIsAssignModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Target Member *</label>
                <select
                  required
                  value={assignMemberId}
                  onChange={(e) => setAssignMemberId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan} • Goal: {m.healthGoal || "General Fitness"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Select Workout Split</label>
                <select
                  value={selectedWorkoutId}
                  onChange={(e) => setSelectedWorkoutId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  <option value="">None / Keep Current</option>
                  {workoutPrograms.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} ({w.daysPerWeek} Days • {w.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Select Nutrition & Diet Plan</label>
                <select
                  value={selectedDietId}
                  onChange={(e) => setSelectedDietId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  <option value="">None / Keep Current</option>
                  {dietPlans.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.calorieTarget} kcal • {d.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Coaching Note</label>
                <input
                  type="text"
                  placeholder="e.g. Focus on form during week 1..."
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  Assign to Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
