import React, { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building,
  Save,
  Upload,
  Trash2,
  Image,
  CreditCard,
  Layers,
  Globe,
  Clock,
  Phone,
  Mail,
  FileText,
  MapPin,
  CheckCircle2,
  Database,
  Download,
  UploadCloud,
  RefreshCw,
  Plus,
  Edit2,
  X,
  Share2,
  Shield,
  Instagram,
  Facebook,
} from "lucide-react";
import { useGymStore, MembershipPlan } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  component: BusinessSettingsPage,
});

function BusinessSettingsPage() {
  const {
    settings,
    updateSettings,
    updateGymLogo,
    removeGymLogo,
    addPlan,
    updatePlan,
    deletePlan,
    exportData,
    importData,
    resetToDefaultData,
    lastSaved,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"profile" | "plans" | "billing" | "backup">("profile");

  // Profile Form State
  const [gymName, setGymName] = useState(settings.name);
  const [ownerName, setOwnerName] = useState(settings.ownerName || "Karan Johar");
  const [location, setLocation] = useState(settings.location);
  const [address, setAddress] = useState(settings.address || "");
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber || "");
  const [operatingHours, setOperatingHours] = useState(settings.operatingHours || "");
  const [upiId, setUpiId] = useState(settings.upiId || "");
  const [instagram, setInstagram] = useState(settings.socialLinks?.instagram || "");
  const [facebook, setFacebook] = useState(settings.socialLinks?.facebook || "");
  const [website, setWebsite] = useState(settings.socialLinks?.website || "");
  const [googleMaps, setGoogleMaps] = useState(settings.socialLinks?.googleMaps || "");

  // Invoicing & Tax State
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix || "PEAK-2026-");
  const [taxRatePercent, setTaxRatePercent] = useState(settings.taxRatePercent || 18);

  // Plan Modal State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState(3000);
  const [planDuration, setPlanDuration] = useState(1);
  const [planType, setPlanType] = useState<MembershipPlan["type"]>("Standard");
  const [planPerks, setPlanPerks] = useState("Full gym floor access, Locker room & shower");

  // File Inputs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backupFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Logo Upload via FileReader
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo image size should be under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateGymLogo(base64);
        toast.success("Gym logo updated! Automatically synced to Header, Sidebar, and Invoices.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      name: gymName.trim(),
      ownerName: ownerName.trim(),
      location: location.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      gstNumber: gstNumber.trim(),
      operatingHours: operatingHours.trim(),
      upiId: upiId.trim(),
      socialLinks: {
        instagram: instagram.trim(),
        facebook: facebook.trim(),
        website: website.trim(),
        googleMaps: googleMaps.trim(),
      },
    });
    toast.success("Business profile details updated successfully!");
  };

  const handleSaveBilling = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      invoicePrefix: invoicePrefix.trim(),
      taxRatePercent: Number(taxRatePercent),
      upiId: upiId.trim(),
    });
    toast.success("Tax & invoicing preferences updated!");
  };

  // Plan CRUD Handlers
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanName("");
    setPlanPrice(3000);
    setPlanDuration(1);
    setPlanType("Standard");
    setPlanPerks("Full floor access, Locker storage");
    setIsPlanModalOpen(true);
  };

  const handleOpenEditPlan = (p: MembershipPlan) => {
    setEditingPlan(p);
    setPlanName(p.name);
    setPlanPrice(p.price);
    setPlanDuration(p.durationMonths);
    setPlanType(p.type);
    setPlanPerks(p.perks.join(", "));
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;

    const perksArray = planPerks
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingPlan) {
      updatePlan(editingPlan.id, {
        name: planName.trim(),
        price: Number(planPrice),
        durationMonths: Number(planDuration),
        type: planType,
        perks: perksArray,
      });
      toast.success(`Updated plan ${planName}!`);
    } else {
      addPlan({
        name: planName.trim(),
        price: Number(planPrice),
        durationMonths: Number(planDuration),
        type: planType,
        perks: perksArray,
      });
      toast.success(`Created plan ${planName}!`);
    }
    setIsPlanModalOpen(false);
  };

  const handleDeletePlan = (id: string, name: string) => {
    if (window.confirm(`Delete membership plan "${name}"?`)) {
      deletePlan(id);
      toast.success(`Deleted ${name}`);
    }
  };

  // Backup & Restore Handlers
  const handleDownloadBackup = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peakrep_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Database snapshot downloaded!");
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          toast.success("Database restored successfully!");
        } else {
          toast.error("Invalid database JSON file.");
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Business Profile & Settings</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Enterprise OS
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure gym identity, upload dynamic logos, manage pricing tiers, GST tax rules, and instant database backups.
          </p>
        </div>

        {lastSaved && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-surface border border-border px-3 py-1.5 rounded-xl font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald animate-pulse" />
            <span>Synced & Saved</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1 max-w-fit flex-wrap">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "profile"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span>Business Profile & Logo</span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "plans"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Membership Tiers ({settings.membershipPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "billing"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Tax & Invoicing</span>
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "backup"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Data Backup & Sync</span>
        </button>
      </div>

      {/* Tab 1: Business Profile & Logo Management */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Management Card */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Image className="h-4 w-4 text-emerald" />
              <span>Gym Brand Logo</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Upload your official gym logo. It will automatically propagate to the Top Header, Desktop Sidebar, Invoices, and Official Reports.
            </p>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border bg-canvas space-y-3">
              {settings.logoUrl ? (
                <div className="relative group">
                  <img
                    src={settings.logoUrl}
                    alt={settings.name}
                    className="h-28 w-28 rounded-2xl object-cover border border-border shadow-md"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="p-1.5 rounded-lg bg-surface text-foreground shadow hover:scale-105 transition"
                      title="Replace Logo"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={removeGymLogo}
                      className="p-1.5 rounded-lg bg-surface text-rose-500 shadow hover:scale-105 transition"
                      title="Delete Logo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-2xl bg-muted text-muted-foreground border border-border">
                  <Image className="h-8 w-8" />
                </div>
              )}

              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{settings.logoUrl ? "Replace Logo" : "Upload Logo"}</span>
                </button>
                {settings.logoUrl && (
                  <button
                    type="button"
                    onClick={removeGymLogo}
                    className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Business Information Form */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-surface p-6 shadow-2xs">
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground">Business Information</h3>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Gym Name *</label>
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Displayed in top header & app title</p>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Director / Owner Name *</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald font-mono"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Plot number, Street, Locality, City, State, PIN"
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">GST / Tax ID Number</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="29AABCU9603R1ZM"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="5:30 AM - 10:30 PM (Mon-Sat)"
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
              </div>

              {/* Social Media Links */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-foreground">Social & Map Presences</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Instagram URL (https://instagram.com/...)"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                  <input
                    type="text"
                    placeholder="Facebook URL (https://facebook.com/...)"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                  <input
                    type="text"
                    placeholder="Website URL (https://...)"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                  <input
                    type="text"
                    placeholder="Google Maps Link (https://maps.google.com/...)"
                    value={googleMaps}
                    onChange={(e) => setGoogleMaps(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Membership Plans Manager */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Active Membership Tiers & Pricing</h3>
            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {settings.membershipPlans.map((plan) => (
              <div
                key={plan.id}
                className="rounded-2xl border border-border bg-surface p-5 space-y-3 shadow-2xs hover:border-foreground/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                      {plan.type}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {plan.durationMonths} Month{plan.durationMonths > 1 ? "s" : ""}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-foreground mt-2">{plan.name}</h4>
                  <p className="text-xl font-bold font-mono text-emerald mt-1">
                    {settings.currencySymbol}{plan.price.toLocaleString("en-IN")}
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {plan.perks.map((perk, i) => (
                      <p key={i} className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald shrink-0" />
                        <span className="truncate">{perk}</span>
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => handleOpenEditPlan(plan)}
                    className="p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Edit Plan"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id, plan.name)}
                    className="p-1.5 rounded-lg border border-rose-500/30 hover:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                    title="Delete Plan"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Tax & Invoicing */}
      {activeTab === "billing" && (
        <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xs space-y-4">
          <form onSubmit={handleSaveBilling} className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
              Tax, GST & Invoicing Configuration
            </h3>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">UPI VPA Handle (for QR Payments)</label>
              <input
                type="text"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="gym@upi"
                className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  required
                  value={invoicePrefix}
                  onChange={(e) => setInvoicePrefix(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Standard GST Tax Rate (%)</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={28}
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Billing Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 4: Database Backup & Restore */}
      {activeTab === "backup" && (
        <div className="max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xs space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Database Backup & Real-Time Sync Hub</h3>
            <p className="text-xs text-muted-foreground">
              All member profiles, dues, payments, lockers, workouts, and settings are continuously synced. You can export complete offline JSON snapshots or restore across devices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-canvas p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <Download className="h-4 w-4 text-emerald" />
                <span>Export Full Backup</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Download a complete JSON database image containing all operational models.
              </p>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition shadow-xs"
              >
                Download JSON Snapshot
              </button>
            </div>

            <div className="rounded-xl border border-border bg-canvas p-5 space-y-3">
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="h-4 w-4 text-blue-500" />
                <span>Restore Backup</span>
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Upload and restore a previously saved JSON snapshot.
              </p>
              <input
                ref={backupFileInputRef}
                type="file"
                accept=".json"
                onChange={handleUploadBackup}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backupFileInputRef.current?.click()}
                className="w-full py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition"
              >
                Upload & Restore
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-foreground">Reset Test Environment</p>
              <p className="text-[11px] text-muted-foreground">Restore defaults with clean data</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset all operational models to clean default state?")) {
                  resetToDefaultData();
                  toast.success("Database restored to defaults.");
                }
              }}
              className="px-3.5 py-1.5 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition"
            >
              Reset Data
            </button>
          </div>
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
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
                  placeholder="e.g. Monthly Flex Pass"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Price ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald font-bold"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Duration (Months)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={36}
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono outline-none focus:border-emerald"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Plan Tier</label>
                <select
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value as any)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                >
                  <option value="Standard">Standard Pass</option>
                  <option value="Premium">Premium All-Access</option>
                  <option value="PT Package">Personal Training 1-on-1</option>
                  <option value="VIP Pass">Executive VIP Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Perks (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="Full floor access, Shower, Locker"
                  value={planPerks}
                  onChange={(e) => setPlanPerks(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
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
                  className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}