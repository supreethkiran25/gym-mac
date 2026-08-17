import React, { createContext, useContext, useEffect, useState } from "react";

export type MemberStatus = "Active" | "Expiring" | "Expired" | "Partial" | "Frozen";

export interface MemberTimelineEvent {
  id: string;
  type: "registration" | "payment" | "attendance" | "upgrade" | "pt_session" | "freeze" | "pos_purchase" | "workout_assigned";
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
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  plan: string; // e.g. "Monthly Flex", "Quarterly Pro", "Annual Elite", "Personal Training 1-on-1"
  joinDate: string;
  expiry: string; // e.g. "2026-06-15"
  status: MemberStatus;
  due: number;
  avatar?: string;
  avatarColor?: string;
  notes?: string;
  attendanceRate: number; // percentage e.g. 88
  lastVisit: string; // e.g. "Today, 7:15 AM"
  isCurrentlyInside: boolean;
  checkInTime?: string;
  assignedTrainer?: string;
  healthGoal?: string;
  emergencyContact?: string;
  assignedWorkout?: string;
  assignedDiet?: string;
  assignedLocker?: number;
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
  category: "Membership" | "Personal Training" | "Merchandise" | "Registration" | "Pro Shop";
  status: "Paid" | "Partial" | "Overdue" | "Pending";
  invoiceNumber: string;
  notes?: string;
}

export interface ReminderItem {
  id: string;
  memberId?: string;
  name: string;
  phone: string;
  reason: string;
  channel: "WhatsApp" | "SMS" | "Email";
  time: string;
  status: "Pending" | "Sent";
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
  shift: string; // e.g. "Morning 6:00 AM - 2:00 PM"
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

export interface GymClass {
  id: string;
  title: string;
  trainer: string;
  trainerId?: string;
  time: string;
  durationMinutes: number;
  days: string[]; // e.g. ["Mon", "Wed", "Fri"]
  capacity: number;
  enrolledMembers: string[]; // member IDs
  room: string;
  category: "HIIT" | "Strength" | "Yoga" | "Spin" | "CrossFit";
  intensity: "High" | "Medium" | "All Levels";
}

export interface GymEquipment {
  id: string;
  name: string;
  category: "Cardio" | "Strength" | "Cables" | "Free Weights";
  status: "Operational" | "Service Due" | "Under Repair";
  lastServiced: string;
  nextServiceDate: string;
  serialNumber: string;
  location: string;
  usageCount: number;
  modelNumber?: string;
  warrantyExpiry?: string;
  vendorName?: string;
  notes?: string;
}

export interface SmartInsight {
  id: string;
  title: string;
  description: string;
  type: "warning" | "opportunity" | "info" | "alert";
  metricChange: string;
  actionLabel: string;
  actionType: "nudge_expiring" | "assign_trainer" | "service_equipment" | "promote_pt" | "restock_pos" | "followup_leads";
}

// Lead CRM Model
export type LeadStage = "Inquiry" | "Trial Scheduled" | "Trial Booked" | "Trial Completed" | "Offer Sent" | "Won" | "Lost";

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

// POS Product & Orders
export interface POSProduct {
  id: string;
  name: string;
  category: "Supplements" | "Beverages" | "Apparel" | "Accessories";
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  icon: string;
  unit: string;
}

export interface POSOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface POSOrder {
  id: string;
  orderNumber: string;
  memberId?: string;
  memberName: string;
  items: POSOrderItem[];
  totalAmount: number;
  paymentMethod: "UPI" | "Cash" | "Card" | "Member Due";
  date: string;
}

// Workouts & Diet Programs
export interface WorkoutProgram {
  id: string;
  title: string;
  category: "Hypertrophy" | "Fat Loss" | "Strength & Power" | "Functional Mobility";
  daysPerWeek: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  focus: string;
  routine: {
    day: string;
    exercises: { name: string; sets: string; reps: string; rest: string }[];
  }[];
  assignedCount: number;
}

export interface DietPlan {
  id: string;
  title: string;
  category: "High Protein Muscle" | "Calorie Deficit Cut" | "Clean Bulk" | "Ketogenic Shred";
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  meals: { time: string; name: string; items: string[]; calories: number }[];
  assignedCount: number;
}

// Lockers
export interface Locker {
  id: string;
  number: number;
  section: "Men's Locker Room" | "Women's Locker Room" | "Executive VIP";
  status: "Available" | "Occupied" | "Maintenance";
  assignedMemberId?: string;
  assignedMemberName?: string;
  expiresOn?: string;
}

// Multi-Location / Branch
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
  location: string;
  phone: string;
  email: string;
  currencySymbol: string;
  perMemberRate: number;
  operatingHours: string;
  gstNumber: string;
  upiId: string;
  invoicePrefix: string;
  taxRatePercent: number;
  autoSendWhatsAppOnRenewal: boolean;
  membershipPlans: MembershipPlan[];
  reminderTemplateWhatsApp: string;
  reminderTemplateSMS: string;
  welcomeTemplateWhatsApp: string;
}

// Mock Datasets
const DEFAULT_LOCATIONS: GymLocation[] = [
  {
    id: "loc-1",
    name: "Iron House · Andheri West (Main)",
    address: "Link Road, Andheri West, Mumbai",
    phone: "+91 98765 43210",
    isMain: true,
    memberCount: 148,
    capacity: 80,
  },
  {
    id: "loc-2",
    name: "Iron House · Bandra Flagship",
    address: "Pali Hill, Bandra West, Mumbai",
    phone: "+91 98765 11223",
    isMain: false,
    memberCount: 112,
    capacity: 65,
  },
  {
    id: "loc-3",
    name: "Iron House · Juhu Studio",
    address: "JVPD Scheme, Juhu, Mumbai",
    phone: "+91 98765 99887",
    isMain: false,
    memberCount: 76,
    capacity: 50,
  },
];

const DEFAULT_PLANS: MembershipPlan[] = [
  {
    id: "plan-1",
    name: "Monthly Flex",
    price: 2800,
    durationMonths: 1,
    type: "Standard",
    perks: ["Full gym floor access", "Locker room & shower", "1 Free Trainer Assessment"],
    activeCount: 28,
    expiringCount: 8,
    frozenCount: 2,
    upgradeOpportunities: 14,
  },
  {
    id: "plan-2",
    name: "Quarterly Pro",
    price: 7500,
    durationMonths: 3,
    type: "Standard",
    perks: ["Full gym floor access", "Steam & Sauna access", "Diet chart consultation", "Locker storage"],
    activeCount: 42,
    expiringCount: 5,
    frozenCount: 1,
    upgradeOpportunities: 19,
  },
  {
    id: "plan-3",
    name: "Annual Elite",
    price: 22000,
    durationMonths: 12,
    type: "VIP Pass",
    perks: ["All-hours unlimited access", "2 Free PT Sessions / month", "Nutrition consultations", "Free guest pass monthly", "Towel service"],
    activeCount: 64,
    expiringCount: 3,
    frozenCount: 3,
    upgradeOpportunities: 0,
  },
  {
    id: "plan-4",
    name: "Personal Training 1-on-1",
    price: 15000,
    durationMonths: 1,
    type: "PT Package",
    perks: ["Dedicated Senior Coach", "Custom biometric tracking", "Weekly diet planning", "Post-workout recovery zone"],
    activeCount: 18,
    expiringCount: 2,
    frozenCount: 0,
    upgradeOpportunities: 6,
  },
];

const DEFAULT_MEMBERS: Member[] = [
  {
    id: "m-1",
    name: "Aarav Sharma",
    phone: "+91 98201 12233",
    email: "aarav.sharma@example.com",
    plan: "Monthly Flex",
    joinDate: "2025-11-21",
    expiry: "2026-05-21",
    status: "Expiring",
    due: 0,
    attendanceRate: 86,
    lastVisit: "Today, 7:15 AM",
    isCurrentlyInside: true,
    checkInTime: "07:15 AM",
    assignedTrainer: "Coach Vikram",
    healthGoal: "Hypertrophy & Strength (Target 80kg)",
    emergencyContact: "+91 98201 99887 (Father)",
    assignedWorkout: "Push-Pull-Legs Hypertrophy Split",
    assignedDiet: "High Protein Muscle Fuel (2400 kcal)",
    assignedLocker: 12,
    notes: "Consistent morning lifter. Focus on squats and deadlifts.",
    timeline: [
      { id: "t-1", type: "attendance", title: "Checked in at Main Gate", timestamp: "Today, 7:15 AM" },
      { id: "t-2", type: "payment", title: "Monthly Renewal ₹2,800 paid via UPI", timestamp: "Apr 21, 2026", amount: 2800 },
      { id: "t-3", type: "pt_session", title: "Upper Body Strength Assessment completed", timestamp: "Apr 05, 2026" },
      { id: "t-4", type: "registration", title: "Joined Iron House on Monthly Flex", timestamp: "Nov 21, 2025" },
    ],
    invoices: [
      { id: "inv-101", invoiceNumber: "INV-2026-041", date: "2026-04-21", amount: 2800, plan: "Monthly Flex", method: "UPI", status: "Paid" },
      { id: "inv-102", invoiceNumber: "INV-2026-029", date: "2026-03-21", amount: 2800, plan: "Monthly Flex", method: "UPI", status: "Paid" },
    ],
  },
  {
    id: "m-2",
    name: "Mehul Patel",
    phone: "+91 97401 88123",
    email: "mehul.p@example.com",
    plan: "Quarterly Pro",
    joinDate: "2026-02-23",
    expiry: "2026-05-23",
    status: "Partial",
    due: 1500,
    attendanceRate: 74,
    lastVisit: "Yesterday, 6:30 PM",
    isCurrentlyInside: false,
    assignedTrainer: "Coach Rohit",
    healthGoal: "Fat Loss & Cardiovascular Endurance",
    emergencyContact: "+91 97401 11223 (Spouse)",
    assignedWorkout: "Upper-Lower Functional Conditioning",
    assignedDiet: "Calorie Deficit Fat Shred (1850 kcal)",
    assignedLocker: 18,
    notes: "Promised remaining ₹1,500 due by end of week.",
    timeline: [
      { id: "t-5", type: "attendance", title: "Evening Cardio & Core session", timestamp: "Yesterday, 6:30 PM" },
      { id: "t-6", type: "payment", title: "Partial Payment ₹6,000 recorded (Balance ₹1,500)", timestamp: "Feb 23, 2026", amount: 6000 },
      { id: "t-7", type: "registration", title: "Joined Iron House on Quarterly Pro", timestamp: "Feb 23, 2026" },
    ],
    invoices: [
      { id: "inv-103", invoiceNumber: "INV-2026-015", date: "2026-02-23", amount: 6000, plan: "Quarterly Pro", method: "Cash", status: "Partial" },
    ],
  },
  {
    id: "m-3",
    name: "Riya Kapoor",
    phone: "+91 99876 12390",
    email: "riya.kapoor@example.com",
    plan: "Annual Elite",
    joinDate: "2026-01-15",
    expiry: "2027-01-15",
    status: "Active",
    due: 0,
    attendanceRate: 94,
    lastVisit: "Today, 6:00 AM",
    isCurrentlyInside: true,
    checkInTime: "06:00 AM",
    assignedTrainer: "Coach Ananya",
    healthGoal: "Functional Fitness & Marathon Training",
    emergencyContact: "+91 99876 99000 (Sister)",
    assignedWorkout: "HIIT & VO2 Max Endurance",
    assignedDiet: "Endurance Athlete Carb-Load (2200 kcal)",
    assignedLocker: 4,
    notes: "Attends 6:30 AM Spin and Functional HIIT regularly.",
    timeline: [
      { id: "t-8", type: "attendance", title: "Checked in for Early Morning Spin", timestamp: "Today, 6:00 AM" },
      { id: "t-9", type: "pt_session", title: "Lactate Threshold & VO2 Max consult", timestamp: "May 02, 2026" },
      { id: "t-10", type: "payment", title: "Annual Elite Membership ₹22,000 paid via Card", timestamp: "Jan 15, 2026", amount: 22000 },
    ],
    invoices: [
      { id: "inv-104", invoiceNumber: "INV-2026-004", date: "2026-01-15", amount: 22000, plan: "Annual Elite", method: "Card", status: "Paid" },
    ],
  },
  {
    id: "m-4",
    name: "Kabir Nair",
    phone: "+91 90220 33445",
    email: "kabir.nair@example.com",
    plan: "Personal Training 1-on-1",
    joinDate: "2025-11-27",
    expiry: "2026-06-27",
    status: "Active",
    due: 0,
    attendanceRate: 92,
    lastVisit: "Today, 8:00 AM",
    isCurrentlyInside: true,
    checkInTime: "08:00 AM",
    assignedTrainer: "Coach Vikram",
    healthGoal: "Powerlifting Preparation (Bench 130kg)",
    assignedWorkout: "5x5 Powerlifting & Max Effort",
    assignedDiet: "High Protein Muscle Fuel (2400 kcal)",
    assignedLocker: 7,
    notes: "Training for state bench press meet.",
    timeline: [
      { id: "t-12", type: "attendance", title: "PT Session with Coach Vikram", timestamp: "Today, 8:00 AM" },
      { id: "t-13", type: "payment", title: "Personal Training Package ₹15,000 paid via UPI", timestamp: "May 10, 2026", amount: 15000 },
    ],
    invoices: [
      { id: "inv-105", invoiceNumber: "INV-2026-048", date: "2026-05-10", amount: 15000, plan: "Personal Training 1-on-1", method: "UPI", status: "Paid" },
    ],
  },
  {
    id: "m-5",
    name: "Tara Iyer",
    phone: "+91 98112 99831",
    email: "tara.i@example.com",
    plan: "Monthly Flex",
    joinDate: "2026-03-12",
    expiry: "2026-05-12",
    status: "Expired",
    due: 2800,
    attendanceRate: 48,
    lastVisit: "May 10, 2026",
    isCurrentlyInside: false,
    healthGoal: "General Mobility and Posture Correction",
    notes: "Membership expired 6 days ago. Send reminder via WhatsApp.",
    timeline: [
      { id: "t-14", type: "attendance", title: "Yoga & Mat work", timestamp: "May 10, 2026" },
      { id: "t-15", type: "registration", title: "Joined on Monthly Flex", timestamp: "Mar 12, 2026" },
    ],
    invoices: [
      { id: "inv-106", invoiceNumber: "INV-2026-022", date: "2026-03-12", amount: 2800, plan: "Monthly Flex", method: "Bank", status: "Paid" },
    ],
  },
];

const DEFAULT_LEADS: Lead[] = [
  {
    id: "lead-1",
    name: "Devendra Singhania",
    phone: "+91 98200 44332",
    email: "devendra@example.com",
    source: "Instagram",
    stage: "Trial Scheduled",
    fitnessGoal: "Weight Loss (Target -12kg)",
    trialDate: "Today, 5:00 PM",
    notes: "Inquired via Instagram Reel about Coach Vikram's HIIT class.",
    assignedTrainer: "Coach Vikram",
    createdAt: "2026-05-18",
    budget: 7500,
  },
  {
    id: "lead-2",
    name: "Kritika Chawla",
    phone: "+91 97110 88776",
    email: "kritika.c@example.com",
    source: "Walk-In",
    stage: "Trial Completed",
    fitnessGoal: "Functional Strength & Morning Spin",
    trialDate: "Yesterday",
    notes: "Completed 7:30 AM trial. Loved the steam room and turf area. Ready to join Quarterly Pro.",
    assignedTrainer: "Coach Ananya",
    createdAt: "2026-05-17",
    budget: 7500,
  },
  {
    id: "lead-3",
    name: "Sameer Joshi",
    phone: "+91 99300 22110",
    email: "sameer.j@example.com",
    source: "Google Maps",
    stage: "Inquiry",
    fitnessGoal: "Bodybuilding & 1-on-1 Personal Training",
    notes: "Searched 'Best Gym in Andheri West'. Wants a dedicated senior trainer for contest prep.",
    assignedTrainer: "Coach Vikram",
    createdAt: "2026-05-19",
    budget: 15000,
  },
  {
    id: "lead-4",
    name: "Pooja Saluja",
    phone: "+91 98450 33991",
    email: "pooja.s@example.com",
    source: "Referral",
    stage: "Offer Sent",
    fitnessGoal: "Post-pregnancy core rehab & Pilates",
    notes: "Referred by Riya Kapoor. Special 10% referral discount offer sent on WhatsApp.",
    assignedTrainer: "Coach Ananya",
    createdAt: "2026-05-16",
    budget: 22000,
  },
];

const DEFAULT_POS_PRODUCTS: POSProduct[] = [
  {
    id: "pos-1",
    name: "Optimum Nutrition Gold Standard Whey (2kg, Double Rich Chocolate)",
    category: "Supplements",
    price: 6800,
    costPrice: 4900,
    stock: 18,
    sku: "ON-WHEY-2KG",
    icon: "🥛",
    unit: "Tub",
  },
  {
    id: "pos-2",
    name: "Cellucor C4 Original Pre-Workout (30 Servings, Fruit Punch)",
    category: "Supplements",
    price: 2600,
    costPrice: 1800,
    stock: 24,
    sku: "C4-PRE-30S",
    icon: "⚡",
    unit: "Tub",
  },
  {
    id: "pos-3",
    name: "Fast&Up BCAA 2:1:1 Intra-Workout (30 Servings, Lime)",
    category: "Supplements",
    price: 1800,
    costPrice: 1100,
    stock: 32,
    sku: "FA-BCAA-LIME",
    icon: "🧪",
    unit: "Tub",
  },
  {
    id: "pos-4",
    name: "Red Bull Energy Drink (250ml Can - Chilled)",
    category: "Beverages",
    price: 150,
    costPrice: 95,
    stock: 48,
    sku: "RB-CAN-250",
    icon: "🥫",
    unit: "Can",
  },
  {
    id: "pos-5",
    name: "Iron House Pro Shaker Bottle (700ml Stainless Steel)",
    category: "Accessories",
    price: 750,
    costPrice: 320,
    stock: 40,
    sku: "IH-SHAKER-SS",
    icon: "🍶",
    unit: "Bottle",
  },
  {
    id: "pos-6",
    name: "Harbinger Heavy Duty Weightlifting Straps",
    category: "Accessories",
    price: 850,
    costPrice: 420,
    stock: 15,
    sku: "HB-STRAPS-HD",
    icon: "🥊",
    unit: "Pair",
  },
  {
    id: "pos-7",
    name: "Iron House Signature Oversized Heavy Cotton Pump Cover Tee",
    category: "Apparel",
    price: 1200,
    costPrice: 550,
    stock: 22,
    sku: "IH-TEE-BLK",
    icon: "👕",
    unit: "Tee",
  },
];

const DEFAULT_WORKOUT_PROGRAMS: WorkoutProgram[] = [
  {
    id: "wo-1",
    title: "Push-Pull-Legs Hypertrophy Split",
    category: "Hypertrophy",
    daysPerWeek: 6,
    level: "Intermediate",
    focus: "Maximum muscle growth, progressive overload on compound lifts & isolation finish.",
    assignedCount: 24,
    routine: [
      {
        day: "Push (Chest, Shoulders, Triceps)",
        exercises: [
          { name: "Barbell Incline Bench Press", sets: "4", reps: "8-10", rest: "90s" },
          { name: "Dumbbell Flat Press", sets: "3", reps: "10-12", rest: "75s" },
          { name: "Standing Overhead DB Press", sets: "3", reps: "8-10", rest: "90s" },
          { name: "Cable Lateral Raises", sets: "4", reps: "12-15", rest: "60s" },
          { name: "Tricep Rope Pushdowns", sets: "3", reps: "12-15", rest: "60s" },
        ],
      },
      {
        day: "Pull (Back, Rear Delts, Biceps)",
        exercises: [
          { name: "Barbell Deadlift / Heavy Row", sets: "4", reps: "6-8", rest: "120s" },
          { name: "Lat Pulldown (Neutral Grip)", sets: "3", reps: "10-12", rest: "75s" },
          { name: "Chest-Supported T-Bar Row", sets: "3", reps: "10-12", rest: "75s" },
          { name: "Face Pulls", sets: "4", reps: "15-20", rest: "60s" },
          { name: "Incline DB Bicep Curls", sets: "3", reps: "10-12", rest: "60s" },
        ],
      },
      {
        day: "Legs (Quads, Hamstrings, Calves)",
        exercises: [
          { name: "Barbell Back Squat", sets: "4", reps: "8-10", rest: "120s" },
          { name: "Romanian Deadlift (RDL)", sets: "3", reps: "10-12", rest: "90s" },
          { name: "Leg Press 45-degree", sets: "3", reps: "12-15", rest: "75s" },
          { name: "Lying Hamstring Curls", sets: "3", reps: "12-15", rest: "60s" },
          { name: "Standing Calf Raises", sets: "4", reps: "15-20", rest: "45s" },
        ],
      },
    ],
  },
  {
    id: "wo-2",
    title: "5x5 Powerbuilding & Strength",
    category: "Strength & Power",
    daysPerWeek: 4,
    level: "Advanced",
    focus: "Strength peaking on Squat, Bench, Deadlift, and Overhead Press.",
    assignedCount: 16,
    routine: [
      {
        day: "Heavy Bench & Upper",
        exercises: [
          { name: "Barbell Bench Press", sets: "5", reps: "5", rest: "150s" },
          { name: "Barbell Row", sets: "5", reps: "5", rest: "120s" },
          { name: "Weighted Dips", sets: "3", reps: "8", rest: "90s" },
        ],
      },
      {
        day: "Heavy Squat & Lower",
        exercises: [
          { name: "Barbell Back Squat", sets: "5", reps: "5", rest: "180s" },
          { name: "Romanian Deadlift", sets: "4", reps: "6", rest: "120s" },
          { name: "Walking DB Lunges", sets: "3", reps: "10/leg", rest: "90s" },
        ],
      },
    ],
  },
];

const DEFAULT_DIET_PLANS: DietPlan[] = [
  {
    id: "diet-1",
    title: "High Protein Muscle Fuel (2400 kcal)",
    category: "High Protein Muscle",
    calorieTarget: 2400,
    proteinGrams: 180,
    carbsGrams: 240,
    fatsGrams: 65,
    assignedCount: 32,
    meals: [
      { time: "07:30 AM", name: "Breakfast", items: ["4 Whole Eggs scrambled with spinach", "2 Slices Toasted Sourdough", "1 Banana + Black Coffee"], calories: 580 },
      { time: "11:30 AM", name: "Mid-Morning", items: ["1 Scoop Gold Standard Whey", "30g Mixed Almonds & Walnuts"], calories: 320 },
      { time: "01:30 PM", name: "Lunch", items: ["200g Grilled Chicken Breast / Paneer", "150g Steamed Basmati Rice", "1 Bowl Dal + Cucumber Salad"], calories: 680 },
      { time: "05:00 PM", name: "Pre-Workout Snack", items: ["1 Apple", "1 Scoop Fast&Up BCAA / Pre-Workout"], calories: 120 },
      { time: "08:30 PM", name: "Dinner", items: ["180g Baked Fish / Tofu Steak", "2 Multigrain Roti", "Stir-fried Broccoli & Mushrooms"], calories: 700 },
    ],
  },
  {
    id: "diet-2",
    title: "Calorie Deficit Fat Shred (1850 kcal)",
    category: "Calorie Deficit Cut",
    calorieTarget: 1850,
    proteinGrams: 160,
    carbsGrams: 150,
    fatsGrams: 50,
    assignedCount: 28,
    meals: [
      { time: "08:00 AM", name: "Breakfast", items: ["3 Egg White Omelet + 1 Whole Egg", "1 Slice Multigrain Toast", "Green Tea"], calories: 340 },
      { time: "01:00 PM", name: "Lunch", items: ["180g Grilled Chicken / Soya Chunks", "100g Brown Rice", "Large Garden Salad with Olive Oil drizzle"], calories: 560 },
      { time: "04:30 PM", name: "Snack", items: ["1 Scoop Whey in water", "10 Almonds"], calories: 200 },
      { time: "08:00 PM", name: "Dinner", items: ["150g Grilled Fish / Paneer Tikka", "1 Multigrain Roti", "Clear Vegetable Soup"], calories: 550 },
      { time: "10:00 PM", name: "Bedtime", items: ["Chamomile Tea + 5g Glutamine"], calories: 20 },
    ],
  },
];

const DEFAULT_LOCKERS: Locker[] = Array.from({ length: 24 }, (_, i) => {
  const num = i + 1;
  const isOccupied = num === 12 || num === 18 || num === 4 || num === 7;
  const isMaintenance = num === 15;
  return {
    id: `loc-l-${num}`,
    number: num,
    section: num <= 10 ? "Men's Locker Room" : num <= 20 ? "Women's Locker Room" : "Executive VIP",
    status: isMaintenance ? "Maintenance" : isOccupied ? "Occupied" : "Available",
    assignedMemberName: num === 12 ? "Aarav Sharma" : num === 18 ? "Mehul Patel" : num === 4 ? "Riya Kapoor" : num === 7 ? "Kabir Nair" : undefined,
    expiresOn: isOccupied ? "2026-06-15" : undefined,
  };
});

const DEFAULT_SETTINGS: GymSettings = {
  name: "Iron House Fitness",
  location: "Mumbai · Andheri West",
  phone: "+91 98765 43210",
  email: "support@ironhousegym.com",
  currencySymbol: "₹",
  perMemberRate: 10,
  operatingHours: "5:30 AM – 11:00 PM (Daily)",
  gstNumber: "27AAAC1234F1Z5",
  upiId: "ironhousegym@icici",
  invoicePrefix: "INV-2026-",
  taxRatePercent: 18,
  autoSendWhatsAppOnRenewal: true,
  membershipPlans: DEFAULT_PLANS,
  reminderTemplateWhatsApp:
    "Hi {name}, your {gym} membership is {reason}. Total due: {due}. Please clear your dues via UPI link to continue training without interruption.",
  reminderTemplateSMS:
    "{gym} Alert: Dear {name}, your membership is {reason}. Outstanding: {due}. Kindly renew today.",
  welcomeTemplateWhatsApp:
    "Welcome to {gym}, {name}! Your {plan} pass is now active. Let's crush your fitness goals!",
};

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "s-1",
    name: "Vikram Malhotra",
    role: "Head Coach",
    phone: "+91 98330 11223",
    email: "vikram@ironhousegym.com",
    salary: 65000,
    shift: "Morning 6:00 AM - 2:00 PM",
    status: "On Floor",
    avatar: "VM",
    assignedClientsCount: 8,
    leaveRecords: [],
  },
  {
    id: "s-2",
    name: "Ananya Deshmukh",
    role: "Nutritionist",
    phone: "+91 98450 77889",
    email: "ananya@ironhousegym.com",
    salary: 52000,
    shift: "Full Day 9:00 AM - 5:00 PM",
    status: "On Floor",
    avatar: "AD",
    assignedClientsCount: 14,
    leaveRecords: [],
  },
  {
    id: "s-3",
    name: "Rohit Khanna",
    role: "Personal Trainer",
    phone: "+91 99200 44556",
    email: "rohit@ironhousegym.com",
    salary: 48000,
    shift: "Evening 2:00 PM - 10:00 PM",
    status: "Off Duty",
    avatar: "RK",
    assignedClientsCount: 11,
    leaveRecords: [],
  },
  {
    id: "s-4",
    name: "Pooja Hegde",
    role: "Front Desk Manager",
    phone: "+91 98110 33221",
    email: "pooja@ironhousegym.com",
    salary: 38000,
    shift: "Morning 6:00 AM - 2:00 PM",
    status: "On Floor",
    avatar: "PH",
    assignedClientsCount: 0,
    leaveRecords: [],
  },
];

const DEFAULT_CLASSES: GymClass[] = [
  {
    id: "c-1",
    title: "Morning HIIT & Core Blast",
    trainer: "Vikram Malhotra",
    trainerId: "s-1",
    time: "06:30 AM",
    durationMinutes: 45,
    days: ["Mon", "Wed", "Fri"],
    capacity: 20,
    enrolledMembers: ["m-1", "m-3"],
    room: "Studio A (Ground Floor)",
    category: "HIIT",
    intensity: "High",
  },
  {
    id: "c-2",
    title: "Strength & Functional Kettlebells",
    trainer: "Rohit Khanna",
    trainerId: "s-3",
    time: "07:30 AM",
    durationMinutes: 50,
    days: ["Tue", "Thu", "Sat"],
    capacity: 15,
    enrolledMembers: ["m-1", "m-4"],
    room: "Functional Turf",
    category: "Strength",
    intensity: "High",
  },
  {
    id: "c-3",
    title: "Vinyasa Flow & Deep Recovery",
    trainer: "Ananya Deshmukh",
    trainerId: "s-2",
    time: "08:30 AM",
    durationMinutes: 60,
    days: ["Mon", "Wed", "Fri", "Sun"],
    capacity: 18,
    enrolledMembers: ["m-3"],
    room: "Mind & Body Studio",
    category: "Yoga",
    intensity: "All Levels",
  },
  {
    id: "c-4",
    title: "Evening High-RPM Spin Cycle",
    trainer: "Rohit Khanna",
    trainerId: "s-3",
    time: "06:45 PM",
    durationMinutes: 45,
    days: ["Mon", "Tue", "Thu", "Fri"],
    capacity: 16,
    enrolledMembers: ["m-2"],
    room: "Spin Studio",
    category: "Spin",
    intensity: "High",
  },
];

const DEFAULT_EQUIPMENT: GymEquipment[] = [
  {
    id: "eq-1",
    name: "Matrix Commercial Treadmill T50 #3",
    category: "Cardio",
    status: "Service Due",
    lastServiced: "2026-02-10",
    nextServiceDate: "2026-05-10",
    serialNumber: "MTX-TR-2024-003",
    location: "Cardio Zone (Bay 3)",
    usageCount: 1420,
    modelNumber: "T50-Pro",
    vendorName: "Matrix Fitness India",
  },
  {
    id: "eq-2",
    name: "Eleiko Olympic Power Rack #1",
    category: "Strength",
    status: "Operational",
    lastServiced: "2026-04-15",
    nextServiceDate: "2026-08-15",
    serialNumber: "ELK-PR-2023-011",
    location: "Heavy Lifting Zone",
    usageCount: 2850,
    modelNumber: "Power-X9",
    vendorName: "Eleiko Sport",
  },
  {
    id: "eq-3",
    name: "LifeFitness 8-Stack Cable Crossover",
    category: "Cables",
    status: "Operational",
    lastServiced: "2026-04-01",
    nextServiceDate: "2026-07-01",
    serialNumber: "LF-CAB-2022-094",
    location: "Central Floor",
    usageCount: 3940,
    modelNumber: "LF-C800",
    vendorName: "Life Fitness",
  },
  {
    id: "eq-4",
    name: "Concept2 RowErg #2",
    category: "Cardio",
    status: "Under Repair",
    lastServiced: "2026-01-20",
    nextServiceDate: "2026-04-20",
    serialNumber: "C2-ROW-2024-012",
    location: "HIIT Bay",
    usageCount: 980,
    modelNumber: "Model D PM5",
    vendorName: "Concept2 India",
  },
];

const DEFAULT_INSIGHTS: SmartInsight[] = [
  {
    id: "ins-1",
    title: "15% Drop in Renewal Rate Expected",
    description: "4 key members are expiring in the next 48 hours without auto-debit configured.",
    type: "warning",
    metricChange: "-15% renewals",
    actionLabel: "Send Batch WhatsApp Nudge",
    actionType: "nudge_expiring",
  },
  {
    id: "ins-2",
    title: "Evening Peak Capacity Surging",
    description: "Average 6:00 PM - 8:30 PM floor occupancy reached 94% this week.",
    type: "opportunity",
    metricChange: "+28% peak load",
    actionLabel: "Assign Extra Evening Trainer",
    actionType: "assign_trainer",
  },
  {
    id: "ins-3",
    title: "Matrix Treadmill #3 Overdue for Service",
    description: "Cardio belt calibration is 7 days past scheduled manufacturer maintenance.",
    type: "alert",
    metricChange: "7 days overdue",
    actionLabel: "Log Maintenance Complete",
    actionType: "service_equipment",
  },
  {
    id: "ins-4",
    title: "Personal Training Demand Up +24%",
    description: "6 Quarterly Pro members logged 4+ visits this week and qualify for PT upgrade.",
    type: "info",
    metricChange: "+24% PT velocity",
    actionLabel: "View Upgrade Opportunities",
    actionType: "promote_pt",
  },
];

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: "p-1",
    memberId: "m-1",
    member: "Aarav Sharma",
    date: "2026-05-18",
    method: "UPI",
    amount: 2800,
    category: "Membership",
    status: "Paid",
    invoiceNumber: "INV-2026-051",
    notes: "Monthly renewal via Google Pay",
  },
  {
    id: "p-2",
    memberId: "m-4",
    member: "Kabir Nair",
    date: "2026-05-17",
    method: "UPI",
    amount: 15000,
    category: "Personal Training",
    status: "Paid",
    invoiceNumber: "INV-2026-050",
    notes: "1-on-1 PT package with Coach Vikram",
  },
  {
    id: "p-3",
    memberId: "m-3",
    member: "Riya Kapoor",
    date: "2026-05-15",
    method: "Card",
    amount: 22000,
    category: "Membership",
    status: "Paid",
    invoiceNumber: "INV-2026-049",
    notes: "Annual membership card swipe",
  },
  {
    id: "p-4",
    memberId: "m-2",
    member: "Mehul Patel",
    date: "2026-05-14",
    method: "Cash",
    amount: 6000,
    category: "Membership",
    status: "Partial",
    invoiceNumber: "INV-2026-048",
    notes: "Quarterly first installment (Due ₹1,500)",
  },
];

const DEFAULT_REMINDERS: ReminderItem[] = [
  {
    id: "r-1",
    memberId: "m-5",
    name: "Tara Iyer",
    phone: "+91 98112 99831",
    reason: "Membership expired (Due ₹2,800)",
    channel: "WhatsApp",
    time: "Today, 9:00 AM",
    status: "Pending",
  },
  {
    id: "r-2",
    memberId: "m-2",
    name: "Mehul Patel",
    phone: "+91 97401 88123",
    reason: "Pending installment ₹1,500",
    channel: "WhatsApp",
    time: "Tomorrow, 10:00 AM",
    status: "Pending",
  },
];

interface GymStoreContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;
  members: Member[];
  payments: Payment[];
  reminders: ReminderItem[];
  staff: StaffMember[];
  classes: GymClass[];
  equipment: GymEquipment[];
  insights: SmartInsight[];
  settings: GymSettings;
  leads: Lead[];
  posProducts: POSProduct[];
  posOrders: POSOrder[];
  workoutPrograms: WorkoutProgram[];
  dietPlans: DietPlan[];
  lockers: Locker[];
  locations: GymLocation[];
  currentLocationId: string;
  // Core Actions
  addMember: (member: Omit<Member, "id" | "timeline" | "invoices" | "attendanceRate" | "lastVisit" | "isCurrentlyInside">) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  checkInMember: (memberId: string) => void;
  checkOutMember: (memberId: string) => void;
  renewMember: (memberId: string, durationMonths: number, planName?: string) => void;
  toggleFreezeMember: (memberId: string) => void;
  recordPayment: (payment: Omit<Payment, "id" | "invoiceNumber">) => void;
  sendReminder: (id: string) => void;
  sendAllReminders: () => void;
  // Staff CRUD
  addStaff: (staffMember: Omit<StaffMember, "id" | "leaveRecords" | "assignedClientsCount">) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  payStaffSalary: (staffId: string) => void;
  toggleStaffStatus: (staffId: string, status: "On Floor" | "Off Duty" | "On Leave") => void;
  approveLeaveRequest: (staffId: string, leaveId: string) => void;
  // Equipment CRUD
  addEquipment: (equipment: Omit<GymEquipment, "id" | "usageCount">) => void;
  updateEquipment: (id: string, updates: Partial<GymEquipment>) => void;
  deleteEquipment: (id: string) => void;
  serviceEquipment: (equipmentId: string) => void;
  // Plans CRUD
  addPlan: (plan: Omit<MembershipPlan, "id" | "activeCount" | "expiringCount" | "frozenCount" | "upgradeOpportunities">) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;
  // Classes
  bookClass: (classId: string, memberId: string) => void;
  cancelClassBooking: (classId: string, memberId: string) => void;
  dismissInsight: (id: string) => void;
  executeInsightAction: (insight: SmartInsight) => void;
  updateSettings: (newSettings: Partial<GymSettings>) => void;
  resetToDefaultData: () => void;
  // Lead CRM Actions
  addLead: (lead: Omit<Lead, "id" | "createdAt">) => void;
  updateLeadStage: (leadId: string, stage: LeadStage) => void;
  convertLeadToMember: (leadId: string, planName: string, due?: number) => void;
  // POS Pro Shop Actions
  processPOSSale: (sale: { memberId?: string; memberName: string; items: POSOrderItem[]; paymentMethod: "UPI" | "Cash" | "Card" | "Member Due" }) => void;
  restockProduct: (productId: string, quantity: number) => void;
  // Workout & Diet Actions
  assignWorkoutToMember: (memberId: string, workoutId: string) => void;
  assignDietToMember: (memberId: string, dietId: string) => void;
  // Locker Actions
  assignLocker: (lockerNumber: number, memberId: string, memberName: string) => void;
  releaseLocker: (lockerNumber: number) => void;
  // Multi-Location Actions
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
}

const GymContext = createContext<GymStoreContextType | null>(null);

const STORAGE_KEY_V6 = "ironhouse_gym_flow_v6";

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state: dark or light
  const [theme, setThemeState] = useState<"dark" | "light">(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const saved = localStorage.getItem("gym_flow_theme");
      if (saved === "light" || saved === "dark") return saved;
      return "dark"; // Default to sleek dark mode
    } catch {
      return "dark";
    }
  });

  const setTheme = (newTheme: "dark" | "light") => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("gym_flow_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [theme]);

  const [members, setMembers] = useState<Member[]>(() => {
    if (typeof window === "undefined") return DEFAULT_MEMBERS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_members`);
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    if (typeof window === "undefined") return DEFAULT_PAYMENTS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_payments`);
      return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
    } catch {
      return DEFAULT_PAYMENTS;
    }
  });

  const [reminders, setReminders] = useState<ReminderItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_REMINDERS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_reminders`);
      return saved ? JSON.parse(saved) : DEFAULT_REMINDERS;
    } catch {
      return DEFAULT_REMINDERS;
    }
  });

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    if (typeof window === "undefined") return DEFAULT_STAFF;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_staff`);
      return saved ? JSON.parse(saved) : DEFAULT_STAFF;
    } catch {
      return DEFAULT_STAFF;
    }
  });

  const [classes, setClasses] = useState<GymClass[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CLASSES;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_classes`);
      return saved ? JSON.parse(saved) : DEFAULT_CLASSES;
    } catch {
      return DEFAULT_CLASSES;
    }
  });

  const [equipment, setEquipment] = useState<GymEquipment[]>(() => {
    if (typeof window === "undefined") return DEFAULT_EQUIPMENT;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_equipment`);
      return saved ? JSON.parse(saved) : DEFAULT_EQUIPMENT;
    } catch {
      return DEFAULT_EQUIPMENT;
    }
  });

  const [insights, setInsights] = useState<SmartInsight[]>(() => {
    if (typeof window === "undefined") return DEFAULT_INSIGHTS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_insights`);
      return saved ? JSON.parse(saved) : DEFAULT_INSIGHTS;
    } catch {
      return DEFAULT_INSIGHTS;
    }
  });

  const [settings, setSettings] = useState<GymSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window === "undefined") return DEFAULT_LEADS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_leads`);
      return saved ? JSON.parse(saved) : DEFAULT_LEADS;
    } catch {
      return DEFAULT_LEADS;
    }
  });

  const [posProducts, setPOSProducts] = useState<POSProduct[]>(() => {
    if (typeof window === "undefined") return DEFAULT_POS_PRODUCTS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_pos_products`);
      return saved ? JSON.parse(saved) : DEFAULT_POS_PRODUCTS;
    } catch {
      return DEFAULT_POS_PRODUCTS;
    }
  });

  const [posOrders, setPOSOrders] = useState<POSOrder[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_pos_orders`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [workoutPrograms, setWorkoutPrograms] = useState<WorkoutProgram[]>(() => {
    if (typeof window === "undefined") return DEFAULT_WORKOUT_PROGRAMS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_workout_programs`);
      return saved ? JSON.parse(saved) : DEFAULT_WORKOUT_PROGRAMS;
    } catch {
      return DEFAULT_WORKOUT_PROGRAMS;
    }
  });

  const [dietPlans, setDietPlans] = useState<DietPlan[]>(() => {
    if (typeof window === "undefined") return DEFAULT_DIET_PLANS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_diet_plans`);
      return saved ? JSON.parse(saved) : DEFAULT_DIET_PLANS;
    } catch {
      return DEFAULT_DIET_PLANS;
    }
  });

  const [lockers, setLockers] = useState<Locker[]>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCKERS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_lockers`);
      return saved ? JSON.parse(saved) : DEFAULT_LOCKERS;
    } catch {
      return DEFAULT_LOCKERS;
    }
  });

  const [locations, setLocations] = useState<GymLocation[]>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCATIONS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_V6}_locations`);
      return saved ? JSON.parse(saved) : DEFAULT_LOCATIONS;
    } catch {
      return DEFAULT_LOCATIONS;
    }
  });

  const [currentLocationId, setCurrentLocationId] = useState("loc-1");

  // Dynamic UPI QR Modal state
  const [isUPIQRModalOpen, setIsUPIQRModalOpen] = useState(false);
  const [upiQRPaymentDetails, setUpiQRPaymentDetails] = useState<{ amount: number; memberName: string; note: string } | null>(null);

  // Modals & Panels UI State
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

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_payments`, JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_reminders`, JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_staff`, JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_classes`, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_equipment`, JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_insights`, JSON.stringify(insights));
  }, [insights]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_leads`, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_pos_products`, JSON.stringify(posProducts));
  }, [posProducts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_pos_orders`, JSON.stringify(posOrders));
  }, [posOrders]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_workout_programs`, JSON.stringify(workoutPrograms));
  }, [workoutPrograms]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_diet_plans`, JSON.stringify(dietPlans));
  }, [dietPlans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_lockers`, JSON.stringify(lockers));
  }, [lockers]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_V6}_locations`, JSON.stringify(locations));
  }, [locations]);

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

  const openUPIQRModal = (amount: number, memberName: string, note?: string) => {
    setUpiQRPaymentDetails({
      amount,
      memberName,
      note: note || `Gym Fee - ${settings.name}`,
    });
    setIsUPIQRModalOpen(true);
  };

  // Action: Add Member
  const addMember = (memberData: Omit<Member, "id" | "timeline" | "invoices" | "attendanceRate" | "lastVisit" | "isCurrentlyInside">) => {
    const newId = `m-${Date.now()}`;
    const invoiceNum = `${settings.invoicePrefix || "INV-2026-"}${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split("T")[0];

    const newMember: Member = {
      ...memberData,
      id: newId,
      attendanceRate: 100,
      lastVisit: "Joined today",
      isCurrentlyInside: false,
      timeline: [
        {
          id: `t-${Date.now()}`,
          type: "registration",
          title: `Registered for ${memberData.plan} Membership`,
          timestamp: "Just now",
        },
      ],
      invoices:
        memberData.due === 0
          ? [
            {
              id: `inv-${Date.now()}`,
              invoiceNumber: invoiceNum,
              date: today,
              amount: settings.membershipPlans.find((p) => p.name === memberData.plan)?.price || 2800,
              plan: memberData.plan,
              method: "UPI",
              status: "Paid",
            },
          ]
          : [],
    };

    setMembers((prev) => [newMember, ...prev]);

    if (newMember.due > 0) {
      const newReminder: ReminderItem = {
        id: `r-${Date.now()}`,
        memberId: newMember.id,
        name: newMember.name,
        phone: newMember.phone,
        reason: `Pending due ${settings.currencySymbol}${newMember.due}`,
        channel: "WhatsApp",
        time: "Today, 9:00 AM",
        status: "Pending",
      };
      setReminders((prev) => [newReminder, ...prev]);
    }
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          if (updated.due === 0 && (updated.status === "Partial" || updated.status === "Expired")) {
            updated.status = "Active";
          }
          return updated;
        }
        return m;
      })
    );
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setReminders((prev) => prev.filter((r) => r.memberId !== id));
    if (selectedMember360?.id === id) {
      setIsMember360Open(false);
      setSelectedMember360(null);
    }
  };

  const checkInMember = (memberId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            isCurrentlyInside: true,
            checkInTime: timeNow,
            lastVisit: `Today, ${timeNow}`,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "attendance",
                title: `Checked in at floor gate (${timeNow})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      })
    );
  };

  const checkOutMember = (memberId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            isCurrentlyInside: false,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "attendance",
                title: `Checked out (${timeNow})`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      })
    );
  };

  const renewMember = (memberId: string, durationMonths: number, planName?: string) => {
    const today = new Date();
    today.setMonth(today.getMonth() + durationMonths);
    const newExpiry = today.toISOString().split("T")[0];
    const invoiceNum = `${settings.invoicePrefix || "INV-2026-"}${Math.floor(100 + Math.random() * 900)}`;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const selectedPlan = planName || m.plan;
          const planPrice = settings.membershipPlans.find((p) => p.name === selectedPlan)?.price || 2800;
          return {
            ...m,
            plan: selectedPlan,
            expiry: newExpiry,
            status: "Active",
            due: 0,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "upgrade",
                title: `Renewed ${selectedPlan} membership for ${durationMonths} month(s)`,
                timestamp: "Just now",
                amount: planPrice,
              },
              ...m.timeline,
            ],
            invoices: [
              {
                id: `inv-${Date.now()}`,
                invoiceNumber: invoiceNum,
                date: new Date().toISOString().split("T")[0],
                amount: planPrice,
                plan: selectedPlan,
                method: "UPI",
                status: "Paid",
              },
              ...m.invoices,
            ],
          };
        }
        return m;
      })
    );
  };

  const toggleFreezeMember = (memberId: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          const newStatus: MemberStatus = m.status === "Frozen" ? "Active" : "Frozen";
          return {
            ...m,
            status: newStatus,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "freeze",
                title: newStatus === "Frozen" ? "Membership paused/frozen" : "Membership resumed/active",
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      })
    );
  };

  const recordPayment = (paymentData: Omit<Payment, "id" | "invoiceNumber">) => {
    const invoiceNumber = `${settings.invoicePrefix || "INV-2026-"}${Math.floor(100 + Math.random() * 900)}`;
    const newPayment: Payment = {
      ...paymentData,
      id: `p-${Date.now()}`,
      invoiceNumber,
    };
    setPayments((prev) => [newPayment, ...prev]);

    if (paymentData.memberId || paymentData.member) {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === paymentData.memberId || m.name.toLowerCase() === paymentData.member.toLowerCase()) {
            const newDue = Math.max(0, m.due - paymentData.amount);
            const newStatus: MemberStatus =
              newDue === 0 ? (m.status === "Partial" || m.status === "Expired" ? "Active" : m.status) : "Partial";
            return {
              ...m,
              due: newDue,
              status: newStatus,
              timeline: [
                {
                  id: `t-${Date.now()}`,
                  type: "payment",
                  title: `Logged payment of ${settings.currencySymbol}${paymentData.amount} via ${paymentData.method}`,
                  timestamp: "Just now",
                  amount: paymentData.amount,
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
                  status: newDue === 0 ? "Paid" : "Partial",
                },
                ...m.invoices,
              ],
            };
          }
          return m;
        })
      );
    }
  };

  const sendReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Sent" as const } : r))
    );
  };

  const sendAllReminders = () => {
    setReminders((prev) => prev.map((r) => ({ ...r, status: "Sent" as const })));
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
    setStaff((prev) => [...prev, newStaff]);
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
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
    setPayments((prev) => [paymentEntry, ...prev]);
  };

  const toggleStaffStatus = (staffId: string, status: "On Floor" | "Off Duty" | "On Leave") => {
    setStaff((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status } : s))
    );
  };

  const approveLeaveRequest = (staffId: string, leaveId: string) => {
    setStaff((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            leaveRecords: s.leaveRecords.map((l) =>
              l.id === leaveId ? { ...l, status: "Approved" as const } : l
            ),
          };
        }
        return s;
      })
    );
  };

  // Equipment CRUD
  const addEquipment = (eqData: Omit<GymEquipment, "id" | "usageCount">) => {
    const newEquipment: GymEquipment = {
      ...eqData,
      id: `eq-${Date.now()}`,
      usageCount: 0,
    };
    setEquipment((prev) => [newEquipment, ...prev]);
  };

  const updateEquipment = (id: string, updates: Partial<GymEquipment>) => {
    setEquipment((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  const serviceEquipment = (equipmentId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 3);
    const nextServiceDate = nextDate.toISOString().split("T")[0];

    setEquipment((prev) =>
      prev.map((e) =>
        e.id === equipmentId
          ? {
            ...e,
            status: "Operational",
            lastServiced: today,
            nextServiceDate,
            usageCount: e.usageCount + 50,
          }
          : e
      )
    );
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
    setSettings((prev) => ({
      ...prev,
      membershipPlans: [...prev.membershipPlans, newPlan],
    }));
  };

  const updatePlan = (id: string, updates: Partial<MembershipPlan>) => {
    setSettings((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const deletePlan = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.filter((p) => p.id !== id),
    }));
  };

  const bookClass = (classId: string, memberId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId && !c.enrolledMembers.includes(memberId)) {
          return { ...c, enrolledMembers: [...c.enrolledMembers, memberId] };
        }
        return c;
      })
    );
  };

  const cancelClassBooking = (classId: string, memberId: string) => {
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === classId) {
          return { ...c, enrolledMembers: c.enrolledMembers.filter((id) => id !== memberId) };
        }
        return c;
      })
    );
  };

  const dismissInsight = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
  };

  const executeInsightAction = (insight: SmartInsight) => {
    switch (insight.actionType) {
      case "nudge_expiring":
        sendAllReminders();
        break;
      case "assign_trainer":
        if (staff.length > 2) {
          toggleStaffStatus(staff[2].id, "On Floor");
        }
        break;
      case "service_equipment":
        if (equipment.length > 0) {
          serviceEquipment(equipment[0].id);
        }
        break;
      case "promote_pt":
        setIsAddMemberOpen(true);
        break;
      case "restock_pos":
        setPOSProducts((prev) =>
          prev.map((p) => (p.stock < 10 ? { ...p, stock: p.stock + 20 } : p))
        );
        break;
    }
  };

  // Lead Actions
  const addLead = (leadData: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStage = (leadId: string, stage: LeadStage) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage } : l))
    );
  };

  const convertLeadToMember = (leadId: string, planName: string, due: number = 0) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    addMember({
      name: targetLead.name,
      phone: targetLead.phone,
      email: targetLead.email,
      plan: planName,
      joinDate: new Date().toISOString().split("T")[0],
      expiry: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
      status: due > 0 ? "Partial" : "Active",
      due,
      healthGoal: targetLead.fitnessGoal,
      notes: `Converted from ${targetLead.source} lead. ${targetLead.notes}`,
    });

    updateLeadStage(leadId, "Won");
  };

  // POS Actions
  const processPOSSale = (sale: { memberId?: string; memberName: string; items: POSOrderItem[]; paymentMethod: "UPI" | "Cash" | "Card" | "Member Due" }) => {
    const orderNum = `ORD-${Date.now().toString().slice(-4)}`;
    const totalAmount = sale.items.reduce((s, it) => s + it.price * it.quantity, 0);

    const newOrder: POSOrder = {
      id: `pos-ord-${Date.now()}`,
      orderNumber: orderNum,
      memberId: sale.memberId,
      memberName: sale.memberName,
      items: sale.items,
      totalAmount,
      paymentMethod: sale.paymentMethod,
      date: new Date().toISOString().split("T")[0],
    };

    setPOSOrders((prev) => [newOrder, ...prev]);

    // Decrement stock
    setPOSProducts((prev) =>
      prev.map((prod) => {
        const itemInSale = sale.items.find((it) => it.productId === prod.id);
        if (itemInSale) {
          return { ...prod, stock: Math.max(0, prod.stock - itemInSale.quantity) };
        }
        return prod;
      })
    );

    // Record to financial ledger
    const newPayment: Payment = {
      id: `p-${Date.now()}`,
      memberId: sale.memberId,
      member: sale.memberName,
      date: new Date().toISOString().split("T")[0],
      method: sale.paymentMethod === "Member Due" ? "UPI" : sale.paymentMethod,
      amount: totalAmount,
      category: "Pro Shop",
      status: sale.paymentMethod === "Member Due" ? "Partial" : "Paid",
      invoiceNumber: `INV-POS-${Date.now().toString().slice(-4)}`,
      notes: `Pro Shop sale (${sale.items.map((i) => `${i.quantity}x ${i.name}`).join(", ")})`,
    };
    setPayments((prev) => [newPayment, ...prev]);

    // If assigned to a member, add timeline entry
    if (sale.memberId) {
      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === sale.memberId) {
            const addedDue = sale.paymentMethod === "Member Due" ? totalAmount : 0;
            return {
              ...m,
              due: m.due + addedDue,
              status: addedDue > 0 ? "Partial" : m.status,
              timeline: [
                {
                  id: `t-${Date.now()}`,
                  type: "pos_purchase",
                  title: `Purchased Pro Shop items (${settings.currencySymbol}${totalAmount})`,
                  timestamp: "Just now",
                  amount: totalAmount,
                },
                ...m.timeline,
              ],
            };
          }
          return m;
        })
      );
    }
  };

  const restockProduct = (productId: string, quantity: number) => {
    setPOSProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: p.stock + quantity } : p))
    );
  };

  // Workout & Diet Actions
  const assignWorkoutToMember = (memberId: string, workoutId: string) => {
    const workout = workoutPrograms.find((w) => w.id === workoutId);
    if (!workout) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            assignedWorkout: workout.title,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "workout_assigned",
                title: `Assigned Workout Split: ${workout.title}`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      })
    );
  };

  const assignDietToMember = (memberId: string, dietId: string) => {
    const diet = dietPlans.find((d) => d.id === dietId);
    if (!diet) return;

    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId) {
          return {
            ...m,
            assignedDiet: diet.title,
            timeline: [
              {
                id: `t-${Date.now()}`,
                type: "workout_assigned",
                title: `Assigned Nutrition Plan: ${diet.title}`,
                timestamp: "Just now",
              },
              ...m.timeline,
            ],
          };
        }
        return m;
      })
    );
  };

  // Locker Actions
  const assignLocker = (lockerNumber: number, memberId: string, memberName: string) => {
    const expiresOn = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0];
    setLockers((prev) =>
      prev.map((l) =>
        l.number === lockerNumber
          ? {
            ...l,
            status: "Occupied",
            assignedMemberId: memberId,
            assignedMemberName: memberName,
            expiresOn,
          }
          : l
      )
    );

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, assignedLocker: lockerNumber } : m))
    );
  };

  const releaseLocker = (lockerNumber: number) => {
    const targetLocker = lockers.find((l) => l.number === lockerNumber);
    if (targetLocker?.assignedMemberId) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === targetLocker.assignedMemberId ? { ...m, assignedLocker: undefined } : m
        )
      );
    }

    setLockers((prev) =>
      prev.map((l) =>
        l.number === lockerNumber
          ? {
            ...l,
            status: "Available",
            assignedMemberId: undefined,
            assignedMemberName: undefined,
            expiresOn: undefined,
          }
          : l
      )
    );
  };

  // Multi-Location Actions
  const switchLocation = (locationId: string) => {
    setCurrentLocationId(locationId);
    const targetLoc = locations.find((l) => l.id === locationId);
    if (targetLoc) {
      setSettings((prev) => ({
        ...prev,
        name: targetLoc.name.split(" · ")[0],
        location: targetLoc.name.split(" · ")[1] || prev.location,
      }));
    }
  };

  const updateSettings = (newSettings: Partial<GymSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetToDefaultData = () => {
    setMembers(DEFAULT_MEMBERS);
    setPayments(DEFAULT_PAYMENTS);
    setStaff(DEFAULT_STAFF);
    setEquipment(DEFAULT_EQUIPMENT);
    setSettings(DEFAULT_SETTINGS);
    setLeads(DEFAULT_LEADS);
    setPOSProducts(DEFAULT_POS_PRODUCTS);
    setLockers(DEFAULT_LOCKERS);
  };

  return (
    <GymContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        members,
        payments,
        reminders,
        staff,
        classes,
        equipment,
        insights,
        settings,
        leads,
        posProducts,
        posOrders,
        workoutPrograms,
        dietPlans,
        lockers,
        locations,
        currentLocationId,
        addMember,
        updateMember,
        deleteMember,
        checkInMember,
        checkOutMember,
        renewMember,
        toggleFreezeMember,
        recordPayment,
        sendReminder,
        sendAllReminders,
        addStaff,
        updateStaff,
        deleteStaff,
        payStaffSalary,
        toggleStaffStatus,
        approveLeaveRequest,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        serviceEquipment,
        addPlan,
        updatePlan,
        deletePlan,
        bookClass,
        cancelClassBooking,
        dismissInsight,
        executeInsightAction,
        updateSettings,
        resetToDefaultData,
        addLead,
        updateLeadStage,
        convertLeadToMember,
        processPOSSale,
        restockProduct,
        assignWorkoutToMember,
        assignDietToMember,
        assignLocker,
        releaseLocker,
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
