import React, { useState, useEffect } from "react";
import { X, UserCheck, Calendar, Phone, Mail, CreditCard, Trash2 } from "lucide-react";
import { useGymStore, MemberStatus } from "../lib/gym-store";
import { toast } from "sonner";

export function EditMemberModal() {
  const { editingMember, setEditingMember, updateMember, deleteMember, settings } = useGymStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("Monthly");
  const [expiry, setExpiry] = useState("");
  const [status, setStatus] = useState<MemberStatus>("Active");
  const [due, setDue] = useState("0");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (editingMember) {
      setName(editingMember.name);
      setPhone(editingMember.phone);
      setEmail(editingMember.email || "");
      setPlan(editingMember.plan);
      setExpiry(editingMember.expiry);
      setStatus(editingMember.status);
      setDue(editingMember.due.toString());
      setNotes(editingMember.notes || "");
    }
  }, [editingMember]);

  if (!editingMember) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const dueAmount = parseFloat(due) || 0;

    updateMember(editingMember.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      plan,
      expiry,
      status,
      due: dueAmount,
      notes: notes.trim(),
    });

    toast.success(`Updated ${name}'s membership details`);
    setEditingMember(null);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to remove ${editingMember.name}?`)) {
      deleteMember(editingMember.id);
      toast.info(`Member ${editingMember.name} deleted`);
      setEditingMember(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-soft text-accent-foreground">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Edit Member Profile</h2>
              <p className="text-xs text-muted-foreground">{editingMember.name}</p>
            </div>
          </div>
          <button
            onClick={() => setEditingMember(null)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas pl-9 pr-3 py-2 outline-none focus:border-emerald"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas pl-9 pr-3 py-2 outline-none focus:border-emerald"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Plan
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
              >
                {settings.membershipPlans.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Expiry Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas pl-9 pr-3 py-2 outline-none focus:border-emerald"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MemberStatus)}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
              >
                <option value="Active">Active</option>
                <option value="Expiring">Expiring</option>
                <option value="Expired">Expired</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Pending Due ({settings.currencySymbol})
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="number"
                  min="0"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  className="w-full rounded-md border border-border bg-canvas pl-9 pr-3 py-2 outline-none focus:border-emerald font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-md border border-border bg-canvas px-3 py-2 outline-none focus:border-emerald"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between border-t border-border">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Member
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="rounded-md border border-border bg-canvas px-4 py-2 text-sm font-medium hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
