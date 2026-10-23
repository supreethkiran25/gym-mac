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
  Palette,
  RotateCw,
  Lock,
  Eye,
  EyeOff,
  Check,
  Zap,
} from "lucide-react";
import { useGymStore, MembershipPlan, BRAND_THEMES, BrandThemePreset } from "../lib/gym-store";
import { extractDominantColor } from "../lib/color-extractor";
import { toast } from "sonner";
import { RoleGuard } from "../components/dashboard/RoleGuard";

export const Route = createFileRoute("/dashboard/settings")({
  component: BusinessSettingsPageRoute,
  head: () => ({
    meta: [{ title: "Business Settings & Brand Studio | PEAKREP Gym OS" }],
  }),
});

function BusinessSettingsPageRoute() {
  return (
    <RoleGuard requiredRole="admin" moduleName="Business Settings & System Logs">
      <BusinessSettingsPage />
    </RoleGuard>
  );
}

function BusinessSettingsPage() {
  const {
    settings,
    updateSettings,
    updateGymLogo,
    removeGymLogo,
    setBrandColor,
    addPlan,
    updatePlan,
    deletePlan,
    exportData,
    importData,
    resetToDefaultData,
    lastSaved,
    systemLogs,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<
    "profile" | "brand" | "plans" | "billing" | "security" | "backup" | "audit"
  >("profile");

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

  // Brand Theme State
  const [customBrandColor, setCustomBrandColor] = useState(settings.brandColor || "#3b82f6");

  // Security Form State
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword || "admin123");
  const [showAdminPassword, setShowAdminPassword] = useState(false);

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

  // Handle Logo Upload via FileReader
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      toast.error("Logo image size should be under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        updateGymLogo(base64);
        toast.success("Gym logo uploaded! Automatically extracted dominant brand theme color.");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReExtractColor = async () => {
    if (!settings.logoUrl) {
      toast.info("Please upload a gym logo first to extract brand colors.");
      return;
    }
    try {
      const extractedHex = await extractDominantColor(settings.logoUrl);
      setBrandColor(extractedHex, "Extracted from Gym Logo");
      setCustomBrandColor(extractedHex);
      toast.success(`Color extracted accurately from logo: ${extractedHex}`);
    } catch (e) {
      toast.error("Failed to extract color from logo");
    }
  };

  // Automatically re-extract vibrant color if previously saved with a muddy/old color
  React.useEffect(() => {
    if (settings.logoUrl && (settings.brandColor === "#664751" || !settings.brandColor)) {
      extractDominantColor(settings.logoUrl).then((hex) => {
        if (hex && hex !== settings.brandColor) {
          setBrandColor(hex, "Extracted from Gym Logo");
          setCustomBrandColor(hex);
        }
      });
    }
  }, [settings.logoUrl, settings.brandColor]);

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

  const handleApplyPresetTheme = (preset: BrandThemePreset) => {
    setCustomBrandColor(preset.primary);
    setBrandColor(preset.primary, preset.name);
    toast.success(`Theme updated to "${preset.name}" (${preset.primary})`);
  };

  const handleApplyCustomColor = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandColor(customBrandColor, "Custom Brand Color");
    toast.success(`Custom brand color applied: ${customBrandColor}`);
  };

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      toast.error("Admin master password cannot be empty");
      return;
    }
    updateSettings({
      adminPassword: adminPassword.trim(),
    });
    toast.success("Admin Master Password updated successfully!");
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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Business Profile & System Settings
            </h1>
            <span className="rounded-full bg-brand-soft text-brand border border-brand/20 px-2.5 py-0.5 text-xs font-bold">
              Director Console
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Configure gym identity, dynamic logo color extraction, plan pricing, security passcodes,
            and backups.
          </p>
        </div>

        {lastSaved && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border px-3.5 py-1.5 rounded-xl font-mono shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Synced & Saved</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 rounded-2xl border border-border bg-card p-1.5 max-w-full flex-wrap shadow-2xs">
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "profile"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span>Business Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("brand")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "brand"
              ? "bg-brand text-white shadow-md shadow-brand/25 font-bold"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Palette className="h-3.5 w-3.5 text-brand" />
          <span>Brand Theme & Logo Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "security"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-amber-500" />
          <span>Security & Passcode</span>
        </button>

        <button
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "plans"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Membership Tiers ({settings.membershipPlans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "billing"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <CreditCard className="h-3.5 w-3.5" />
          <span>Tax & Invoicing</span>
        </button>

        <button
          onClick={() => setActiveTab("backup")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "backup"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span>Data Backup</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === "audit"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Shield className="h-3.5 w-3.5 text-brand" />
          <span>Audit Trail ({systemLogs.length})</span>
        </button>
      </div>

      {/* Tab: Brand Theme & Logo Studio (Audio Directive 4) */}
      {activeTab === "brand" && (
        <div className="space-y-6">
          {/* Logo & Auto-Extraction Banner */}
          <div className="rounded-3xl border border-brand/30 bg-gradient-to-r from-brand/10 via-card to-card p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/20 border border-brand/30 px-3 py-1 text-xs font-bold text-brand">
                  <Palette className="h-3.5 w-3.5" />
                  <span>Dynamic Color Adaptation Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  Gym Logo Dominant Color Extraction
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  When you upload your gym logo, PeakRep automatically extracts the dominant brand
                  color and recalculates glowing accents, soft tints, and button borders across your
                  entire dashboard.
                </p>
              </div>

              {/* Logo Preview & Action */}
              <div className="flex items-center gap-4 bg-background/70 border border-border p-4 rounded-2xl">
                {settings.logoUrl ? (
                  <div className="relative group">
                    <img
                      src={settings.logoUrl}
                      alt={settings.name}
                      className="h-20 w-20 rounded-2xl object-cover border border-border shadow-md"
                    />
                  </div>
                ) : (
                  <div className="grid h-20 w-20 place-items-center rounded-2xl bg-muted text-muted-foreground border border-border">
                    <Image className="h-8 w-8" />
                  </div>
                )}

                <div className="space-y-2">
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition-all"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>
                      {settings.logoUrl ? "Change Logo & Extract" : "Upload Logo & Extract"}
                    </span>
                  </button>
                  {settings.logoUrl && (
                    <button
                      type="button"
                      onClick={removeGymLogo}
                      className="block text-[11px] font-semibold text-rose-500 hover:underline"
                    >
                      Reset to Default Theme
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Theme Status */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Active Brand Color:</span>
                <div className="flex items-center gap-2 bg-background border border-border px-3 py-1.5 rounded-xl">
                  <span
                    className="h-4 w-4 rounded-full border border-white/20 shadow-xs"
                    style={{ backgroundColor: settings.brandColor || "#3b82f6" }}
                  />
                  <span className="font-mono font-bold text-foreground">
                    {settings.brandColor || "#3b82f6"}
                  </span>
                  <span className="text-muted-foreground">
                    ({settings.brandThemeName || "Custom"})
                  </span>
                </div>
              </div>

              {/* Generated Palette preview tokens */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-medium">Generated Tokens:</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: "var(--brand-primary, #3b82f6)" }}
                  >
                    Primary
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold border"
                    style={{
                      backgroundColor: "var(--brand-soft, rgba(59, 130, 246, 0.15))",
                      borderColor: "var(--brand-border, rgba(59, 130, 246, 0.3))",
                      color: "var(--brand-primary, #3b82f6)",
                    }}
                  >
                    Soft Tint
                  </span>
                  <span
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-foreground border"
                    style={{ borderColor: "var(--brand-border, rgba(59, 130, 246, 0.3))" }}
                  >
                    Border
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Preset Palettes Grid & Custom Color Picker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Presets */}
            <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Palette className="h-4 w-4 text-brand" />
                    <span>Gym Color Theme Presets</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Click any curated fitness studio color palette to instantly theme the dashboard
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BRAND_THEMES.map((theme) => {
                  const isSelected =
                    (settings.brandColor || "#3b82f6").toLowerCase() ===
                    theme.primary.toLowerCase();

                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleApplyPresetTheme(theme)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all duration-150 ${
                        isSelected
                          ? "border-brand bg-brand-soft/25 ring-2 ring-brand/40 shadow-sm"
                          : "border-border bg-background/60 hover:bg-accent hover:border-border/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span
                            className="block h-8 w-8 rounded-xl shadow-md border border-white/10"
                            style={{ backgroundColor: theme.primary }}
                          />
                          <span
                            className="absolute -bottom-1 -right-1 block h-3.5 w-3.5 rounded-full border-2 border-card"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            {theme.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{theme.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-muted-foreground">
                          {theme.primary}
                        </span>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Picker & Live Component Preview */}
            <div className="space-y-6">
              {/* Custom Color Input */}
              <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xs">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4 text-brand" />
                  <span>Custom Color Palette</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Pick any custom hex color code from your gym's official marketing brand
                  guidelines.
                </p>

                <form onSubmit={handleApplyCustomColor} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customBrandColor}
                      onChange={(e) => setCustomBrandColor(e.target.value)}
                      className="h-11 w-14 rounded-xl border border-border bg-background cursor-pointer p-1"
                    />
                    <input
                      type="text"
                      value={customBrandColor}
                      onChange={(e) => setCustomBrandColor(e.target.value)}
                      placeholder="#8B5CF6"
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono font-bold focus:border-brand focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition-all"
                  >
                    <span>Apply Custom Color</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Security & Passcode (Audio Directive 1) */}
      {activeTab === "security" && (
        <div className="max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Director Master Passcode</h2>
              <p className="text-xs text-muted-foreground">
                Set the password required when switching from Reception mode to Admin mode
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300 space-y-1 leading-relaxed">
            <p className="font-semibold text-amber-200">Security Requirement Note</p>
            <p className="text-muted-foreground/90">
              When front desk receptionists operate PeakRep, they are blocked from viewing director
              analytics, payroll, and plan pricing. Entering this master password allows switching
              back into full Admin privileges.
            </p>
          </div>

          <form onSubmit={handleSaveSecurity} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">
                Master Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showAdminPassword ? "text" : "password"}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter master passcode"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-11 text-xs font-medium focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Master Passcode</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Business Profile */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Logo Management Card */}
          <div className="rounded-3xl border border-border bg-card p-6 space-y-4 shadow-2xs">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Image className="h-4 w-4 text-brand" />
              <span>Gym Brand Logo</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upload your official gym logo. It will automatically propagate to the Top Header,
              Desktop Sidebar, Invoices, and Official Reports.
            </p>

            <div className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-border bg-background/50 space-y-3">
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
                      className="p-1.5 rounded-lg bg-card text-foreground shadow hover:scale-105 transition"
                      title="Replace Logo"
                    >
                      <Upload className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={removeGymLogo}
                      className="p-1.5 rounded-lg bg-card text-rose-500 shadow hover:scale-105 transition"
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

            <div className="rounded-2xl border border-brand/30 bg-brand-soft/20 p-3.5 text-xs text-muted-foreground flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border border-white/20 shadow-xs"
                  style={{ backgroundColor: settings.brandColor || "#3b82f6" }}
                />
                <span className="font-semibold text-brand">Extracted Color:</span>
                <span className="font-mono font-bold text-foreground">
                  {settings.brandColor || "#3b82f6"}
                </span>
              </div>
              {settings.logoUrl && (
                <button
                  type="button"
                  onClick={handleReExtractColor}
                  className="inline-flex items-center gap-1 rounded-lg bg-brand px-2 py-1 text-[11px] font-bold text-brand-foreground shadow-xs hover:brightness-110 transition"
                  title="Re-run chroma extraction on logo"
                >
                  <RotateCw className="h-3 w-3" />
                  <span>Re-Extract</span>
                </button>
              )}
            </div>
          </div>

          {/* Business Information Form */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xs">
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground">Business Information</h3>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Gym Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={gymName}
                    onChange={(e) => setGymName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Displayed in top header & app title
                  </p>
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Director / Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand font-mono"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Branch / Location Hub
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-brand uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Operating Hours
                </label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-foreground mb-2">Social & Maps Connect</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-muted-foreground mb-1">Instagram URL</label>
                    <input
                      type="url"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1">Google Maps Link</label>
                    <input
                      type="url"
                      value={googleMaps}
                      onChange={(e) => setGoogleMaps(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab: Membership Plans Management */}
      {activeTab === "plans" && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Membership Plans & Pricing Matrix
              </h3>
              <p className="text-xs text-muted-foreground">
                Manage fees, billing cycles, and package perks
              </p>
            </div>
            <button
              onClick={handleOpenCreatePlan}
              className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition-all"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Plan</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings.membershipPlans.map((p) => (
              <div
                key={p.id}
                className="rounded-2xl border border-border bg-background p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand font-mono">
                    {p.type}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPlan(p)}
                      className="p-1 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlan(p.id, p.name)}
                      className="p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-foreground text-sm">{p.name}</h4>
                  <p className="text-xl font-bold font-mono text-foreground mt-0.5">
                    {settings.currencySymbol}
                    {p.price.toLocaleString("en-IN")}
                    <span className="text-xs text-muted-foreground font-normal">
                      {" "}
                      / {p.durationMonths} mo
                    </span>
                  </p>
                </div>

                <div className="space-y-1 pt-1 border-t border-border text-[11px] text-muted-foreground">
                  {p.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                      <span className="truncate">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Tax & Invoicing */}
      {activeTab === "billing" && (
        <div className="max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-5 shadow-2xs">
          <h3 className="text-sm font-bold text-foreground border-b border-border pb-3">
            Invoicing, UPI & Tax Settings
          </h3>
          <form onSubmit={handleSaveBilling} className="space-y-4 text-xs">
            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Invoice Prefix *
              </label>
              <input
                type="text"
                required
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-brand font-bold"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                e.g. PEAK-2026- will generate PEAK-2026-0001
              </p>
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                GST Tax Rate (%)
              </label>
              <input
                type="number"
                min={0}
                max={28}
                value={taxRatePercent}
                onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-brand font-bold"
              />
            </div>

            <div>
              <label className="block text-muted-foreground font-semibold mb-1">
                Gym UPI VPA ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="gym@upi"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-brand"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Used for dynamic QR code generation
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand/20 hover:brightness-110 transition-all"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Invoicing Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab: Data Backup */}
      {activeTab === "backup" && (
        <div className="max-w-2xl rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-sm font-bold text-foreground">Database Backup & Recovery</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Export and restore all local gym records including members, payments, and logs
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-brand" />
                  <span>Download Backup</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Export complete encrypted JSON archive of all gym members, billing records, and
                  audit logs.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-brand py-2 text-xs font-bold text-white shadow-xs hover:brightness-110"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON Backup</span>
              </button>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4 space-y-3 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <UploadCloud className="h-4 w-4 text-emerald-500" />
                  <span>Restore Snapshot</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Import a previous backup file to restore complete system database state.
                </p>
              </div>
              <label className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:bg-accent cursor-pointer shadow-xs">
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleUploadBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-destructive">Factory Reset Database</p>
              <p className="text-[11px] text-muted-foreground">Restore factory demo data</p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm("Are you sure you want to reset all data to default demo state?")
                ) {
                  resetToDefaultData();
                  toast.success("Database restored to default demo state");
                }
              }}
              className="px-3.5 py-1.5 rounded-xl border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Tab: System Audit Trail */}
      {activeTab === "audit" && (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4 text-brand" />
                <span>Real-Time Audit Trail</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Chronological log of all administrative and financial actions
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {systemLogs.length} Records
            </span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {systemLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-border bg-background text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{log.action}</span>
                    <span className="px-1.5 py-0.5 rounded bg-brand/10 text-brand text-[10px] font-semibold">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{log.details}</p>
                </div>
                <div className="text-right shrink-0 text-[10px] text-muted-foreground">
                  <p>{log.timestamp}</p>
                  <p className="font-medium text-foreground">
                    {log.userName} ({log.userRole})
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Create/Edit Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">
                {editingPlan ? `Edit ${editingPlan.name}` : "Create Membership Plan"}
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Flex Pass"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Price ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={planPrice}
                    onChange={(e) => setPlanPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-brand font-bold"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">
                    Duration (Months)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={36}
                    value={planDuration}
                    onChange={(e) => setPlanDuration(Number(e.target.value))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">Plan Tier</label>
                <select
                  value={planType}
                  onChange={(e) =>
                    setPlanType(
                      e.target.value as "Standard" | "Premium" | "PT Package" | "VIP Pass",
                    )
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                >
                  <option value="Standard">Standard Pass</option>
                  <option value="Premium">Premium All-Access</option>
                  <option value="PT Package">Personal Training 1-on-1</option>
                  <option value="VIP Pass">Executive VIP Pass</option>
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-semibold mb-1">
                  Perks (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="Full floor access, Shower, Locker"
                  value={planPerks}
                  onChange={(e) => setPlanPerks(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-brand"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand text-white font-bold hover:brightness-110 shadow-xs"
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
