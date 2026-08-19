import React, { useState, useEffect } from "react";
import { Lock, ShieldAlert, KeyRound, Eye, EyeOff, X, ArrowRight, CheckCircle2 } from "lucide-react";
import { useGymStore } from "../../lib/gym-store";

export const AdminAuthModal: React.FC = () => {
  const { isAdminAuthModalOpen, setIsAdminAuthModalOpen, verifyAndSwitchToAdmin, settings } = useGymStore();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isAdminAuthModalOpen) {
      setPassword("");
      setError("");
      setIsSuccess(false);
    }
  }, [isAdminAuthModalOpen]);

  if (!isAdminAuthModalOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError("Please enter the admin password");
      return;
    }

    const success = verifyAndSwitchToAdmin(password);
    if (success) {
      setIsSuccess(true);
      setError("");
    } else {
      setError("Incorrect passcode. Please enter the valid master passcode.");
    }
  };

  const handleQuickFill = () => {
    const defaultPass = settings.adminPassword || "admin123";
    setPassword(defaultPass);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={() => setIsAdminAuthModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border/80 bg-card/95 p-6 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Glow Accent */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                Admin Authentication
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter Master Password to switch from Reception
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAdminAuthModalOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="leading-relaxed">
            <p className="font-semibold text-amber-200">Director Privilege Gate</p>
            <p className="text-muted-foreground/90 mt-0.5">
              Reception mode restricts access to financial metrics, staff payroll, and plan pricing. Entering the Admin password unlocks full director capabilities.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="h-3.5 w-3.5 text-brand" />
                Master Admin Passcode
              </label>
              <button
                type="button"
                onClick={handleQuickFill}
                className="text-[11px] font-medium text-brand hover:underline flex items-center gap-1"
              >
                Autofill Demo Passcode
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                autoFocus
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                placeholder="Enter master passcode"
                className={`w-full rounded-xl border bg-background/80 px-4 py-2.5 pr-11 text-sm font-medium placeholder:text-muted-foreground/60 transition-all focus:outline-none focus:ring-2 ${
                  error
                    ? "border-destructive focus:border-destructive focus:ring-destructive/20"
                    : "border-border focus:border-brand focus:ring-brand/20"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <p className="mt-1.5 text-xs font-medium text-destructive animate-in fade-in duration-150">
                {error}
              </p>
            )}

            {isSuccess && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Authentication successful! Switching to Admin...
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdminAuthModalOpen(false)}
              className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/25 hover:brightness-110 active:scale-[0.98] transition-all"
            >
              Unlock Admin
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
