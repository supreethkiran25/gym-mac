import React from "react";
import { X, Printer, Download, Share2, CheckCircle, ShieldCheck } from "lucide-react";
import { useGymStore } from "../../lib/gym-store";
import { toast } from "sonner";

export function InvoiceModal() {
  const {
    isInvoiceModalOpen,
    setIsInvoiceModalOpen,
    activeInvoicePayment,
    settings,
  } = useGymStore();

  if (!isInvoiceModalOpen || !activeInvoicePayment) return null;

  const inv = activeInvoicePayment;
  const taxPercent = settings.taxRatePercent || 18;
  const baseAmount = Math.round((inv.amount * 100) / (100 + taxPercent));
  const taxAmount = inv.amount - baseAmount;

  const handlePrint = () => {
    window.print();
    toast.success("Printing invoice receipt...");
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Receipt from ${settings.name}\nInvoice #${inv.invoiceNumber}\nMember: ${inv.member}\nAmount: ${settings.currencySymbol}${inv.amount.toLocaleString("en-IN")}\nMethod: ${inv.method}\nDate: ${inv.date}\nStatus: ${inv.status}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    toast.success("Shared invoice via WhatsApp");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald" />
            <span className="text-sm font-semibold">Official Payment Tax Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-muted transition"
            >
              <Share2 className="h-3.5 w-3.5 text-emerald" /> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </button>
            <button
              onClick={() => setIsInvoiceModalOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Canvas */}
        <div className="p-8 space-y-6 text-sm bg-white text-zinc-900">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-zinc-200 pb-6">
            <div className="flex items-start gap-3">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.name}
                  className="h-12 w-12 rounded-xl object-cover border border-zinc-200"
                />
              ) : (
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-900 text-white font-mono font-bold text-lg">
                  PR
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-950">{settings.name}</h1>
                <p className="text-xs text-zinc-600 mt-0.5">{settings.address || settings.location}</p>
                <p className="text-xs text-zinc-600">Phone: {settings.phone} · GSTIN: {settings.gstNumber || "Unregistered"}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1">
                {inv.status === "Paid" ? "PAID IN FULL" : "PARTIAL PAYMENT"}
              </span>
              <p className="text-xs font-mono font-bold mt-2 text-zinc-800">Invoice: {inv.invoiceNumber}</p>
              <p className="text-xs text-zinc-500">Date: {inv.date}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-zinc-500 uppercase tracking-wider">Billed To:</p>
              <p className="text-base font-bold text-zinc-900 mt-1">{inv.member}</p>
              <p className="text-zinc-600 mt-0.5">Category: {inv.category}</p>
              {inv.installmentIndex && (
                <p className="text-emerald-700 font-semibold mt-0.5">Installment #{inv.installmentIndex} of {inv.totalInstallments || 1}</p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold text-zinc-500 uppercase tracking-wider">Payment Details:</p>
              <p className="font-mono text-zinc-900 font-semibold mt-1">Method: {inv.method}</p>
              <p className="text-zinc-500">Authorized & Recorded in PeakRep OS</p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="border border-zinc-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Taxable Value</th>
                  <th className="py-2.5 px-4 text-right">GST ({taxPercent}%)</th>
                  <th className="py-2.5 px-4 text-right">Total ({settings.currencySymbol})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-zinc-900">{inv.category} Fee</p>
                    <p className="text-[11px] text-zinc-500">{inv.notes || "Gym subscription & facility access"}</p>
                  </td>
                  <td className="py-3 px-4 text-right font-mono">{settings.currencySymbol}{baseAmount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 text-right font-mono text-zinc-600">{settings.currencySymbol}{taxAmount.toLocaleString("en-IN")}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-zinc-900 text-sm">
                    {settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Invoice Summary */}
          <div className="flex justify-between items-end pt-4 border-t border-zinc-200 text-xs">
            <div className="space-y-1 text-zinc-500">
              <p className="font-semibold text-zinc-700">Terms & Conditions:</p>
              <p>1. Membership fees are non-transferable and subject to gym rules.</p>
              <p>2. Keep this receipt for tax deduction and verification purposes.</p>
            </div>

            <div className="w-48 space-y-1.5 text-right font-mono">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span>{settings.currencySymbol}{baseAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>GST ({taxPercent}%):</span>
                <span>{settings.currencySymbol}{taxAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-1">
                <span>Total Paid:</span>
                <span>{settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-zinc-400 pt-4 border-t border-zinc-100">
            Powered by PEAKREP Gym Operating System · Generated on {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
