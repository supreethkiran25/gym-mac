import React from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert, Lock, ArrowRight, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { useGymStore, UserRole } from "../../lib/gym-store";

interface RoleGuardProps {
  requiredRole?: UserRole;
  moduleName: string;
  children: React.ReactNode;
}

const RESTRICTED_FOR_RECEPTION = [
  "Revenue & Financial Analytics",
  "Refunds Processing",
  "Export Financial Reports",
  "Create / Delete Membership Plans",
  "Staff Management (Add / Edit / Delete)",
  "Salary & Payroll Management",
  "System & Business Settings",
  "Role Management & Security",
  "Data Export / Full Backup",
  "Advanced Custom Reports",
];

export function RoleGuard({ requiredRole = "admin", moduleName, children }: RoleGuardProps) {
  const { currentUser, requestRoleSwitch } = useGymStore();

  if (currentUser.role === requiredRole || currentUser.role === "admin") {
    return <>{children}</>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150 py-4 max-w-4xl mx-auto">
      <div className="rounded-3xl border border-rose-500/30 bg-rose-950/15 p-6 sm:p-8 space-y-6 text-foreground shadow-lg">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-500/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-600/20 text-rose-500 border border-rose-500/40">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-3 w-3" /> RBAC Security Layer Active
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-foreground">
                Access Restricted: {moduleName}
              </h2>
            </div>
          </div>

          <button
            onClick={() => requestRoleSwitch("admin")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 text-xs font-bold transition shadow-md shrink-0"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>Unlock with Admin Password</span>
          </button>
        </div>

        {/* Reason / Context */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            You are currently logged in with the <strong className="text-emerald-500">Reception (Front Desk)</strong> role.
            Under the Gym RBAC Security Policy, front desk accounts have strictly isolated access to walk-in registrations,
            floor check-ins, renewal collection, and member profiles.
          </p>
        </div>

        {/* Diagram Restriction Matrix */}
        <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">
              Security Matrix: Restricted Reception Modules
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Gym RBAC Standard v9.0</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {RESTRICTED_FOR_RECEPTION.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 p-2 rounded-xl bg-canvas border border-border text-muted-foreground"
              >
                <XCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition"
          >
            <span>Return to Front Desk Overview</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            to="/dashboard/checkin"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold hover:bg-muted transition text-foreground"
          >
            <span>Open Floor Check-In Turnstile</span>
          </Link>
          <Link
            to="/dashboard/renewals"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-semibold hover:bg-muted transition text-foreground"
          >
            <span>Open Renewals Queue</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
