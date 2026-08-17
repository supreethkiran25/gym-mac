import React, { useState, useEffect } from "react";
import { X, Settings as SettingsIcon, Building, ShieldCheck, MessageSquare, Tag } from "lucide-react";
import { useGymStore } from "../lib/gym-store";
import { toast } from "sonner";

export function SettingsModal() {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    activeSettingsTab,
    setActiveSettingsTab,
    settings,
    updateSettings,
  } = useGymStore();

  const [gymName, setGymName] = useState(settings.name);
  const [location, setLocation] = useState(settings.location);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [waTemplate, setWaTemplate] = useState(settings.reminderTemplateWhatsApp);
  const [smsTemplate, setSmsTemplate] = useState(settings.reminderTemplateSMS);
  const [plans, setPlans] = useState(settings.membershipPlans);

  useEffect(() => {
    setGymName(settings.name);
    setLocation(settings.location);
    setPhone(settings.phone);
    setEmail(settings.email);
    setWaTemplate(settings.reminderTemplateWhatsApp);
    setSmsTemplate(settings.reminderTemplateSMS);
    setPlans(settings.membershipPlans);
  }, [settings]);

  if (!isSettingsOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: gymName,
      location,
      phone,
      email,
    });
    toast.success("Gym Profile updated successfully!");
    setIsSettingsOpen(false);
  };

  const handleSaveTemplates = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      reminderTemplateWhatsApp: waTemplate,
      reminderTemplateSMS: smsTemplate,
    });
    toast.success("Reminder templates saved!");
    setIsSettingsOpen(false);
  };

  const handlePlanPriceChange = (index: number, newPrice: number) => {
    const updated = [...plans];
    updated[index] = { ...updated[index], price: newPrice };
    setPlans(updated);
  };

  const handleSavePlans = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ membershipPlans: plans });
    toast.success("Membership plans & pricing updated!");
    setIsSettingsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-soft text-accent-foreground">
              <SettingsIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Settings & Preferences</h2>
              <p className="text-xs text-muted-foreground">Manage your gym profile and options</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex border-b border-border bg-canvas px-6">
          {[
            { id: "profile", label: "Gym Profile", icon: Building },
            { id: "staff", label: "Staff & Access", icon: ShieldCheck },
            { id: "templates", label: "Reminder Copy", icon: MessageSquare },
            { id: "plans", label: "Membership Plans", icon: Tag },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSettingsTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition ${
                  active
                    ? "border-emerald text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-sm">
          {activeSettingsTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Gym / Studio Name
                </label>
                <input
                  type="text"
                  required
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Location / City & Branch
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Support Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-md border border-border bg-canvas px-4 py-2 text-sm font-medium hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeSettingsTab === "staff" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Active Staff Members and Permissions</p>
              <div className="divide-y divide-border rounded-lg border border-border bg-canvas">
                {[
                  { name: "Karan Johar", role: "Owner / Admin", email: "karan@ironhouse.com" },
                  { name: "Siddharth Malhotra", role: "Head Trainer", email: "sid@ironhouse.com" },
                  { name: "Ananya Panday", role: "Front Desk Manager", email: "ananya@ironhouse.com" },
                ].map((s) => (
                  <div key={s.email} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-soft px-2.5 py-0.5 text-xs text-accent-foreground font-medium">
                      {s.role}
                    </span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toast.info("Staff invite feature triggered")}
                className="w-full rounded-md border border-dashed border-border py-2 text-center text-xs font-medium text-muted-foreground hover:border-emerald hover:text-foreground transition"
              >
                + Invite New Staff Member
              </button>
            </div>
          )}

          {activeSettingsTab === "templates" && (
            <form onSubmit={handleSaveTemplates} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  WhatsApp Reminder Template
                </label>
                <textarea
                  rows={3}
                  value={waTemplate}
                  onChange={(e) => setWaTemplate(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald text-xs font-mono"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Available tags: <code className="bg-muted px-1 rounded">&#123;name&#125;</code>, <code className="bg-muted px-1 rounded">&#123;reason&#125;</code>, <code className="bg-muted px-1 rounded">&#123;due&#125;</code>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  SMS Alert Template
                </label>
                <textarea
                  rows={3}
                  value={smsTemplate}
                  onChange={(e) => setSmsTemplate(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-md border border-border bg-canvas px-4 py-2 text-sm font-medium hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
                >
                  Save Templates
                </button>
              </div>
            </form>
          )}

          {activeSettingsTab === "plans" && (
            <form onSubmit={handleSavePlans} className="space-y-4">
              <div className="space-y-3">
                {plans.map((p, idx) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-canvas p-3">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.durationMonths} month duration</p>
                    </div>
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-xs text-muted-foreground">{settings.currencySymbol}</span>
                      <input
                        type="number"
                        min="0"
                        value={p.price}
                        onChange={(e) => handlePlanPriceChange(idx, parseFloat(e.target.value) || 0)}
                        className="w-24 rounded border border-border bg-surface px-2 py-1 text-right text-sm font-semibold outline-none focus:border-emerald"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-md border border-border bg-canvas px-4 py-2 text-sm font-medium hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
                >
                  Save Pricing
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
