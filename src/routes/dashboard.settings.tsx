import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Settings,
  Building,
  DollarSign,
  Bell,
  Clock,
  Shield,
  Save,
  Check,
  Layers,
  Plus,
  Trash2,
  Edit2,
  Moon,
  Sun,
  Download,
  RotateCcw,
  MessageCircle,
  Smartphone,
  CheckCircle2,
  X,
} from "lucide-react";
import { useGymStore, MembershipPlan } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: GymSettingsPage,
});

function GymSettingsPage() {
  const {
    settings,
    updateSettings,
    addPlan,
    updatePlan,
    deletePlan,
    resetToDefaultData,
    theme,
    toggleTheme,
    setTheme,
    members,
    payments,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"profile" | "plans" | "templates" | "tax" | "theme" | "backup">("profile");

  // Profile Form States
  const [name, setName] = useState(settings.name);
  const [location, setLocation] = useState(settings.location);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [operatingHours, setOperatingHours] = useState(settings.operatingHours);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [upiId, setUpiId] = useState(settings.upiId || "ironhousegym@icici");
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || "INV-2026-");
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent || 18);
  const [autoSendWhatsAppOnRenewal, setAutoSendWhatsAppOnRenewal] = useState(settings.autoSendWhatsAppOnRenewal ?? true);

  // Template States
  const [whatsappReminder, setWhatsappReminder] = useState(settings.reminderTemplateWhatsApp);
  const [smsReminder, setSmsReminder] = useState(settings.reminderTemplateSMS);
  const [whatsappWelcome, setWhatsappWelcome] = useState(settings.welcomeTemplateWhatsApp || "Welcome to {gym}, {name}! Your {plan} pass is active.");

  // Plan CRUD States
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(2800);
  const [planMonths, setPlanMonths] = useState(1);
  const [planType, setPlanType] = useState<"Standard" | "Premium" | "PT Package" | "VIP Pass">("Standard");
  const [planPerksText, setPlanPerksText] = useState("Full gym floor access, Locker & Shower");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name,
      location,
      phone,
      email,
      currencySymbol,
      operatingHours,
      gstNumber,
      upiId,
      invoicePrefix,
      taxRatePercent: Number(taxRatePercent),
      autoSendWhatsAppOnRenewal,
      reminderTemplateWhatsApp: whatsappReminder,
      reminderTemplateSMS: smsReminder,
      welcomeTemplateWhatsApp: whatsappWelcome,
    });
    toast.success("Gym settings and preferences saved successfully!");
  };

  const handleOpenAddPlan = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanPrice(3500);
    setPlanMonths(1);
    setPlanType("Standard");
    setPlanPerksText("Full gym floor access, Locker & shower");
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (p: MembershipPlan) => {
    setEditingPlan(p);
    setPlanName(p.name);
    setPlanPrice(p.price);
    setPlanMonths(p.durationMonths);
    setPlanType(p.type);
    setPlanPerksText(p.perks.join(", "));
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    const perksArray = planPerksText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name: planName.trim(),
        price: Number(planPrice),
        durationMonths: Number(planMonths),
        type: planType,
        perks: perksArray,
      });
      toast.success(`Updated ${planName} plan!`);
    } else {
      addPlan({
        name: planName.trim(),
        price: Number(planPrice),
        durationMonths: Number(planMonths),
        type: planType,
        perks: perksArray,
      });
      toast.success(`Created new plan: ${planName}!`);
    }
    setIsPlanModalOpen(false);
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (window.confirm(`Delete the "${name}" membership plan?`)) {
      deletePlan(id);
      toast.success(`Deleted plan: ${name}`);
    }
  };

  const handleExportData = () => {
    const backupData = {
      settings,
      members,
      payments,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const a = document.createElement("a");
    a.href = jsonStr;
    a.download = `gym_flow_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    toast.success("Downloaded complete database snapshot!");
  };

  const handleResetData = () => {
    if (window.confirm("Reset all members, payments, and assets to default demo state?")) {
      resetToDefaultData();
      toast.success("Reset system data to defaults.");
    }
  };

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gym Settings & Brand Studio</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              v6.0 SaaS
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure business profiles, custom membership pricing tiers, WhatsApp templates, and tax details.
          </p>
        </div>

        {/* Global Dark / Light Mode Toggle Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1">
          <button
            onClick={() => setTheme("light")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              theme === "light"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span>Light</span>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              theme === "dark"
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border">
        {[
          { id: "profile", label: "Business Profile", icon: Building },
          { id: "plans", label: "Membership Plans", icon: Layers },
          { id: "templates", label: "WhatsApp & SMS", icon: Bell },
          { id: "tax", label: "GST & Invoicing", icon: DollarSign },
          { id: "theme", label: "Theme & Appearance", icon: Sun },
          { id: "backup", label: "Data Backup", icon: Download },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? "bg-foreground text-background shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 1. Facility & Business Profile Tab */}
      {activeTab === "profile" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Building className="h-4 w-4 text-emerald" />
              <h2 className="text-sm font-semibold">Facility & Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Gym Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Location / City Branch</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Support Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">UPI Merchant ID (VPA for QR Pay)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Profile Details</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. Membership Plans Manager Tab */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Custom Membership Plans & Pricing Tiers</h2>
            <button
              onClick={handleOpenAddPlan}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {settings.membershipPlans.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-surface p-5 space-y-4 hover:border-foreground/40 transition shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {p.type}
                    </span>
                    <span className="font-mono text-xl font-bold text-foreground">
                      {settings.currencySymbol}{p.price.toLocaleString("en-IN")}
                      <span className="text-xs text-muted-foreground font-normal"> / {p.durationMonths} mo</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-foreground">{p.name}</h3>

                  <ul className="space-y-1 text-xs text-muted-foreground pt-1">
                    {p.perks.map((perk, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald shrink-0" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {p.activeCount} active subscribers
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditPlan(p)}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition"
                      title="Edit Plan"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(p.id, p.name)}
                      className="p-1.5 rounded-lg border border-border hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition"
                      title="Delete Plan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. WhatsApp & SMS Automation Templates Tab */}
      {activeTab === "templates" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MessageCircle className="h-4 w-4 text-emerald" />
              <h2 className="text-sm font-semibold">Automated WhatsApp & SMS Messaging Templates</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Dynamic placeholders: <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{`{name}`}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{`{gym}`}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{`{due}`}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{`{reason}`}</code>, <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px]">{`{plan}`}</code>.
            </p>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  WhatsApp Overdue & Renewal Reminder Template
                </label>
                <textarea
                  rows={3}
                  value={whatsappReminder}
                  onChange={(e) => setWhatsappReminder(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-3 font-mono text-xs leading-relaxed outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  WhatsApp New Member Welcome Nudge
                </label>
                <textarea
                  rows={2}
                  value={whatsappWelcome}
                  onChange={(e) => setWhatsappWelcome(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-3 font-mono text-xs leading-relaxed outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">
                  SMS Urgent Renewal Alert Template
                </label>
                <textarea
                  rows={2}
                  value={smsReminder}
                  onChange={(e) => setSmsReminder(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-3 font-mono text-xs leading-relaxed outline-none focus:border-emerald"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Message Templates</span>
            </button>
          </div>
        </form>
      )}

      {/* 4. GST & Invoicing Tab */}
      {activeTab === "tax" && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <DollarSign className="h-4 w-4 text-emerald" />
              <h2 className="text-sm font-semibold">Tax Compliance & Invoice Numbering</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-muted-foreground mb-1">GSTIN Tax Registration ID</label>
                <input
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">GST Tax Rate (%)</label>
                <input
                  type="number"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted-foreground mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-6 py-2.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save Invoicing Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* 5. Theme & Appearance Tab */}
      {activeTab === "theme" && (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-semibold">Interface Theme & Visual Appearance</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select your preferred visual mode for front-desk display screens.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dark Mode Tile */}
            <div
              onClick={() => setTheme("dark")}
              className={`cursor-pointer rounded-2xl border p-5 space-y-3 transition ${
                theme === "dark"
                  ? "border-emerald bg-emerald-soft/10 ring-2 ring-emerald"
                  : "border-border bg-surface hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-emerald" />
                  <span className="font-bold text-sm">Onyx Dark Mode (Recommended)</span>
                </div>
                {theme === "dark" && <Check className="h-4 w-4 text-emerald" />}
              </div>
              <p className="text-xs text-muted-foreground">
                High-contrast OLED dark theme engineered for modern fitness dashboards and front-desk tablets.
              </p>
            </div>

            {/* Light Mode Tile */}
            <div
              onClick={() => setTheme("light")}
              className={`cursor-pointer rounded-2xl border p-5 space-y-3 transition ${
                theme === "light"
                  ? "border-emerald bg-emerald-soft/10 ring-2 ring-emerald"
                  : "border-border bg-surface hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span className="font-bold text-sm">Editorial Light Mode</span>
                </div>
                {theme === "light" && <Check className="h-4 w-4 text-emerald" />}
              </div>
              <p className="text-xs text-muted-foreground">
                Clean canvas aesthetic with crisp typography for brightly lit reception desks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Data Backup & Reset Tab */}
      {activeTab === "backup" && (
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-2xs">
          <div>
            <h2 className="text-sm font-semibold">Database Management & Backup Snapshot</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Export your gym data or reset to default demo environment.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-border bg-canvas space-y-3">
              <h3 className="text-xs font-bold text-foreground">Export JSON Backup</h3>
              <p className="text-xs text-muted-foreground">
                Download an offline backup of all member records, payments, staff, and configuration.
              </p>
              <button
                onClick={handleExportData}
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
              >
                <Download className="h-4 w-4" />
                <span>Export Backup File</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
              <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400">Reset Demo Data</h3>
              <p className="text-xs text-muted-foreground">
                Restore all mock gym members, classes, equipment, and finances to original demo state.
              </p>
              <button
                onClick={handleResetData}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 text-rose-600 dark:text-rose-400 px-4 py-2 text-xs font-semibold hover:bg-rose-500/10 transition"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Add / Edit Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold">
                {editingPlan ? `Edit ${editingPlan.name}` : "Create Membership Plan"}
              </h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 6-Month Transformation"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="12000"
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={60}
                    value={planMonths}
                    onChange={(e) => setPlanMonths(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Plan Type</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="PT Package">PT Package</option>
                  <option value="VIP Pass">VIP Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Perks & Inclusions (Comma separated)
                </label>
                <textarea
                  rows={2}
                  placeholder="Full gym floor access, Locker & shower, 1 Free PT assessment"
                  value={planPerksText}
                  onChange={(e) => setPlanPerksText(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-2.5 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90"
                >
                  {editingPlan ? "Save Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}