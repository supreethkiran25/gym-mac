import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { extractDominantColor, applyBrandThemeCss } from "./color-extractor";
import { toast } from "sonner";
import {
  formatDateYMD,
  deriveMembershipLifecycleStatus,
  calculateRenewalExpiry,
  calculateFreezeWindow,
  calculateUnfreezeExpiry,
} from "./membership-lifecycle";
import { evaluateAccessDecision, AccessDecision } from "./access-engine";
import {
  generateNextInvoiceNumber,
  generateNextCreditNoteNumber,
  evaluateRefundState,
} from "./invoice-engine";
import { validateCsvImportBatch, ImportValidationResult } from "./csv-import-validator";
import { identifyAttendanceDrops, calculateRetentionMetrics } from "./retention-engine";
import { runFinancialReconciliation, computeDailyCloseSummary } from "./reconciliation-engine";

export type UserRole = "admin" | "reception";

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  shift?: string;
  loggedInAt: string;
}

export type MemberStatus = "Active" | "Expiring" | "Expired" | "Partial" | "Frozen";

export interface MemberTimelineEvent {
  id: string;
  type:
    | "registration"
    | "payment"
    | "attendance"
    | "upgrade"
    | "pt_session"
    | "freeze"
    | "workout_assigned"
    | "diet_assigned"
    | "locker_assigned"
    | "broadcast_sent"
    | "renewal"
    | "transfer"
    | "refund";
  title: string;
  timestamp: string;
  amount?: number;
  note?: string;
}

export interface MemberInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  plan: string;
  method: "UPI" | "Cash" | "Card" | "Bank";
  status: "Paid" | "Partial" | "Refunded";
  installmentInfo?: string;
}

export interface InstallmentRecord {
  id: string;
  amount: number;
  date: string;
  method: "UPI" | "Cash" | "Card" | "Bank";
  invoiceNumber: string;
  installmentNumber: number;
  totalInstallments: number;
  note?: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  plan: string;
  planPrice: number;
  collectedAmount: number;
  due: number; // strictly: planPrice - collectedAmount
  joinDate: string;
  expiry: string;
  status: MemberStatus;
  avatar?: string;
  avatarColor?: string;
  notes?: string;
  attendanceRate: number;
  lastVisit: string;
  isCurrentlyInside: boolean;
  checkInTime?: string;
  assignedTrainer?: string;
  healthGoal?: string;
  emergencyContact?: string;
  freezeUntil?: string;
  freezeReason?: string;
  assignedWorkout?: string;
  assignedWorkoutId?: string;
  assignedDiet?: string;
  assignedDietId?: string;
  assignedLocker?: number;
  installments: InstallmentRecord[];
  timeline: MemberTimelineEvent[];
  invoices: MemberInvoice[];
}

export interface Payment {
  id: string;
  memberId?: string;
  member: string;
  date: string;
  method: "UPI" | "Cash" | "Card" | "Bank";
  amount: number;
  category: "Membership" | "Personal Training" | "Registration";
  status: "Paid" | "Partial" | "Overdue" | "Refunded";
  invoiceNumber: string;
  installmentIndex?: number;
  totalInstallments?: number;
  notes?: string;
  collectedBy?: string;
}

export interface RefundRecord {
  id: string;
  paymentId: string;
  memberId: string;
  memberName: string;
  amount: number;
  date: string;
  reason: string;
  processedBy: string;
  invoiceNumber: string;
}

export interface RenewalRecord {
  id: string;
  memberId: string;
  memberName: string;
  planName: string;
  previousExpiry: string;
  newExpiry: string;
  amount: number;
  date: string;
  processedBy: string;
  paymentMethod: "UPI" | "Cash" | "Card" | "Bank";
}

export interface SystemLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  category:
    | "Auth"
    | "Member"
    | "Payment"
    | "Plan"
    | "Staff"
    | "Locker"
    | "Settings"
    | "Attendance"
    | "Renewal"
    | "Refund";
  details: string;
  ipAddress?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  type: "Standard" | "Premium" | "PT Package" | "VIP Pass" | string;
  perks: string[];
  activeCount: number;
  expiringCount: number;
  frozenCount: number;
  upgradeOpportunities: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: "Head Coach" | "Personal Trainer" | "Nutritionist" | "Front Desk Manager" | "Floor Trainer";
  phone: string;
  email: string;
  salary: number;
  shift: string;
  status: "On Floor" | "Off Duty" | "On Leave";
  avatar: string;
  assignedClientsCount: number;
  lastPaidDate?: string;
  leaveRecords: {
    id: string;
    type: "Casual" | "Sick" | "Annual";
    fromDate: string;
    toDate: string;
    status: "Approved" | "Pending" | "Rejected";
    reason: string;
  }[];
}

// Operational Expenses, Bills & Payroll Outflow
export type ExpenseCategory =
  | "Building Rent"
  | "Electricity & Water"
  | "Staff Salary"
  | "Equipment Maintenance"
  | "Supplements & Inventory"
  | "Software & Marketing"
  | "Miscellaneous";

export interface GymExpense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: "UPI" | "Bank Transfer" | "Cash" | "Card" | "Cheque";
  status: "Paid" | "Pending";
  recipientName: string;
  receiptNumber?: string;
  notes?: string;
  recordedBy: string;
  staffId?: string;
}

// Lead CRM Model
export type LeadStage =
  "Inquiry" | "Trial Scheduled" | "Trial Completed" | "Offer Sent" | "Won" | "Lost";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: "Walk-In" | "Instagram" | "Google Maps" | "Referral" | "Website";
  stage: LeadStage;
  fitnessGoal: string;
  trialDate?: string;
  notes: string;
  assignedTrainer?: string;
  createdAt: string;
  budget?: number;
}

// Workouts & Diet Programs
export interface WorkoutExercise {
  id: string;
  name: string;
  sets: string | number;
  reps: string;
  weightTarget?: string;
  restTime?: string;
  instructions?: string;
}

export interface WorkoutRoutineDay {
  day: string;
  focus: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutProgram {
  id: string;
  title: string;
  category: "Strength" | "Hypertrophy" | "Fat Loss" | "Endurance" | "Functional";
  level: "Beginner" | "Intermediate" | "Advanced";
  daysPerWeek: number;
  durationWeeks: number;
  focus: string;
  routine: WorkoutRoutineDay[];
  assignedCount: number;
  isArchived?: boolean;
  createdAt: string;
}

export interface DietMeal {
  time: string;
  name: string;
  items: string;
  quantity?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  instructions?: string;
}

export interface DietPlan {
  id: string;
  title: string;
  category: "Muscle Gain" | "Calorie Deficit" | "Clean Bulk" | "Ketogenic Shred" | "High Protein";
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  meals: DietMeal[];
  assignedCount: number;
  isArchived?: boolean;
  createdAt: string;
}

// Lockers
export type LockerStatus = "Available" | "Occupied" | "Reserved" | "Under Maintenance" | "Expired";

export interface LockerRepairLog {
  id: string;
  issue: string;
  repairedAt: string;
  repairedBy: string;
  notes?: string;
}

export interface LockerHistoryItem {
  id: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface Locker {
  id: string;
  number: number;
  section: "Men's Locker Room" | "Women's Locker Room" | "Executive VIP";
  status: LockerStatus;
  assignedMemberId?: string;
  assignedMemberName?: string;
  reservedFor?: string;
  expiresOn?: string;
  maintenanceDate?: string;
  maintenanceIssue?: string;
  repairHistory: LockerRepairLog[];
  history: LockerHistoryItem[];
}

// Broadcast Communications
export interface BroadcastMessage {
  id: string;
  title: string;
  body: string;
  category:
    | "Announcement"
    | "Renewal Notice"
    | "Gym Closure"
    | "Class Update"
    | "Promotion"
    | "Urgent Alert";
  recipientsType: "all" | "active" | "expiring" | "expired" | "partial_due" | "plan" | "individual";
  targetPlanName?: string;
  targetMemberId?: string;
  recipientCount: number;
  channels: ("WhatsApp" | "SMS" | "In-App" | "Push")[];
  status: "Sent" | "Scheduled" | "Draft";
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
}

export interface GymLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  isMain: boolean;
  memberCount: number;
  capacity: number;
}

export interface BrandThemePreset {
  id: string;
  name: string;
  primary: string;
  accent: string;
  description: string;
}

export const BRAND_THEMES: BrandThemePreset[] = [
  {
    id: "sovereign-sky",
    name: "Sovereign Sky (Official)",
    primary: "#0ea5e9",
    accent: "#38bdf8",
    description: "Luminous sky blue gradient with frosted glass radiance",
  },
  {
    id: "glacier-frost",
    name: "Glacier Frost",
    primary: "#38bdf8",
    accent: "#bae6fd",
    description: "Ultra-crisp cyan sky frost for executive displays",
  },
  {
    id: "cobalt",
    name: "Cobalt Enterprise",
    primary: "#3b82f6",
    accent: "#60a5fa",
    description: "Official enterprise tech blue",
  },
  {
    id: "obsidian-azure",
    name: "Obsidian Deep Blue",
    primary: "#1d4ed8",
    accent: "#38bdf8",
    description: "High-contrast midnight performance blue",
  },
];

export interface GymSettings {
  name: string;
  ownerName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  brandColor?: string;
  brandThemeName?: string;
  adminPassword?: string;
  currencySymbol: string;
  operatingHours: string;
  gstNumber: string;
  upiId: string;
  invoicePrefix: string;
  taxRatePercent: number;
  membershipPlans: MembershipPlan[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    website?: string;
    googleMaps?: string;
  };
  broadcastTemplateRenewal: string;
  broadcastTemplateDue: string;
  broadcastTemplateWelcome: string;
  reminderTemplateWhatsApp?: string;
  reminderTemplateSMS?: string;
}

// Role Permissions Matrix
export const ROLE_PERMISSIONS = {
  admin: {
    canAccessFinancialAnalytics: true,
    canProcessRefunds: true,
    canExportFinancialReports: true,
    canManagePlans: true,
    canManageStaff: true,
    canManageSalaries: true,
    canAccessSettings: true,
    canManageRoles: true,
    canBackupRestore: true,
    canViewAllReports: true,
    canDeleteMember: true,
    canTransferMembership: true,
    canFreezeMember: true,
    canAddMember: true,
    canEditMember: true,
    canCollectPayment: true,
    canCheckInMember: true,
    canRenewMember: true,
  },
  reception: {
    canAccessFinancialAnalytics: false,
    canProcessRefunds: false,
    canExportFinancialReports: false,
    canManagePlans: false,
    canManageStaff: false,
    canManageSalaries: false,
    canAccessSettings: false,
    canManageRoles: false,
    canBackupRestore: false,
    canViewAllReports: false,
    canDeleteMember: false,
    canTransferMembership: false,
    canFreezeMember: true,
    canAddMember: true,
    canEditMember: true,
    canCollectPayment: true,
    canCheckInMember: true,
    canRenewMember: true,
  },
};

// Default Datasets
const DEFAULT_LOCATIONS: GymLocation[] = [
  {
    id: "loc-1",
    name: "Gold's Gym · Mysore Main",
    address: "Plot 42, BM Habitat Mall Road, Jayalakshmipuram, Mysuru, Karnataka 570012",
    phone: "+91 821 241 5566",
    isMain: true,
    memberCount: 210,
    capacity: 120,
  },
];

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: "plan-1",
    name: "Monthly Flex",
    price: 3000,
    durationMonths: 1,
    type: "Standard",
    perks: ["Full gym floor access", "Locker room & shower", "1 Free Assessment"],
    activeCount: 3,
    expiringCount: 1,
    frozenCount: 0,
    upgradeOpportunities: 1,
  },
  {
    id: "plan-2",
    name: "Quarterly Pro",
    price: 8000,
    durationMonths: 3,
    type: "Standard",
    perks: ["Full floor access", "Steam & Sauna access", "Diet consultation", "Locker storage"],
    activeCount: 2,
    expiringCount: 1,
    frozenCount: 1,
    upgradeOpportunities: 0,
  },
  {
    id: "plan-3",
    name: "Annual Elite",
    price: 24000,
    durationMonths: 12,
    type: "VIP Pass",
    perks: [
      "All-hours unlimited access",
      "2 Free PT Sessions / mo",
      "Custom Nutrition chart",
      "Free towel service",
    ],
    activeCount: 2,
    expiringCount: 0,
    frozenCount: 0,
    upgradeOpportunities: 0,
  },
  {
    id: "plan-4",
    name: "Personal Training 1-on-1",
    price: 15000,
    durationMonths: 1,
    type: "PT Package",
    perks: [
      "Dedicated Senior Coach",
      "Custom biometric tracking",
      "Weekly diet adjust",
      "Recovery zone access",
    ],
    activeCount: 1,
    expiringCount: 0,
    frozenCount: 0,
    upgradeOpportunities: 0,
  },
];

const DEFAULT_MEMBERS: Member[] = [
  {
    id: "m-kariya",
    name: "Kariya",
    phone: "+91 98765 43210",
    email: "kariya@peakrep.com",
    plan: "Monthly Flex",
    planPrice: 3000,
    collectedAmount: 3000,
    due: 0,
    joinDate: "2026-05-01",
    expiry: "2026-06-01",
    status: "Active",
    attendanceRate: 100,
    lastVisit: "Today, 6:30 AM",
    isCurrentlyInside: true,
    checkInTime: "06:30 AM",
    assignedTrainer: "Marcus Vance",
    healthGoal: "Strength & Hypertrophy",
    emergencyContact: "+91 98765 00000",
    assignedWorkout: "Push-Pull-Legs Hypertrophy Split",
    assignedWorkoutId: "wo-1",
    assignedDiet: "High Protein Muscle Fuel (2400 kcal)",
    assignedDietId: "diet-1",
    assignedLocker: 1,
    notes: "Founding active member.",
    installments: [
      {
        id: "inst-1",
        amount: 3000,
        date: "2026-05-01",
        method: "UPI",
        invoiceNumber: "INV-2026-0001",
        installmentNumber: 1,
        totalInstallments: 1,
        note: "Full Monthly Flex payment",
      },
    ],
    timeline: [
      {
        id: "t-1",
        type: "attendance",
        title: "Checked in at Main Floor Gate",
        timestamp: "Today, 6:30 AM",
      },
      {
        id: "t-2",
        type: "payment",
        title: "Paid ₹3,000 for Monthly Flex Pass via UPI",
        timestamp: "May 01, 2026",
        amount: 3000,
      },
      {
        id: "t-3",
        type: "registration",
        title: "Enrolled in Gold's Gym Mysore",
        timestamp: "May 01, 2026",
      },
    ],
    invoices: [
      {
        id: "inv-kariya-1",
        invoiceNumber: "INV-2026-0001",
        date: "2026-05-01",
        amount: 3000,
        plan: "Monthly Flex",
        method: "UPI",
        status: "Paid",
        installmentInfo: "Single Full Payment",
      },
    ],
  },
  {
    id: "m-alex",
    name: "Alex Morgan",
    phone: "+91 98450 11223",
    email: "alex.morgan@gmail.com",
    plan: "Quarterly Pro",
    planPrice: 8000,
    collectedAmount: 8000,
    due: 0,
    joinDate: "2026-03-01",
    expiry: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Expiring",
    attendanceRate: 92,
    lastVisit: "Yesterday, 7:15 PM",
    isCurrentlyInside: false,
    assignedTrainer: "Marcus Vance",
    healthGoal: "Fat Loss & Endurance",
    emergencyContact: "+91 98450 99887",
    assignedLocker: 4,
    notes: "Expiring in 3 days. Send renewal reminder.",
    installments: [
      {
        id: "inst-alex-1",
        amount: 8000,
        date: "2026-03-01",
        method: "Card",
        invoiceNumber: "INV-2026-0002",
        installmentNumber: 1,
        totalInstallments: 1,
      },
    ],
    timeline: [
      {
        id: "t-a1",
        type: "attendance",
        title: "Checked in at Main Gate",
        timestamp: "Yesterday, 7:15 PM",
      },
      {
        id: "t-a2",
        type: "payment",
        title: "Paid ₹8,000 for Quarterly Pro via Card",
        timestamp: "Mar 01, 2026",
        amount: 8000,
      },
    ],
    invoices: [
      {
        id: "inv-alex-1",
        invoiceNumber: "INV-2026-0002",
        date: "2026-03-01",
        amount: 8000,
        plan: "Quarterly Pro",
        method: "Card",
        status: "Paid",
      },
    ],
  },
  {
    id: "m-rohan",
    name: "Rohan Sharma",
    phone: "+91 97410 88990",
    email: "rohan.sharma@outlook.com",
    plan: "Annual Elite",
    planPrice: 24000,
    collectedAmount: 12000,
    due: 12000,
    joinDate: "2026-04-15",
    expiry: "2027-04-15",
    status: "Partial",
    attendanceRate: 85,
    lastVisit: "Today, 7:45 AM",
    isCurrentlyInside: true,
    checkInTime: "07:45 AM",
    assignedTrainer: "Devendra Rao",
    healthGoal: "Muscle Building",
    emergencyContact: "+91 97410 11223",
    assignedLocker: 8,
    notes: "2nd Installment of ₹12,000 due on 15th.",
    installments: [
      {
        id: "inst-rohan-1",
        amount: 12000,
        date: "2026-04-15",
        method: "UPI",
        invoiceNumber: "INV-2026-0003",
        installmentNumber: 1,
        totalInstallments: 2,
        note: "1st Installment (50%)",
      },
    ],
    timeline: [
      {
        id: "t-r1",
        type: "attendance",
        title: "Checked in at Main Floor Gate",
        timestamp: "Today, 7:45 AM",
      },
      {
        id: "t-r2",
        type: "payment",
        title: "Paid ₹12,000 (Installment 1) via UPI",
        timestamp: "Apr 15, 2026",
        amount: 12000,
      },
    ],
    invoices: [
      {
        id: "inv-rohan-1",
        invoiceNumber: "INV-2026-0003",
        date: "2026-04-15",
        amount: 12000,
        plan: "Annual Elite",
        method: "UPI",
        status: "Partial",
        installmentInfo: "Installment 1 of 2 (Due: ₹12,000)",
      },
    ],
  },
  {
    id: "m-sneha",
    name: "Sneha Patel",
    phone: "+91 99001 22334",
    email: "sneha.patel@gmail.com",
    plan: "Monthly Flex",
    planPrice: 3000,
    collectedAmount: 3000,
    due: 0,
    joinDate: "2026-04-01",
    expiry: "2026-05-01",
    status: "Expired",
    attendanceRate: 60,
    lastVisit: "May 01, 2026",
    isCurrentlyInside: false,
    healthGoal: "General Fitness",
    notes: "Expired membership. Follow up for renewal discount.",
    installments: [],
    timeline: [
      {
        id: "t-s1",
        type: "registration",
        title: "Monthly Flex membership expired",
        timestamp: "May 01, 2026",
      },
    ],
    invoices: [],
  },
  {
    id: "m-vikram",
    name: "Vikram Malhotra",
    phone: "+91 98860 33445",
    email: "vikram.m@techcorp.in",
    plan: "Quarterly Pro",
    planPrice: 8000,
    collectedAmount: 8000,
    due: 0,
    joinDate: "2026-02-15",
    expiry: "2026-06-15",
    status: "Frozen",
    freezeUntil: "2026-05-25",
    freezeReason: "Medical recovery - Knee ligament strain",
    attendanceRate: 78,
    lastVisit: "May 05, 2026",
    isCurrentlyInside: false,
    healthGoal: "Rehabilitation & Strength",
    notes: "Membership temporarily paused until May 25.",
    installments: [],
    timeline: [
      {
        id: "t-v1",
        type: "freeze",
        title: "Membership frozen until May 25 (Knee strain)",
        timestamp: "May 05, 2026",
      },
    ],
    invoices: [],
  },
  {
    id: "m-priya",
    name: "Priya Nair",
    phone: "+91 97312 99001",
    email: "priya.nair@gmail.com",
    plan: "Personal Training 1-on-1",
    planPrice: 15000,
    collectedAmount: 15000,
    due: 0,
    joinDate: "2026-05-10",
    expiry: "2026-06-10",
    status: "Active",
    attendanceRate: 100,
    lastVisit: "Today, 8:00 AM",
    isCurrentlyInside: true,
    checkInTime: "08:00 AM",
    assignedTrainer: "Marcus Vance",
    healthGoal: "Contest Prep & Conditioning",
    notes: "VIP Client. Daily morning PT slot.",
    installments: [],
    timeline: [
      {
        id: "t-p1",
        type: "attendance",
        title: "Checked in for PT with Marcus Vance",
        timestamp: "Today, 8:00 AM",
      },
      {
        id: "t-p2",
        type: "payment",
        title: "Paid ₹15,000 for PT Package via UPI",
        timestamp: "May 10, 2026",
        amount: 15000,
      },
    ],
    invoices: [],
  },
];

const DEFAULT_WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: "wo-1",
    title: "Push-Pull-Legs Hypertrophy Split",
    category: "Hypertrophy",
    level: "Intermediate",
    daysPerWeek: 6,
    durationWeeks: 8,
    focus: "Progressive overload focused on muscle hypertrophy and foundational strength.",
    assignedCount: 2,
    createdAt: "2026-05-01",
    routine: [
      {
        day: "Day 1: Push (Chest, Shoulders, Triceps)",
        focus: "Horizontal & vertical pressing",
        exercises: [
          {
            id: "ex-1",
            name: "Incline Barbell Bench Press",
            sets: "4",
            reps: "8-10",
            weightTarget: "70-85 kg",
            restTime: "90s",
            instructions: "Touch upper chest, control 3-sec eccentric.",
          },
          {
            id: "ex-2",
            name: "Flat Dumbbell Press",
            sets: "3",
            reps: "10-12",
            weightTarget: "30 kg DBs",
            restTime: "75s",
            instructions: "Full stretch at bottom.",
          },
          {
            id: "ex-3",
            name: "Standing Overhead DB Press",
            sets: "3",
            reps: "8-10",
            weightTarget: "20 kg DBs",
            restTime: "90s",
            instructions: "Keep core locked.",
          },
          {
            id: "ex-4",
            name: "Cable Lateral Raises",
            sets: "4",
            reps: "12-15",
            weightTarget: "10 kg",
            restTime: "60s",
            instructions: "Pause at parallel.",
          },
          {
            id: "ex-5",
            name: "Tricep Rope Pushdowns",
            sets: "3",
            reps: "12-15",
            weightTarget: "25 kg",
            restTime: "60s",
            instructions: "Spread rope at full extension.",
          },
        ],
      },
      {
        day: "Day 2: Pull (Back, Rear Delts, Biceps)",
        focus: "Vertical & horizontal pulling",
        exercises: [
          {
            id: "ex-6",
            name: "Barbell Conventional Deadlift",
            sets: "4",
            reps: "6-8",
            weightTarget: "120 kg",
            restTime: "120s",
            instructions: "Brace core, neutral spine throughout.",
          },
          {
            id: "ex-7",
            name: "Wide Grip Lat Pulldown",
            sets: "3",
            reps: "10-12",
            weightTarget: "60 kg",
            restTime: "75s",
            instructions: "Pull to collarbone with elbow drive.",
          },
          {
            id: "ex-8",
            name: "Chest Supported Seated Cable Row",
            sets: "3",
            reps: "10-12",
            weightTarget: "55 kg",
            restTime: "75s",
            instructions: "Squeeze scapulae 1 sec.",
          },
          {
            id: "ex-9",
            name: "Incline DB Bicep Curls",
            sets: "3",
            reps: "10-12",
            weightTarget: "14 kg DBs",
            restTime: "60s",
            instructions: "Full supination at peak.",
          },
        ],
      },
      {
        day: "Day 3: Legs (Quads, Hamstrings, Calves)",
        focus: "Lower body power and knee flexion",
        exercises: [
          {
            id: "ex-10",
            name: "Barbell Back Squat",
            sets: "4",
            reps: "8-10",
            weightTarget: "100 kg",
            restTime: "120s",
            instructions: "Hit parallel depth, drive through midfoot.",
          },
          {
            id: "ex-11",
            name: "Romanian Deadlift",
            sets: "3",
            reps: "10-12",
            weightTarget: "80 kg",
            restTime: "90s",
            instructions: "Hinge at hips, slight knee bend.",
          },
          {
            id: "ex-12",
            name: "Leg Press 45-Degree",
            sets: "3",
            reps: "12-15",
            weightTarget: "180 kg",
            restTime: "75s",
            instructions: "No lockout at top.",
          },
          {
            id: "ex-13",
            name: "Standing Calf Raises",
            sets: "4",
            reps: "15-20",
            weightTarget: "60 kg",
            restTime: "45s",
            instructions: "2-sec deep stretch at bottom.",
          },
        ],
      },
    ],
  },
];

const DEFAULT_DIET_PLANS: DietPlan[] = [
  {
    id: "diet-1",
    title: "High Protein Muscle Fuel (2400 kcal)",
    category: "High Protein",
    calorieTarget: 2400,
    proteinGrams: 180,
    carbsGrams: 240,
    fatsGrams: 65,
    assignedCount: 2,
    createdAt: "2026-05-01",
    meals: [
      {
        time: "07:30 AM",
        name: "Breakfast Fuel",
        items: "4 Whole Eggs, 2 Slices Whole Grain Toast, 1 Banana",
        quantity: "1 Plate",
        calories: 580,
        protein: 32,
        carbs: 54,
        fats: 22,
        instructions: "Scramble eggs in olive oil spray.",
      },
      {
        time: "11:00 AM",
        name: "Mid-Morning Snack",
        items: "Greek Yogurt, 30g Mixed Almonds & Walnuts, Honey",
        quantity: "200g bowl",
        calories: 340,
        protein: 22,
        carbs: 24,
        fats: 16,
        instructions: "Mix with cinnamon.",
      },
      {
        time: "01:30 PM",
        name: "Power Lunch",
        items: "Grilled Chicken Breast / Paneer, 150g Steamed Basmati Rice, Green Salad",
        quantity: "1 Large Bowl",
        calories: 680,
        protein: 55,
        carbs: 70,
        fats: 14,
        instructions: "Season with lemon and herbs.",
      },
      {
        time: "05:00 PM",
        name: "Pre-Workout Fuel",
        items: "1 Scoop Whey Protein Isolate, 1 Apple, 1 tbsp Peanut Butter",
        quantity: "1 Shake + Fruit",
        calories: 300,
        protein: 28,
        carbs: 32,
        fats: 8,
        instructions: "Consume 45 min before training.",
      },
      {
        time: "08:30 PM",
        name: "Post-Workout Dinner",
        items: "Grilled Fish Fillet / Soya Chunks, 2 Multigrain Rotis, Steamed Broccoli & Beans",
        quantity: "1 Plate",
        calories: 500,
        protein: 43,
        carbs: 60,
        fats: 11,
        instructions: "Light oil preparation.",
      },
    ],
  },
];

const DEFAULT_LOCKERS: Locker[] = Array.from({ length: 24 }, (_, i) => {
  const num = i + 1;
  const isKariya = num === 1;
  const isAlex = num === 4;
  const isRohan = num === 8;
  return {
    id: `loc-l-${num}`,
    number: num,
    section: num <= 10 ? "Men's Locker Room" : num <= 20 ? "Women's Locker Room" : "Executive VIP",
    status:
      isKariya || isAlex || isRohan ? "Occupied" : num === 12 ? "Under Maintenance" : "Available",
    assignedMemberId: isKariya ? "m-kariya" : isAlex ? "m-alex" : isRohan ? "m-rohan" : undefined,
    assignedMemberName: isKariya
      ? "Kariya"
      : isAlex
        ? "Alex Morgan"
        : isRohan
          ? "Rohan Sharma"
          : undefined,
    expiresOn: isKariya ? "2026-06-01" : isAlex ? "2026-05-22" : undefined,
    maintenanceIssue: num === 12 ? "Electronic biometric lock keypad jammed" : undefined,
    repairHistory: [],
    history: [
      {
        id: `h-${num}-init`,
        action: "Initialized",
        timestamp: "2026-05-01",
        details: isKariya ? "Assigned to Kariya" : "Locker operational and available",
      },
    ],
  };
});

const DEFAULT_SETTINGS: GymSettings = {
  name: "Gold's Gym Mysore",
  ownerName: "Karan Johar",
  location: "Mysuru · Jayalakshmipuram",
  address: "Plot 42, BM Habitat Mall Road, Jayalakshmipuram, Mysuru, Karnataka 570012",
  phone: "+91 821 241 5566",
  email: "mysore@goldsgym.in",
  logoUrl: "",
  brandColor: "#0ea5e9",
  brandThemeName: "Sovereign Sky",
  adminPassword: "admin123",
  currencySymbol: "₹",
  operatingHours: "5:30 AM – 10:30 PM (Mon-Sat), 6:00 AM – 2:00 PM (Sun)",
  gstNumber: "29AABCU9603R1ZM",
  upiId: "goldsgymmysore@icici",
  invoicePrefix: "PEAK-2026-",
  taxRatePercent: 18,
  membershipPlans: DEFAULT_PLANS,
  socialLinks: {
    instagram: "https://instagram.com/goldsgymmysore",
    facebook: "https://facebook.com/goldsgymmysore",
    website: "https://goldsgym.in",
    googleMaps: "https://maps.google.com/?q=Gold's+Gym+Mysore",
  },
  broadcastTemplateRenewal:
    "Hi {name}, your {gym} membership ({plan}) expires on {expiry}. Total renewal fee: {due}. Clear your renewal to continue uninterrupted training.",
  broadcastTemplateDue:
    "Dear {name}, an installment of {due} is pending for your {gym} membership. Kindly pay via our online link or at the front desk.",
  broadcastTemplateWelcome:
    "Welcome to {gym}, {name}! Your {plan} pass is now active. Let's reach your peak potential!",
};

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "staff-1",
    name: "Karan Johar",
    role: "Head Coach",
    phone: "+91 98450 00111",
    email: "karan@goldsgym.in",
    salary: 75000,
    shift: "Morning (05:30 AM – 02:00 PM)",
    status: "On Floor",
    avatar: "KJ",
    assignedClientsCount: 4,
    leaveRecords: [],
  },
  {
    id: "staff-2",
    name: "Sneha Reddy",
    role: "Front Desk Manager",
    phone: "+91 98450 00222",
    email: "reception@goldsgym.in",
    salary: 35000,
    shift: "General (08:00 AM – 05:00 PM)",
    status: "On Floor",
    avatar: "SR",
    assignedClientsCount: 0,
    leaveRecords: [],
  },
  {
    id: "staff-3",
    name: "Marcus Vance",
    role: "Personal Trainer",
    phone: "+91 98450 00333",
    email: "marcus@goldsgym.in",
    salary: 45000,
    shift: "Evening (02:00 PM – 10:30 PM)",
    status: "On Floor",
    avatar: "MV",
    assignedClientsCount: 6,
    leaveRecords: [],
  },
  {
    id: "staff-4",
    name: "Ananya Roy",
    role: "Nutritionist",
    phone: "+91 98450 00444",
    email: "ananya@goldsgym.in",
    salary: 40000,
    shift: "Morning (06:00 AM – 02:30 PM)",
    status: "Off Duty",
    avatar: "AR",
    assignedClientsCount: 8,
    leaveRecords: [],
  },
  {
    id: "staff-5",
    name: "Devendra Rao",
    role: "Floor Trainer",
    phone: "+91 98450 00555",
    email: "devendra@goldsgym.in",
    salary: 28000,
    shift: "Evening (02:00 PM – 10:30 PM)",
    status: "On Floor",
    avatar: "DR",
    assignedClientsCount: 3,
    leaveRecords: [],
  },
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Aditya Verma",
    phone: "+91 98800 11223",
    email: "aditya.v@gmail.com",
    source: "Instagram",
    stage: "Trial Scheduled",
    fitnessGoal: "Weight Loss & Functional Fitness",
    trialDate: "Tomorrow, 6:00 PM",
    notes: "Interested in 3-Month Transformation package.",
    assignedTrainer: "Marcus Vance",
    createdAt: "2026-05-18",
    budget: 10000,
  },
  {
    id: "lead-2",
    name: "Kavya Menon",
    phone: "+91 98800 44556",
    email: "kavya.m@tech.com",
    source: "Walk-In",
    stage: "Offer Sent",
    fitnessGoal: "Personal Training",
    notes: "Sent quote for Annual VIP + PT.",
    assignedTrainer: "Ananya Roy",
    createdAt: "2026-05-17",
    budget: 35000,
  },
];

const DEFAULT_BROADCASTS: BroadcastMessage[] = [
  {
    id: "bc-1",
    title: "Weekend Powerlifting Workshop with Coach Marcus",
    body: "Join our masterclass this Saturday at 9:00 AM covering Deadlift & Squat bio-mechanics. Free for all active members!",
    category: "Announcement",
    recipientsType: "active",
    recipientCount: 5,
    channels: ["WhatsApp", "In-App"],
    status: "Sent",
    sentAt: "Today, 9:00 AM",
    createdAt: "2026-05-19",
  },
];

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: "p-kariya-1",
    memberId: "m-kariya",
    member: "Kariya",
    date: "2026-05-01",
    method: "UPI",
    amount: 3000,
    category: "Membership",
    status: "Paid",
    invoiceNumber: "INV-2026-0001",
    installmentIndex: 1,
    totalInstallments: 1,
    notes: "Full Monthly Flex membership fee",
    collectedBy: "Sneha Reddy (Reception)",
  },
  {
    id: "p-alex-1",
    memberId: "m-alex",
    member: "Alex Morgan",
    date: "2026-03-01",
    method: "Card",
    amount: 8000,
    category: "Membership",
    status: "Paid",
    invoiceNumber: "INV-2026-0002",
    installmentIndex: 1,
    totalInstallments: 1,
    notes: "Quarterly Pro membership fee",
    collectedBy: "Sneha Reddy (Reception)",
  },
  {
    id: "p-rohan-1",
    memberId: "m-rohan",
    member: "Rohan Sharma",
    date: "2026-04-15",
    method: "UPI",
    amount: 12000,
    category: "Membership",
    status: "Partial",
    invoiceNumber: "INV-2026-0003",
    installmentIndex: 1,
    totalInstallments: 2,
    notes: "1st installment of Annual Elite",
    collectedBy: "Karan Johar (Admin)",
  },
  {
    id: "p-priya-1",
    memberId: "m-priya",
    member: "Priya Nair",
    date: "2026-05-10",
    method: "UPI",
    amount: 15000,
    category: "Personal Training",
    status: "Paid",
    invoiceNumber: "INV-2026-0004",
    installmentIndex: 1,
    totalInstallments: 1,
    notes: "1-on-1 PT package with Marcus Vance",
    collectedBy: "Sneha Reddy (Reception)",
  },
];

const DEFAULT_EXPENSES: GymExpense[] = [
  {
    id: "exp-1",
    title: "Gym Floor Monthly Lease (Jayalakshmipuram)",
    category: "Building Rent",
    amount: 65000,
    date: "2026-05-05",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    recipientName: "Habitat Properties Ltd.",
    receiptNumber: "RENT-MAY-2026",
    notes: "Monthly commercial lease for 4,500 sq.ft gym facility",
    recordedBy: "Karan Johar (Admin)",
  },
  {
    id: "exp-2",
    title: "BESCOM Commercial Electricity Bill",
    category: "Electricity & Water",
    amount: 18450,
    date: "2026-05-12",
    paymentMethod: "UPI",
    status: "Paid",
    recipientName: "BESCOM Mysore Sub-Division",
    receiptNumber: "BESCOM-992140",
    notes: "Peak summer HVAC cooling and facility lighting charges",
    recordedBy: "Karan Johar (Admin)",
  },
  {
    id: "exp-3",
    title: "Staff Salary — Sneha Reddy (Front Desk Manager)",
    category: "Staff Salary",
    amount: 35000,
    date: "2026-05-01",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    recipientName: "Sneha Reddy",
    receiptNumber: "PAY-2026-05-SR",
    notes: "May 2026 Monthly Payroll",
    recordedBy: "Karan Johar (Admin)",
    staffId: "staff-2",
  },
  {
    id: "exp-4",
    title: "Staff Salary — Devendra Rao (Floor Trainer)",
    category: "Staff Salary",
    amount: 28000,
    date: "2026-05-01",
    paymentMethod: "Bank Transfer",
    status: "Paid",
    recipientName: "Devendra Rao",
    receiptNumber: "PAY-2026-05-DR",
    notes: "May 2026 Monthly Payroll",
    recordedBy: "Karan Johar (Admin)",
    staffId: "staff-5",
  },
  {
    id: "exp-5",
    title: "Treadmill Motor & Cable Pulley Bi-Monthly Maintenance",
    category: "Equipment Maintenance",
    amount: 7500,
    date: "2026-05-15",
    paymentMethod: "UPI",
    status: "Paid",
    recipientName: "FitCare Technicians Mysore",
    receiptNumber: "SRV-2026-881",
    notes: "Lubrication, motor check and wire alignment on 6 treadmills",
    recordedBy: "Karan Johar (Admin)",
  },
  {
    id: "exp-6",
    title: "Supplements Stock (Whey Isolate & Pre-Workout)",
    category: "Supplements & Inventory",
    amount: 14200,
    date: "2026-05-16",
    paymentMethod: "UPI",
    status: "Paid",
    recipientName: "MuscleBlaze Wholesale Distributor",
    receiptNumber: "INV-MB-4412",
    notes: "Restocked 10 tubs Whey Isolate and 15 shakers for POS desk",
    recordedBy: "Karan Johar (Admin)",
  },
];

const DEFAULT_SYSTEM_LOGS: SystemLog[] = [
  {
    id: "log-1",
    timestamp: "Today, 08:00 AM",
    userName: "Sneha Reddy",
    userRole: "reception",
    action: "Member Check-In",
    category: "Attendance",
    details: "Checked in Priya Nair for morning PT session",
    ipAddress: "192.168.1.45 (Front Desk PC)",
  },
  {
    id: "log-2",
    timestamp: "Today, 07:45 AM",
    userName: "Sneha Reddy",
    userRole: "reception",
    action: "Member Check-In",
    category: "Attendance",
    details: "Checked in Rohan Sharma at Main Floor turnstile",
    ipAddress: "192.168.1.45 (Front Desk PC)",
  },
  {
    id: "log-3",
    timestamp: "Today, 06:30 AM",
    userName: "Karan Johar",
    userRole: "admin",
    action: "Member Check-In",
    category: "Attendance",
    details: "Checked in Kariya at Main Floor Gate",
    ipAddress: "192.168.1.10 (Director Console)",
  },
  {
    id: "log-4",
    timestamp: "Yesterday, 04:15 PM",
    userName: "Karan Johar",
    userRole: "admin",
    action: "Plan Updated",
    category: "Plan",
    details: "Updated benefits on Annual Elite plan (Added 2 PT sessions)",
    ipAddress: "192.168.1.10 (Director Console)",
  },
  {
    id: "log-5",
    timestamp: "May 10, 2026, 11:20 AM",
    userName: "Sneha Reddy",
    userRole: "reception",
    action: "Payment Recorded",
    category: "Payment",
    details: "Collected ₹15,000 from Priya Nair (INV-2026-0004) via UPI",
    ipAddress: "192.168.1.45 (Front Desk PC)",
  },
];

const DEFAULT_REFUNDS: RefundRecord[] = [];

const DEFAULT_RENEWALS: RenewalRecord[] = [];

interface GymStoreContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;

  // RBAC & Session State
  currentUser: CurrentUser;
  login: (role: UserRole, email?: string, name?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  requestRoleSwitch: (role: UserRole) => void;
  isAdminAuthModalOpen: boolean;
  setIsAdminAuthModalOpen: (open: boolean) => void;
  verifyAndSwitchToAdmin: (password: string) => boolean;
  hasPermission: (action: keyof typeof ROLE_PERMISSIONS.admin) => boolean;

  members: Member[];
  payments: Payment[];
  expenses: GymExpense[];
  staff: StaffMember[];
  settings: GymSettings;
  leads: Lead[];
  workoutPrograms: WorkoutProgram[];
  dietPlans: DietPlan[];
  lockers: Locker[];
  locations: GymLocation[];
  broadcasts: BroadcastMessage[];
  systemLogs: SystemLog[];
  refunds: RefundRecord[];
  renewals: RenewalRecord[];
  currentLocationId: string;
  lastSaved: Date | null;
  isSaved: boolean;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;

  // Audit Logs
  addSystemLog: (action: string, category: SystemLog["category"], details: string) => void;

  // Core Member Actions
  addMember: (
    member: Omit<
      Member,
      | "id"
      | "timeline"
      | "invoices"
      | "attendanceRate"
      | "lastVisit"
      | "isCurrentlyInside"
      | "installments"
      | "collectedAmount"
    >,
  ) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  checkInMember: (memberId: string) => boolean;
  evaluateAndCheckInMember: (
    memberId: string,
    options?: { isOverride?: boolean; overrideReason?: string },
  ) => AccessDecision;
  checkOutMember: (memberId: string) => void;
  renewMember: (
    memberId: string,
    durationMonths: number,
    planName?: string,
    paidAmount?: number,
    paymentMethod?: "UPI" | "Cash" | "Card" | "Bank",
  ) => void;
  extendMembershipDays: (memberId: string, additionalDays: number, reason: string) => void;
  freezeMember: (memberId: string, days: number, reason: string) => void;
  unfreezeMember: (memberId: string) => void;
  transferMembership: (
    fromMemberId: string,
    toName: string,
    toPhone: string,
    toEmail: string,
  ) => void;
  bulkImportMembers: (newMembers: Array<Record<string, string> | Partial<Member>>) => number;
  validateImportBatch: (rows: Array<Record<string, string>>) => ImportValidationResult;

  // New Analytics & Reconciliation Features
  runReconciliation: () => ReturnType<typeof runFinancialReconciliation>;
  getAttendanceDropAlerts: () => ReturnType<typeof identifyAttendanceDrops>;
  getRetentionMetrics: () => ReturnType<typeof calculateRetentionMetrics>;
  getDailyClose: (date?: string) => ReturnType<typeof computeDailyCloseSummary>;

  // Payment & Inflow Actions
  recordPayment: (payment: {
    memberId: string;
    member: string;
    date: string;
    method: "UPI" | "Cash" | "Card" | "Bank";
    amount: number;
    category?: "Membership" | "Personal Training" | "Registration";
    notes?: string;
    installmentNumber?: number;
    totalInstallments?: number;
  }) => void;
  refundPayment: (paymentId: string, refundAmount: number, reason: string) => boolean;

  // Operational Expenses, Bills & Payroll Outflow Actions
  addExpense: (expense: Omit<GymExpense, "id">) => void;
  updateExpense: (id: string, updates: Partial<GymExpense>) => void;
  deleteExpense: (id: string) => void;

  // Staff CRUD & Payroll
  addStaff: (
    staffMember: Omit<StaffMember, "id" | "leaveRecords" | "assignedClientsCount">,
  ) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  payStaffSalary: (
    staffId: string,
    paymentMethod?: "UPI" | "Bank Transfer" | "Cash" | "Cheque",
    notes?: string,
  ) => void;
  toggleStaffStatus: (staffId: string, status: "On Floor" | "Off Duty" | "On Leave") => void;
  approveLeaveRequest: (staffId: string, leaveId: string) => void;

  // Plans CRUD
  addPlan: (
    plan: Omit<
      MembershipPlan,
      "id" | "activeCount" | "expiringCount" | "frozenCount" | "upgradeOpportunities"
    >,
  ) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;

  // Lead CRM Actions
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  convertLeadToMember: (
    leadId: string,
    planName: string,
    initialPaid?: number,
    method?: "UPI" | "Cash" | "Card" | "Bank",
  ) => void;

  // Workouts & Diets CRUD & Assignment
  addWorkoutProgram: (program: Omit<WorkoutProgram, "id" | "assignedCount" | "createdAt">) => void;
  updateWorkoutProgram: (id: string, updates: Partial<WorkoutProgram>) => void;
  duplicateWorkoutProgram: (id: string) => void;
  deleteWorkoutProgram: (id: string) => void;
  archiveWorkoutProgram: (id: string) => void;
  assignWorkoutToMember: (memberId: string, workoutId: string) => void;

  addDietPlan: (diet: Omit<DietPlan, "id" | "assignedCount" | "createdAt">) => void;
  updateDietPlan: (id: string, updates: Partial<DietPlan>) => void;
  duplicateDietPlan: (id: string) => void;
  deleteDietPlan: (id: string) => void;
  archiveDietPlan: (id: string) => void;
  assignDietToMember: (memberId: string, dietId: string) => void;
  assignProgramToMember: (
    memberId: string,
    workoutId?: string,
    dietId?: string,
    notes?: string,
  ) => void;

  // Locker Operations
  assignLocker: (
    lockerNumber: number,
    memberId: string,
    memberName: string,
    durationDays?: number,
  ) => void;
  reserveLocker: (lockerNumber: number, reservedFor: string, note?: string) => void;
  releaseLocker: (lockerNumber: number) => void;
  markLockerMaintenance: (lockerNumber: number, issue: string, date?: string) => void;
  completeLockerRepair: (lockerNumber: number, repairNotes?: string, repairedBy?: string) => void;

  // Broadcast Center Actions
  sendBroadcastMessage: (
    broadcast: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">,
  ) => void;
  saveDraftBroadcast: (
    broadcast: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">,
  ) => void;
  deleteBroadcastMessage: (id: string) => void;

  // Multi-Location Actions
  addLocation: (loc: Omit<GymLocation, "id">) => void;
  updateLocation: (id: string, updates: Partial<GymLocation>) => void;
  deleteLocation: (id: string) => void;
  switchLocation: (locationId: string) => void;

  // Dynamic UPI QR Modal
  isUPIQRModalOpen: boolean;
  setIsUPIQRModalOpen: (open: boolean) => void;
  upiQRPaymentDetails: { amount: number; memberName: string; note: string } | null;
  openUPIQRModal: (amount: number, memberName: string, note?: string) => void;

  // Modals & Panels UI State
  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  isRecordPaymentOpen: boolean;
  setIsRecordPaymentOpen: (open: boolean) => void;
  paymentForMember: Member | null;
  setPaymentForMember: (member: Member | null) => void;
  isCheckInOpen: boolean;
  setIsCheckInOpen: (open: boolean) => void;
  isMember360Open: boolean;
  setIsMember360Open: (open: boolean) => void;
  selectedMember360: Member | null;
  setSelectedMember360: (member: Member | null) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  activeInvoicePayment: Payment | null;
  setActiveInvoicePayment: (payment: Payment | null) => void;
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  activeSettingsTab: string;
  setActiveSettingsTab: (tab: string) => void;
  editingMember: Member | null;
  setEditingMember: (member: Member | null) => void;

  // Additional RBAC Modals
  isBulkImportOpen: boolean;
  setIsBulkImportOpen: (open: boolean) => void;
  isRefundModalOpen: boolean;
  setIsRefundModalOpen: (open: boolean) => void;
  selectedPaymentForRefund: Payment | null;
  setSelectedPaymentForRefund: (payment: Payment | null) => void;
  isRenewModalOpen: boolean;
  setIsRenewModalOpen: (open: boolean) => void;
  selectedMemberForRenewal: Member | null;
  setSelectedMemberForRenewal: (member: Member | null) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  selectedMemberForTransfer: Member | null;
  setSelectedMemberForTransfer: (member: Member | null) => void;
  isFreezeModalOpen: boolean;
  setIsFreezeModalOpen: (open: boolean) => void;
  selectedMemberForFreeze: Member | null;
  setSelectedMemberForFreeze: (member: Member | null) => void;
  isExpenseModalOpen: boolean;
  setIsExpenseModalOpen: (open: boolean) => void;
  editingExpense: GymExpense | null;
  setEditingExpense: (expense: GymExpense | null) => void;

  // Settings Actions
  updateSettings: (newSettings: Partial<GymSettings>) => void;
  updateGymLogo: (logoBase64: string) => void;
  removeGymLogo: () => void;
  setBrandColor: (hexColor: string, themeName?: string) => void;
  resetToDefaultData: () => void;
}

const GymContext = createContext<GymStoreContextType | null>(null);

const STORAGE_KEY_PEAKREP = "peakrep_gym_os_v9";

const DEFAULT_ADMIN_USER: CurrentUser = {
  id: "u-admin",
  name: "Karan Johar",
  email: "admin@gym.com",
  role: "admin",
  shift: "Full Director Access",
  avatar: "KJ",
  loggedInAt: new Date().toISOString(),
};

const DEFAULT_RECEPTION_USER: CurrentUser = {
  id: "u-reception",
  name: "Sneha Reddy",
  email: "reception@gym.com",
  role: "reception",
  shift: "Front Desk (08:00 AM - 05:00 PM)",
  avatar: "SR",
  loggedInAt: new Date().toISOString(),
};

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydratedRef = useRef(false);

  // Theme state
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  // User & RBAC state
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DEFAULT_ADMIN_USER);

  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [payments, setPayments] = useState<Payment[]>(DEFAULT_PAYMENTS);
  const [expenses, setExpenses] = useState<GymExpense[]>(DEFAULT_EXPENSES);
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [settings, setSettings] = useState<GymSettings>(DEFAULT_SETTINGS);
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [workoutPrograms, setWorkoutPrograms] =
    useState<WorkoutProgram[]>(DEFAULT_WORKOUT_PROGRAMS);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(DEFAULT_DIET_PLANS);
  const [lockers, setLockers] = useState<Locker[]>(DEFAULT_LOCKERS);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(DEFAULT_BROADCASTS);
  const [locations, setLocations] = useState<GymLocation[]>(DEFAULT_LOCATIONS);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(DEFAULT_SYSTEM_LOGS);
  const [refunds, setRefunds] = useState<RefundRecord[]>(DEFAULT_REFUNDS);
  const [renewals, setRenewals] = useState<RenewalRecord[]>(DEFAULT_RENEWALS);
  const [currentLocationId, setCurrentLocationId] = useState<string>("loc-1");

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Modals & Panels UI State
  const [isUPIQRModalOpen, setIsUPIQRModalOpen] = useState(false);
  const [upiQRPaymentDetails, setUpiQRPaymentDetails] = useState<{
    amount: number;
    memberName: string;
    note: string;
  } | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentForMember, setPaymentForMember] = useState<Member | null>(null);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isMember360Open, setIsMember360Open] = useState(false);
  const [selectedMember360, setSelectedMember360] = useState<Member | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoicePayment, setActiveInvoicePayment] = useState<Payment | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState("profile");
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Additional RBAC Modals
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPaymentForRefund, setSelectedPaymentForRefund] = useState<Payment | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedMemberForRenewal, setSelectedMemberForRenewal] = useState<Member | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedMemberForTransfer, setSelectedMemberForTransfer] = useState<Member | null>(null);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [selectedMemberForFreeze, setSelectedMemberForFreeze] = useState<Member | null>(null);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<GymExpense | null>(null);

  // Admin Auth Gate Modal State
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Session Storage helper for Multi-Tab Independence
  const STORAGE_KEY_SESSION = "peakrep_session_user_v9";

  const safePersistSession = (user: CurrentUser) => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
      setLastSaved(new Date());
    } catch (err) {
      console.warn("[PeakRep Session Storage Sync Error]:", err);
    }
  };

  const safeLoadSession = (fallback: CurrentUser): CurrentUser => {
    if (typeof window === "undefined") return fallback;
    try {
      const item = sessionStorage.getItem(STORAGE_KEY_SESSION);
      if (item !== null && item !== undefined && item !== "") {
        return JSON.parse(item);
      }
      // Check localStorage for initial tab migration
      const localItem = localStorage.getItem(`${STORAGE_KEY_PEAKREP}_current_user`);
      if (localItem) {
        const parsed = JSON.parse(localItem);
        sessionStorage.setItem(STORAGE_KEY_SESSION, localItem);
        return parsed;
      }
    } catch (e) {
      console.warn(`[PeakRep Session Load Error]:`, e);
    }
    return fallback;
  };

  // Safe Storage persistence helper for Shared Database Entities
  const safePersist = (key: string, data: unknown) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, typeof data === "string" ? data : JSON.stringify(data));
      setLastSaved(new Date());
      setIsSaved(true);
    } catch (err) {
      console.warn(`[PeakRep Storage Sync Error] Failed to persist key "${key}":`, err);
    }
  };

  // Safe Storage loader helper
  const safeLoad = <T,>(key: string, fallback: T): T => {
    if (typeof window === "undefined") return fallback;
    try {
      const item = localStorage.getItem(key);
      if (item !== null && item !== undefined && item !== "") {
        return JSON.parse(item);
      }
    } catch (e) {
      console.warn(`[PeakRep Storage Load Error for ${key}]:`, e);
    }
    return fallback;
  };

  // Add system audit log helper
  const addSystemLog = (action: string, category: SystemLog["category"], details: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newLog: SystemLog = {
      id: `log-${Date.now()}`,
      timestamp: `Today, ${timeNow}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      category,
      details,
      ipAddress:
        currentUser.role === "admin"
          ? "192.168.1.10 (Director Console)"
          : "192.168.1.45 (Front Desk PC)",
    };

    setSystemLogs((prev) => {
      const updated = [newLog, ...prev.slice(0, 99)];
      safePersist(`${STORAGE_KEY_PEAKREP}_system_logs`, updated);
      return updated;
    });
  };

  // Auth / Role Actions
  const login = (role: UserRole, email?: string, name?: string) => {
    const user: CurrentUser =
      role === "admin"
        ? {
            id: "u-admin",
            name: name || "Karan Johar",
            email: email || "admin@gym.com",
            role: "admin",
            shift: "Full Director Access",
            avatar: "KJ",
            loggedInAt: new Date().toISOString(),
          }
        : {
            id: "u-reception",
            name: name || "Sneha Reddy",
            email: email || "reception@gym.com",
            role: "reception",
            shift: "Front Desk (08:00 AM - 05:00 PM)",
            avatar: "SR",
            loggedInAt: new Date().toISOString(),
          };

    setCurrentUser(user);
    safePersistSession(user);
    addSystemLog(
      `User Login (${role.toUpperCase()})`,
      "Auth",
      `${user.name} logged in successfully`,
    );
  };

  const logout = () => {
    addSystemLog(
      `User Logout (${currentUser.role.toUpperCase()})`,
      "Auth",
      `${currentUser.name} logged out`,
    );
    const defaultUser = DEFAULT_RECEPTION_USER;
    setCurrentUser(defaultUser);
    safePersistSession(defaultUser);
  };

  const switchRole = (role: UserRole) => {
    if (role === "admin") {
      const currentOwnerName = settings.ownerName || "Karan Johar";
      const adminUser: CurrentUser = {
        ...DEFAULT_ADMIN_USER,
        name: currentOwnerName,
        avatar:
          currentOwnerName
            .split(" ")
            .map((w) => w[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "AD",
      };
      setCurrentUser(adminUser);
      safePersistSession(adminUser);
      addSystemLog(
        "Role Switched to Admin",
        "Auth",
        `Switched session to Gym Owner (${currentOwnerName})`,
      );
    } else {
      setCurrentUser(DEFAULT_RECEPTION_USER);
      safePersistSession(DEFAULT_RECEPTION_USER);
      addSystemLog(
        "Role Switched to Reception",
        "Auth",
        "Switched session to Front Desk (Limited Access)",
      );
    }
  };

  // Role Switch Guard: Requires Admin Password when switching Reception -> Admin
  const requestRoleSwitch = (targetRole: UserRole) => {
    if (targetRole === currentUser.role) return;
    if (targetRole === "admin" && currentUser.role === "reception") {
      setIsAdminAuthModalOpen(true);
    } else {
      switchRole(targetRole);
    }
  };

  const verifyAndSwitchToAdmin = (password: string): boolean => {
    const expected = settings.adminPassword || "admin123";
    if (password.trim() === expected.trim()) {
      switchRole("admin");
      setIsAdminAuthModalOpen(false);
      return true;
    }
    return false;
  };

  const hasPermission = (action: keyof typeof ROLE_PERMISSIONS.admin): boolean => {
    const perms = ROLE_PERMISSIONS[currentUser.role];
    return perms ? !!perms[action] : false;
  };

  // Initial Client Hydration from LocalStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedTheme = localStorage.getItem("peakrep_theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        if (savedTheme === "dark") document.documentElement.classList.add("dark");
        else document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }

      const loadedSettings = safeLoad(`${STORAGE_KEY_PEAKREP}_settings`, DEFAULT_SETTINGS);
      const loadedUser = safeLoadSession(DEFAULT_ADMIN_USER);
      const loadedMembers = safeLoad(`${STORAGE_KEY_PEAKREP}_members`, DEFAULT_MEMBERS);
      const loadedPayments = safeLoad(`${STORAGE_KEY_PEAKREP}_payments`, DEFAULT_PAYMENTS);
      const loadedExpenses = safeLoad(`${STORAGE_KEY_PEAKREP}_expenses`, DEFAULT_EXPENSES);
      const loadedStaff = safeLoad(`${STORAGE_KEY_PEAKREP}_staff`, DEFAULT_STAFF);
      const loadedLeads = safeLoad(`${STORAGE_KEY_PEAKREP}_leads`, DEFAULT_LEADS);
      const loadedWorkouts = safeLoad(
        `${STORAGE_KEY_PEAKREP}_workout_programs`,
        DEFAULT_WORKOUT_PROGRAMS,
      );
      const loadedDiets = safeLoad(`${STORAGE_KEY_PEAKREP}_diet_plans`, DEFAULT_DIET_PLANS);
      const loadedLockers = safeLoad(`${STORAGE_KEY_PEAKREP}_lockers`, DEFAULT_LOCKERS);
      const loadedBroadcasts = safeLoad(`${STORAGE_KEY_PEAKREP}_broadcasts`, DEFAULT_BROADCASTS);
      const loadedLocations = safeLoad(`${STORAGE_KEY_PEAKREP}_locations`, DEFAULT_LOCATIONS);
      const loadedLogs = safeLoad(`${STORAGE_KEY_PEAKREP}_system_logs`, DEFAULT_SYSTEM_LOGS);
      const loadedRefunds = safeLoad(`${STORAGE_KEY_PEAKREP}_refunds`, DEFAULT_REFUNDS);
      const loadedRenewals = safeLoad(`${STORAGE_KEY_PEAKREP}_renewals`, DEFAULT_RENEWALS);
      const loadedLocId = localStorage.getItem(`${STORAGE_KEY_PEAKREP}_current_loc`) || "loc-1";

      const finalUser =
        loadedUser.role === "admin" &&
        loadedSettings.ownerName &&
        loadedUser.name !== loadedSettings.ownerName
          ? {
              ...loadedUser,
              name: loadedSettings.ownerName,
              avatar:
                loadedSettings.ownerName
                  .split(" ")
                  .map((w: string) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "AD",
            }
          : loadedUser;

      setCurrentUser(finalUser);
      setSettings(loadedSettings);
      setMembers(loadedMembers);
      setPayments(loadedPayments);
      setExpenses(loadedExpenses);
      setStaff(loadedStaff);
      setSettings(loadedSettings);
      setLeads(loadedLeads);
      setWorkoutPrograms(loadedWorkouts);
      setDietPlans(loadedDiets);
      setLockers(loadedLockers);
      setBroadcasts(loadedBroadcasts);
      setLocations(loadedLocations);
      setSystemLogs(loadedLogs);
      setRefunds(loadedRefunds);
      setRenewals(loadedRenewals);
      setCurrentLocationId(loadedLocId);

      // Normalize legacy colors to company theme: Black, White, and Sovereign Sky Blue Highlight
      if (
        !loadedSettings.brandColor ||
        loadedSettings.brandColor === "#8b5cf6" ||
        loadedSettings.brandColor === "#10b981" ||
        loadedSettings.brandColor === "#3b82f6" ||
        loadedSettings.brandThemeName === "Ultra Violet" ||
        loadedSettings.brandThemeName === "Cobalt Enterprise"
      ) {
        loadedSettings.brandColor = "#0ea5e9";
        loadedSettings.brandThemeName = "Sovereign Sky";
        safePersist(`${STORAGE_KEY_PEAKREP}_settings`, loadedSettings);
      }

      // Initialize Brand Theme CSS tokens
      applyBrandThemeCss(loadedSettings.brandColor || "#0ea5e9");

      setLastSaved(new Date());
    } catch (err) {
      console.error("[PeakRep Hydration Error]:", err);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

  // Sync Dynamic Brand CSS Theme when settings.brandColor changes
  useEffect(() => {
    if (settings?.brandColor) {
      applyBrandThemeCss(settings.brandColor);
    }
  }, [settings?.brandColor]);

  const setTheme = (newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("peakrep_theme", newTheme);
        if (newTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        // Immediately re-harmonize brand CSS tokens for the new dark/light background
        applyBrandThemeCss(settings.brandColor || "#3b82f6");
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Guarded sync to LocalStorage for Shared State (Excluding currentUser for Tab-Isolation)
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_members`, members);
  }, [members]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_payments`, payments);
  }, [payments]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_expenses`, expenses);
  }, [expenses]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_staff`, staff);
  }, [staff]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_settings`, settings);
  }, [settings]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_leads`, leads);
  }, [leads]);
  useEffect(() => {
    if (isHydratedRef.current)
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, workoutPrograms);
  }, [workoutPrograms]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, dietPlans);
  }, [dietPlans]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, lockers);
  }, [lockers]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, broadcasts);
  }, [broadcasts]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_locations`, locations);
  }, [locations]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_system_logs`, systemLogs);
  }, [systemLogs]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_refunds`, refunds);
  }, [refunds]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_renewals`, renewals);
  }, [renewals]);
  useEffect(() => {
    if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, currentLocationId);
  }, [currentLocationId]);

  // Live Cross-Tab Multi-Window Synchronization (Excludes currentUser to allow isolated Admin and Reception tabs)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === `${STORAGE_KEY_PEAKREP}_members`) setMembers(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_payments`) setPayments(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_expenses`) setExpenses(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_staff`) setStaff(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_settings`) {
          const parsedSettings = JSON.parse(e.newValue);
          setSettings(parsedSettings);
          if (parsedSettings.brandColor) applyBrandThemeCss(parsedSettings.brandColor);
        } else if (e.key === `${STORAGE_KEY_PEAKREP}_leads`) setLeads(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_workout_programs`)
          setWorkoutPrograms(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_diet_plans`)
          setDietPlans(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_lockers`) setLockers(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_broadcasts`)
          setBroadcasts(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_locations`) setLocations(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_system_logs`)
          setSystemLogs(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_current_loc`) setCurrentLocationId(e.newValue);
        else if (e.key === "peakrep_theme") {
          if (e.newValue === "light" || e.newValue === "dark") {
            setThemeState(e.newValue);
            if (e.newValue === "dark") document.documentElement.classList.add("dark");
            else document.documentElement.classList.remove("dark");
            applyBrandThemeCss(settings.brandColor || "#3b82f6");
          }
        }
        setLastSaved(new Date());
      } catch (err) {
        console.warn("[PeakRep Cross-Tab Storage Parse Warning]:", err);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Keep selectedMember360 synchronized with members list
  useEffect(() => {
    if (selectedMember360) {
      const refreshed = members.find((m) => m.id === selectedMember360.id);
      if (refreshed) setSelectedMember360(refreshed);
    }
  }, [members]);

  // Global Keyboard Shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Export & Import Database Snapshot
  const exportData = (): string => {
    const payload = {
      system: "PEAKREP GYM OS",
      version: "9.0",
      exportedAt: new Date().toISOString(),
      theme,
      currentUser,
      currentLocationId,
      settings,
      members,
      payments,
      staff,
      leads,
      workoutPrograms,
      dietPlans,
      lockers,
      broadcasts,
      locations,
      systemLogs,
      refunds,
      renewals,
    };
    addSystemLog("Database Exported", "Settings", "Exported full JSON database snapshot");
    return JSON.stringify(payload, null, 2);
  };

  const importData = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.members && Array.isArray(data.members)) {
        setMembers(data.members);
        safePersist(`${STORAGE_KEY_PEAKREP}_members`, data.members);
      }
      if (data.payments && Array.isArray(data.payments)) {
        setPayments(data.payments);
        safePersist(`${STORAGE_KEY_PEAKREP}_payments`, data.payments);
      }
      if (data.staff && Array.isArray(data.staff)) {
        setStaff(data.staff);
        safePersist(`${STORAGE_KEY_PEAKREP}_staff`, data.staff);
      }
      if (data.settings && typeof data.settings === "object") {
        setSettings(data.settings);
        safePersist(`${STORAGE_KEY_PEAKREP}_settings`, data.settings);
      }
      if (data.leads && Array.isArray(data.leads)) {
        setLeads(data.leads);
        safePersist(`${STORAGE_KEY_PEAKREP}_leads`, data.leads);
      }
      if (data.workoutPrograms && Array.isArray(data.workoutPrograms)) {
        setWorkoutPrograms(data.workoutPrograms);
        safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, data.workoutPrograms);
      }
      if (data.dietPlans && Array.isArray(data.dietPlans)) {
        setDietPlans(data.dietPlans);
        safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, data.dietPlans);
      }
      if (data.lockers && Array.isArray(data.lockers)) {
        setLockers(data.lockers);
        safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, data.lockers);
      }
      if (data.broadcasts && Array.isArray(data.broadcasts)) {
        setBroadcasts(data.broadcasts);
        safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, data.broadcasts);
      }
      if (data.locations && Array.isArray(data.locations)) {
        setLocations(data.locations);
        safePersist(`${STORAGE_KEY_PEAKREP}_locations`, data.locations);
      }
      if (data.systemLogs && Array.isArray(data.systemLogs)) {
        setSystemLogs(data.systemLogs);
        safePersist(`${STORAGE_KEY_PEAKREP}_system_logs`, data.systemLogs);
      }
      if (data.currentLocationId) {
        setCurrentLocationId(data.currentLocationId);
        safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, data.currentLocationId);
      }
      if (data.theme && (data.theme === "dark" || data.theme === "light")) {
        setTheme(data.theme);
      }
      setLastSaved(new Date());
      setIsSaved(true);
      addSystemLog("Database Restored", "Settings", "Imported and restored JSON database snapshot");
      return true;
    } catch (err) {
      console.error("[PeakRep Import Failed]:", err);
      return false;
    }
  };

  const openUPIQRModal = (amount: number, memberName: string, note?: string) => {
    setUpiQRPaymentDetails({
      amount,
      memberName,
      note: note || `Gym Fee - ${settings.name}`,
    });
    setIsUPIQRModalOpen(true);
  };

  // Action: Add Member
  const addMember = (
    memberData: Omit<
      Member,
      | "id"
      | "timeline"
      | "invoices"
      | "attendanceRate"
      | "lastVisit"
      | "isCurrentlyInside"
      | "installments"
      | "collectedAmount"
    >,
  ) => {
    const newId = `m-${Date.now()}`;
    const invoiceNum = `${settings.invoicePrefix || "PEAK-2026-"}${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split("T")[0];

    const planObj = settings.membershipPlans.find((p) => p.name === memberData.plan);
    const planPrice = memberData.planPrice || planObj?.price || 3000;
    const initialPaid = Math.max(0, planPrice - (memberData.due || 0));
    const pendingDue = Math.max(0, planPrice - initialPaid);

    const initialInstallments: InstallmentRecord[] =
      initialPaid > 0
        ? [
            {
              id: `inst-${Date.now()}`,
              amount: initialPaid,
              date: today,
              method: "UPI",
              invoiceNumber: invoiceNum,
              installmentNumber: 1,
              totalInstallments: pendingDue > 0 ? 2 : 1,
              note: pendingDue > 0 ? "Initial Enrollment Deposit" : "Full Membership Fee",
            },
          ]
        : [];

    const newMember: Member = {
      ...memberData,
      id: newId,
      planPrice,
      collectedAmount: initialPaid,
      due: pendingDue,
      attendanceRate: 100,
      lastVisit: "Joined today",
      isCurrentlyInside: false,
      installments: initialInstallments,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "registration",
          title: `Enrolled in ${memberData.plan} Membership`,
          timestamp: "Just now",
        },
      ],
      invoices:
        initialPaid > 0
          ? [
              {
                id: `inv-${Date.now()}`,
                invoiceNumber: invoiceNum,
                date: today,
                amount: initialPaid,
                plan: memberData.plan,
                method: "UPI",
                status: pendingDue === 0 ? "Paid" : "Partial",
                installmentInfo:
                  pendingDue > 0
                    ? `Installment 1 of 2 (Due: ${settings.currencySymbol}${pendingDue})`
                    : "Full Paid",
              },
            ]
          : [],
    };

    setMembers((prev) => {
      const updated = [newMember, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    if (initialPaid > 0) {
      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        memberId: newId,
        member: newMember.name,
        date: today,
        method: "UPI",
        amount: initialPaid,
        category: "Membership",
        status: pendingDue === 0 ? "Paid" : "Partial",
        invoiceNumber: invoiceNum,
        installmentIndex: 1,
        totalInstallments: pendingDue > 0 ? 2 : 1,
        notes: `Enrollment fee for ${newMember.plan}`,
        collectedBy: `${currentUser.name} (${currentUser.role === "admin" ? "Admin" : "Reception"})`,
      };
      setPayments((prev) => {
        const updated = [newPayment, ...prev];
        safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
        return updated;
      });
    }

    addSystemLog(
      "Member Added",
      "Member",
      `Added new member ${newMember.name} with ${newMember.plan} plan`,
    );
  };

  const validateImportBatch = (rows: Array<Record<string, string>>): ImportValidationResult => {
    return validateCsvImportBatch(rows, members, settings.membershipPlans);
  };

  const bulkImportMembers = (
    newMembersList: Array<Record<string, string> | Partial<Member>>,
  ): number => {
    const stringRecords = newMembersList.map((item) => {
      const res: Record<string, string> = {};
      for (const [k, v] of Object.entries(item)) {
        res[k] = v !== undefined && v !== null ? String(v) : "";
      }
      return res;
    });

    const validation = validateCsvImportBatch(stringRecords, members, settings.membershipPlans);
    if (validation.validCount === 0) {
      toast.error(
        `Import blocked: All ${validation.totalRows} rows had validation errors or duplicate phone numbers.`,
      );
      return 0;
    }

    const todayStr = formatDateYMD(new Date());
    const currentInvoices = [
      ...payments.map((p) => p.invoiceNumber),
      ...members.flatMap((m) => m.invoices.map((i) => i.invoiceNumber)),
    ].filter(Boolean);

    const newPaymentsToAdd: Payment[] = [];
    const importedMembers: Member[] = validation.validRows.map((row, index) => {
      const newId = `m-import-${Date.now()}-${index}`;
      const invNum = generateNextInvoiceNumber(
        currentInvoices,
        settings.invoicePrefix || "INV-2026-",
      );
      currentInvoices.push(invNum);

      if (row.paidAmount && row.paidAmount > 0) {
        newPaymentsToAdd.push({
          id: `p-imp-${Date.now()}-${index}`,
          memberId: newId,
          member: row.name,
          date: row.joinDate || todayStr,
          method: "UPI",
          amount: row.paidAmount,
          category: "Membership",
          status: row.computedDue === 0 ? "Paid" : "Partial",
          invoiceNumber: invNum,
          installmentIndex: 1,
          totalInstallments: row.computedDue > 0 ? 2 : 1,
          notes: "Initial payment via validated CSV bulk import",
          collectedBy: `${currentUser.name} (${currentUser.role})`,
        });
      }

      return {
        id: newId,
        name: row.name,
        phone: row.phone,
        email: row.email,
        plan: row.plan,
        planPrice: row.planPrice || 3000,
        collectedAmount: row.paidAmount || 0,
        due: row.computedDue,
        joinDate: row.joinDate || todayStr,
        expiry: row.expiry || calculateRenewalExpiry(todayStr, 1),
        status: row.computedStatus,
        attendanceRate: 100,
        lastVisit: "Imported via CSV",
        isCurrentlyInside: false,
        healthGoal: row.healthGoal,
        notes: row.notes || "Imported via Safe CSV Upload",
        installments:
          row.paidAmount && row.paidAmount > 0
            ? [
                {
                  id: `inst-imp-${Date.now()}-${index}`,
                  amount: row.paidAmount,
                  date: row.joinDate || todayStr,
                  method: "UPI",
                  invoiceNumber: invNum,
                  installmentNumber: 1,
                  totalInstallments: row.computedDue > 0 ? 2 : 1,
                  note: "Import deposit",
                },
              ]
            : [],
        timeline: [
          {
            id: `t-imp-${Date.now()}-${index}`,
            type: "registration",
            title: `Imported via validated CSV upload (${row.plan})`,
            timestamp: "Just now",
          },
        ],
        invoices:
          row.paidAmount && row.paidAmount > 0
            ? [
                {
                  id: `inv-imp-${Date.now()}-${index}`,
                  invoiceNumber: invNum,
                  date: row.joinDate || todayStr,
                  amount: row.paidAmount,
                  plan: row.plan,
                  method: "UPI",
                  status: row.computedDue === 0 ? "Paid" : "Partial",
                  installmentInfo:
                    row.computedDue > 0
                      ? `Imported with remaining due: ${settings.currencySymbol}${row.computedDue}`
                      : "Full Paid",
                },
              ]
            : [],
      };
    });

    setMembers((prev) => {
      const updated = [...importedMembers, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    if (newPaymentsToAdd.length > 0) {
      setPayments((prev) => {
        const updated = [...newPaymentsToAdd, ...prev];
        safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
        return updated;
      });
    }

    addSystemLog(
      "Bulk Member Import",
      "Member",
      `Safely imported ${validation.validCount} members (${validation.errorCount} skipped/duplicates)`,
    );
    toast.success(
      `Imported ${validation.validCount} members${
        validation.errorCount > 0 ? ` (${validation.errorCount} skipped/duplicates)` : ""
      }`,
    );
    return validation.validCount;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const item = { ...m, ...updates };
          if (item.planPrice !== undefined && item.collectedAmount !== undefined) {
            item.due = Math.max(0, item.planPrice - item.collectedAmount);
          }
          const lifecycle = deriveMembershipLifecycleStatus(item.expiry, item.freezeUntil);
          item.status =
            lifecycle === "Expired"
              ? "Expired"
              : lifecycle === "Frozen"
              ? "Frozen"
              : item.due > 0
              ? "Partial"
              : "Active";
          return item;
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
    addSystemLog("Member Updated", "Member", `Updated profile details for member ID ${id}`);
  };

  const deleteMember = (id: string) => {
    if (!hasPermission("canDeleteMember")) {
      toast.error("Permission Denied: Only Directors and Administrators can delete member records.");
      return;
    }
    const target = members.find((m) => m.id === id);
    if (target?.assignedLocker) {
      releaseLocker(target.assignedLocker);
    }
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
    if (selectedMember360?.id === id) {
      setIsMember360Open(false);
      setSelectedMember360(null);
    }
    addSystemLog("Member Deleted", "Member", `Permanently removed member: ${target?.name || id}`);
    toast.success(`Removed member ${target?.name || id}`);
  };

  const evaluateAndCheckInMember = (
    memberId: string,
    options?: { isOverride?: boolean; overrideReason?: string },
  ): AccessDecision => {
    const member = members.find((m) => m.id === memberId);
    const decision = evaluateAccessDecision(member, {
      operatorName: currentUser.name,
      operatorRole: currentUser.role,
      isOverride: options?.isOverride,
      overrideReason: options?.overrideReason,
    });

    if (!decision.allowed) {
      addSystemLog(
        "Turnstile Access Blocked",
        "Attendance",
        `${member?.name || memberId}: ${decision.message}`,
      );
      return decision;
    }

    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            isCurrentlyInside: true,
            checkInTime: timeNow,
            lastVisit: `Today, ${timeNow}`,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "attendance" as const,
                title:
                  decision.code === "OVERRIDDEN"
                    ? `Turnstile Override: Checked in (${options?.overrideReason})`
                    : `Checked in at floor turnstile (${timeNow})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog(
      decision.code === "OVERRIDDEN" ? "Turnstile Override Authorized" : "Member Check-In",
      "Attendance",
      `${member?.name || memberId} authorized at ${timeNow}${
        decision.overrideReason ? ` (Reason: ${decision.overrideReason})` : ""
      }`,
    );

    return decision;
  };

  const checkInMember = (memberId: string): boolean => {
    const decision = evaluateAndCheckInMember(memberId);
    return decision.allowed;
  };

  const checkOutMember = (memberId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let memberName = "";

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          memberName = m.name;
          return {
            ...m,
            isCurrentlyInside: false,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "attendance" as const,
                title: `Checked out (${timeNow})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog(
      "Member Check-Out",
      "Attendance",
      `Checked out ${memberName || memberId} at ${timeNow}`,
    );
  };

  const renewMember = (
    memberId: string,
    durationMonths: number,
    planName?: string,
    paidAmount?: number,
    paymentMethod: "UPI" | "Cash" | "Card" | "Bank" = "UPI",
  ) => {
    const fromMember = members.find((m) => m.id === memberId);
    if (!fromMember) {
      toast.error("Member not found for renewal.");
      return;
    }

    const todayStr = formatDateYMD(new Date());
    // Early renewers preserve their remaining days!
    const newExpiry = calculateRenewalExpiry(fromMember.expiry, durationMonths, todayStr);

    const existingInvoices = [
      ...payments.map((p) => p.invoiceNumber),
      ...members.flatMap((m) => m.invoices.map((i) => i.invoiceNumber)),
    ].filter(Boolean);
    const invoiceNum = generateNextInvoiceNumber(
      existingInvoices,
      settings.invoicePrefix || "INV-2026-",
    );

    let renewedMemberName = fromMember.name;
    let prevExp = fromMember.expiry;
    const selectedPlan = planName || fromMember.plan;
    const planObj = settings.membershipPlans.find((p) => p.name === selectedPlan);
    const planPrice = planObj?.price || 3000;
    const actualPaid = paidAmount !== undefined ? paidAmount : planPrice;
    const remainingDue = Math.max(0, planPrice - actualPaid);

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          const newInstallment: InstallmentRecord = {
            id: `inst-${Date.now()}`,
            amount: actualPaid,
            date: todayStr,
            method: paymentMethod,
            invoiceNumber: invoiceNum,
            installmentNumber: 1,
            totalInstallments: remainingDue > 0 ? 2 : 1,
            note: "Renewal Fee",
          };

          const newInvoice: MemberInvoice = {
            id: `inv-${Date.now()}`,
            invoiceNumber: invoiceNum,
            date: todayStr,
            amount: actualPaid,
            plan: selectedPlan,
            method: paymentMethod,
            status: remainingDue === 0 ? "Paid" : "Partial",
            installmentInfo:
              remainingDue > 0
                ? `Renewal Installment 1 (Due: ${settings.currencySymbol}${remainingDue})`
                : "Full Renewal Paid",
          };

          return {
            ...m,
            plan: selectedPlan,
            planPrice,
            collectedAmount: actualPaid,
            due: remainingDue,
            expiry: newExpiry,
            status: remainingDue > 0 ? "Partial" : ("Active" as MemberStatus),
            freezeUntil: undefined,
            freezeReason: undefined,
            installments: [newInstallment, ...m.installments],
            invoices: [newInvoice, ...m.invoices],
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "renewal" as const,
                title: `Renewed ${selectedPlan} (${durationMonths} mos) — Exp: ${newExpiry}`,
                timestamp: "Just now",
                amount: actualPaid,
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    // Record Payment
    if (actualPaid > 0) {
      const newPayment: Payment = {
        id: `p-${Date.now()}`,
        memberId,
        member: renewedMemberName,
        date: todayStr,
        method: paymentMethod,
        amount: actualPaid,
        category: "Membership",
        status: "Paid",
        invoiceNumber: invoiceNum,
        installmentIndex: 1,
        totalInstallments: 1,
        notes: `Membership Renewal (${planName || "Plan"})`,
        collectedBy: `${currentUser.name} (${currentUser.role})`,
      };
      setPayments((prev) => {
        const updated = [newPayment, ...prev];
        safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
        return updated;
      });
    }

    // Record Renewal
    const newRenewal: RenewalRecord = {
      id: `rn-${Date.now()}`,
      memberId,
      memberName: renewedMemberName,
      planName: planName || "Membership Plan",
      previousExpiry: prevExp,
      newExpiry,
      amount: actualPaid,
      date: todayStr,
      processedBy: currentUser.name,
      paymentMethod,
    };
    setRenewals((prev) => {
      const updated = [newRenewal, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_renewals`, updated);
      return updated;
    });

    addSystemLog(
      "Membership Renewed",
      "Renewal",
      `Renewed ${renewedMemberName} for ${durationMonths} months until ${newExpiry}`,
    );
  };

  const extendMembershipDays = (memberId: string, additionalDays: number, reason: string) => {
    let memberName = "";
    let newExpiryStr = "";

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          memberName = m.name;
          const currentExp = new Date(m.expiry || new Date());
          currentExp.setDate(currentExp.getDate() + additionalDays);
          newExpiryStr = currentExp.toISOString().split("T")[0];

          return {
            ...m,
            expiry: newExpiryStr,
            status: "Active" as MemberStatus,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "upgrade" as const,
                title: `Extended membership by +${additionalDays} days (${reason})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog(
      "Membership Extended",
      "Renewal",
      `Extended ${memberName} by +${additionalDays} days until ${newExpiryStr} (${reason})`,
    );
  };

  const freezeMember = (memberId: string, days: number, reason: string) => {
    const { freezeStartDate, freezeUntilDate } = calculateFreezeWindow(days);
    let memberName = "";

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          memberName = m.name;
          return {
            ...m,
            status: "Frozen" as MemberStatus,
            freezeUntil: freezeUntilDate,
            freezeReason: reason,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "freeze" as const,
                title: `Membership frozen for ${days} days until ${freezeUntilDate} (Start: ${freezeStartDate} - ${reason})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog(
      "Membership Frozen",
      "Member",
      `Froze membership for ${memberName} until ${freezeUntilDate} (${reason})`,
    );
    toast.info(`Froze membership for ${memberName} until ${freezeUntilDate}`);
  };

  const unfreezeMember = (memberId: string) => {
    let memberName = "";
    let extendedDays = 0;
    let newExpiryDate = "";

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          memberName = m.name;
          const todayStr = formatDateYMD(new Date());
          const freezeEvent = m.timeline.find((t) => t.type === "freeze");
          const freezeMatch = freezeEvent?.title.match(/Start:\s*(\d{4}-\d{2}-\d{2})/);
          const freezeStartDate = freezeMatch ? freezeMatch[1] : todayStr;

          const { newExpiry, daysExtended } = calculateUnfreezeExpiry(
            m.expiry,
            freezeStartDate,
            todayStr,
          );
          extendedDays = daysExtended;
          newExpiryDate = newExpiry;

          const lifecycle = deriveMembershipLifecycleStatus(newExpiry);
          return {
            ...m,
            expiry: newExpiry,
            status: (lifecycle === "Expired"
              ? "Expired"
              : m.due > 0
              ? "Partial"
              : "Active") as MemberStatus,
            freezeUntil: undefined,
            freezeReason: undefined,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "freeze" as const,
                title: `Membership resumed: extended by +${daysExtended} days (New expiry: ${newExpiry})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog(
      "Membership Unfrozen",
      "Member",
      `Resumed membership for ${memberName}: extended by +${extendedDays} days until ${newExpiryDate}`,
    );
    toast.success(
      `Unfroze ${memberName} and extended validity by +${extendedDays} days until ${newExpiryDate}`,
    );
  };

  const transferMembership = (
    fromMemberId: string,
    toName: string,
    toPhone: string,
    toEmail: string,
  ) => {
    if (!hasPermission("canTransferMembership")) {
      toast.error("Permission Denied: Only Directors and Administrators can transfer memberships.");
      return;
    }
    const fromMember = members.find((m) => m.id === fromMemberId);
    if (!fromMember) {
      toast.error("Member record not found.");
      return;
    }
    if (fromMember.status === "Expired") {
      toast.error("Cannot transfer an expired membership. Please renew first.");
      return;
    }

    // Release old locker if held
    if (fromMember.assignedLocker) {
      releaseLocker(fromMember.assignedLocker);
    }

    const newId = `m-transfer-${Date.now()}`;
    const todayStr = formatDateYMD(new Date());

    const newRecipient: Member = {
      id: newId,
      name: toName,
      phone: toPhone,
      email: toEmail,
      plan: fromMember.plan,
      planPrice: fromMember.planPrice,
      collectedAmount: fromMember.collectedAmount,
      due: fromMember.due,
      joinDate: todayStr,
      expiry: fromMember.expiry,
      status: fromMember.due > 0 ? "Partial" : "Active",
      attendanceRate: 100,
      lastVisit: "Transferred today",
      isCurrentlyInside: false,
      installments: [],
      notes: `Transferred from ${fromMember.name} on ${todayStr}`,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "transfer",
          title: `Received membership transfer from ${fromMember.name} (Valid till ${fromMember.expiry})`,
          timestamp: "Just now",
        },
      ],
      invoices: [],
    };

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === fromMemberId) {
          return {
            ...m,
            status: "Expired" as MemberStatus,
            assignedLocker: undefined,
            notes: `${m.notes || ""} [Transferred remaining membership to ${toName} on ${todayStr}]`,
            timeline: [
              {
                id: `t-tr-${Date.now()}`,
                type: "transfer" as const,
                title: `Transferred remaining membership to ${toName}`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      const final = [newRecipient, ...updated];
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, final);
      return final;
    });

    addSystemLog(
      "Membership Transferred",
      "Member",
      `Transferred membership from ${fromMember.name} to ${toName}`,
    );
    toast.success(`Transferred membership to ${toName}!`);
  };

  // Payment Actions
  const recordPayment = (paymentData: {
    memberId: string;
    member: string;
    date: string;
    method: "UPI" | "Cash" | "Card" | "Bank";
    amount: number;
    category?: "Membership" | "Personal Training" | "Registration";
    notes?: string;
    installmentNumber?: number;
    totalInstallments?: number;
  }) => {
    const existingInvoices = [
      ...payments.map((p) => p.invoiceNumber),
      ...members.flatMap((m) => m.invoices.map((i) => i.invoiceNumber)),
    ].filter(Boolean);
    const invoiceNum = generateNextInvoiceNumber(
      existingInvoices,
      settings.invoicePrefix || "INV-2026-",
    );

    const newPayment: Payment = {
      ...paymentData,
      id: `p-${Date.now()}`,
      category: paymentData.category || "Membership",
      status: "Paid",
      invoiceNumber: invoiceNum,
      installmentIndex: paymentData.installmentNumber || 1,
      totalInstallments: paymentData.totalInstallments || 1,
      collectedBy: `${currentUser.name} (${currentUser.role === "admin" ? "Admin" : "Reception"})`,
    };

    setPayments((prev) => {
      const updated = [newPayment, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
      return updated;
    });

    // Update member collected dues & history
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === paymentData.memberId) {
          const newCollected = m.collectedAmount + paymentData.amount;
          const newDue = Math.max(0, m.planPrice - newCollected);

          const newInstallment: InstallmentRecord = {
            id: `inst-${Date.now()}`,
            amount: paymentData.amount,
            date: paymentData.date,
            method: paymentData.method,
            invoiceNumber: invoiceNum,
            installmentNumber: (m.installments.length || 0) + 1,
            totalInstallments: paymentData.totalInstallments || 2,
            note: paymentData.notes || "Installment Payment",
          };

          const newInvoice: MemberInvoice = {
            id: `inv-${Date.now()}`,
            invoiceNumber: invoiceNum,
            date: paymentData.date,
            amount: paymentData.amount,
            plan: m.plan,
            method: paymentData.method,
            status: newDue === 0 ? "Paid" : "Partial",
            installmentInfo:
              newDue > 0
                ? `Installment Payment (Remaining: ${settings.currencySymbol}${newDue})`
                : "Full Paid",
          };

          // DEF-004 FIX: Do NOT mark an expired member Active just because debt was cleared!
          const lifecycle = deriveMembershipLifecycleStatus(m.expiry, m.freezeUntil);
          const newStatus: MemberStatus =
            lifecycle === "Expired"
              ? "Expired"
              : lifecycle === "Frozen"
              ? "Frozen"
              : newDue > 0
              ? "Partial"
              : "Active";

          return {
            ...m,
            collectedAmount: newCollected,
            due: newDue,
            status: newStatus,
            installments: [newInstallment, ...m.installments],
            invoices: [newInvoice, ...m.invoices],
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "payment" as const,
                title: `Paid ${settings.currencySymbol}${paymentData.amount.toLocaleString("en-IN")} via ${paymentData.method}`,
                timestamp: "Just now",
                amount: paymentData.amount,
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog(
      "Payment Collected",
      "Payment",
      `Collected ${settings.currencySymbol}${paymentData.amount} from ${paymentData.member} via ${paymentData.method} (${invoiceNum})`,
    );
    toast.success(
      `Recorded payment of ${settings.currencySymbol}${paymentData.amount.toLocaleString("en-IN")} (${invoiceNum})`,
    );
  };

  const refundPayment = (paymentId: string, refundAmount: number, reason: string): boolean => {
    if (!hasPermission("canProcessRefunds")) {
      toast.error("Permission Denied: Only Directors and Administrators can process refunds.");
      return false;
    }

    const targetPayment = payments.find((p) => p.id === paymentId);
    if (!targetPayment) {
      toast.error("Payment record not found.");
      return false;
    }

    const targetMember = members.find((m) => m.id === targetPayment.memberId);
    const refundEval = evaluateRefundState(
      targetPayment.amount,
      refundAmount,
      targetMember?.collectedAmount || targetPayment.amount,
      targetMember?.planPrice || targetPayment.amount,
    );

    if (!refundEval.isEligible) {
      toast.error(refundEval.errorMessage || "Invalid refund amount.");
      return false;
    }

    const todayStr = formatDateYMD(new Date());
    const existingCreditNotes = refunds.map((r) => r.id);
    const creditNoteNum = generateNextCreditNoteNumber(existingCreditNotes);

    // Update payment record with partial or full status
    setPayments((prev) => {
      const updated = prev.map((p) => {
        if (p.id === paymentId) {
          return {
            ...p,
            status: (refundEval.paymentStatus === "Refunded"
              ? "Refunded"
              : "Partial") as Payment["status"],
            notes: `${p.notes || ""} [REFUND ${creditNoteNum}: ${settings.currencySymbol}${refundAmount} on ${todayStr} - ${reason}]`,
          };
        }
        return p;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
      return updated;
    });

    // Update member balance and append credit note to invoice register
    if (targetPayment.memberId) {
      setMembers((prev) => {
        const updated = prev.map((m) => {
          if (m.id === targetPayment.memberId) {
            const creditNoteInvoice: MemberInvoice = {
              id: `cn-${Date.now()}`,
              invoiceNumber: creditNoteNum,
              date: todayStr,
              amount: -refundAmount,
              plan: `Credit Note (${targetPayment.invoiceNumber})`,
              method: targetPayment.method,
              status: "Refunded",
              installmentInfo: `Credit Note against ${targetPayment.invoiceNumber} (${reason})`,
            };

            const lifecycle = deriveMembershipLifecycleStatus(m.expiry, m.freezeUntil);
            const updatedStatus: MemberStatus =
              lifecycle === "Expired"
                ? "Expired"
                : lifecycle === "Frozen"
                ? "Frozen"
                : refundEval.newDue > 0
                ? "Partial"
                : "Active";

            return {
              ...m,
              collectedAmount: refundEval.newCollectedAmount,
              due: refundEval.newDue,
              status: updatedStatus,
              invoices: [creditNoteInvoice, ...m.invoices],
              timeline: [
                {
                  id: `t-ref-${Date.now()}`,
                  type: "refund" as const,
                  title: `Processed Refund (${creditNoteNum}) of ${settings.currencySymbol}${refundAmount} (${reason})`,
                  timestamp: "Just now",
                  amount: -refundAmount,
                },
                ...m.timeline,
              ],
            };
          }
          return m;
        });
        safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
        return updated;
      });
    }

    // Record authoritative Refund entry
    const refundRecord: RefundRecord = {
      id: creditNoteNum,
      paymentId,
      memberId: targetPayment.memberId || "",
      memberName: targetPayment.member,
      amount: refundAmount,
      date: todayStr,
      reason,
      processedBy: currentUser.name,
      invoiceNumber: targetPayment.invoiceNumber,
    };

    setRefunds((prev) => {
      const updated = [refundRecord, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_refunds`, updated);
      return updated;
    });

    addSystemLog(
      "Payment Refunded",
      "Refund",
      `Refunded ${settings.currencySymbol}${refundAmount} (${creditNoteNum}) to ${targetPayment.member} (${reason})`,
    );
    toast.success(
      `Processed refund of ${settings.currencySymbol}${refundAmount.toLocaleString("en-IN")} (${creditNoteNum})`,
    );
    return true;
  };

  // Staff CRUD
  const addStaff = (
    staffData: Omit<StaffMember, "id" | "leaveRecords" | "assignedClientsCount">,
  ) => {
    const newStaff: StaffMember = {
      ...staffData,
      id: `staff-${Date.now()}`,
      leaveRecords: [],
      assignedClientsCount: 0,
    };
    setStaff((prev) => {
      const updated = [...prev, newStaff];
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
    addSystemLog("Staff Added", "Staff", `Added staff member: ${newStaff.name} (${newStaff.role})`);
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
    addSystemLog("Staff Updated", "Staff", `Updated staff profile for ID ${id}`);
  };

  const deleteStaff = (id: string) => {
    const target = staff.find((s) => s.id === id);
    setStaff((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
    addSystemLog("Staff Removed", "Staff", `Removed staff member ${target?.name || id}`);
  };

  // Operational Expenses, Utility Bills & Rent Actions
  const addExpense = (expenseData: Omit<GymExpense, "id">) => {
    const newExpense: GymExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => {
      const updated = [newExpense, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_expenses`, updated);
      return updated;
    });
    addSystemLog(
      "Expense Logged",
      "Payment",
      `Recorded ${settings.currencySymbol}${newExpense.amount.toLocaleString("en-IN")} for ${newExpense.title} (${newExpense.category})`,
    );
  };

  const updateExpense = (id: string, updates: Partial<GymExpense>) => {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...updates } : e));
      safePersist(`${STORAGE_KEY_PEAKREP}_expenses`, updated);
      return updated;
    });
    addSystemLog("Expense Updated", "Payment", `Updated expense record ${id}`);
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_expenses`, updated);
      return updated;
    });
    addSystemLog("Expense Removed", "Payment", `Removed expense record: ${target?.title || id}`);
  };

  // Staff Salary Disbursement (Integrated with Operational Expenses Outflow)
  const payStaffSalary = (
    staffId: string,
    paymentMethod: "UPI" | "Bank Transfer" | "Cash" | "Cheque" = "Bank Transfer",
    notes: string = "",
  ) => {
    const target = staff.find((s) => s.id === staffId);
    if (!target) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    // 1. Create a Salary Outflow Expense in Financial Ledger
    const salaryExpense: GymExpense = {
      id: `exp-sal-${Date.now()}`,
      title: `Staff Salary — ${target.name} (${target.role})`,
      category: "Staff Salary",
      amount: target.salary,
      date: todayStr,
      paymentMethod,
      status: "Paid",
      recipientName: target.name,
      receiptNumber: `PAY-${Date.now().toString().slice(-6)}`,
      notes: notes || `${currentMonth} Monthly Payroll Disbursement`,
      recordedBy: currentUser.name,
      staffId: target.id,
    };

    setExpenses((prev) => {
      const updated = [salaryExpense, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_expenses`, updated);
      return updated;
    });

    // 2. Mark Staff record as paid today
    setStaff((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, lastPaidDate: todayStr } : s));
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });

    addSystemLog(
      "Salary Paid",
      "Staff",
      `Disbursed ${settings.currencySymbol}${target.salary.toLocaleString("en-IN")} to ${target.name} (${target.role}) via ${paymentMethod}`,
    );
  };

  const toggleStaffStatus = (staffId: string, status: "On Floor" | "Off Duty" | "On Leave") => {
    setStaff((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, status } : s));
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
    addSystemLog(
      "Staff Status Changed",
      "Staff",
      `Changed status of staff ${staffId} to ${status}`,
    );
  };

  const approveLeaveRequest = (staffId: string, leaveId: string) => {
    setStaff((prev) => {
      const updated = prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            leaveRecords: s.leaveRecords.map((l) =>
              l.id === leaveId ? { ...l, status: "Approved" as const } : l,
            ),
          };
        }
        return s;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
    addSystemLog(
      "Leave Approved",
      "Staff",
      `Approved leave request ${leaveId} for staff ${staffId}`,
    );
  };

  // Plans CRUD
  const addPlan = (
    planData: Omit<
      MembershipPlan,
      "id" | "activeCount" | "expiringCount" | "frozenCount" | "upgradeOpportunities"
    >,
  ) => {
    if (!hasPermission("canManagePlans")) {
      toast.error(
        "Permission Denied: Only Directors and Administrators can configure membership plans.",
      );
      return;
    }
    const newPlan: MembershipPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      activeCount: 0,
      expiringCount: 0,
      frozenCount: 0,
      upgradeOpportunities: 0,
    };
    setSettings((prev) => {
      const updated = { ...prev, membershipPlans: [...prev.membershipPlans, newPlan] };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
    addSystemLog(
      "Plan Created",
      "Plan",
      `Created new membership plan: ${newPlan.name} (${settings.currencySymbol}${newPlan.price})`,
    );
    toast.success(`Created plan ${newPlan.name}!`);
  };

  const updatePlan = (id: string, updates: Partial<MembershipPlan>) => {
    if (!hasPermission("canManagePlans")) {
      toast.error("Permission Denied: Only Directors and Administrators can edit membership plans.");
      return;
    }
    setSettings((prev) => {
      const updated = {
        ...prev,
        membershipPlans: prev.membershipPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
    addSystemLog("Plan Updated", "Plan", `Updated plan ID ${id}`);
    toast.success("Updated membership plan!");
  };

  const deletePlan = (id: string) => {
    if (!hasPermission("canManagePlans")) {
      toast.error(
        "Permission Denied: Only Directors and Administrators can delete membership plans.",
      );
      return;
    }
    const targetPlan = settings.membershipPlans.find((p) => p.id === id);
    if (!targetPlan) return;
    const enrolledMembersCount = members.filter((m) => m.plan === targetPlan.name).length;
    if (enrolledMembersCount > 0) {
      toast.error(
        `Cannot delete "${targetPlan.name}": ${enrolledMembersCount} members are currently enrolled. Reassign them first.`,
      );
      return;
    }

    setSettings((prev) => {
      const updated = {
        ...prev,
        membershipPlans: prev.membershipPlans.filter((p) => p.id !== id),
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
    addSystemLog("Plan Deleted", "Plan", `Deleted plan: ${targetPlan.name}`);
    toast.success(`Deleted plan ${targetPlan.name}`);
  };

  // Lead CRM
  const addLead = (leadData: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLeads((prev) => {
      const updated = [newLead, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_leads`, updated);
      return updated;
    });
    addSystemLog("Lead Added", "Member", `Recorded new lead: ${newLead.name} (${newLead.source})`);
  };

  const updateLeadStage = (leadId: string, stage: LeadStage) => {
    setLeads((prev) => {
      const updated = prev.map((l) => (l.id === leadId ? { ...l, stage } : l));
      safePersist(`${STORAGE_KEY_PEAKREP}_leads`, updated);
      return updated;
    });
  };

  const convertLeadToMember = (
    leadId: string,
    planName: string,
    initialPaid?: number,
    method: "UPI" | "Cash" | "Card" | "Bank" = "UPI",
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const planObj = settings.membershipPlans.find((p) => p.name === planName);
    const planPrice = planObj?.price || 3000;
    const paid = initialPaid !== undefined ? initialPaid : planPrice;
    const due = Math.max(0, planPrice - paid);

    addMember({
      name: targetLead.name,
      phone: targetLead.phone,
      email: targetLead.email,
      plan: planName,
      planPrice,
      due,
      joinDate: new Date().toISOString().split("T")[0],
      expiry: new Date(Date.now() + (planObj?.durationMonths || 1) * 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      status: due > 0 ? "Partial" : "Active",
      healthGoal: targetLead.fitnessGoal,
      assignedTrainer: targetLead.assignedTrainer,
      notes: `Converted from Lead (Source: ${targetLead.source}). ${targetLead.notes}`,
    });

    updateLeadStage(leadId, "Won");
  };

  // Workout Programs & Diets
  const addWorkoutProgram = (
    programData: Omit<WorkoutProgram, "id" | "assignedCount" | "createdAt">,
  ) => {
    const newProg: WorkoutProgram = {
      ...programData,
      id: `wo-${Date.now()}`,
      assignedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setWorkoutPrograms((prev) => {
      const updated = [newProg, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, updated);
      return updated;
    });
  };

  const updateWorkoutProgram = (id: string, updates: Partial<WorkoutProgram>) => {
    setWorkoutPrograms((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, ...updates } : w));
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, updated);
      return updated;
    });
  };

  const duplicateWorkoutProgram = (id: string) => {
    const source = workoutPrograms.find((w) => w.id === id);
    if (!source) return;
    const clone: WorkoutProgram = {
      ...source,
      id: `wo-${Date.now()}`,
      title: `${source.title} (Copy)`,
      assignedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setWorkoutPrograms((prev) => {
      const updated = [clone, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, updated);
      return updated;
    });
  };

  const deleteWorkoutProgram = (id: string) => {
    setWorkoutPrograms((prev) => {
      const updated = prev.filter((w) => w.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, updated);
      return updated;
    });
  };

  const archiveWorkoutProgram = (id: string) => {
    setWorkoutPrograms((prev) => {
      const updated = prev.map((w) => (w.id === id ? { ...w, isArchived: !w.isArchived } : w));
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, updated);
      return updated;
    });
  };

  const assignWorkoutToMember = (memberId: string, workoutId: string) => {
    const prog = workoutPrograms.find((w) => w.id === workoutId);
    if (!prog) return;
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId ? { ...m, assignedWorkout: prog.title, assignedWorkoutId: prog.id } : m,
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
  };

  const addDietPlan = (dietData: Omit<DietPlan, "id" | "assignedCount" | "createdAt">) => {
    const newDiet: DietPlan = {
      ...dietData,
      id: `diet-${Date.now()}`,
      assignedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDietPlans((prev) => {
      const updated = [newDiet, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, updated);
      return updated;
    });
  };

  const updateDietPlan = (id: string, updates: Partial<DietPlan>) => {
    setDietPlans((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, ...updates } : d));
      safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, updated);
      return updated;
    });
  };

  const duplicateDietPlan = (id: string) => {
    const source = dietPlans.find((d) => d.id === id);
    if (!source) return;
    const clone: DietPlan = {
      ...source,
      id: `diet-${Date.now()}`,
      title: `${source.title} (Copy)`,
      assignedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDietPlans((prev) => {
      const updated = [clone, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, updated);
      return updated;
    });
  };

  const deleteDietPlan = (id: string) => {
    setDietPlans((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, updated);
      return updated;
    });
  };

  const archiveDietPlan = (id: string) => {
    setDietPlans((prev) => {
      const updated = prev.map((d) => (d.id === id ? { ...d, isArchived: !d.isArchived } : d));
      safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, updated);
      return updated;
    });
  };

  const assignDietToMember = (memberId: string, dietId: string) => {
    const diet = dietPlans.find((d) => d.id === dietId);
    if (!diet) return;
    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId ? { ...m, assignedDiet: diet.title, assignedDietId: diet.id } : m,
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
  };

  const assignProgramToMember = (
    memberId: string,
    workoutId?: string,
    dietId?: string,
    notes?: string,
  ) => {
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          const wObj = workoutPrograms.find((w) => w.id === workoutId);
          const dObj = dietPlans.find((d) => d.id === dietId);
          return {
            ...m,
            assignedWorkout: wObj ? wObj.title : m.assignedWorkout,
            assignedWorkoutId: wObj ? wObj.id : m.assignedWorkoutId,
            assignedDiet: dObj ? dObj.title : m.assignedDiet,
            assignedDietId: dObj ? dObj.id : m.assignedDietId,
            notes: notes !== undefined ? notes : m.notes,
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
  };

  // Lockers
  const assignLocker = (
    lockerNumber: number,
    memberId: string,
    memberName: string,
    durationDays = 30,
  ): boolean => {
    const targetLocker = lockers.find((l) => l.number === lockerNumber);
    if (
      targetLocker &&
      targetLocker.status === "Occupied" &&
      targetLocker.assignedMemberId !== memberId
    ) {
      toast.error(
        `Locker #${lockerNumber} is already occupied by ${targetLocker.assignedMemberName}.`,
      );
      return false;
    }
    if (targetLocker && targetLocker.status === "Under Maintenance") {
      toast.error(`Locker #${lockerNumber} is currently under maintenance.`);
      return false;
    }

    // Release any previous locker held by this member
    const prevLocker = lockers.find(
      (l) => l.assignedMemberId === memberId && l.number !== lockerNumber,
    );
    if (prevLocker) {
      releaseLocker(prevLocker.number);
    }

    const exp = new Date();
    exp.setDate(exp.getDate() + durationDays);
    const expStr = exp.toISOString().split("T")[0];

    setLockers((prev) => {
      const updated = prev.map((l) => {
        if (l.number === lockerNumber) {
          return {
            ...l,
            status: "Occupied" as LockerStatus,
            assignedMemberId: memberId,
            assignedMemberName: memberName,
            expiresOn: expStr,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Assigned",
                timestamp: new Date().toISOString().split("T")[0],
                details: `Assigned to ${memberName} (Expires ${expStr})`,
              },
              ...l.history,
            ],
          };
        }
        return l;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });

    setMembers((prev) => {
      const updated = prev.map((m) =>
        m.id === memberId ? { ...m, assignedLocker: lockerNumber } : m,
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    addSystemLog("Locker Assigned", "Locker", `Assigned locker #${lockerNumber} to ${memberName}`);
    toast.success(`Assigned locker #${lockerNumber} to ${memberName}`);
    return true;
  };

  const reserveLocker = (lockerNumber: number, reservedFor: string, note?: string) => {
    setLockers((prev) => {
      const updated = prev.map((l) => {
        if (l.number === lockerNumber) {
          return {
            ...l,
            status: "Reserved" as LockerStatus,
            reservedFor,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Reserved",
                timestamp: new Date().toISOString().split("T")[0],
                details: `Reserved for ${reservedFor} (${note || "Hold"})`,
              },
              ...l.history,
            ],
          };
        }
        return l;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });
  };

  const releaseLocker = (lockerNumber: number) => {
    let releasedMemberId: string | undefined;

    setLockers((prev) => {
      const updated = prev.map((l) => {
        if (l.number === lockerNumber) {
          releasedMemberId = l.assignedMemberId;
          const oldMember = l.assignedMemberName;
          return {
            ...l,
            status: "Available" as LockerStatus,
            assignedMemberId: undefined,
            assignedMemberName: undefined,
            expiresOn: undefined,
            reservedFor: undefined,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Released",
                timestamp: new Date().toISOString().split("T")[0],
                details: `Released and made available (Previously: ${oldMember || "Occupied"})`,
              },
              ...l.history,
            ],
          };
        }
        return l;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });

    // Clear assignedLocker on member
    if (releasedMemberId) {
      setMembers((prev) => {
        const updated = prev.map((m) =>
          m.id === releasedMemberId ? { ...m, assignedLocker: undefined } : m,
        );
        safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
        return updated;
      });
    }

    addSystemLog("Locker Released", "Locker", `Released locker #${lockerNumber}`);
  };

  const markLockerMaintenance = (lockerNumber: number, issue: string, date?: string) => {
    const mDate = date || new Date().toISOString().split("T")[0];
    setLockers((prev) => {
      const updated = prev.map((l) => {
        if (l.number === lockerNumber) {
          return {
            ...l,
            status: "Under Maintenance" as LockerStatus,
            maintenanceDate: mDate,
            maintenanceIssue: issue,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Maintenance",
                timestamp: mDate,
                details: `Reported issue: ${issue}`,
              },
              ...l.history,
            ],
          };
        }
        return l;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });
  };

  const completeLockerRepair = (
    lockerNumber: number,
    repairNotes?: string,
    repairedBy = "Maintenance Team",
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    setLockers((prev) => {
      const updated = prev.map((l) => {
        if (l.number === lockerNumber) {
          const repairItem: LockerRepairLog = {
            id: `rep-${Date.now()}`,
            issue: l.maintenanceIssue || "Routine Repair",
            repairedAt: todayStr,
            repairedBy,
            notes: repairNotes,
          };
          return {
            ...l,
            status: "Available" as LockerStatus,
            maintenanceDate: undefined,
            maintenanceIssue: undefined,
            repairHistory: [repairItem, ...l.repairHistory],
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Repaired",
                timestamp: todayStr,
                details: `Repaired by ${repairedBy}: ${repairNotes || "Issue resolved"}`,
              },
              ...l.history,
            ],
          };
        }
        return l;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });
  };

  // Broadcast Communications
  const sendBroadcastMessage = (
    broadcastData: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">,
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newBroadcast: BroadcastMessage = {
      ...broadcastData,
      id: `bc-${Date.now()}`,
      status: "Sent",
      sentAt: `Today, ${timeNow}`,
      createdAt: todayStr,
    };
    setBroadcasts((prev) => {
      const updated = [newBroadcast, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, updated);
      return updated;
    });
    addSystemLog(
      "Broadcast Sent",
      "Settings",
      `Dispatched broadcast "${newBroadcast.title}" to ${newBroadcast.recipientCount} members`,
    );
  };

  const saveDraftBroadcast = (
    broadcastData: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">,
  ) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const draft: BroadcastMessage = {
      ...broadcastData,
      id: `bc-${Date.now()}`,
      status: "Draft",
      createdAt: todayStr,
    };
    setBroadcasts((prev) => {
      const updated = [draft, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, updated);
      return updated;
    });
  };

  const deleteBroadcastMessage = (id: string) => {
    setBroadcasts((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, updated);
      return updated;
    });
  };

  // Multi-Location Actions
  const addLocation = (locData: Omit<GymLocation, "id">) => {
    const newLoc: GymLocation = {
      ...locData,
      id: `loc-${Date.now()}`,
    };
    setLocations((prev) => {
      const updated = [...prev, newLoc];
      safePersist(`${STORAGE_KEY_PEAKREP}_locations`, updated);
      return updated;
    });
  };

  const updateLocation = (id: string, updates: Partial<GymLocation>) => {
    setLocations((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, ...updates } : l));
      safePersist(`${STORAGE_KEY_PEAKREP}_locations`, updated);
      return updated;
    });
  };

  const deleteLocation = (id: string) => {
    setLocations((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_locations`, updated);
      return updated;
    });
  };

  const switchLocation = (locationId: string) => {
    setCurrentLocationId(locationId);
    safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, locationId);
    const targetLoc = locations.find((l) => l.id === locationId);
    if (targetLoc) {
      setSettings((prev) => {
        const updated = {
          ...prev,
          name: targetLoc.name.split(" · ")[0],
          location: targetLoc.name.split(" · ")[1] || prev.location,
          address: targetLoc.address || prev.address,
          phone: targetLoc.phone || prev.phone,
        };
        safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
        return updated;
      });
    }
  };

  // Settings Actions
  const updateSettings = (newSettings: Partial<GymSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });

    if (newSettings.ownerName) {
      const newOwnerName = newSettings.ownerName.trim();
      setCurrentUser((prevUser) => {
        if (prevUser.role === "admin") {
          const updatedUser: CurrentUser = {
            ...prevUser,
            name: newOwnerName,
            avatar:
              newOwnerName
                .split(" ")
                .map((w: string) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "AD",
          };
          safePersistSession(updatedUser);
          return updatedUser;
        }
        return prevUser;
      });
    }

    addSystemLog("Settings Updated", "Settings", "Updated gym business settings & preferences");
  };

  const setBrandColor = (hex: string, themeName?: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        brandColor: hex,
        brandThemeName: themeName || prev.brandThemeName || "Custom Brand",
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
    applyBrandThemeCss(hex);
  };

  const updateGymLogo = (logoBase64: string) => {
    setSettings((prev) => {
      const updated = { ...prev, logoUrl: logoBase64 };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });

    if (logoBase64 && logoBase64.startsWith("data:image")) {
      extractDominantColor(logoBase64)
        .then((hex) => {
          setBrandColor(hex, "Extracted from Gym Logo");
          addSystemLog(
            "Brand Color Extracted",
            "Settings",
            `Extracted dominant logo color: ${hex}`,
          );
        })
        .catch((err) => {
          console.warn("[ColorExtractor] Failed to extract dominant color:", err);
        });
    }
  };

  const removeGymLogo = () => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        logoUrl: "",
        brandColor: "#3b82f6",
        brandThemeName: "Cobalt Enterprise",
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
    applyBrandThemeCss("#3b82f6");
  };

  const resetToDefaultData = () => {
    setCurrentUser(DEFAULT_ADMIN_USER);
    setMembers(DEFAULT_MEMBERS);
    setPayments(DEFAULT_PAYMENTS);
    setExpenses(DEFAULT_EXPENSES);
    setStaff(DEFAULT_STAFF);
    setSettings(DEFAULT_SETTINGS);
    setLeads(DEFAULT_LEADS);
    setWorkoutPrograms(DEFAULT_WORKOUT_PROGRAMS);
    setDietPlans(DEFAULT_DIET_PLANS);
    setLockers(DEFAULT_LOCKERS);
    setBroadcasts(DEFAULT_BROADCASTS);
    setLocations(DEFAULT_LOCATIONS);
    setSystemLogs(DEFAULT_SYSTEM_LOGS);
    setRefunds(DEFAULT_REFUNDS);
    setRenewals(DEFAULT_RENEWALS);
    setCurrentLocationId("loc-1");

    safePersistSession(DEFAULT_ADMIN_USER);
    safePersist(`${STORAGE_KEY_PEAKREP}_members`, DEFAULT_MEMBERS);
    safePersist(`${STORAGE_KEY_PEAKREP}_payments`, DEFAULT_PAYMENTS);
    safePersist(`${STORAGE_KEY_PEAKREP}_expenses`, DEFAULT_EXPENSES);
    safePersist(`${STORAGE_KEY_PEAKREP}_staff`, DEFAULT_STAFF);
    safePersist(`${STORAGE_KEY_PEAKREP}_settings`, DEFAULT_SETTINGS);
    safePersist(`${STORAGE_KEY_PEAKREP}_leads`, DEFAULT_LEADS);
    safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, DEFAULT_WORKOUT_PROGRAMS);
    safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, DEFAULT_DIET_PLANS);
    safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, DEFAULT_LOCKERS);
    safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, DEFAULT_BROADCASTS);
    safePersist(`${STORAGE_KEY_PEAKREP}_locations`, DEFAULT_LOCATIONS);
    safePersist(`${STORAGE_KEY_PEAKREP}_system_logs`, DEFAULT_SYSTEM_LOGS);
    safePersist(`${STORAGE_KEY_PEAKREP}_refunds`, DEFAULT_REFUNDS);
    safePersist(`${STORAGE_KEY_PEAKREP}_renewals`, DEFAULT_RENEWALS);
    safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, "loc-1");

    applyBrandThemeCss("#3b82f6");
  };

  return (
    <GymContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        currentUser,
        login,
        logout,
        switchRole,
        requestRoleSwitch,
        isAdminAuthModalOpen,
        setIsAdminAuthModalOpen,
        verifyAndSwitchToAdmin,
        hasPermission,
        members,
        payments,
        expenses,
        staff,
        settings,
        leads,
        workoutPrograms,
        dietPlans,
        lockers,
        broadcasts,
        locations,
        systemLogs,
        refunds,
        renewals,
        currentLocationId,
        lastSaved,
        isSaved,
        exportData,
        importData,
        addSystemLog,
        addMember,
        bulkImportMembers,
        validateImportBatch,
        updateMember,
        deleteMember,
        checkInMember,
        evaluateAndCheckInMember,
        checkOutMember,
        renewMember,
        extendMembershipDays,
        freezeMember,
        unfreezeMember,
        transferMembership,
        recordPayment,
        refundPayment,
        runReconciliation: () => runFinancialReconciliation(payments, members, refunds),
        getAttendanceDropAlerts: () => identifyAttendanceDrops(members),
        getRetentionMetrics: () => calculateRetentionMetrics(members),
        getDailyClose: (date?: string) =>
          computeDailyCloseSummary(
            date || formatDateYMD(new Date()),
            payments,
            expenses,
            refunds,
          ),
        addExpense,
        updateExpense,
        deleteExpense,
        addStaff,
        updateStaff,
        deleteStaff,
        payStaffSalary,
        toggleStaffStatus,
        approveLeaveRequest,
        addPlan,
        updatePlan,
        deletePlan,
        addLead,
        updateLeadStage,
        convertLeadToMember,
        addWorkoutProgram,
        updateWorkoutProgram,
        duplicateWorkoutProgram,
        deleteWorkoutProgram,
        archiveWorkoutProgram,
        assignWorkoutToMember,
        addDietPlan,
        updateDietPlan,
        duplicateDietPlan,
        deleteDietPlan,
        archiveDietPlan,
        assignDietToMember,
        assignProgramToMember,
        assignLocker,
        reserveLocker,
        releaseLocker,
        markLockerMaintenance,
        completeLockerRepair,
        sendBroadcastMessage,
        saveDraftBroadcast,
        deleteBroadcastMessage,
        addLocation,
        updateLocation,
        deleteLocation,
        switchLocation,
        isUPIQRModalOpen,
        setIsUPIQRModalOpen,
        upiQRPaymentDetails,
        openUPIQRModal,
        isAddMemberOpen,
        setIsAddMemberOpen,
        isRecordPaymentOpen,
        setIsRecordPaymentOpen,
        paymentForMember,
        setPaymentForMember,
        isCheckInOpen,
        setIsCheckInOpen,
        isMember360Open,
        setIsMember360Open,
        selectedMember360,
        setSelectedMember360,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoicePayment,
        setActiveInvoicePayment,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        activeSettingsTab,
        setActiveSettingsTab,
        editingMember,
        setEditingMember,
        isBulkImportOpen,
        setIsBulkImportOpen,
        isRefundModalOpen,
        setIsRefundModalOpen,
        selectedPaymentForRefund,
        setSelectedPaymentForRefund,
        isRenewModalOpen,
        setIsRenewModalOpen,
        selectedMemberForRenewal,
        setSelectedMemberForRenewal,
        isTransferModalOpen,
        setIsTransferModalOpen,
        selectedMemberForTransfer,
        setSelectedMemberForTransfer,
        isFreezeModalOpen,
        setIsFreezeModalOpen,
        selectedMemberForFreeze,
        setSelectedMemberForFreeze,
        isExpenseModalOpen,
        setIsExpenseModalOpen,
        editingExpense,
        setEditingExpense,
        updateSettings,
        updateGymLogo,
        removeGymLogo,
        setBrandColor,
        resetToDefaultData,
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

export const useGymStore = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGymStore must be used within a GymProvider");
  }
  return context;
};
