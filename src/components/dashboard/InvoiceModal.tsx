import React, { useState } from "react";
import {
  X,
  Printer,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  User,
  Award,
} from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { toast } from "sonner";

// Indian Currency Number to Words converter (e.g. 12000 -> "Twelve Thousand")
function numberToWordsIndian(num: number): string {
  if (!num || isNaN(num) || num === 0) return "Zero Rupees Only";

  const singleDigits = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const tensDigits = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function convertSection(n: number): string {
    let str = "";
    if (n > 99) {
      str += singleDigits[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
      if (n > 0) str += "and ";
    }
    if (n > 19) {
      str += tensDigits[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += singleDigits[n] + " ";
    }
    return str.trim();
  }

  const intPart = Math.floor(Math.abs(num));
  let result = "";

  const crore = Math.floor(intPart / 10000000);
  let remainder = intPart % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder %= 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder %= 1000;

  const hundred = remainder;

  if (crore > 0) result += convertSection(crore) + " Crore ";
  if (lakh > 0) result += convertSection(lakh) + " Lakh ";
  if (thousand > 0) result += convertSection(thousand) + " Thousand ";
  if (hundred > 0) result += convertSection(hundred) + " ";

  return `Indian Rupees ${result.trim()} Only`;
}

export function InvoiceModal() {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    activeInvoicePayment,
    settings,
    currentUser,
    members,
  } = useGymStore();

  const [copied, setCopied] = useState(false);

  if (!isInvoiceModalOpen || !activeInvoicePayment) return null;

  const inv = activeInvoicePayment;
  const taxPercent = settings.taxRatePercent || 18;
  const baseAmount = Math.round((inv.amount * 100) / (100 + taxPercent));
  const taxAmount = inv.amount - baseAmount;
  const cgstAmount = Math.round(taxAmount / 2);
  const sgstAmount = taxAmount - cgstAmount;

  // Resolve member profile for richer invoice details
  const member = members.find(
    (m) =>
      (inv.memberId && m.id === inv.memberId) ||
      m.name.toLowerCase().trim() === inv.member.toLowerCase().trim()
  );

  const memberPhone = member?.phone || "+91 98860 12345";
  const memberEmail = member?.email || "member@fitnesshub.com";
  const memberPlan = member?.plan || (inv.category === "Membership" ? "Annual Elite Gym Pass" : inv.category);
  const startDate = member?.joinDate || inv.date;
  const endDate = member?.expiry || "1 Year Validity";
  const brandColor = settings.brandColor || "#10b981";

  const handlePrint = () => {
    window.print();
    toast.success("Printing 1-page A4 invoice...");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `*OFFICIAL TAX INVOICE & RECEIPT*\n` +
      `*${settings.name}*\n` +
      `----------------------------------------\n` +
      `📄 *Invoice No:* ${inv.invoiceNumber}\n` +
      `📅 *Date:* ${inv.date}\n` +
      `👤 *Member:* ${inv.member}\n` +
      `🏋️ *Plan:* ${memberPlan}\n` +
      `💰 *Amount Paid:* ${settings.currencySymbol}${inv.amount.toLocaleString("en-IN")}\n` +
      `💳 *Payment Mode:* ${inv.method}\n` +
      `✅ *Status:* ${inv.status.toUpperCase()} (Tax Included)\n` +
      `🏛️ *GSTIN:* ${settings.gstNumber || "29AABCU9603R1ZM"}\n` +
      `----------------------------------------\n` +
      `Thank you for training with us! 💪`
    );
    const phoneClean = memberPhone.replace(/[^0-9]/g, "");
    const waUrl = phoneClean.length >= 10 ? `https://wa.me/${phoneClean}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, "_blank");
    toast.success("WhatsApp receipt dispatched!");
  };

  const handleCopySummary = () => {
    const text = `Invoice #${inv.invoiceNumber} | ${settings.name} | ${inv.member} | ${settings.currencySymbol}${inv.amount.toLocaleString("en-IN")} | ${inv.date}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Invoice summary copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-2 sm:p-4 backdrop-blur-md overflow-y-auto print-invoice-modal-overlay animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl rounded-3xl border border-border/80 bg-surface shadow-2xl overflow-hidden print-invoice-page print:border-none print:shadow-none print:rounded-none animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 sm:px-6 py-3.5 bg-muted/40 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Official Tax Invoice & Payment Receipt</span>
                <span className="rounded-full bg-brand/15 px-2 py-0.5 text-[10px] font-semibold text-brand">
                  GST INV-01 Compliant
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Original for Recipient · 1-Page A4 Standard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition"
              title="Copy Summary"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold transition shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>WhatsApp Receipt</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-bold hover:opacity-90 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="p-1.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Canvas (A4 Standard 1-Page Layout) */}
        <div className="p-6 sm:p-8 space-y-4 bg-white text-zinc-900 font-sans print-avoid-break">
          {/* Top Decorative Brand Bar */}
          <div
            className="h-1.5 w-full rounded-full"
            style={{
              background: `linear-gradient(90deg, ${brandColor}, #3b82f6, ${brandColor})`,
            }}
          />

          {/* Header: Gym Brand & Official Invoice Metadata */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-zinc-200 pb-4">
            {/* Left: Gym Brand Entity */}
            <div className="flex items-start gap-3.5">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="h-14 w-14 rounded-2xl object-cover border border-zinc-200 shadow-sm shrink-0 bg-white p-1"
                />
              ) : (
                <div
                  className="grid h-14 w-14 place-items-center rounded-2xl text-white font-heading font-black text-xl shadow-sm shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {settings.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-zinc-950 font-heading">
                    {settings.name}
                  </h1>
                  <span className="rounded-md bg-zinc-100 border border-zinc-200 px-2 py-0.5 text-[9px] font-bold text-zinc-700 uppercase">
                    Fitness Centre
                  </span>
                </div>
                <p className="text-xs text-zinc-600 font-medium">
                  {settings.address || settings.location || "Central Fitness Arena, Main Boulevard"}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-500 pt-0.5 font-medium">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3 text-zinc-400" /> {settings.phone}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-zinc-400" /> {settings.email || "billing@gym.com"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className="rounded bg-zinc-100 border border-zinc-200 px-2 py-0.5 font-mono text-[10px] font-bold text-zinc-800">
                    GSTIN: {settings.gstNumber || "29AABCU9603R1ZM"}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium">
                    State: Karnataka (29) · SAC: 999723
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Invoice Type, Number, Date & Status */}
            <div className="text-left sm:text-right space-y-1 shrink-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{inv.status === "Paid" ? "PAID IN FULL · VERIFIED" : inv.status.toUpperCase()}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-950 font-heading">
                TAX INVOICE & RECEIPT
              </h2>
              <div className="space-y-0.5 text-xs text-zinc-600 font-medium">
                <p className="font-mono text-zinc-900 font-bold">
                  Invoice No: <span className="text-zinc-950 font-extrabold">{inv.invoiceNumber}</span>
                </p>
                <p className="flex sm:justify-end items-center gap-1 text-[11px]">
                  <Calendar className="h-3 w-3 text-zinc-400" />
                  <span>Date: {inv.date}</span>
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
                  Original for Recipient
                </p>
              </div>
            </div>
          </div>

          {/* Two-Column Information Cards: Billed To & Payment Protocol */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card 1: Billed To (Member Info) */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-zinc-500" />
                  Billed To (Member)
                </span>
                <span className="font-mono text-[10px] font-bold text-zinc-500">
                  ID: {member?.id || "MEM-" + inv.invoiceNumber.slice(-4)}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-950 font-heading">{inv.member}</h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 text-[11px] text-zinc-600 font-medium">
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Contact:</span>
                    <span>{memberPhone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Email:</span>
                    <span className="truncate block">{memberEmail}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Membership Tier:</span>
                    <span className="font-bold text-zinc-900">{memberPlan}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px]">Floor Access:</span>
                    <span className="text-emerald-700 font-semibold">Active & Valid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Payment Protocol & Cashier Details */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-2">
              <div className="flex items-center justify-between border-b border-zinc-200/80 pb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
                  Payment & Settlement Protocol
                </span>
                <span className="font-mono text-[9px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                  Electronic Settlement
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-zinc-600 font-medium">
                <div>
                  <span className="text-zinc-400 block text-[10px]">Payment Method:</span>
                  <span className="font-bold text-zinc-900 font-mono">
                    {inv.method === "UPI" ? "UPI / Instant QR" : inv.method === "Card" ? "POS Card Terminal" : inv.method === "Cash" ? "Cash at Reception" : "Bank Transfer"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Transaction Ref / UTR:</span>
                  <span className="font-mono text-zinc-800 font-semibold">
                    TXN-{inv.method.toUpperCase()}-{inv.invoiceNumber.replace(/[^0-9]/g, "") || "8849"}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Authorized Desk Officer:</span>
                  <span className="text-zinc-900 font-medium">
                    {inv.collectedBy || currentUser.name} ({currentUser.role === "admin" ? "Director" : "Front Desk"})
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px]">Merchant UPI VPA:</span>
                  <span className="font-mono text-zinc-800 truncate block">
                    {settings.upiId || "gym@upi"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Itemized Services & Tax Breakdown Table */}
          <div className="rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-700 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  <th className="py-2 px-3">Service & Facility Description</th>
                  <th className="py-2 px-3 text-center">SAC Code</th>
                  <th className="py-2 px-3 text-center">Duration</th>
                  <th className="py-2 px-3 text-right">Taxable Base</th>
                  <th className="py-2 px-3 text-right">CGST ({taxPercent / 2}%)</th>
                  <th className="py-2 px-3 text-right">SGST ({taxPercent / 2}%)</th>
                  <th className="py-2 px-3 text-right">Total ({settings.currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                <tr className="hover:bg-zinc-50/50">
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-400 font-semibold">01</td>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-zinc-950 text-xs flex items-center gap-1.5">
                      <span>{inv.category} Subscription · {memberPlan}</span>
                      <Award className="h-3 w-3 text-amber-500 inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-tight">
                      {inv.notes || "Comprehensive strength equipment access, cardio floor, locker bay, smart workout tracking & shower facility."}
                    </p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-zinc-600 text-[11px]">999723</td>
                  <td className="py-2.5 px-3 text-center font-medium text-zinc-700 text-[11px]">
                    {inv.installmentIndex ? `Inst. #${inv.installmentIndex}/${inv.totalInstallments || 1}` : "Active Term"}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-zinc-800">
                    {settings.currencySymbol}{baseAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-zinc-600">
                    {settings.currencySymbol}{cgstAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-zinc-600">
                    {settings.currencySymbol}{sgstAmount.toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-extrabold text-zinc-950 text-xs">
                    {settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Amount in Words & Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1 items-start">
            {/* Left: Amount in Words & Validity Notes (7 cols) */}
            <div className="sm:col-span-7 space-y-2.5">
              <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-3 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Amount in Words:
                </span>
                <p className="text-xs font-bold text-zinc-900 italic font-heading">
                  "{numberToWordsIndian(inv.amount)}"
                </p>
              </div>

              {/* Membership Validity Highlights */}
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 rounded-lg bg-zinc-100 border border-zinc-200 px-2.5 py-1 text-zinc-700 font-medium">
                  <Calendar className="h-3 w-3 text-zinc-500" />
                  <span>Cycle: <strong>{startDate}</strong> to <strong>{endDate}</strong></span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed">
                * Taxes calculated as per Central GST Act 2017 & State GST Act 2017 under SAC 999723 (Health, Fitness & Physical Well-being Services).
              </p>
            </div>

            {/* Right: Detailed Math Calculation Box (5 cols) */}
            <div className="sm:col-span-5 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-600">
                <span className="font-sans font-medium">Taxable Base Subtotal:</span>
                <span className="font-semibold">{settings.currencySymbol}{baseAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span className="font-sans font-medium">Central Tax (CGST {taxPercent / 2}%):</span>
                <span>{settings.currencySymbol}{cgstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span className="font-sans font-medium">State Tax (SGST {taxPercent / 2}%):</span>
                <span>{settings.currencySymbol}{sgstAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-600 border-t border-zinc-200 pt-1">
                <span className="font-sans font-semibold">Total GST ({taxPercent}%):</span>
                <span className="font-semibold">{settings.currencySymbol}{taxAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold text-zinc-950 border-t-2 border-zinc-300 pt-1.5 font-sans">
                <span className="font-heading text-sm">Grand Total Paid:</span>
                <span className="font-mono text-base text-zinc-950 font-black">
                  {settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-emerald-700 font-semibold border-t border-dashed border-zinc-200 pt-1">
                <span>Balance Due:</span>
                <span>{settings.currencySymbol}0.00 (Zero Balance)</span>
              </div>
            </div>
          </div>

          {/* Signatures & Clean Footer */}
          <div className="flex items-end justify-between pt-4 border-t border-zinc-200">
            <div className="text-[9px] text-zinc-400 space-y-0.5">
              <p>Powered by PEAKREP Gym Operating System · High-Performance Enterprise Edition</p>
              <p>Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}, {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
            </div>

            {/* Right: Signature as requested (e.g. Gedde, From Gold's Gym) */}
            <div className="text-right space-y-0.5 min-w-[200px]">
              <p className="font-serif italic text-base text-zinc-900 font-bold tracking-wide">
                {settings.ownerName || "Director"}
              </p>
              <div className="border-t border-zinc-400 pt-1 text-[11px] font-bold text-zinc-900 uppercase tracking-wider">
                {settings.ownerName || "Director"}, From {settings.name}
              </div>
              <p className="text-[10px] text-zinc-500 font-medium">
                (Authorized Signatory)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
