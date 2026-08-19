import React, { useState } from "react";
import { X, PauseCircle, PlayCircle, ShieldAlert } from "lucide-react";
import { useGymStore, Member } from "../../lib/gym-store";
import { toast } from "sonner";

export function FreezeMemberModal() {
  const {
    isFreezeModalOpen,
    setIsFreezeModalOpen,
    selectedMemberForFreeze,
    setSelectedMemberForFreeze,
    freezeMember,
    unfreezeMember,
  } = useGymStore();

  const [freezeDays, setFreezeDays] = useState(15);
  const [freezeReason, setFreezeReason] = useState("Medical recovery / Injury");

  if (!isFreezeModalOpen || !selectedMemberForFreeze) return null;

  const isAlreadyFrozen = selectedMemberForFreeze.status === "Frozen";

  const handleClose = () => {
    setIsFreezeModalOpen(false);
    setSelectedMemberForFreeze(null);
  };

  const handleFreeze = (e: React.FormEvent) => {
    e.preventDefault();
    freezeMember(selectedMemberForFreeze.id, freezeDays, freezeReason);
    toast.success(`Froze membership for ${selectedMemberForFreeze.name} for ${freezeDays} days.`);
    handleClose();
  };

  const handleUnfreeze = () => {
    unfreezeMember(selectedMemberForFreeze.id);
    toast.success(`Resumed / unfroze membership for ${selectedMemberForFreeze.name}!`);
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
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {isAlreadyFrozen ? <PlayCircle className="h-5 w-5" /> : <PauseCircle className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                {isAlreadyFrozen ? "Resume / Unfreeze Member" : "Freeze / Pause Membership"}
              </h3>
              <p className="text-xs text-muted-foreground">{selectedMemberForFreeze.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isAlreadyFrozen ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300 space-y-1">
              <p className="font-bold">Currently Frozen</p>
              <p className="text-[11px]">
                Frozen until: <strong>{selectedMemberForFreeze.freezeUntil}</strong>
              </p>
              <p className="text-[11px]">Reason: {selectedMemberForFreeze.freezeReason}</p>
            </div>
            <p className="text-muted-foreground">
              Unfreezing will immediately reactivate the member's gym floor turnstile privileges.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUnfreeze}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
              >
                Resume Membership Now
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFreeze} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Freeze Duration (Days)</label>
              <div className="grid grid-cols-4 gap-2">
                {[7, 15, 30, 60].map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setFreezeDays(days)}
                    className={`py-2 rounded-xl border text-xs font-bold transition ${
                      freezeDays === days
                        ? "bg-foreground text-background border-foreground"
                        : "bg-canvas border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {days} Days
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Reason for Pause</label>
              <select
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs focus:border-foreground focus:outline-hidden"
              >
                <option value="Medical recovery / Injury">Medical recovery / Injury</option>
                <option value="Business travel / Relocation">Business travel / Relocation</option>
                <option value="Exam / Academic break">Exam / Academic break</option>
                <option value="Personal leave / Vacation">Personal leave / Vacation</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 rounded-xl border border-border bg-canvas text-muted-foreground hover:text-foreground font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-md"
              >
                Freeze for {freezeDays} Days
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
