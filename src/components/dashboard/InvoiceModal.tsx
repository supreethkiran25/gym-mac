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
  const taxAmount = Math.round(inv.amount * 0.18);
  const baseAmount = inv.amount - taxAmount;

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
              <Share2 className="h-3.5 w-3.5" /> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition"
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
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded bg-zinc-900 text-white font-serif font-bold text-base">
                  R
                </div>
                <h1 className="text-xl font-bold tracking-tight">{settings.name}</h1>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{settings.location}</p>
              <p className="text-xs text-zinc-500">Phone: {settings.phone} · GSTIN: {settings.gstNumber}</p>
            </div>
            <div className="text-right">
              <span className="inline-block rounded bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1">
                {inv.status === "Paid" ? "PAID IN FULL" : "PARTIAL PAYMENT"}
              </span>
              <p className="text-xs font-mono font-bold mt-2 text-zinc-700">Invoice: {inv.invoiceNumber}</p>
              <p className="text-xs text-zinc-500">Date: {inv.date}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-semibold text-zinc-500 uppercase tracking-wider">Billed To:</p>
              <p className="text-base font-bold text-zinc-900 mt-1">{inv.member}</p>
              <p className="text-zinc-600 mt-0.5">Category: {inv.category}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-zinc-500 uppercase tracking-wider">Payment Details:</p>
              <p className="font-mono text-zinc-900 font-semibold mt-1">Method: {inv.method}</p>
              <p className="text-zinc-500">Txn: Authenticated & Cleared</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs">
            <thead>
              <tr className="border-y border-zinc-200 bg-zinc-50 text-left text-zinc-600">
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">Taxable Value</th>
                <th className="py-2.5 px-3 text-right">GST (18%)</th>
                <th className="py-2.5 px-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              <tr>
                <td className="py-3 px-3 font-semibold text-zinc-900">
                  {inv.notes || `${inv.category} Access & Training Package`}
                </td>
                <td className="py-3 px-3 text-zinc-600">{inv.category}</td>
                <td className="py-3 px-3 text-right font-mono">
                  {settings.currencySymbol}{baseAmount.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {settings.currencySymbol}{taxAmount.toLocaleString("en-IN")}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                  {settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Grand Totals */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal:</span>
                <span className="font-mono">{settings.currencySymbol}{baseAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>CGST (9%) + SGST (9%):</span>
                <span className="font-mono">{settings.currencySymbol}{taxAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-2 text-sm font-bold text-zinc-900">
                <span>Total Paid:</span>
                <span className="font-mono">{settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-zinc-200 pt-4 text-[11px] text-zinc-500 text-center">
            <p>Thank you for choosing {settings.name}! Membership is non-transferable without front desk approval.</p>
            <p className="mt-0.5">This is a computer generated invoice and does not require a physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
