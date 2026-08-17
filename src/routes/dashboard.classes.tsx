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
  MessageCircle,
  Trash2,
  Edit2,
  Send,
  Building,
  Activity,
  Check,
} from "lucide-react";
import { useGymStore, GymClass } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/classes")({
  component: ClassesManagement,
});

const DAYS = ["All", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ALL_WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ClassesManagement() {
  const {
    classes,
    members,
    staff,
    settings,
    addClass,
    updateClass,
    deleteClass,
    bookClass,
    cancelClassBooking,
  } = useGymStore();

  const [selectedDay, setSelectedDay] = useState("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);

  // Assign Member Dialog State
  const [assigningClass, setAssigningClass] = useState<GymClass | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState("");

  // Share / Message Dialog State
  const [messagingClass, setMessagingClass] = useState<GymClass | null>(null);
  const [messageTargetMemberId, setMessageTargetMemberId] = useState("");

  // Create / Edit Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Strength" as GymClass["category"],
    trainer: staff[0]?.name || "Coach Alex",
    time: "07:00 AM",
    durationMinutes: 45,
    days: ["Mon", "Wed", "Fri"],
    capacity: 15,
    room: "Studio A (Main)",
    intensity: "Medium" as GymClass["intensity"],
  });

  const filteredClasses = classes.filter((c) => {
    if (selectedDay === "All") return true;
    return c.days.includes(selectedDay);
  });

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      category: "Strength",
      trainer: staff[0]?.name || "Coach Alex",
      time: "07:00 AM",
      durationMinutes: 45,
      days: ["Mon", "Wed", "Fri"],
      capacity: 15,
      room: "Studio A (Main)",
      intensity: "Medium",
    });
    setEditingClass(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (cls: GymClass) => {
    setFormData({
      title: cls.title,
      category: cls.category,
      trainer: cls.trainer,
      time: cls.time,
      durationMinutes: cls.durationMinutes,
      days: cls.days,
      capacity: cls.capacity,
      room: cls.room,
      intensity: cls.intensity,
    });
    setEditingClass(cls);
    setIsCreateModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter a class title");
      return;
    }
    if (formData.days.length === 0) {
      toast.error("Please select at least one day for the class");
      return;
    }

    if (editingClass) {
      updateClass(editingClass.id, formData);
      toast.success(`Updated ${formData.title}!`);
    } else {
      addClass(formData);
      toast.success(`Scheduled new class: ${formData.title}!`);
    }

    setIsCreateModalOpen(false);
  };

  const handleDeleteClass = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete ${title}?`)) {
      deleteClass(id);
      toast.info(`Deleted ${title}`);
    }
  };

  const handleToggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleAssignMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningClass || !selectedMemberId) return;

    bookClass(assigningClass.id, selectedMemberId);
    const memberObj = members.find((m) => m.id === selectedMemberId);
    toast.success(`Assigned ${memberObj?.name || "Member"} to ${assigningClass.title}!`);
    setAssigningClass(null);
    setSelectedMemberId("");
  };

  const handleRemoveBooking = (classId: string, memberId: string) => {
    cancelClassBooking(classId, memberId);
    toast.info("Removed member reservation");
  };

  const handleSendMessageToMember = (cls: GymClass, member: (typeof members)[0]) => {
    const text = encodeURIComponent(
      `Hi ${member.name}, you are confirmed for ${cls.title} at ${settings.name}! 🏋️‍♂️\n\n` +
      `📅 Days: ${cls.days.join(", ")}\n` +
      `⏰ Time: ${cls.time} (${cls.durationMinutes} mins)\n` +
      `📍 Location: ${cls.room}\n` +
      `👤 Coach: ${cls.trainer}\n\n` +
      `Please arrive 5 mins before session. Have a great workout!`
    );
    const cleanPhone = member.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Dispatched class schedule to ${member.name}`);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messagingClass || !messageTargetMemberId) return;
    const targetMember = members.find((m) => m.id === messageTargetMemberId);
    if (targetMember) {
      handleSendMessageToMember(messagingClass, targetMember);
    }
    setMessagingClass(null);
    setMessageTargetMemberId("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Studio Classes & Schedules</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {classes.length} Active Sessions
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Schedule studio classes, assign members, and send direct WhatsApp booking messages.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Schedule New Class</span>
        </button>
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
      {filteredClasses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-4">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">No Studio Classes Scheduled</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Add your first group workout or studio session to start enrolling members and dispatching booking schedules.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" /> Schedule First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClasses.map((cls) => {
            const bookedCount = cls.enrolledMembers.length;
            const isFull = bookedCount >= cls.capacity;

            return (
              <div
                key={cls.id}
                className="rounded-2xl border border-border bg-surface p-6 space-y-4 hover:border-foreground/40 transition shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                          {cls.category}
                        </span>
                        <span className="text-xs text-muted-foreground">{cls.room}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-canvas border border-border text-muted-foreground">
                          {cls.intensity}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-foreground mt-1.5">{cls.title}</h3>
                      <p className="text-xs text-muted-foreground">Coach: <b>{cls.trainer}</b></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-emerald">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{cls.time}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{cls.durationMinutes} mins</span>
                      </div>

                      <div className="flex items-center gap-1 pl-2 border-l border-border">
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                          title="Edit Class Details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClass(cls.id, cls.title)}
                          className="p-1.5 rounded-lg border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 transition"
                          title="Delete Class"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
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

                  {/* Enrolled Roster & 1-Click Member Message */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">Enrolled Members ({bookedCount})</span>
                      {members.length > 0 && (
                        <button
                          onClick={() => {
                            setMessagingClass(cls);
                            setMessageTargetMemberId(members[0]?.id || "");
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald hover:underline"
                        >
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp Schedule</span>
                        </button>
                      )}
                    </div>

                    {bookedCount === 0 ? (
                      <p className="text-xs text-muted-foreground italic py-1">No members assigned yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {cls.enrolledMembers.map((mId) => {
                          const mObj = members.find((m) => m.id === mId);
                          return (
                            <span
                              key={mId}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1 text-xs"
                            >
                              <span className="font-medium">{mObj?.name || "Member"}</span>
                              {mObj && (
                                <button
                                  onClick={() => handleSendMessageToMember(cls, mObj)}
                                  className="text-emerald hover:text-emerald-soft transition"
                                  title={`Send WhatsApp confirmation to ${mObj.name}`}
                                >
                                  <MessageCircle className="h-3 w-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleRemoveBooking(cls.id, mId)}
                                className="text-muted-foreground hover:text-rose-500 transition"
                                title="Remove from class"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action Dock: Assign Member Button */}
                <div className="pt-4 border-t border-border flex items-center gap-2">
                  <button
                    onClick={() => {
                      setAssigningClass(cls);
                      setSelectedMemberId(members[0]?.id || "");
                    }}
                    disabled={isFull || members.length === 0}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      isFull || members.length === 0
                        ? "bg-muted text-muted-foreground cursor-not-allowed"
                        : "bg-foreground text-background hover:opacity-90 shadow-xs"
                    }`}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{isFull ? "Class Full" : "+ Assign Member"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 1. Schedule / Edit Class Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-emerald" />
                <h3 className="text-sm font-bold text-foreground">
                  {editingClass ? `Edit Class: ${editingClass.title}` : "Schedule New Studio Class"}
                </h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Class Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Conditioning & Functional HIIT"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as GymClass["category"] })
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald"
                  >
                    <option value="Strength">Strength & Hypertrophy</option>
                    <option value="HIIT">HIIT & Conditioning</option>
                    <option value="Yoga">Yoga & Mobility</option>
                    <option value="Spin">Spin & Cardio</option>
                    <option value="CrossFit">CrossFit & Functional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Trainer / Coach</label>
                  <select
                    value={formData.trainer}
                    onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald"
                  >
                    {staff.length > 0 ? (
                      staff.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name} ({s.role})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Coach Alex">Coach Alex</option>
                        <option value="Coach Vikram">Coach Vikram</option>
                        <option value="Coach Elena">Coach Elena</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Days Selector */}
              <div>
                <label className="block text-muted-foreground mb-1.5 font-semibold">
                  Scheduled Days of Week *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_WEEK_DAYS.map((day) => {
                    const isSelected = formData.days.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                          isSelected
                            ? "bg-foreground text-background border-foreground shadow-xs"
                            : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Time</label>
                  <input
                    type="text"
                    required
                    placeholder="07:00 AM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Max Capacity</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs font-mono text-foreground outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Studio / Room</label>
                  <input
                    type="text"
                    placeholder="Studio A"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground mb-1 font-semibold">Intensity Level</label>
                  <select
                    value={formData.intensity}
                    onChange={(e) =>
                      setFormData({ ...formData, intensity: e.target.value as GymClass["intensity"] })
                    }
                    className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs text-foreground outline-none focus:border-emerald"
                  >
                    <option value="All Levels">All Levels Welcome</option>
                    <option value="Medium">Medium Intensity</option>
                    <option value="High">High Intensity (Advanced)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border text-xs font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 shadow-xs"
                >
                  {editingClass ? "Save Changes" : "Schedule Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Assign Member Modal */}
      {assigningClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-emerald" />
                <h3 className="text-sm font-bold">Assign Member to {assigningClass.title}</h3>
              </div>
              <button onClick={() => setAssigningClass(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAssignMember} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Select Member</label>
                <select
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.plan} · {m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-canvas border border-border space-y-1">
                <p className="font-semibold text-foreground">{assigningClass.title}</p>
                <p className="text-muted-foreground text-[11px]">
                  {assigningClass.days.join(", ")} · {assigningClass.time} ({assigningClass.durationMinutes} mins)
                </p>
                <p className="text-muted-foreground text-[11px]">Coach: {assigningClass.trainer} · Room: {assigningClass.room}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setAssigningClass(null)}
                  className="px-3 py-1.5 rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-foreground text-background font-semibold"
                >
                  Confirm & Assign Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Send WhatsApp Schedule to Member Dialog */}
      {messagingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-emerald" />
                <h3 className="text-sm font-bold">Dispatch WhatsApp Schedule</h3>
              </div>
              <button onClick={() => setMessagingClass(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground mb-1 font-semibold">Select Member to Message</label>
                <select
                  value={messageTargetMemberId}
                  onChange={(e) => setMessageTargetMemberId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs outline-none focus:border-emerald"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-canvas border border-border space-y-1 text-muted-foreground text-[11px]">
                <p className="font-semibold text-foreground">Message Preview:</p>
                <p>
                  "Hi [Member], you are confirmed for <b>{messagingClass.title}</b> at {settings.name}! 🏋️‍♂️ Days: {messagingClass.days.join(", ")} at {messagingClass.time} with Coach {messagingClass.trainer}."
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setMessagingClass(null)}
                  className="px-3 py-1.5 rounded-lg border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald text-white font-semibold hover:opacity-90"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Send WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
