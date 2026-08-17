import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Plus,
  Search,
  MessageCircle,
  UserCheck,
  Calendar,
  Phone,
  Mail,
  ArrowRight,
  TrendingUp,
  Flame,
  CheckCircle2,
  X,
  Clock,
  Sparkles,
} from "lucide-react";
import { useGymStore, Lead, LeadStage } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/leads")({
  component: LeadsCRM,
});

const STAGES: LeadStage[] = [
  "Inquiry",
  "Trial Booked",
  "Trial Completed",
  "Offer Sent",
  "Won",
];

function LeadsCRM() {
  const {
    leads,
    addLead,
    updateLeadStage,
    convertLeadToMember,
    settings,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("All");
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);
  const [convertPlan, setConvertPlan] = useState(settings.membershipPlans[0]?.name || "Monthly Flex");

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [source, setSource] = useState<"Walk-In" | "Instagram" | "Google Maps" | "Referral" | "Website">("Walk-In");
  const [goal, setGoal] = useState("");
  const [notes, setNotes] = useState("");

  const filteredLeads = leads.filter((l) => {
    const matches =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.source.toLowerCase().includes(search.toLowerCase());
    if (!matches) return false;
    if (selectedStage === "All") return true;
    return l.stage === selectedStage;
  });

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addLead({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      source,
      stage: "Inquiry",
      fitnessGoal: goal.trim() || "General Fitness",
      notes: notes.trim(),
    });

    toast.success(`Added new prospect lead: ${name}!`);
    setIsAddLeadOpen(false);
    setName("");
    setPhone("+91 ");
    setEmail("");
    setGoal("");
    setNotes("");
  };

  const handleSendWhatsApp = (lead: Lead) => {
    const text = encodeURIComponent(
      `Hi ${lead.name}, greetings from ${settings.name}! Thank you for your inquiry regarding our gym memberships & trial workouts. Would you like to schedule your free consultation pass today?`
    );
    const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Opened WhatsApp chat for ${lead.name}`);
  };

  const handleConfirmConvert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertingLead) return;

    convertLeadToMember(convertingLead.id, convertPlan, 0);
    toast.success(`🎉 Converted ${convertingLead.name} into an active ${convertPlan} gym member!`);
    setConvertingLead(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Prospect & Trial CRM Funnel</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length} Active Leads
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Track walk-in inquiries, Instagram trial passes, and convert prospects to paying members in 1 click.
          </p>
        </div>

        <button
          onClick={() => setIsAddLeadOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Prospect Lead
        </button>
      </div>

      {/* Funnel Stage Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {STAGES.map((st) => {
          const count = leads.filter((l) => l.stage === st).length;
          return (
            <div
              key={st}
              onClick={() => setSelectedStage(selectedStage === st ? "All" : st)}
              className={`cursor-pointer rounded-2xl border p-4 transition ${
                selectedStage === st
                  ? "border-foreground bg-foreground text-background shadow-xs"
                  : "border-border bg-surface hover:bg-muted/50"
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{st}</p>
              <p className="mt-1 font-mono text-2xl font-bold">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search leads by name, phone or source..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm outline-none focus:border-emerald"
        />
      </div>

      {/* Leads Pipeline Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="rounded-2xl border border-border bg-surface p-5 space-y-4 hover:border-foreground/40 transition shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{lead.name}</h3>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {lead.source}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{lead.phone}</p>
              </div>

              <select
                value={lead.stage}
                onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                className="rounded-lg border border-border bg-canvas px-2 py-1 text-xs font-semibold outline-none focus:border-emerald"
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-border bg-canvas p-3 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Goal:</span>
                <span className="font-semibold text-foreground truncate max-w-[160px]">{lead.fitnessGoal}</span>
              </div>
              {lead.trialDate && (
                <div className="flex justify-between text-emerald font-medium">
                  <span>Trial Slot:</span>
                  <span>{lead.trialDate}</span>
                </div>
              )}
              {lead.notes && (
                <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                  {lead.notes}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
              <button
                onClick={() => handleSendWhatsApp(lead)}
                className="flex-1 py-1.5 rounded-xl border border-border bg-canvas text-xs font-medium hover:bg-muted transition flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="h-3.5 w-3.5 text-emerald" />
                <span>WhatsApp</span>
              </button>

              {lead.stage !== "Won" ? (
                <button
                  onClick={() => setConvertingLead(lead)}
                  className="flex-1 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-emerald" />
                  <span>Convert Member</span>
                </button>
              ) : (
                <span className="flex-1 text-center text-xs font-semibold text-emerald">
                  ✓ Active Member
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Convert Lead to Member Modal */}
      {convertingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">Convert {convertingLead.name} to Member</h3>
              <button onClick={() => setConvertingLead(null)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmConvert} className="space-y-4 text-xs">
              <div>
                <label className="block text-muted-foreground font-medium mb-1">Select Membership Plan</label>
                <select
                  value={convertPlan}
                  onChange={(e) => setConvertPlan(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                >
                  {settings.membershipPlans.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({settings.currencySymbol}{p.price.toLocaleString("en-IN")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-border bg-canvas p-3 space-y-1">
                <p className="font-semibold text-foreground">{convertingLead.name}</p>
                <p className="text-muted-foreground">{convertingLead.phone} · {convertingLead.email || "No email"}</p>
                <p className="text-[11px] text-muted-foreground">Goal: {convertingLead.fitnessGoal}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setConvertingLead(null)}
                  className="px-4 py-2 rounded-xl border border-border"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  Enroll & Activate Membership
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {isAddLeadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">Add New Prospect Lead</h3>
              <button onClick={() => setIsAddLeadOpen(false)} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Devendra Singhania"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Source</label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Walk-In">Walk-In</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Google Maps">Google Maps</option>
                    <option value="Referral">Referral</option>
                    <option value="Website">Website</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Fitness Goal</label>
                <input
                  type="text"
                  placeholder="e.g. Fat loss, Muscle Gain, Rehab"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Inquiry Notes</label>
                <textarea
                  rows={2}
                  placeholder="Details about consultation..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-2.5 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddLeadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
