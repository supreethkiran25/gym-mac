import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  Flame,
  CheckCircle2,
  X,
  UserPlus,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { useGymStore, GymClass } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/classes")({
  component: ClassesManagement,
});

const DAYS = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ClassesManagement() {
  const { classes, members, bookClass, cancelClassBooking } = useGymStore();
  const [selectedDay, setSelectedDay] = useState("All");
  const [bookingClass, setBookingClass] = useState<GymClass | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const filteredClasses = classes.filter((c) => {
    if (selectedDay === "All") return true;
    return c.days.includes(selectedDay);
  });

  const handleBookMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClass || !selectedMemberId) return;

    bookClass(bookingClass.id, selectedMemberId);
    const memberObj = members.find((m) => m.id === selectedMemberId);
    toast.success(`Booked ${memberObj?.name || "Member"} into ${bookingClass.title}!`);
    setBookingClass(null);
    setSelectedMemberId("");
  };

  const handleRemoveBooking = (classId: string, memberId: string) => {
    cancelClassBooking(classId, memberId);
    toast.info("Cancelled class spot reservation");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Studio Classes & Schedules</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {classes.length} Active Sessions
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Capacity management, studio schedules, coach assignments, and live roster booking.
          </p>
        </div>
      </div>

      {/* Day of Week Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDay(d)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition border ${
              selectedDay === d
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {d === "All" ? "All Week" : d}
          </button>
        ))}
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredClasses.map((cls) => {
          const bookedCount = cls.enrolledMembers.length;
          const isFull = bookedCount >= cls.capacity;

          return (
            <div
              key={cls.id}
              className="rounded-2xl border border-border bg-surface p-6 space-y-4 hover:border-foreground/40 transition shadow-2xs"
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                      {cls.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{cls.room}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mt-1.5">{cls.title}</h3>
                  <p className="text-xs text-muted-foreground">Coach: {cls.trainer}</p>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{cls.time}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{cls.durationMinutes} mins</span>
                </div>
              </div>

              {/* Schedule Days Badges */}
              <div className="flex items-center gap-1.5">
                {cls.days.map((day) => (
                  <span
                    key={day}
                    className="rounded-md bg-canvas border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground"
                  >
                    {day}
                  </span>
                ))}
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1.5 rounded-xl border border-border bg-canvas p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Capacity Roster</span>
                  <span className="font-mono font-bold">
                    {bookedCount} / {cls.capacity} Booked
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isFull ? "bg-rose-500" : "bg-emerald"
                    }`}
                    style={{ width: `${(bookedCount / cls.capacity) * 100}%` }}
                  />
                </div>
              </div>

              {/* Enrolled Roster */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">Enrolled Members ({bookedCount})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {cls.enrolledMembers.map((mId) => {
                    const mObj = members.find((m) => m.id === mId);
                    return (
                      <span
                        key={mId}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs"
                      >
                        <span className="font-medium">{mObj?.name || "Member"}</span>
                        <button
                          onClick={() => handleRemoveBooking(cls.id, mId)}
                          className="text-muted-foreground hover:text-danger"
                          title="Remove from class"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Book Spot Button */}
              <div className="pt-2 border-t border-border">
                <button
                  onClick={() => {
                    setBookingClass(cls);
                    setSelectedMemberId(members[0]?.id || "");
                  }}
                  disabled={isFull}
                  className={`w-full py-2 rounded-xl text-xs font-semibold transition ${
                    isFull
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-foreground text-background hover:opacity-90"
                  }`}
                >
                  {isFull ? "Class Full (Waitlist Open)" : "+ Reserve Spot for Member"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Member Dialog */}
      {bookingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-semibold">Reserve Spot in {bookingClass.title}</h3>
              <button onClick={() => setBookingClass(null)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleBookMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-medium">Select Member</label>
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

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingClass(null)}
                  className="px-3 py-1.5 rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-foreground text-background font-semibold"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
