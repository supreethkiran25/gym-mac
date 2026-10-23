import React, { useState } from "react";
import { X, ArrowRightLeft, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";
import { toast } from "sonner";

export function TransferMembershipModal() {
  const {
    isTransferModalOpen,
    setIsTransferModalOpen,
    selectedMemberForTransfer,
    setSelectedMemberForTransfer,
    transferMembership,
  } = useGymStore();

  const [toName, setToName] = useState("");
  const [toPhone, setToPhone] = useState("");
  const [toEmail, setToEmail] = useState("");

  if (!isTransferModalOpen || !selectedMemberForTransfer) return null;

  const handleClose = () => {
    setIsTransferModalOpen(false);
    setSelectedMemberForTransfer(null);
    setToName("");
    setToPhone("");
    setToEmail("");
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toName.trim() || !toPhone.trim()) {
      toast.error("Please enter the recipient's name and phone number");
      return;
    }

    transferMembership(
      selectedMemberForTransfer.id,
      toName.trim(),
      toPhone.trim(),
      toEmail.trim() || `${toName.toLowerCase().replace(/\s+/g, ".")}@gmail.com`,
    );
    toast.success(`Successfully transferred membership to ${toName}!`);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand border border-brand/20">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-soft text-brand border border-brand/20">
                  Admin Authorized
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground mt-0.5">Transfer Membership</h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Plan Summary */}
        <div className="rounded-2xl border border-border bg-canvas p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Transferring From:</span>
            <span className="font-bold text-foreground">{selectedMemberForTransfer.name}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Membership Plan:</span>
            <span className="font-bold text-foreground">{selectedMemberForTransfer.plan}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Remaining Validity:</span>
            <span className="font-bold text-emerald">Until {selectedMemberForTransfer.expiry}</span>
          </div>
        </div>

        {/* Transfer Form */}
        <form onSubmit={handleTransfer} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Recipient Member Name *</label>
            <input
              type="text"
              required
              value={toName}
              onChange={(e) => setToName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs focus:border-foreground focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Recipient Phone Number *</label>
            <input
              type="tel"
              required
              value={toPhone}
              onChange={(e) => setToPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs focus:border-foreground focus:outline-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">Recipient Email (Optional)</label>
            <input
              type="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="recipient@gmail.com"
              className="w-full rounded-xl border border-border bg-canvas px-3.5 py-2.5 text-xs focus:border-foreground focus:outline-hidden"
            />
          </div>

          <div className="p-3 rounded-2xl bg-muted/40 border border-border text-muted-foreground text-[11px] leading-tight">
            Original member's account will be marked as Transferred/Expired, and a new active
            account with the same validity date ({selectedMemberForTransfer.expiry}) will be created
            for the recipient.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-xs transition shadow-md"
            >
              Confirm Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
