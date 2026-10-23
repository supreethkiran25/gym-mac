/**
 * PEAKREP OS — Safe CSV Import Validator Engine
 * Validates member import rows, normalizes phone & email, prevents duplicates,
 * checks membership plans, and generates diagnostic error logs.
 */

import { Member, MembershipPlan } from "./gym-store";

export interface CsvMemberRow {
  name: string;
  phone: string;
  email: string;
  plan: string;
  planPrice?: number;
  paidAmount?: number;
  joinDate?: string;
  expiry?: string;
  healthGoal?: string;
  notes?: string;
}

export interface RowValidationError {
  rowIndex: number;
  field: string;
  error: string;
  value: string;
}

export interface ImportValidationResult {
  validRows: Array<CsvMemberRow & { computedDue: number; computedStatus: Member["status"] }>;
  invalidRows: Array<{ row: Partial<CsvMemberRow>; errors: RowValidationError[] }>;
  totalRows: number;
  validCount: number;
  errorCount: number;
  duplicateCount: number;
  plansFound: string[];
}

/**
 * Normalizes phone numbers (removes spaces, dashes, parentheses).
 */
export function normalizePhone(phone: string): string {
  if (!phone) return "";
  return phone.replace(/[^0-9+]/g, "").trim();
}

/**
 * Normalizes email strings.
 */
export function normalizeEmail(email: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Validates and dry-runs an array of CSV import rows against existing members and plans.
 */
export function validateCsvImportBatch(
  rows: Array<Record<string, string>>,
  existingMembers: Member[],
  availablePlans: MembershipPlan[],
  todayStr: string = new Date().toISOString().split("T")[0],
): ImportValidationResult {
  const existingPhones = new Set(existingMembers.map((m) => normalizePhone(m.phone)));
  const existingEmails = new Set(
    existingMembers.map((m) => normalizeEmail(m.email)).filter(Boolean),
  );

  const seenBatchPhones = new Set<string>();
  const seenBatchEmails = new Set<string>();

  const validRows: ImportValidationResult["validRows"] = [];
  const invalidRows: ImportValidationResult["invalidRows"] = [];
  const plansFound = new Set<string>();
  let duplicateCount = 0;

  rows.forEach((rawRow, idx) => {
    const rowIndex = idx + 1;
    const errors: RowValidationError[] = [];

    // Extract & normalize fields (case-insensitive header mapping)
    const name = (rawRow.name || rawRow.Name || rawRow["Member Name"] || "").trim();
    const rawPhone = (rawRow.phone || rawRow.Phone || rawRow["Mobile"] || rawRow["Phone Number"] || "").trim();
    const phone = normalizePhone(rawPhone);
    const rawEmail = (rawRow.email || rawRow.Email || rawRow["Email Address"] || "").trim();
    const email = normalizeEmail(rawEmail);
    const planName = (rawRow.plan || rawRow.Plan || rawRow["Membership Plan"] || "").trim();

    // Field 1: Name
    if (!name) {
      errors.push({ rowIndex, field: "name", error: "Member name is mandatory.", value: name });
    }

    // Field 2: Phone
    if (!phone || phone.length < 10) {
      errors.push({ rowIndex, field: "phone", error: "Valid 10+ digit phone number is required.", value: rawPhone });
    } else if (existingPhones.has(phone)) {
      duplicateCount++;
      errors.push({ rowIndex, field: "phone", error: "Phone number already registered to an existing member.", value: phone });
    } else if (seenBatchPhones.has(phone)) {
      duplicateCount++;
      errors.push({ rowIndex, field: "phone", error: "Duplicate phone number found within the same CSV batch.", value: phone });
    }

    // Field 3: Email (optional, but must be unique & valid if provided)
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ rowIndex, field: "email", error: "Invalid email format.", value: email });
      } else if (existingEmails.has(email)) {
        duplicateCount++;
        errors.push({ rowIndex, field: "email", error: "Email already registered to an existing member.", value: email });
      } else if (seenBatchEmails.has(email)) {
        duplicateCount++;
        errors.push({ rowIndex, field: "email", error: "Duplicate email found within this CSV batch.", value: email });
      }
    }

    // Field 4: Plan Validation
    const matchedPlan = availablePlans.find(
      (p) => p.name.toLowerCase() === planName.toLowerCase(),
    );
    if (!matchedPlan) {
      errors.push({
        rowIndex,
        field: "plan",
        error: `Plan "${planName || "Unknown"}" does not match configured gym plans. Available: ${availablePlans.map((p) => p.name).join(", ")}.`,
        value: planName,
      });
    } else {
      plansFound.add(matchedPlan.name);
    }

    // Amounts & Dues
    const planPrice = matchedPlan?.price || Number(rawRow.planPrice || rawRow.price) || 3000;
    const paidRaw = rawRow.paidAmount !== undefined ? Number(rawRow.paidAmount) : planPrice;
    const paid = isNaN(paidRaw) ? planPrice : Math.max(0, paidRaw);
    const computedDue = Math.max(0, planPrice - paid);
    const computedStatus: Member["status"] = computedDue > 0 ? "Partial" : "Active";

    // Dates
    const joinDate = rawRow.joinDate || todayStr;
    let expiry = rawRow.expiry;
    if (!expiry) {
      const d = new Date(joinDate);
      d.setMonth(d.getMonth() + (matchedPlan?.durationMonths || 1));
      expiry = d.toISOString().split("T")[0];
    }

    if (errors.length > 0) {
      invalidRows.push({ row: { name, phone, email, plan: planName }, errors });
    } else {
      seenBatchPhones.add(phone);
      if (email) seenBatchEmails.add(email);

      validRows.push({
        name,
        phone,
        email: email || `${name.toLowerCase().replace(/\s+/g, ".")}@gym.local`,
        plan: matchedPlan?.name || planName,
        planPrice,
        paidAmount: paid,
        computedDue,
        computedStatus,
        joinDate,
        expiry,
        healthGoal: rawRow.healthGoal || "General Fitness",
        notes: rawRow.notes || "Imported via Safe CSV Batch",
      });
    }
  });

  return {
    validRows,
    invalidRows,
    totalRows: rows.length,
    validCount: validRows.length,
    errorCount: invalidRows.length,
    duplicateCount,
    plansFound: Array.from(plansFound),
  };
}
