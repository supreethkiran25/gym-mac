import React, { useState } from "react";
import { Shield, ShieldAlert, Crown, Headphones, ChevronDown, Check, RefreshCw, LogOut } from "lucide-react";
import { useGymStore, UserRole } from "../../lib/gym-store";
import { toast } from "sonner";

interface RoleBadgeProps {
  variant?: "header" | "compact" | "banner";
}

export function RoleBadge({ variant = "header" }: RoleBadgeProps) {
  const { currentUser, requestRoleSwitch, logout } = useGymStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isAdmin = currentUser.role === "admin";

  const handleSwitch = (newRole: UserRole) => {
    if (newRole === currentUser.role) {
      setDropdownOpen(false);
      return;
    }
    setDropdownOpen(false);
    requestRoleSwitch(newRole);
  };

  if (variant === "banner") {
    return (
      <div
        className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border text-xs ${
          isAdmin
            ? "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
        }`}
      >
        <div className="flex items-center gap-2.5 font-medium">
          {isAdmin ? (
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <Crown className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <Headphones className="h-3.5 w-3.5" />
            </span>
          )}
          <span>
            Active Role:{" "}
            <strong className="font-bold">
              {isAdmin ? "Admin (Gym Owner) — Full Access" : "Reception (Front Desk) — Limited Access"}
            </strong>
          </span>
          <span className="hidden sm:inline-block text-[11px] opacity-75">
            ({currentUser.name} · {currentUser.email})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSwitch(isAdmin ? "reception" : "admin")}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-border text-foreground font-semibold hover:bg-muted transition text-xs shadow-2xs"
          >
            <RefreshCw className="h-3 w-3 text-muted-foreground" />
            <span>Switch to {isAdmin ? "Reception View" : "Admin View"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen((prev) => !prev)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition shadow-2xs ${
          isAdmin
            ? "bg-brand-soft border-brand/30 text-brand hover:brightness-105"
            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
        }`}
        title="Role-Based Access Control Switcher"
      >
        {isAdmin ? (
          <Crown className="h-3.5 w-3.5 text-brand" />
        ) : (
          <Headphones className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        )}
        <span className="hidden sm:inline">{isAdmin ? "Admin (Owner)" : "Reception"}</span>
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-surface shadow-2xl p-3 space-y-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-1.5 border-b border-border">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">RBAC Role Switcher</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  Security Level
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Logged in as <span className="font-semibold text-foreground">{currentUser.name}</span>
              </p>
            </div>

            <div className="space-y-1 pt-1">
              <button
                onClick={() => handleSwitch("admin")}
                className={`flex w-full items-start gap-2.5 p-2 rounded-xl text-left transition ${
                  isAdmin ? "bg-brand-soft border border-brand/40" : "hover:bg-muted"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground font-bold shadow-xs">
                  <Crown className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Admin (Gym Owner)</span>
                    {isAdmin && <Check className="h-3.5 w-3.5 text-brand" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Full access: Revenue, Staff, Plans, Refunds, Analytics, Settings
                  </p>
                </div>
              </button>

              <button
                onClick={() => handleSwitch("reception")}
                className={`flex w-full items-start gap-2.5 p-2 rounded-xl text-left transition ${
                  !isAdmin ? "bg-emerald-500/15 border border-emerald-500/30" : "hover:bg-muted"
                }`}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
                  <Headphones className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Reception (Front Desk)</span>
                    {!isAdmin && <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Front desk access: Check-ins, Attendance, Renewals, Payments
                  </p>
                </div>
              </button>
            </div>

            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Active Session: {currentUser.role.toUpperCase()}</span>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  window.location.href = "/";
                }}
                className="flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-600 font-semibold p-1"
              >
                <LogOut className="h-3 w-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
