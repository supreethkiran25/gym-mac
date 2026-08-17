import React, { createContext, useContext, useEffect, useState, useRef } from "react";

export type MemberStatus = "Active" | "Expiring" | "Expired" | "Partial" | "Frozen";

export interface MemberTimelineEvent {
  id: string;
  type: "registration" | "payment" | "attendance" | "upgrade" | "pt_session" | "freeze" | "workout_assigned" | "diet_assigned" | "locker_assigned" | "broadcast_sent";
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
  status: "Paid" | "Partial";
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
  status: "Paid" | "Partial" | "Overdue";
  invoiceNumber: string;
  installmentIndex?: number;
  totalInstallments?: number;
  notes?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  type: "Standard" | "Premium" | "PT Package" | "VIP Pass";
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
  leaveRecords: {
    id: string;
    type: "Casual" | "Sick" | "Annual";
    fromDate: string;
    toDate: string;
    status: "Approved" | "Pending" | "Rejected";
    reason: string;
  }[];
}

// Lead CRM Model
export type LeadStage = "Inquiry" | "Trial Scheduled" | "Trial Completed" | "Offer Sent" | "Won" | "Lost";

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
  category: "Announcement" | "Renewal Notice" | "Gym Closure" | "Class Update" | "Promotion" | "Urgent Alert";
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

export interface GymSettings {
  name: string;
  ownerName: string;
  location: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
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
}

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
    activeCount: 1,
    expiringCount: 0,
    frozenCount: 0,
    upgradeOpportunities: 0,
  },
  {
    id: "plan-2",
    name: "Quarterly Pro",
    price: 8000,
    durationMonths: 3,
    type: "Standard",
    perks: ["Full floor access", "Steam & Sauna access", "Diet consultation", "Locker storage"],
    activeCount: 0,
    expiringCount: 0,
    frozenCount: 0,
    upgradeOpportunities: 0,
  },
  {
    id: "plan-3",
    name: "Annual Elite",
    price: 24000,
    durationMonths: 12,
    type: "VIP Pass",
    perks: ["All-hours unlimited access", "2 Free PT Sessions / mo", "Custom Nutrition chart", "Free towel service"],
    activeCount: 0,
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
    perks: ["Dedicated Senior Coach", "Custom biometric tracking", "Weekly diet adjust", "Recovery zone access"],
    activeCount: 0,
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
    assignedTrainer: "Head Coach",
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
      { id: "t-1", type: "attendance", title: "Checked in at Main Floor Gate", timestamp: "Today, 6:30 AM" },
      { id: "t-2", type: "payment", title: "Paid ₹3,000 for Monthly Flex Pass via UPI", timestamp: "May 01, 2026", amount: 3000 },
      { id: "t-3", type: "registration", title: "Enrolled in Gold's Gym Mysore", timestamp: "May 01, 2026" },
    ],
    invoices: [
      { id: "inv-kariya-1", invoiceNumber: "INV-2026-0001", date: "2026-05-01", amount: 3000, plan: "Monthly Flex", method: "UPI", status: "Paid", installmentInfo: "Single Full Payment" },
    ],
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
    assignedCount: 1,
    createdAt: "2026-05-01",
    routine: [
      {
        day: "Day 1: Push (Chest, Shoulders, Triceps)",
        focus: "Horizontal & vertical pressing",
        exercises: [
          { id: "ex-1", name: "Incline Barbell Bench Press", sets: "4", reps: "8-10", weightTarget: "70-85 kg", restTime: "90s", instructions: "Touch upper chest, control 3-sec eccentric." },
          { id: "ex-2", name: "Flat Dumbbell Press", sets: "3", reps: "10-12", weightTarget: "30 kg DBs", restTime: "75s", instructions: "Full stretch at bottom." },
          { id: "ex-3", name: "Standing Overhead DB Press", sets: "3", reps: "8-10", weightTarget: "20 kg DBs", restTime: "90s", instructions: "Keep core locked." },
          { id: "ex-4", name: "Cable Lateral Raises", sets: "4", reps: "12-15", weightTarget: "10 kg", restTime: "60s", instructions: "Pause at parallel." },
          { id: "ex-5", name: "Tricep Rope Pushdowns", sets: "3", reps: "12-15", weightTarget: "25 kg", restTime: "60s", instructions: "Spread rope at full extension." },
        ],
      },
      {
        day: "Day 2: Pull (Back, Rear Delts, Biceps)",
        focus: "Vertical & horizontal pulling",
        exercises: [
          { id: "ex-6", name: "Barbell Conventional Deadlift", sets: "4", reps: "6-8", weightTarget: "120 kg", restTime: "120s", instructions: "Brace core, neutral spine throughout." },
          { id: "ex-7", name: "Wide Grip Lat Pulldown", sets: "3", reps: "10-12", weightTarget: "60 kg", restTime: "75s", instructions: "Pull to collarbone with elbow drive." },
          { id: "ex-8", name: "Chest Supported Seated Cable Row", sets: "3", reps: "10-12", weightTarget: "55 kg", restTime: "75s", instructions: "Squeeze scapulae 1 sec." },
          { id: "ex-9", name: "Incline DB Bicep Curls", sets: "3", reps: "10-12", weightTarget: "14 kg DBs", restTime: "60s", instructions: "Full supination at peak." },
        ],
      },
      {
        day: "Day 3: Legs (Quads, Hamstrings, Calves)",
        focus: "Lower body power and knee flexion",
        exercises: [
          { id: "ex-10", name: "Barbell Back Squat", sets: "4", reps: "8-10", weightTarget: "100 kg", restTime: "120s", instructions: "Hit parallel depth, drive through midfoot." },
          { id: "ex-11", name: "Romanian Deadlift", sets: "3", reps: "10-12", weightTarget: "80 kg", restTime: "90s", instructions: "Hinge at hips, slight knee bend." },
          { id: "ex-12", name: "Leg Press 45-Degree", sets: "3", reps: "12-15", weightTarget: "180 kg", restTime: "75s", instructions: "No lockout at top." },
          { id: "ex-13", name: "Standing Calf Raises", sets: "4", reps: "15-20", weightTarget: "60 kg", restTime: "45s", instructions: "2-sec deep stretch at bottom." },
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
    assignedCount: 1,
    createdAt: "2026-05-01",
    meals: [
      { time: "07:30 AM", name: "Breakfast Fuel", items: "4 Whole Eggs, 2 Slices Whole Grain Toast, 1 Banana", quantity: "1 Plate", calories: 580, protein: 32, carbs: 54, fats: 22, instructions: "Scramble eggs in olive oil spray." },
      { time: "11:00 AM", name: "Mid-Morning Snack", items: "Greek Yogurt, 30g Mixed Almonds & Walnuts, Honey", quantity: "200g bowl", calories: 340, protein: 22, carbs: 24, fats: 16, instructions: "Mix with cinnamon." },
      { time: "01:30 PM", name: "Power Lunch", items: "Grilled Chicken Breast / Paneer, 150g Steamed Basmati Rice, Green Salad", quantity: "1 Large Bowl", calories: 680, protein: 55, carbs: 70, fats: 14, instructions: "Season with lemon and herbs." },
      { time: "05:00 PM", name: "Pre-Workout Fuel", items: "1 Scoop Whey Protein Isolate, 1 Apple, 1 tbsp Peanut Butter", quantity: "1 Shake + Fruit", calories: 300, protein: 28, carbs: 32, fats: 8, instructions: "Consume 45 min before training." },
      { time: "08:30 PM", name: "Post-Workout Dinner", items: "Grilled Fish Fillet / Soya Chunks, 2 Multigrain Rotis, Steamed Broccoli & Beans", quantity: "1 Plate", calories: 500, protein: 43, carbs: 60, fats: 11, instructions: "Light oil preparation." },
    ],
  },
];

const DEFAULT_LOCKERS: Locker[] = Array.from({ length: 24 }, (_, i) => {
  const num = i + 1;
  const isKariya = num === 1;
  return {
    id: `loc-l-${num}`,
    number: num,
    section: num <= 10 ? "Men's Locker Room" : num <= 20 ? "Women's Locker Room" : "Executive VIP",
    status: isKariya ? "Occupied" : "Available",
    assignedMemberId: isKariya ? "m-kariya" : undefined,
    assignedMemberName: isKariya ? "Kariya" : undefined,
    expiresOn: isKariya ? "2026-06-01" : undefined,
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

const DEFAULT_STAFF: StaffMember[] = [];
const DEFAULT_LEADS: Lead[] = [];
const DEFAULT_BROADCASTS: BroadcastMessage[] = [];

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
  },
];

interface GymStoreContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  members: Member[];
  payments: Payment[];
  staff: StaffMember[];
  settings: GymSettings;
  leads: Lead[];
  workoutPrograms: WorkoutProgram[];
  dietPlans: DietPlan[];
  lockers: Locker[];
  locations: GymLocation[];
  broadcasts: BroadcastMessage[];
  currentLocationId: string;
  lastSaved: Date | null;
  isSaved: boolean;
  exportData: () => string;
  importData: (jsonStr: string) => boolean;

  // Core Member Actions
  addMember: (member: Omit<Member, "id" | "timeline" | "invoices" | "attendanceRate" | "lastVisit" | "isCurrentlyInside" | "installments" | "collectedAmount">) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  checkInMember: (memberId: string) => void;
  checkOutMember: (memberId: string) => void;
  renewMember: (memberId: string, durationMonths: number, planName?: string, paidAmount?: number, paymentMethod?: "UPI" | "Cash" | "Card" | "Bank") => void;
  toggleFreezeMember: (memberId: string) => void;

  // Payment Engine Actions
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

  // Staff CRUD
  addStaff: (staffMember: Omit<StaffMember, "id" | "leaveRecords" | "assignedClientsCount">) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  payStaffSalary: (staffId: string) => void;
  toggleStaffStatus: (staffId: string, status: "On Floor" | "Off Duty" | "On Leave") => void;
  approveLeaveRequest: (staffId: string, leaveId: string) => void;

  // Plans CRUD
  addPlan: (plan: Omit<MembershipPlan, "id" | "activeCount" | "expiringCount" | "frozenCount" | "upgradeOpportunities">) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;

  // Lead CRM Actions
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  convertLeadToMember: (leadId: string, planName: string, initialPaid?: number, method?: "UPI" | "Cash" | "Card" | "Bank") => void;

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

  assignProgramToMember: (memberId: string, workoutId?: string, dietId?: string, notes?: string) => void;

  // Locker Operations & Maintenance Workflow
  assignLocker: (lockerNumber: number, memberId: string, memberName: string, durationDays?: number) => void;
  reserveLocker: (lockerNumber: number, reservedFor: string, note?: string) => void;
  releaseLocker: (lockerNumber: number) => void;
  markLockerMaintenance: (lockerNumber: number, issue: string, date?: string) => void;
  completeLockerRepair: (lockerNumber: number, repairNotes?: string, repairedBy?: string) => void;

  // Broadcast Center Actions
  sendBroadcastMessage: (broadcast: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">) => void;
  saveDraftBroadcast: (broadcast: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">) => void;
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

  // Settings Actions
  updateSettings: (newSettings: Partial<GymSettings>) => void;
  updateGymLogo: (logoBase64: string) => void;
  removeGymLogo: () => void;
  resetToDefaultData: () => void;
}

const GymContext = createContext<GymStoreContextType | null>(null);

const STORAGE_KEY_PEAKREP = "peakrep_gym_os_v9";

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isHydratedRef = useRef(false);

  // Theme state
  const [theme, setThemeState] = useState<"dark" | "light">("dark");

  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [payments, setPayments] = useState<Payment[]>(DEFAULT_PAYMENTS);
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [settings, setSettings] = useState<GymSettings>(DEFAULT_SETTINGS);
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(DEFAULT_WORKOUT_PROGRAMS);
  const [dietPlans, setDietPlans] = useState<DietPlan[]>(DEFAULT_DIET_PLANS);
  const [lockers, setLockers] = useState<Locker[]>(DEFAULT_LOCKERS);
  const [broadcasts, setBroadcasts] = useState<BroadcastMessage[]>(DEFAULT_BROADCASTS);
  const [locations, setLocations] = useState<GymLocation[]>(DEFAULT_LOCATIONS);
  const [currentLocationId, setCurrentLocationId] = useState<string>("loc-1");

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Modals & Panels UI State
  const [isUPIQRModalOpen, setIsUPIQRModalOpen] = useState(false);
  const [upiQRPaymentDetails, setUpiQRPaymentDetails] = useState<{ amount: number; memberName: string; note: string } | null>(null);
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

  // Safe Storage persistence helper
  const safePersist = (key: string, data: any) => {
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

      const loadedMembers = safeLoad(`${STORAGE_KEY_PEAKREP}_members`, DEFAULT_MEMBERS);
      const loadedPayments = safeLoad(`${STORAGE_KEY_PEAKREP}_payments`, DEFAULT_PAYMENTS);
      const loadedStaff = safeLoad(`${STORAGE_KEY_PEAKREP}_staff`, DEFAULT_STAFF);
      const loadedSettings = safeLoad(`${STORAGE_KEY_PEAKREP}_settings`, DEFAULT_SETTINGS);
      const loadedLeads = safeLoad(`${STORAGE_KEY_PEAKREP}_leads`, DEFAULT_LEADS);
      const loadedWorkouts = safeLoad(`${STORAGE_KEY_PEAKREP}_workout_programs`, DEFAULT_WORKOUT_PROGRAMS);
      const loadedDiets = safeLoad(`${STORAGE_KEY_PEAKREP}_diet_plans`, DEFAULT_DIET_PLANS);
      const loadedLockers = safeLoad(`${STORAGE_KEY_PEAKREP}_lockers`, DEFAULT_LOCKERS);
      const loadedBroadcasts = safeLoad(`${STORAGE_KEY_PEAKREP}_broadcasts`, DEFAULT_BROADCASTS);
      const loadedLocations = safeLoad(`${STORAGE_KEY_PEAKREP}_locations`, DEFAULT_LOCATIONS);
      const loadedLocId = localStorage.getItem(`${STORAGE_KEY_PEAKREP}_current_loc`) || "loc-1";

      setMembers(loadedMembers);
      setPayments(loadedPayments);
      setStaff(loadedStaff);
      setSettings(loadedSettings);
      setLeads(loadedLeads);
      setWorkoutPrograms(loadedWorkouts);
      setDietPlans(loadedDiets);
      setLockers(loadedLockers);
      setBroadcasts(loadedBroadcasts);
      setLocations(loadedLocations);
      setCurrentLocationId(loadedLocId);

      setLastSaved(new Date());
    } catch (err) {
      console.error("[PeakRep Hydration Error]:", err);
    } finally {
      isHydratedRef.current = true;
    }
  }, []);

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
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Guarded sync to LocalStorage (only writes AFTER client hydration has loaded persisted state)
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_members`, members); }, [members]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_payments`, payments); }, [payments]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_staff`, staff); }, [staff]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_settings`, settings); }, [settings]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_leads`, leads); }, [leads]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, workoutPrograms); }, [workoutPrograms]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, dietPlans); }, [dietPlans]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, lockers); }, [lockers]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, broadcasts); }, [broadcasts]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_locations`, locations); }, [locations]);
  useEffect(() => { if (isHydratedRef.current) safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, currentLocationId); }, [currentLocationId]);

  // Live Cross-Tab Multi-Window Synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        if (e.key === `${STORAGE_KEY_PEAKREP}_members`) setMembers(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_payments`) setPayments(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_staff`) setStaff(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_settings`) setSettings(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_leads`) setLeads(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_workout_programs`) setWorkoutPrograms(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_diet_plans`) setDietPlans(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_lockers`) setLockers(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_broadcasts`) setBroadcasts(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_locations`) setLocations(JSON.parse(e.newValue));
        else if (e.key === `${STORAGE_KEY_PEAKREP}_current_loc`) setCurrentLocationId(e.newValue);
        else if (e.key === "peakrep_theme") {
          if (e.newValue === "light" || e.newValue === "dark") {
            setThemeState(e.newValue);
            if (e.newValue === "dark") document.documentElement.classList.add("dark");
            else document.documentElement.classList.remove("dark");
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
    };
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
      if (data.currentLocationId) {
        setCurrentLocationId(data.currentLocationId);
        safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, data.currentLocationId);
      }
      if (data.theme && (data.theme === "dark" || data.theme === "light")) {
        setTheme(data.theme);
      }
      setLastSaved(new Date());
      setIsSaved(true);
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
  const addMember = (memberData: Omit<Member, "id" | "timeline" | "invoices" | "attendanceRate" | "lastVisit" | "isCurrentlyInside" | "installments" | "collectedAmount">) => {
    const newId = `m-${Date.now()}`;
    const invoiceNum = `${settings.invoicePrefix || "PEAK-2026-"}${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split("T")[0];

    const planObj = settings.membershipPlans.find((p) => p.name === memberData.plan);
    const planPrice = memberData.planPrice || planObj?.price || 3000;
    const initialPaid = Math.max(0, planPrice - (memberData.due || 0));
    const pendingDue = Math.max(0, planPrice - initialPaid);

    const initialInstallments: InstallmentRecord[] = initialPaid > 0 ? [
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
    ] : [];

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
      invoices: initialPaid > 0 ? [
        {
          id: `inv-${Date.now()}`,
          invoiceNumber: invoiceNum,
          date: today,
          amount: initialPaid,
          plan: memberData.plan,
          method: "UPI",
          status: pendingDue === 0 ? "Paid" : "Partial",
          installmentInfo: pendingDue > 0 ? `Installment 1 of 2 (Due: ${settings.currencySymbol}${pendingDue})` : "Full Paid",
        },
      ] : [],
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
      };
      setPayments((prev) => {
        const updated = [newPayment, ...prev];
        safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
        return updated;
      });
    }
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === id) {
          const item = { ...m, ...updates };
          if (item.planPrice !== undefined && item.collectedAmount !== undefined) {
            item.due = Math.max(0, item.planPrice - item.collectedAmount);
          }
          if (item.due === 0 && (item.status === "Partial" || item.status === "Expired")) {
            item.status = "Active";
          }
          return item;
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
    if (selectedMember360?.id === id) {
      setIsMember360Open(false);
      setSelectedMember360(null);
    }
  };

  const checkInMember = (memberId: string) => {
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
                title: `Checked in at floor turnstile (${timeNow})`,
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
  };

  const checkOutMember = (memberId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
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
  };

  const renewMember = (
    memberId: string,
    durationMonths: number,
    planName?: string,
    paidAmount?: number,
    paymentMethod: "UPI" | "Cash" | "Card" | "Bank" = "UPI"
  ) => {
    const today = new Date();
    today.setMonth(today.getMonth() + durationMonths);
    const newExpiry = today.toISOString().split("T")[0];
    const invoiceNum = `${settings.invoicePrefix || "PEAK-2026-"}${Math.floor(1000 + Math.random() * 9000)}`;

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          const selectedPlan = planName || m.plan;
          const planPrice = settings.membershipPlans.find((p) => p.name === selectedPlan)?.price || 3000;
          const actualPaid = paidAmount !== undefined ? paidAmount : planPrice;
          const remainingDue = Math.max(0, planPrice - actualPaid);

          const newInstallment: InstallmentRecord = {
            id: `inst-${Date.now()}`,
            amount: actualPaid,
            date: new Date().toISOString().split("T")[0],
            method: paymentMethod,
            invoiceNumber: invoiceNum,
            installmentNumber: m.installments.length + 1,
            totalInstallments: remainingDue > 0 ? m.installments.length + 2 : m.installments.length + 1,
            note: `Renewal for ${selectedPlan} (${durationMonths} mos)`,
          };

          return {
            ...m,
            plan: selectedPlan,
            planPrice: m.planPrice + planPrice,
            collectedAmount: m.collectedAmount + actualPaid,
            due: remainingDue,
            expiry: newExpiry,
            status: remainingDue === 0 ? ("Active" as MemberStatus) : ("Partial" as MemberStatus),
            installments: [newInstallment, ...m.installments],
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "upgrade" as const,
                title: `Renewed ${selectedPlan} membership (${durationMonths} month pass)`,
                timestamp: "Just now",
                amount: actualPaid,
              },
              ...m.timeline,
            ],
            invoices: [
              {
                id: `inv-${Date.now()}`,
                invoiceNumber: invoiceNum,
                date: new Date().toISOString().split("T")[0],
                amount: actualPaid,
                plan: selectedPlan,
                method: paymentMethod,
                status: remainingDue === 0 ? ("Paid" as const) : ("Partial" as const),
                installmentInfo: remainingDue > 0 ? `Installment payment (Due: ${settings.currencySymbol}${remainingDue})` : "Full Paid",
              },
              ...m.invoices,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });

    const m = members.find((x) => x.id === memberId);
    const selectedPlan = planName || m?.plan || "Membership";
    const planPrice = settings.membershipPlans.find((p) => p.name === selectedPlan)?.price || 3000;
    const actualPaid = paidAmount !== undefined ? paidAmount : planPrice;

    if (actualPaid > 0) {
      const paymentEntry: Payment = {
        id: `p-${Date.now()}`,
        memberId,
        member: m?.name || "Member",
        date: new Date().toISOString().split("T")[0],
        method: paymentMethod,
        amount: actualPaid,
        category: "Membership",
        status: planPrice - actualPaid === 0 ? "Paid" : "Partial",
        invoiceNumber: invoiceNum,
        installmentIndex: (m?.installments?.length || 0) + 1,
        notes: `Renewal fee for ${selectedPlan}`,
      };
      setPayments((prev) => {
        const updated = [paymentEntry, ...prev];
        safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
        return updated;
      });
    }
  };

  const toggleFreezeMember = (memberId: string) => {
    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          const newStatus: MemberStatus = m.status === "Frozen" ? "Active" : "Frozen";
          return {
            ...m,
            status: newStatus,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "freeze" as const,
                title: newStatus === "Frozen" ? "Membership paused / frozen" : "Membership resumed / active",
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
  };

  // Rebuilt Payment Engine
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
    const invoiceNumber = `${settings.invoicePrefix || "PEAK-2026-"}${Math.floor(1000 + Math.random() * 9000)}`;

    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      memberId: paymentData.memberId,
      member: paymentData.member,
      date: paymentData.date,
      method: paymentData.method,
      amount: paymentData.amount,
      category: paymentData.category || "Membership",
      status: "Paid",
      invoiceNumber,
      installmentIndex: paymentData.installmentNumber,
      totalInstallments: paymentData.totalInstallments,
      notes: paymentData.notes,
    };

    setPayments((prev) => {
      const updated = [newPayment, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
      return updated;
    });

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === paymentData.memberId || m.name.toLowerCase() === paymentData.member.toLowerCase()) {
          const newCollected = m.collectedAmount + paymentData.amount;
          const newDue = Math.max(0, m.planPrice - newCollected);
          const newStatus: MemberStatus = newDue === 0 ? "Active" : "Partial";

          const currentInstallmentCount = (m.installments?.length || 0) + 1;
          const estTotalInstallments = paymentData.totalInstallments || (newDue > 0 ? currentInstallmentCount + 1 : currentInstallmentCount);

          const newInstallmentRecord: InstallmentRecord = {
            id: `inst-${Date.now()}`,
            amount: paymentData.amount,
            date: paymentData.date,
            method: paymentData.method,
            invoiceNumber,
            installmentNumber: paymentData.installmentNumber || currentInstallmentCount,
            totalInstallments: estTotalInstallments,
            note: paymentData.notes || `Installment ${currentInstallmentCount} of ${estTotalInstallments}`,
          };

          return {
            ...m,
            collectedAmount: newCollected,
            due: newDue,
            status: newStatus,
            installments: [newInstallmentRecord, ...(m.installments || [])],
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "payment" as const,
                title: `Recorded payment of ${settings.currencySymbol}${paymentData.amount.toLocaleString("en-IN")} via ${paymentData.method}`,
                timestamp: "Just now",
                amount: paymentData.amount,
                note: newDue > 0 ? `Remaining Due: ${settings.currencySymbol}${newDue.toLocaleString("en-IN")}` : "Full Balance Cleared",
              },
              ...m.timeline,
            ],
            invoices: [
              {
                id: `inv-${Date.now()}`,
                invoiceNumber,
                date: paymentData.date,
                amount: paymentData.amount,
                plan: m.plan,
                method: paymentData.method,
                status: newDue === 0 ? ("Paid" as const) : ("Partial" as const),
                installmentInfo: `Installment #${paymentData.installmentNumber || currentInstallmentCount} (${newDue === 0 ? "Fully Cleared" : `Due: ${settings.currencySymbol}${newDue}`})`,
              },
              ...m.invoices,
            ],
          };
        }
        return m;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
  };

  // Staff CRUD
  const addStaff = (staffData: Omit<StaffMember, "id" | "leaveRecords" | "assignedClientsCount">) => {
    const initials = staffData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const newStaff: StaffMember = {
      ...staffData,
      id: `s-${Date.now()}`,
      avatar: initials || "ST",
      assignedClientsCount: 0,
      leaveRecords: [],
    };
    setStaff((prev) => {
      const updated = [...prev, newStaff];
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
  };

  const payStaffSalary = (staffId: string) => {
    const targetStaff = staff.find((s) => s.id === staffId);
    if (!targetStaff) return;

    const paymentEntry: Payment = {
      id: `p-${Date.now()}`,
      member: `Staff: ${targetStaff.name}`,
      date: new Date().toISOString().split("T")[0],
      method: "Bank",
      amount: targetStaff.salary,
      category: "Personal Training",
      status: "Paid",
      invoiceNumber: `PAY-${Date.now().toString().slice(-4)}`,
      notes: `Monthly payroll compensation for ${targetStaff.name} (${targetStaff.role})`,
    };
    setPayments((prev) => {
      const updated = [paymentEntry, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_payments`, updated);
      return updated;
    });
  };

  const toggleStaffStatus = (staffId: string, status: "On Floor" | "Off Duty" | "On Leave") => {
    setStaff((prev) => {
      const updated = prev.map((s) => (s.id === staffId ? { ...s, status } : s));
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
  };

  const approveLeaveRequest = (staffId: string, leaveId: string) => {
    setStaff((prev) => {
      const updated = prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            leaveRecords: s.leaveRecords.map((l) =>
              l.id === leaveId ? { ...l, status: "Approved" as const } : l
            ),
          };
        }
        return s;
      });
      safePersist(`${STORAGE_KEY_PEAKREP}_staff`, updated);
      return updated;
    });
  };

  // Plans CRUD
  const addPlan = (planData: Omit<MembershipPlan, "id" | "activeCount" | "expiringCount" | "frozenCount" | "upgradeOpportunities">) => {
    const newPlan: MembershipPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
      activeCount: 0,
      expiringCount: 0,
      frozenCount: 0,
      upgradeOpportunities: 0,
    };
    setSettings((prev) => {
      const updated = {
        ...prev,
        membershipPlans: [...prev.membershipPlans, newPlan],
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
  };

  const updatePlan = (id: string, updates: Partial<MembershipPlan>) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        membershipPlans: prev.membershipPlans.map((p) =>
          p.id === id ? { ...p, ...updates } : p
        ),
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
  };

  const deletePlan = (id: string) => {
    setSettings((prev) => {
      const updated = {
        ...prev,
        membershipPlans: prev.membershipPlans.filter((p) => p.id !== id),
      };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
  };

  // Lead CRM Actions
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
    initialPaid: number = 0,
    method: "UPI" | "Cash" | "Card" | "Bank" = "UPI"
  ) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const planObj = settings.membershipPlans.find((p) => p.name === planName);
    const planPrice = planObj?.price || 3000;
    const due = Math.max(0, planPrice - initialPaid);

    addMember({
      name: targetLead.name,
      phone: targetLead.phone,
      email: targetLead.email,
      plan: planName,
      planPrice,
      due,
      joinDate: new Date().toISOString().split("T")[0],
      expiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      status: due === 0 ? "Active" : "Partial",
      healthGoal: targetLead.fitnessGoal,
      notes: `Converted from ${targetLead.source} inquiry. ${targetLead.notes}`,
    });

    updateLeadStage(leadId, "Won");
  };

  // Workout Builder & Management
  const addWorkoutProgram = (progData: Omit<WorkoutProgram, "id" | "assignedCount" | "createdAt">) => {
    const newProg: WorkoutProgram = {
      ...progData,
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
    const existing = workoutPrograms.find((w) => w.id === id);
    if (!existing) return;
    const duplicated: WorkoutProgram = {
      ...existing,
      id: `wo-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      assignedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setWorkoutPrograms((prev) => {
      const updated = [duplicated, ...prev];
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
    const workout = workoutPrograms.find((w) => w.id === workoutId);
    if (!workout) return;

    setMembers((prev) => {
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            assignedWorkout: workout.title,
            assignedWorkoutId: workout.id,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "workout_assigned" as const,
                title: `Assigned Workout Split: ${workout.title}`,
                timestamp: "Just now",
                note: `${workout.daysPerWeek} Days/Week • ${workout.level}`,
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

    setWorkoutPrograms((prev) => {
      const updated = prev.map((w) => (w.id === workoutId ? { ...w, assignedCount: w.assignedCount + 1 } : w));
      safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, updated);
      return updated;
    });
  };

  // Diet Builder & Management
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
    const existing = dietPlans.find((d) => d.id === id);
    if (!existing) return;
    const duplicated: DietPlan = {
      ...existing,
      id: `diet-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      assignedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setDietPlans((prev) => {
      const updated = [duplicated, ...prev];
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
      const updated = prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            assignedDiet: diet.title,
            assignedDietId: diet.id,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "diet_assigned" as const,
                title: `Assigned Nutrition Plan: ${diet.title}`,
                timestamp: "Just now",
                note: `${diet.calorieTarget} kcal • ${diet.proteinGrams}g Protein`,
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

    setDietPlans((prev) => {
      const updated = prev.map((d) => (d.id === dietId ? { ...d, assignedCount: d.assignedCount + 1 } : d));
      safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, updated);
      return updated;
    });
  };

  const assignProgramToMember = (memberId: string, workoutId?: string, dietId?: string, notes?: string) => {
    if (workoutId) assignWorkoutToMember(memberId, workoutId);
    if (dietId) assignDietToMember(memberId, dietId);
  };

  // Locker Operations & Maintenance Workflow
  const assignLocker = (lockerNumber: number, memberId: string, memberName: string, durationDays: number = 30) => {
    const expiresOn = new Date(Date.now() + durationDays * 24 * 3600 * 1000).toISOString().split("T")[0];
    const timestamp = new Date().toISOString().split("T")[0];

    setLockers((prev) => {
      const updated = prev.map((l) =>
        l.number === lockerNumber
          ? {
            ...l,
            status: "Occupied" as LockerStatus,
            assignedMemberId: memberId,
            assignedMemberName: memberName,
            reservedFor: undefined,
            maintenanceDate: undefined,
            maintenanceIssue: undefined,
            expiresOn,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Assigned",
                timestamp,
                details: `Assigned to ${memberName} (Expires: ${expiresOn})`,
              },
              ...l.history,
            ],
          }
          : l
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });

    setMembers((prev) => {
      const updated = prev.map((m) => (m.id === memberId ? { ...m, assignedLocker: lockerNumber } : m));
      safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
      return updated;
    });
  };

  const reserveLocker = (lockerNumber: number, reservedFor: string, note?: string) => {
    const timestamp = new Date().toISOString().split("T")[0];
    setLockers((prev) => {
      const updated = prev.map((l) =>
        l.number === lockerNumber
          ? {
            ...l,
            status: "Reserved" as LockerStatus,
            reservedFor,
            assignedMemberId: undefined,
            assignedMemberName: undefined,
            expiresOn: undefined,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Reserved",
                timestamp,
                details: `Reserved for ${reservedFor}${note ? ` (${note})` : ""}`,
              },
              ...l.history,
            ],
          }
          : l
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });
  };

  const releaseLocker = (lockerNumber: number) => {
    const targetLocker = lockers.find((l) => l.number === lockerNumber);
    const timestamp = new Date().toISOString().split("T")[0];

    if (targetLocker?.assignedMemberId) {
      setMembers((prev) => {
        const updated = prev.map((m) =>
          m.id === targetLocker.assignedMemberId ? { ...m, assignedLocker: undefined } : m
        );
        safePersist(`${STORAGE_KEY_PEAKREP}_members`, updated);
        return updated;
      });
    }

    setLockers((prev) => {
      const updated = prev.map((l) =>
        l.number === lockerNumber
          ? {
            ...l,
            status: "Available" as LockerStatus,
            assignedMemberId: undefined,
            assignedMemberName: undefined,
            reservedFor: undefined,
            expiresOn: undefined,
            maintenanceDate: undefined,
            maintenanceIssue: undefined,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Released",
                timestamp,
                details: `Released by staff. Returned to Available.`,
              },
              ...l.history,
            ],
          }
          : l
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });
  };

  const markLockerMaintenance = (lockerNumber: number, issue: string, date?: string) => {
    const maintenanceDate = date || new Date().toISOString().split("T")[0];

    setLockers((prev) => {
      const updated = prev.map((l) =>
        l.number === lockerNumber
          ? {
            ...l,
            status: "Under Maintenance" as LockerStatus,
            maintenanceDate,
            maintenanceIssue: issue,
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Maintenance Reported",
                timestamp: maintenanceDate,
                details: `Issue: ${issue}`,
              },
              ...l.history,
            ],
          }
          : l
      );
      safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, updated);
      return updated;
    });
  };

  const completeLockerRepair = (lockerNumber: number, repairNotes?: string, repairedBy: string = "Duty Staff") => {
    const timestamp = new Date().toISOString().split("T")[0];

    setLockers((prev) => {
      const updated = prev.map((l) => {
        if (l.number === lockerNumber) {
          const repairEntry: LockerRepairLog = {
            id: `rep-${Date.now()}`,
            issue: l.maintenanceIssue || "General Maintenance",
            repairedAt: timestamp,
            repairedBy,
            notes: repairNotes || "Repaired and sanitized. Returned to operational status.",
          };

          return {
            ...l,
            status: "Available" as LockerStatus,
            maintenanceDate: undefined,
            maintenanceIssue: undefined,
            repairHistory: [repairEntry, ...l.repairHistory],
            history: [
              {
                id: `lh-${Date.now()}`,
                action: "Repaired & Restored",
                timestamp,
                details: `Repaired by ${repairedBy}. Issue resolved. Automatically restored to Available.`,
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

  // Broadcast Messaging Center
  const sendBroadcastMessage = (broadcastData: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const todayStr = new Date().toISOString().split("T")[0];
    const newBroadcast: BroadcastMessage = {
      ...broadcastData,
      id: `bc-${Date.now()}`,
      status: "Sent",
      sentAt: `${todayStr}, ${nowStr}`,
      createdAt: todayStr,
    };

    setBroadcasts((prev) => {
      const updated = [newBroadcast, ...prev];
      safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, updated);
      return updated;
    });

    let targetMembers = members;
    if (broadcastData.recipientsType === "active") targetMembers = members.filter((m) => m.status === "Active");
    else if (broadcastData.recipientsType === "expiring") targetMembers = members.filter((m) => m.status === "Expiring");
    else if (broadcastData.recipientsType === "expired") targetMembers = members.filter((m) => m.status === "Expired");
    else if (broadcastData.recipientsType === "partial_due") targetMembers = members.filter((m) => m.due > 0);
    else if (broadcastData.recipientsType === "plan" && broadcastData.targetPlanName) {
      targetMembers = members.filter((m) => m.plan === broadcastData.targetPlanName);
    } else if (broadcastData.recipientsType === "individual" && broadcastData.targetMemberId) {
      targetMembers = members.filter((m) => m.id === broadcastData.targetMemberId);
    }

    const memberIds = targetMembers.map((m) => m.id);
    if (memberIds.length > 0) {
      setMembers((prev) => {
        const updated = prev.map((m) => {
          if (memberIds.includes(m.id)) {
            return {
              ...m,
              timeline: [
                {
                  id: `t-bc-${Date.now()}`,
                  type: "broadcast_sent" as const,
                  title: `Broadcast: ${broadcastData.title}`,
                  timestamp: "Just now",
                  note: `Sent via ${broadcastData.channels.join(", ")}`,
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
  };

  const saveDraftBroadcast = (broadcastData: Omit<BroadcastMessage, "id" | "createdAt" | "status" | "sentAt">) => {
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
  };

  const updateGymLogo = (logoBase64: string) => {
    setSettings((prev) => {
      const updated = { ...prev, logoUrl: logoBase64 };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
  };

  const removeGymLogo = () => {
    setSettings((prev) => {
      const updated = { ...prev, logoUrl: "" };
      safePersist(`${STORAGE_KEY_PEAKREP}_settings`, updated);
      return updated;
    });
  };

  const resetToDefaultData = () => {
    setMembers(DEFAULT_MEMBERS);
    setPayments(DEFAULT_PAYMENTS);
    setStaff(DEFAULT_STAFF);
    setSettings(DEFAULT_SETTINGS);
    setLeads(DEFAULT_LEADS);
    setWorkoutPrograms(DEFAULT_WORKOUT_PROGRAMS);
    setDietPlans(DEFAULT_DIET_PLANS);
    setLockers(DEFAULT_LOCKERS);
    setBroadcasts(DEFAULT_BROADCASTS);
    setLocations(DEFAULT_LOCATIONS);
    setCurrentLocationId("loc-1");

    safePersist(`${STORAGE_KEY_PEAKREP}_members`, DEFAULT_MEMBERS);
    safePersist(`${STORAGE_KEY_PEAKREP}_payments`, DEFAULT_PAYMENTS);
    safePersist(`${STORAGE_KEY_PEAKREP}_staff`, DEFAULT_STAFF);
    safePersist(`${STORAGE_KEY_PEAKREP}_settings`, DEFAULT_SETTINGS);
    safePersist(`${STORAGE_KEY_PEAKREP}_leads`, DEFAULT_LEADS);
    safePersist(`${STORAGE_KEY_PEAKREP}_workout_programs`, DEFAULT_WORKOUT_PROGRAMS);
    safePersist(`${STORAGE_KEY_PEAKREP}_diet_plans`, DEFAULT_DIET_PLANS);
    safePersist(`${STORAGE_KEY_PEAKREP}_lockers`, DEFAULT_LOCKERS);
    safePersist(`${STORAGE_KEY_PEAKREP}_broadcasts`, DEFAULT_BROADCASTS);
    safePersist(`${STORAGE_KEY_PEAKREP}_locations`, DEFAULT_LOCATIONS);
    safePersist(`${STORAGE_KEY_PEAKREP}_current_loc`, "loc-1");
  };

  return (
    <GymContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        members,
        payments,
        staff,
        settings,
        leads,
        workoutPrograms,
        dietPlans,
        lockers,
        broadcasts,
        locations,
        currentLocationId,
        lastSaved,
        isSaved,
        exportData,
        importData,
        addMember,
        updateMember,
        deleteMember,
        checkInMember,
        checkOutMember,
        renewMember,
        toggleFreezeMember,
        recordPayment,
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
        updateSettings,
        updateGymLogo,
        removeGymLogo,
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
