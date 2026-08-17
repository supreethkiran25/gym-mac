import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type MembershipTier = "Standard" | "Premium" | "VIP Pass" | "PT Package";

export interface MemberInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  plan: string;
  method: "UPI" | "Cash" | "Card" | "Bank Transfer";
  status: "Paid" | "Pending" | "Partially Paid";
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  email: string;
  plan: string;
  status: "Active" | "Expiring" | "Expired" | "Pending Dues";
  startDate: string;
  endDate: string;
  lastPaymentDate: string;
  amountPaid: number;
  totalAmount: number;
  due: number;
  paymentMethod: "UPI" | "Cash" | "Card" | "Bank Transfer";
  notes?: string;
  attendanceRate: number;
  lastVisit: string;
  streakDays: number;
  totalVisitsThisMonth: number;
  assignedWorkout?: string;
  assignedDiet?: string;
  emergencyContact?: string;
  isCurrentlyInside?: boolean;
  checkInTime?: string;
  avatar?: string;
  invoices: MemberInvoice[];
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

export interface POSProduct {
  id: string;
  name: string;
  category: "Supplements" | "Drinks" | "Snacks" | "Apparel" | "Accessories";
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  barcode?: string;
  lowStockThreshold: number;
  soldCount: number;
  image?: string;
}

export interface POSSaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface POSSale {
  id: string;
  timestamp: string;
  memberId?: string;
  memberName: string;
  items: POSSaleItem[];
  totalAmount: number;
  paymentMethod: "UPI" | "Cash" | "Card" | "Split";
  cashierName: string;
}

export interface WorkoutProgram {
  id: string;
  title: string;
  targetGoal: "Hypertrophy" | "Fat Loss" | "Strength" | "Endurance";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  daysPerWeek: number;
  assignedCount: number;
  exercises: { name: string; sets: string; reps: string; targetMuscle: string }[];
}

export interface DietPlan {
  id: string;
  title: string;
  type: "High Protein" | "Keto Lean" | "Maintenance" | "Vegetarian Athlete";
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  meals: { time: string; name: string; description: string }[];
}

export interface LockerItem {
  id: string;
  number: string;
  bay: "A (Men's Locker)" | "B (Men's Locker)" | "C (Women's Locker)" | "D (VIP Lounge)";
  status: "Available" | "Occupied" | "Maintenance";
  assignedMemberId?: string;
  assignedMemberName?: string;
  expiresOn?: string;
  keyNumber: string;
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
  assignedClientsCount: number;
  avatar?: string;
  lastSalaryPaidDate?: string;
}

export interface GymClass {
  id: string;
  title: string;
  instructor: string;
  time: string;
  duration: string;
  day: string;
  capacity: number;
  bookedCount: number;
  room: string;
  category: "HIIT" | "Spin" | "Yoga" | "Strength" | "CrossFit" | "Zumba";
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
  vendorName?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  activeCount: number;
  perks: string[];
  type: "Standard" | "Premium" | "PT Package" | "VIP Pass";
}

export interface GymSettings {
  name: string;
  location: string;
  phone: string;
  email: string;
  currencySymbol: string;
  operatingHours: string;
  gstNumber: string;
  upiId: string;
  invoicePrefix: string;
  taxRatePercent: number;
  autoSendWhatsAppOnRenewal: boolean;
  reminderTemplateWhatsApp: string;
  reminderTemplateSMS: string;
  welcomeTemplateWhatsApp: string;
  membershipPlans: MembershipPlan[];
}

export interface FinancialTransaction {
  id: string;
  type: "Subscription" | "Personal Training" | "POS Sale" | "Staff Salary" | "Equipment Maintenance" | "Utility Expense";
  category: "Income" | "Expense";
  amount: number;
  description: string;
  partyName: string;
  method: "UPI" | "Cash" | "Card" | "Bank Transfer";
  date: string;
  invoiceNumber?: string;
}

// ==========================================
// DEFAULT MOCK DATA
// ==========================================

const DEFAULT_MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: "plan-1",
    name: "Monthly Flex Pass",
    price: 2800,
    durationMonths: 1,
    activeCount: 42,
    perks: ["Full gym floor access", "Locker & shower facilities", "General trainer assistance"],
    type: "Standard",
  },
  {
    id: "plan-2",
    name: "Quarterly Pro Transformation",
    price: 7500,
    durationMonths: 3,
    activeCount: 68,
    perks: ["Full gym access", "1 Free 1-on-1 PT assessment", "Free body composition scan", "Locker access"],
    type: "Standard",
  },
  {
    id: "plan-3",
    name: "Annual Elite All-Access",
    price: 22000,
    durationMonths: 12,
    activeCount: 89,
    perks: ["Unlimited 24/7 access", "Steam & sauna suite", "12 Free guest passes", "Custom diet & workout split", "Dedicated locker"],
    type: "Premium",
  },
  {
    id: "plan-4",
    name: "1-on-1 Personal Training 24-Pack",
    price: 18000,
    durationMonths: 2,
    activeCount: 14,
    perks: ["24 Private sessions with Senior Coach", "Nutritional macro guidance", "Weekly body metric tracking"],
    type: "PT Package",
  },
];

const DEFAULT_MEMBERS: Member[] = [
  {
    id: "mem-1",
    name: "Aarav Sharma",
    phone: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    plan: "Annual Elite All-Access",
    status: "Active",
    startDate: "2026-01-15",
    endDate: "2027-01-14",
    lastPaymentDate: "2026-01-15",
    amountPaid: 22000,
    totalAmount: 22000,
    due: 0,
    paymentMethod: "UPI",
    notes: "Prepares for marathon in November. Focus on high-volume legs & endurance.",
    attendanceRate: 92,
    lastVisit: "Today, 6:45 AM",
    streakDays: 14,
    totalVisitsThisMonth: 19,
    assignedWorkout: "Push-Pull-Legs Hypertrophy",
    assignedDiet: "High Protein Muscle Fuel (2400 kcal)",
    emergencyContact: "Priya Sharma (+91 98765 43219)",
    isCurrentlyInside: true,
    checkInTime: "6:45 AM",
    invoices: [
      {
        id: "inv-101",
        invoiceNumber: "INV-2026-0891",
        date: "2026-01-15",
        amount: 22000,
        plan: "Annual Elite All-Access",
        method: "UPI",
        status: "Paid",
      },
    ],
  },
  {
    id: "mem-2",
    name: "Sneha Patel",
    phone: "+91 98123 45678",
    email: "sneha.patel@example.com",
    plan: "Quarterly Pro Transformation",
    status: "Expiring",
    startDate: "2026-02-20",
    endDate: "2026-05-20",
    lastPaymentDate: "2026-02-20",
    amountPaid: 7500,
    totalAmount: 7500,
    due: 0,
    paymentMethod: "UPI",
    notes: "Interested in upgrading to Annual Elite if personal locker is included.",
    attendanceRate: 85,
    lastVisit: "Yesterday, 7:15 PM",
    streakDays: 6,
    totalVisitsThisMonth: 16,
    assignedWorkout: "Upper-Lower Functional Split",
    assignedDiet: "Keto Lean Definition (1800 kcal)",
    isCurrentlyInside: false,
    invoices: [
      {
        id: "inv-102",
        invoiceNumber: "INV-2026-0743",
        date: "2026-02-20",
        amount: 7500,
        plan: "Quarterly Pro Transformation",
        method: "UPI",
        status: "Paid",
      },
    ],
  },
  {
    id: "mem-3",
    name: "Rohan Verma",
    phone: "+91 99887 76655",
    email: "rohan.verma@example.com",
    plan: "Monthly Flex Pass",
    status: "Pending Dues",
    startDate: "2026-04-10",
    endDate: "2026-05-10",
    lastPaymentDate: "2026-04-10",
    amountPaid: 1500,
    totalAmount: 2800,
    due: 1300,
    paymentMethod: "Cash",
    notes: "Promised to clear ₹1,300 balance on Friday evening.",
    attendanceRate: 71,
    lastVisit: "May 14, 2026",
    streakDays: 0,
    totalVisitsThisMonth: 8,
    assignedWorkout: "Full Body Foundation",
    isCurrentlyInside: false,
    invoices: [
      {
        id: "inv-103",
        invoiceNumber: "INV-2026-0922",
        date: "2026-04-10",
        amount: 1500,
        plan: "Monthly Flex Pass",
        method: "Cash",
        status: "Partially Paid",
      },
    ],
  },
  {
    id: "mem-4",
    name: "Ananya Iyer",
    phone: "+91 97654 32109",
    email: "ananya.iyer@example.com",
    plan: "Annual Elite All-Access",
    status: "Active",
    startDate: "2025-11-01",
    endDate: "2026-11-01",
    lastPaymentDate: "2025-11-01",
    amountPaid: 22000,
    totalAmount: 22000,
    due: 0,
    paymentMethod: "UPI",
    attendanceRate: 95,
    lastVisit: "Today, 7:30 AM",
    streakDays: 21,
    totalVisitsThisMonth: 22,
    assignedWorkout: "Push-Pull-Legs Hypertrophy",
    isCurrentlyInside: true,
    checkInTime: "7:30 AM",
    invoices: [
      {
        id: "inv-104",
        invoiceNumber: "INV-2025-0611",
        date: "2025-11-01",
        amount: 22000,
        plan: "Annual Elite All-Access",
        method: "UPI",
        status: "Paid",
      },
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
    notes: "Completed 7:30 AM trial. Loved the turf area. Ready to join Quarterly Pro.",
    assignedTrainer: "Coach Ananya",
    createdAt: "2026-05-17",
    budget: 7500,
  },
];

const DEFAULT_POS_PRODUCTS: POSProduct[] = [
  {
    id: "pos-1",
    name: "Optimum Nutrition Gold Standard Whey (2 lbs - Rich Chocolate)",
    category: "Supplements",
    price: 3499,
    costPrice: 2600,
    stock: 14,
    sku: "SUP-ON-01",
    lowStockThreshold: 5,
    soldCount: 38,
  },
  {
    id: "pos-2",
    name: "Fast&Up BCAA Energy Blast (Green Apple)",
    category: "Supplements",
    price: 1299,
    costPrice: 850,
    stock: 19,
    sku: "SUP-BCAA-02",
    lowStockThreshold: 6,
    soldCount: 45,
  },
  {
    id: "pos-3",
    name: "Cold Brew Electrolyte Protein Shake (330ml)",
    category: "Drinks",
    price: 180,
    costPrice: 95,
    stock: 28,
    sku: "DRK-CB-01",
    lowStockThreshold: 10,
    soldCount: 112,
  },
];

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "stf-1",
    name: "Vikram Malhotra",
    role: "Head Coach",
    phone: "+91 98201 11223",
    email: "vikram@gymflow.com",
    salary: 65000,
    shift: "Morning 6:00 AM - 2:00 PM",
    status: "On Floor",
    assignedClientsCount: 8,
    avatar: "VM",
  },
  {
    id: "stf-2",
    name: "Ananya Deshmukh",
    role: "Personal Trainer",
    phone: "+91 98334 55667",
    email: "ananya@gymflow.com",
    salary: 45000,
    shift: "Evening 2:00 PM - 10:00 PM",
    status: "On Floor",
    assignedClientsCount: 6,
    avatar: "AD",
  },
];

const DEFAULT_EQUIPMENT: GymEquipment[] = [
  {
    id: "eq-1",
    name: "Hammer Strength Iso-Lateral Chest Press",
    category: "Strength",
    status: "Operational",
    lastServiced: "2026-04-10",
    nextServiceDate: "2026-07-10",
    serialNumber: "HS-CP-001",
    location: "Strength Zone Bay 2",
    usageCount: 840,
    vendorName: "Hammer Strength India",
  },
  {
    id: "eq-2",
    name: "Life Fitness Discover SE3 HD Treadmill #1",
    category: "Cardio",
    status: "Operational",
    lastServiced: "2026-04-15",
    nextServiceDate: "2026-06-15",
    serialNumber: "LF-TM-101",
    location: "Cardio Loft A",
    usageCount: 1420,
    vendorName: "Life Fitness Care",
  },
];

const DEFAULT_LOCKERS: LockerItem[] = [
  { id: "loc-1", number: "L-101", bay: "A (Men's Locker)", status: "Occupied", assignedMemberName: "Aarav Sharma", expiresOn: "2027-01-14", keyNumber: "K-101" },
  { id: "loc-2", number: "L-102", bay: "A (Men's Locker)", status: "Available", keyNumber: "K-102" },
  { id: "loc-3", number: "L-103", bay: "A (Men's Locker)", status: "Available", keyNumber: "K-103" },
  { id: "loc-4", number: "L-201", bay: "C (Women's Locker)", status: "Occupied", assignedMemberName: "Ananya Iyer", expiresOn: "2026-11-01", keyNumber: "K-201" },
  { id: "loc-5", number: "L-202", bay: "C (Women's Locker)", status: "Available", keyNumber: "K-202" },
];

const DEFAULT_SETTINGS: GymSettings = {
  name: "IronHouse Barbell & Fitness Club",
  location: "Indiranagar, Bangalore",
  phone: "+91 80 4123 4567",
  email: "frontdesk@ironhousegym.com",
  currencySymbol: "₹",
  operatingHours: "5:30 AM – 10:30 PM (Daily)",
  gstNumber: "29AABCI1234F1Z8",
  upiId: "ironhousegym@icici",
  invoicePrefix: "INV-2026-",
  taxRatePercent: 18,
  autoSendWhatsAppOnRenewal: true,
  reminderTemplateWhatsApp: "Hi {name}, your membership at {gym} for {plan} is due for renewal. Please tap here to pay: {link}",
  reminderTemplateSMS: "Alert: {name}, your {gym} pass expires in 2 days. Settle dues: {link}",
  welcomeTemplateWhatsApp: "Welcome to {gym}, {name}! Your {plan} pass is active.",
  membershipPlans: DEFAULT_MEMBERSHIP_PLANS,
};

// ==========================================
// CONTEXT CREATION & HOOK
// ==========================================

interface GymStoreContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  setTheme: (theme: "dark" | "light") => void;

  members: Member[];
  addMember: (m: Omit<Member, "id" | "attendanceRate" | "lastVisit" | "streakDays" | "totalVisitsThisMonth" | "invoices">) => void;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  checkInMember: (id: string) => void;
  checkOutMember: (id: string) => void;
  settleMemberDue: (id: string, amountToPay: number, method: "UPI" | "Cash" | "Card") => void;

  leads: Lead[];
  addLead: (l: Omit<Lead, "id" | "createdAt">) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  convertLeadToMember: (leadId: string, planName: string) => void;
  deleteLead: (id: string) => void;

  posProducts: POSProduct[];
  addPOSProduct: (p: Omit<POSProduct, "id" | "soldCount">) => void;
  updatePOSProductStock: (id: string, delta: number) => void;
  processPOSSale: (sale: { memberName: string; items: POSSaleItem[]; paymentMethod: "UPI" | "Cash" | "Card" }) => void;

  equipment: GymEquipment[];
  addEquipment: (e: Omit<GymEquipment, "id" | "usageCount">) => void;
  updateEquipment: (id: string, updates: Partial<GymEquipment>) => void;
  deleteEquipment: (id: string) => void;
  serviceEquipment: (id: string) => void;

  staff: StaffMember[];
  addStaff: (s: Omit<StaffMember, "id" | "assignedClientsCount">) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  payStaffSalary: (id: string) => void;
  toggleStaffStatus: (id: string, status: "On Floor" | "Off Duty" | "On Leave") => void;

  lockers: LockerItem[];
  assignLocker: (lockerNumber: string, memberId: string, memberName: string, expiresOn: string) => void;
  releaseLocker: (lockerNumber: string) => void;

  settings: GymSettings;
  updateSettings: (updates: Partial<GymSettings>) => void;
  addPlan: (p: Omit<MembershipPlan, "id" | "activeCount">) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;
  resetToDefaultData: () => void;

  // Active Modals & UPI QR State
  upiQRState: { isOpen: boolean; amount: number; memberName: string; description: string };
  openUPIQRModal: (amount: number, memberName: string, description: string) => void;
  closeUPIQRModal: () => void;

  isAddMemberOpen: boolean;
  setIsAddMemberOpen: (open: boolean) => void;
  isCheckInOpen: boolean;
  setIsCheckInOpen: (open: boolean) => void;
  selectedMember360: Member | null;
  setSelectedMember360: (m: Member | null) => void;
}

const GymStoreContext = createContext<GymStoreContextType | null>(null);

export function GymProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<"dark" | "light">("dark");
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [leads, setLeads] = useState<Lead[]>(DEFAULT_LEADS);
  const [posProducts, setPosProducts] = useState<POSProduct[]>(DEFAULT_POS_PRODUCTS);
  const [equipment, setEquipment] = useState<GymEquipment[]>(DEFAULT_EQUIPMENT);
  const [staff, setStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [lockers, setLockers] = useState<LockerItem[]>(DEFAULT_LOCKERS);
  const [settings, setSettings] = useState<GymSettings>(DEFAULT_SETTINGS);

  // Modal UI States
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [selectedMember360, setSelectedMember360] = useState<Member | null>(null);
  const [upiQRState, setUpiQRState] = useState({ isOpen: false, amount: 2800, memberName: "", description: "" });

  const setTheme = (newTheme: "dark" | "light") => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Member CRUD Actions
  const addMember = (m: Omit<Member, "id" | "attendanceRate" | "lastVisit" | "streakDays" | "totalVisitsThisMonth" | "invoices">) => {
    const newMember: Member = {
      ...m,
      id: `mem-${Date.now()}`,
      attendanceRate: 100,
      lastVisit: "Today (Enrolled)",
      streakDays: 1,
      totalVisitsThisMonth: 1,
      invoices: [
        {
          id: `inv-${Date.now()}`,
          invoiceNumber: `${settings.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          amount: m.amountPaid,
          plan: m.plan,
          method: m.paymentMethod,
          status: m.due === 0 ? "Paid" : "Partially Paid",
        },
      ],
    };
    setMembers((prev) => [newMember, ...prev]);
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const checkInMember = (id: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isCurrentlyInside: true,
              checkInTime: timeStr,
              lastVisit: `Today, ${timeStr}`,
              totalVisitsThisMonth: m.totalVisitsThisMonth + 1,
            }
          : m
      )
    );
  };

  const checkOutMember = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isCurrentlyInside: false,
              checkInTime: undefined,
            }
          : m
      )
    );
  };

  const settleMemberDue = (id: string, amountToPay: number, method: "UPI" | "Cash" | "Card") => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newDue = Math.max(0, m.due - amountToPay);
        const newAmountPaid = m.amountPaid + amountToPay;
        return {
          ...m,
          due: newDue,
          amountPaid: newAmountPaid,
          status: newDue === 0 ? "Active" : m.status,
          invoices: [
            ...m.invoices,
            {
              id: `inv-${Date.now()}`,
              invoiceNumber: `${settings.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`,
              date: new Date().toISOString().split("T")[0],
              amount: amountToPay,
              plan: m.plan,
              method,
              status: "Paid",
            },
          ],
        };
      })
    );
  };

  // Leads CRM Actions
  const addLead = (l: Omit<Lead, "id" | "createdAt">) => {
    const newLead: Lead = {
      ...l,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLeads((prev) => [newLead, ...prev]);
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  const convertLeadToMember = (leadId: string, planName: string) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const plan = settings.membershipPlans.find((p) => p.name === planName) || settings.membershipPlans[0];
    const today = new Date().toISOString().split("T")[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    addMember({
      name: lead.name,
      phone: lead.phone,
      email: lead.email,
      plan: plan.name,
      status: "Active",
      startDate: today,
      endDate: endDate.toISOString().split("T")[0],
      lastPaymentDate: today,
      amountPaid: plan.price,
      totalAmount: plan.price,
      due: 0,
      paymentMethod: "UPI",
      notes: `Converted from ${lead.source} lead. Goal: ${lead.fitnessGoal}`,
    });

    updateLeadStage(leadId, "Won");
  };

  const deleteLead = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

  // POS Store Actions
  const addPOSProduct = (p: Omit<POSProduct, "id" | "soldCount">) => {
    const newProduct: POSProduct = {
      ...p,
      id: `pos-${Date.now()}`,
      soldCount: 0,
    };
    setPosProducts((prev) => [newProduct, ...prev]);
  };

  const updatePOSProductStock = (id: string, delta: number) => {
    setPosProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p))
    );
  };

  const processPOSSale = (sale: { memberName: string; items: POSSaleItem[]; paymentMethod: "UPI" | "Cash" | "Card" }) => {
    const totalAmount = sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    // Decrement stock
    sale.items.forEach((item) => {
      updatePOSProductStock(item.productId, -item.quantity);
    });
  };

  // Equipment Actions
  const addEquipment = (e: Omit<GymEquipment, "id" | "usageCount">) => {
    const newEq: GymEquipment = {
      ...e,
      id: `eq-${Date.now()}`,
      usageCount: 0,
    };
    setEquipment((prev) => [newEq, ...prev]);
  };

  const updateEquipment = (id: string, updates: Partial<GymEquipment>) => {
    setEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEquipment = (id: string) => {
    setEquipment((prev) => prev.filter((e) => e.id !== id));
  };

  const serviceEquipment = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 3);
    setEquipment((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: "Operational",
              lastServiced: today,
              nextServiceDate: nextDate.toISOString().split("T")[0],
            }
          : e
      )
    );
  };

  // Staff Actions
  const addStaff = (s: Omit<StaffMember, "id" | "assignedClientsCount">) => {
    const newStaff: StaffMember = {
      ...s,
      id: `stf-${Date.now()}`,
      assignedClientsCount: 0,
    };
    setStaff((prev) => [newStaff, ...prev]);
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const deleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const payStaffSalary = (id: string) => {
    const today = new Date().toISOString().split("T")[0];
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, lastSalaryPaidDate: today } : s)));
  };

  const toggleStaffStatus = (id: string, status: "On Floor" | "Off Duty" | "On Leave") => {
    setStaff((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  };

  // Lockers Actions
  const assignLocker = (lockerNumber: string, memberId: string, memberName: string, expiresOn: string) => {
    setLockers((prev) =>
      prev.map((l) =>
        l.number === lockerNumber
          ? { ...l, status: "Occupied", assignedMemberId: memberId, assignedMemberName: memberName, expiresOn }
          : l
      )
    );
  };

  const releaseLocker = (lockerNumber: string) => {
    setLockers((prev) =>
      prev.map((l) =>
        l.number === lockerNumber
          ? { ...l, status: "Available", assignedMemberId: undefined, assignedMemberName: undefined, expiresOn: undefined }
          : l
      )
    );
  };

  // Settings & Plan Actions
  const updateSettings = (updates: Partial<GymSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  const addPlan = (p: Omit<MembershipPlan, "id" | "activeCount">) => {
    const newPlan: MembershipPlan = {
      ...p,
      id: `plan-${Date.now()}`,
      activeCount: 0,
    };
    setSettings((prev) => ({
      ...prev,
      membershipPlans: [...prev.membershipPlans, newPlan],
    }));
  };

  const updatePlan = (id: string, updates: Partial<MembershipPlan>) => {
    setSettings((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const deletePlan = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      membershipPlans: prev.membershipPlans.filter((p) => p.id !== id),
    }));
  };

  const resetToDefaultData = () => {
    setMembers(DEFAULT_MEMBERS);
    setLeads(DEFAULT_LEADS);
    setPosProducts(DEFAULT_POS_PRODUCTS);
    setEquipment(DEFAULT_EQUIPMENT);
    setStaff(DEFAULT_STAFF);
    setLockers(DEFAULT_LOCKERS);
    setSettings(DEFAULT_SETTINGS);
  };

  // UPI QR Modal Controls
  const openUPIQRModal = (amount: number, memberName: string, description: string) => {
    setUpiQRState({ isOpen: true, amount, memberName, description });
  };

  const closeUPIQRModal = () => {
    setUpiQRState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <GymStoreContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        members,
        addMember,
        updateMember,
        deleteMember,
        checkInMember,
        checkOutMember,
        settleMemberDue,
        leads,
        addLead,
        updateLeadStage,
        convertLeadToMember,
        deleteLead,
        posProducts,
        addPOSProduct,
        updatePOSProductStock,
        processPOSSale,
        equipment,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        serviceEquipment,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        payStaffSalary,
        toggleStaffStatus,
        lockers,
        assignLocker,
        releaseLocker,
        settings,
        updateSettings,
        addPlan,
        updatePlan,
        deletePlan,
        resetToDefaultData,
        upiQRState,
        openUPIQRModal,
        closeUPIQRModal,
        isAddMemberOpen,
        setIsAddMemberOpen,
        isCheckInOpen,
        setIsCheckInOpen,
        selectedMember360,
        setSelectedMember360,
      }}
    >
      {children}
    </GymStoreContext.Provider>
  );
}

export function useGymStore() {
  const context = useContext(GymStoreContext);
  if (!context) {
    throw new Error("useGymStore must be used within a GymProvider");
  }
  return context;
}
