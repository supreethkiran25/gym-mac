import React from "react";
import { X, QrCode, CheckCircle2, ShieldCheck, Share2, Copy } from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { toast } from "sonner";

export function DynamicUPIQRModal() {
  const { isUPIQRModalOpen, setIsUPIQRModalOpen, upiQRPaymentDetails, recordPayment, settings, members } =
    useGymStore();

  if (!isUPIQRModalOpen || !upiQRPaymentDetails) return null;

  const { amount, memberName, note } = upiQRPaymentDetails;
  const upiId = settings.upiId || "ironhousegym@icici";
  const upiString = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(settings.name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;

  // Generate real QR code image URL via QR API for crisp scanning
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiString)}&color=0f172a&bgcolor=ffffff&margin=1`;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(upiId);
    toast.success(`Copied UPI ID: ${upiId}`);
  };

  const handleMarkAsPaid = () => {
    const matchedMember = members.find(
      (m) => m.name.toLowerCase() === memberName.toLowerCase(),
    );
    recordPayment({
      memberId: matchedMember?.id || "walk-in",
      member: memberName,
      amount,
      date: new Date().toISOString().split("T")[0],
      method: "UPI",
      category: "Membership",
      notes: `Settled via UPI QR (${note})`,
    });
    toast.success(
      `Payment of ${settings.currencySymbol}${amount.toLocaleString("en-IN")} settled via UPI!`,
    );
    setIsUPIQRModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5 bg-muted/40">
          <div className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-emerald" />
            <span className="text-xs font-semibold text-foreground">Scan & Pay via UPI</span>
          </div>
          <button
            onClick={() => setIsUPIQRModalOpen(false)}
            className="p-1 rounded-md text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground">Paying To</p>
            <h3 className="text-base font-bold text-foreground mt-0.5">{settings.name}</h3>
            <p className="text-3xl font-bold font-mono text-emerald mt-2">
              {settings.currencySymbol}
              {amount.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {memberName} · {note}
            </p>
          </div>

          {/* QR Code Frame */}
          <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-2xl border border-border bg-white p-3 shadow-inner">
            <img src={qrApiUrl} alt="UPI QR Code" className="h-full w-full object-contain" />
          </div>

          {/* Supported Apps pill */}
          <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground">
            <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span>
          </div>

          {/* UPI ID Copy */}
          <button
            onClick={handleCopyUPI}
            className="w-full flex items-center justify-between rounded-xl border border-border bg-canvas px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition"
          >
            <span>{upiId}</span>
            <Copy className="h-3.5 w-3.5" />
          </button>

          {/* 1-Click Instant Settle Button */}
          <button
            onClick={handleMarkAsPaid}
            className="w-full py-2.5 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald" />
            <span>Confirm Payment Received</span>
          </button>
        </div>
      </div>
    </div>
  );
}
