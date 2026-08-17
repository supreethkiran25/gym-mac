import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  Send,
  MessageCircle,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Filter,
  Sparkles,
} from "lucide-react";
import { useGymStore, ReminderItem } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reminders")({
  component: RemindersHub,
});

function RemindersHub() {
  const { reminders, sendReminder, sendAllReminders, settings } = useGymStore();
  const [filterChannel, setFilterChannel] = useState<string>("All");

  const pendingCount = reminders.filter((r) => r.status === "Pending").length;

  const filteredReminders = reminders.filter((r) => {
    if (filterChannel === "All") return true;
    return r.channel === filterChannel;
  });

  const handleSendSingle = (r: ReminderItem) => {
    sendReminder(r.id);
    if (r.channel === "WhatsApp") {
      const text = encodeURIComponent(
        settings.reminderTemplateWhatsApp
          .replace("{name}", r.name)
          .replace("{reason}", r.reason)
          .replace("{due}", `${settings.currencySymbol}2,800`)
          .replace("{gym}", settings.name)
      );
      const cleanPhone = r.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    }
    toast.success(`Sent ${r.channel} reminder to ${r.name}!`);
  };

  const handleSendAll = () => {
    sendAllReminders();
    toast.success(`Dispatched ${pendingCount} automated payment and renewal reminders!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Smart Communications Hub</h1>
            <span className="rounded-full bg-warn/15 text-warn px-2.5 py-0.5 text-xs font-semibold">
              {pendingCount} Pending Nudges
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Multi-channel automated alerts across WhatsApp, SMS, and Email for renewals and unpaid dues.
          </p>
        </div>

        <button
          onClick={handleSendAll}
          disabled={pendingCount === 0}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition shadow-xs ${
            pendingCount === 0
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-foreground text-background hover:opacity-90"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Batch Send All ({pendingCount})</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(["All", "WhatsApp", "SMS", "Email"] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => setFilterChannel(ch)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition border ${
              filterChannel === ch
                ? "bg-foreground text-background border-foreground shadow-xs"
                : "border-border bg-surface text-muted-foreground hover:text-foreground"
            }`}
          >
            {ch}
          </button>
        ))}
      </div>

      {/* Reminders Queue Table / Cards */}
      <div className="rounded-2xl border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-border bg-canvas text-left uppercase text-muted-foreground font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Reason / Trigger</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Scheduled Slot</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReminders.map((r) => (
                <tr key={r.id} className="hover:bg-muted/40 transition">
                  <td className="py-3.5 px-4 font-semibold text-foreground">{r.name}</td>
                  <td className="py-3.5 px-4 font-medium text-foreground">{r.reason}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-canvas border border-border px-2.5 py-1 text-xs font-medium">
                      {r.channel === "WhatsApp" && <MessageCircle className="h-3.5 w-3.5 text-emerald" />}
                      {r.channel === "SMS" && <Smartphone className="h-3.5 w-3.5 text-blue-500" />}
                      {r.channel === "Email" && <Mail className="h-3.5 w-3.5 text-amber-500" />}
                      <span>{r.channel}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{r.time}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        r.status === "Sent"
                          ? "bg-emerald-soft text-accent-foreground"
                          : "bg-warn/15 text-warn"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {r.status === "Pending" ? (
                      <button
                        onClick={() => handleSendSingle(r)}
                        className="inline-flex items-center gap-1 text-xs font-semibold rounded-lg bg-foreground text-background px-3 py-1 hover:opacity-90 transition"
                      >
                        <Send className="h-3 w-3" />
                        <span>Send Now</span>
                      </button>
                    ) : (
                      <span className="text-emerald text-xs font-medium inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}