import React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  UserPlus,
  CreditCard,
  CheckCircle2,
  CalendarCheck,
  BarChart3,
  FileSpreadsheet,
  TrendingUp,
  RotateCw,
  Printer,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useGymStore } from "../../lib/gym-store";

interface WorkflowStepperProps {
  forcedRole?: "admin" | "reception";
}

export function WorkflowStepper({ forcedRole }: WorkflowStepperProps) {
  const {
    currentUser,
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsBulkImportOpen,
    setIsRenewModalOpen,
    members,
    payments,
    setSelectedMemberForRenewal,
    setActiveInvoicePayment,
    setIsInvoiceModalOpen,
  } = useGymStore();

  const role = forcedRole || currentUser.role;
  const isAdmin = role === "admin";

  const adminSteps = [
    {
      num: 1,
      name: "Add Member",
      desc: "Manual / Bulk",
      icon: UserPlus,
      action: () => setIsAddMemberOpen(true),
      badge: `${members.length} Total`,
    },
    {
      num: 2,
      name: "Assign Plan",
      desc: "Membership Plans",
      icon: Layers,
      href: "/dashboard/plans",
    },
    {
      num: 3,
      name: "Collect Payment",
      desc: "Instant / Installment",
      icon: CreditCard,
      action: () => setIsRecordPaymentOpen(true),
    },
    {
      num: 4,
      name: "Member Check-In",
      desc: "Live Turnstile",
      icon: CheckCircle2,
      href: "/dashboard/checkin",
    },
    {
      num: 5,
      name: "Track Attendance",
      desc: "Logs & Heatmaps",
      icon: CalendarCheck,
      href: "/dashboard/checkin",
    },
    {
      num: 6,
      name: "Analyze Business",
      desc: "Revenue & Growth",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
    {
      num: 7,
      name: "Generate Reports",
      desc: "Financial & Member",
      icon: FileSpreadsheet,
      href: "/dashboard/reports",
    },
    {
      num: 8,
      name: "Grow Gym Business",
      desc: "Leads & Retention",
      icon: TrendingUp,
      href: "/dashboard/leads",
    },
  ];

  const receptionSteps = [
    {
      num: 1,
      name: "Add New Member",
      desc: "Quick Walk-in Form",
      icon: UserPlus,
      action: () => setIsAddMemberOpen(true),
    },
    {
      num: 2,
      name: "Assign Plan",
      desc: "Select Standard / Pro",
      icon: Layers,
      action: () => setIsAddMemberOpen(true),
    },
    {
      num: 3,
      name: "Collect Payment",
      desc: "Cash / UPI / Card",
      icon: CreditCard,
      action: () => setIsRecordPaymentOpen(true),
    },
    {
      num: 4,
      name: "Member Check-In",
      desc: "Quick Floor Entry",
      icon: CheckCircle2,
      href: "/dashboard/checkin",
    },
    {
      num: 5,
      name: "Mark Attendance",
      desc: "Daily Roster Log",
      icon: CalendarCheck,
      href: "/dashboard/checkin",
    },
    {
      num: 6,
      name: "Renew Membership",
      desc: "Extend & Renew Dues",
      icon: RotateCw,
      href: "/dashboard/renewals",
      action: () => {
        const expiring =
          members.find((m) => m.status === "Expiring" || m.status === "Expired") || members[0];
        if (expiring) {
          setSelectedMemberForRenewal(expiring);
          setIsRenewModalOpen(true);
        }
      },
    },
    {
      num: 7,
      name: "Print Receipt",
      desc: "Invoice / Confirmation",
      icon: Printer,
      action: () => {
        if (payments.length > 0) {
          setActiveInvoicePayment(payments[0]);
          setIsInvoiceModalOpen(true);
        }
      },
    },
  ];

  const steps = isAdmin ? adminSteps : receptionSteps;

  return (
    <div
      className={`rounded-3xl border p-5 transition-all shadow-xs ${
        isAdmin
          ? "bg-brand-soft/10 border-brand/25 text-foreground"
          : "bg-emerald-950/20 border-emerald-500/30 text-foreground"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`grid h-7 w-7 place-items-center rounded-xl text-brand-foreground font-bold text-xs ${
              isAdmin
                ? "bg-brand shadow-brand/30 shadow-md"
                : "bg-emerald-600 shadow-emerald-500/30 shadow-md"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
              {isAdmin ? "Admin Key Workflow (Full Access)" : "Reception Key Workflow (Front Desk)"}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {isAdmin
                ? "End-to-end operational pipeline from onboarding to business intelligence"
                : "Step-by-step front desk operations for walk-ins, check-ins, and renewals"}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAdmin
              ? "bg-brand-soft text-brand border border-brand/30"
              : "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
          }`}
        >
          {steps.length} Key Steps Pipeline
        </span>
      </div>

      {/* Stepper Pipeline Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === steps.length - 1;

          const content = (
            <div
              className={`group relative flex flex-col justify-between h-full p-3 rounded-2xl border transition-all duration-200 cursor-pointer text-left ${
                isAdmin
                  ? "bg-surface hover:border-brand hover:shadow-md hover:shadow-brand/10 border-border"
                  : "bg-surface hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-500/10 border-border"
              }`}
            >
              {/* Top row: Number Badge & Icon */}
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                    isAdmin
                      ? "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-brand-foreground"
                      : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white"
                  }`}
                >
                  {step.num}
                </span>
                <Icon
                  className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                    isAdmin ? "text-brand" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                />
              </div>

              {/* Title & Desc */}
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-foreground leading-snug group-hover:text-foreground">
                  {step.name}
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight line-clamp-1">
                  {step.desc}
                </div>
              </div>

              {/* Action indicator arrow */}
              <div className="mt-2 pt-1 border-t border-border/60 flex items-center justify-between text-[9px] text-muted-foreground group-hover:text-foreground">
                <span>Trigger</span>
                <ArrowRight className="h-2.5 w-2.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );

          if (step.href) {
            return (
              <Link key={step.num} to={step.href} className="block h-full">
                {content}
              </Link>
            );
          }

          return (
            <button key={step.num} onClick={step.action} className="block w-full h-full text-left">
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
