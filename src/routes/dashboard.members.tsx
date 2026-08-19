import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Search,
  Plus,
  Filter,
  MessageCircle,
  CreditCard,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  LayoutGrid,
  List,
  ChevronRight,
  FileSpreadsheet,
  PauseCircle,
  PlayCircle,
  ArrowRightLeft,
  RotateCw,
  Check,
} from "lucide-react";
import { useGymStore, Member, MemberStatus } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/members")({
  component: MembersManagement,
  head: () => ({
    meta: [{ title: "Member Directory & Operations | PEAKREP Gym OS" }],
  }),
});

function MembersManagement() {
  const {
    members,
    settings,
    currentUser,
    setIsAddMemberOpen,
    setIsBulkImportOpen,
    setSelectedMember360,
    setIsMember360Open,
    setPaymentForMember,
    setIsRecordPaymentOpen,
    setSelectedMemberForRenewal,
    setIsRenewModalOpen,
    setSelectedMemberForFreeze,
    setIsFreezeModalOpen,
    setSelectedMemberForTransfer,
    setIsTransferModalOpen,
    checkInMember,
    checkOutMember,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | MemberStatus | "Inside">("All");
  const [viewMode, setViewMode] = useState<"cards" | "density">("cards");

  const isAdmin = currentUser.role === "admin";

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.plan.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === "All") return true;
    if (statusFilter === "Inside") return m.isCurrentlyInside;
    return m.status === statusFilter;
  });

  const handleOpen360 = (m: Member) => {
    setSelectedMember360(m);
    setIsMember360Open(true);
  };

  const handleSendNudge = (e: React.MouseEvent, m: Member) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `Hi ${m.name}, your ${settings.name} gym membership is currently ${m.status.toLowerCase()}. Outstanding balance is ${settings.currencySymbol}${m.due.toLocaleString("en-IN")}. Please pay online or at front desk.`
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
    toast.success(`Opened WhatsApp reminder for ${m.name}`);
  };

  const statusBadgeStyle: Record<MemberStatus, string> = {
    Active: "bg-emerald-500/20 text-emerald border-emerald-500/30",
    Expiring: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
    Expired: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Partial: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
    Frozen: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Member Directory</h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-mono font-semibold text-muted-foreground">
              {members.length} Total
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Complete member records, subscription status, freeze/transfer management, and instant turnstile attendance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-xl border border-border bg-surface p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "cards" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("density")}
              className={`p-1.5 rounded-lg transition ${
                viewMode === "density" ? "bg-foreground text-background" : "text-muted-foreground"
              }`}
              title="High Density View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3.5 py-2 text-xs font-semibold hover:bg-muted transition shadow-xs text-foreground"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Bulk CSV Import</span>
          </button>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand text-brand-foreground px-4 py-2 text-xs font-bold transition shadow-md shadow-brand/20 hover:brightness-110 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & Fast Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search member by name, phone or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface pl-10 pr-4 py-2.5 text-xs outline-none focus:border-foreground transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["All", "Inside", "Active", "Expiring", "Expired", "Partial", "Frozen"] as const).map(
            (st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition border ${
                  statusFilter === st
                    ? "bg-foreground text-background border-foreground shadow-xs"
                    : "border-border bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "Inside" ? `Inside Floor (${members.filter((m) => m.isCurrentlyInside).length})` : st}
              </button>
            )
          )}
        </div>
      </div>

      {/* Member Cards Grid View */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((m) => {
              const expiryDate = new Date(m.expiry);
              const today = new Date();
              const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

              return (
                <div
                  key={m.id}
                  onClick={() => handleOpen360(m)}
                  className="group relative cursor-pointer rounded-3xl border border-border bg-surface p-5 transition hover:border-foreground/40 hover:shadow-md space-y-4"
                >
                  {/* Card Top: Avatar, Name, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-foreground text-background font-bold text-sm">
                        {m.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-emerald transition">
                          {m.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-mono">{m.phone}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeStyle[m.status]}`}
                      >
                        {m.status}
                      </span>
                      {m.isCurrentlyInside && (
                        <span className="text-[10px] text-emerald font-bold flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald animate-pulse" />
                          Inside Gym
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Middle: Plan & Days Remaining */}
                  <div className="rounded-2xl border border-border bg-canvas p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground text-[11px]">Plan Package</span>
                      <p className="font-bold text-foreground mt-0.5 truncate">{m.plan}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-muted-foreground text-[11px]">Validity</span>
                      <p
                        className={`font-mono font-bold mt-0.5 ${
                          diffDays < 0
                            ? "text-rose-500"
                            : diffDays <= 7
                            ? "text-amber-500"
                            : "text-foreground"
                        }`}
                      >
                        {diffDays < 0 ? "Expired" : `${diffDays} days left`}
                      </p>
                    </div>
                  </div>

                  {/* Card Membership Stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground text-[11px]">Attendance Rate</span>
                      <span className="font-mono font-bold">{m.attendanceRate}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-emerald transition-all duration-300"
                        style={{ width: `${m.attendanceRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Card Footer: Action Shortcuts */}
                  <div className="flex items-center justify-between border-t border-border pt-3" onClick={(e) => e.stopPropagation()}>
                    <div>
                      {m.due > 0 ? (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">Due Balance</span>
                          <p className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                            {settings.currencySymbol}{m.due.toLocaleString("en-IN")}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-muted-foreground">Payment</span>
                          <p className="text-xs font-bold text-emerald">All Cleared</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Renew Modal Shortcut */}
                      <button
                        onClick={() => {
                          setSelectedMemberForRenewal(m);
                          setIsRenewModalOpen(true);
                        }}
                        title="Renew / Grace Period"
                        className="p-1.5 rounded-lg border border-border bg-canvas hover:bg-muted text-foreground transition"
                      >
                        <RotateCw className="h-3.5 w-3.5" />
                      </button>

                      {/* Freeze Modal Shortcut */}
                      <button
                        onClick={() => {
                          setSelectedMemberForFreeze(m);
                          setIsFreezeModalOpen(true);
                        }}
                        title={m.status === "Frozen" ? "Unfreeze Member" : "Freeze Member"}
                        className="p-1.5 rounded-lg border border-border bg-canvas hover:bg-muted text-blue-500 transition"
                      >
                        {m.status === "Frozen" ? <PlayCircle className="h-3.5 w-3.5" /> : <PauseCircle className="h-3.5 w-3.5" />}
                      </button>

                      {/* Transfer Modal Shortcut (Admin) */}
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setSelectedMemberForTransfer(m);
                            setIsTransferModalOpen(true);
                          }}
                          title="Transfer Membership"
                          className="p-1.5 rounded-lg border border-border bg-canvas hover:bg-muted text-purple-500 transition"
                        >
                          <ArrowRightLeft className="h-3.5 w-3.5" />
                        </button>
                      )}

                      {/* Record Payment */}
                      <button
                        onClick={() => {
                          setPaymentForMember(m);
                          setIsRecordPaymentOpen(true);
                        }}
                        title="Collect Payment"
                        className="p-1.5 rounded-lg border border-border bg-canvas hover:bg-muted text-foreground transition"
                      >
                        <CreditCard className="h-3.5 w-3.5" />
                      </button>

                      {/* View 360 */}
                      <button
                        onClick={() => handleOpen360(m)}
                        className="inline-flex items-center gap-0.5 text-xs font-bold text-foreground hover:text-emerald transition pl-1"
                      >
                        <span>360</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center rounded-3xl border border-border bg-surface">
              <Users className="h-8 w-8 mx-auto text-muted-foreground/60 mb-2" />
              <p className="text-sm font-bold text-foreground">No members match your criteria</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching a different name or clear active status filters.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* High-Density Row View */
        <div className="rounded-3xl border border-border bg-surface overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="border-b border-border bg-canvas text-left uppercase text-muted-foreground font-semibold tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Plan & Expiry</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Attendance</th>
                  <th className="py-3 px-4 text-right">Due Balance</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => handleOpen360(m)}
                    className="hover:bg-muted/40 cursor-pointer transition"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background font-bold text-xs">
                          {m.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground hover:text-emerald">{m.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{m.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-foreground">{m.plan}</p>
                      <p className="text-[11px] text-muted-foreground">Expires {m.expiry}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadgeStyle[m.status]}`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {m.attendanceRate}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">
                      {m.due > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400">
                          {settings.currencySymbol}{m.due.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-emerald">Cleared</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedMemberForRenewal(m);
                            setIsRenewModalOpen(true);
                          }}
                          className="p-1 rounded-lg border border-border hover:bg-muted text-foreground"
                          title="Renew"
                        >
                          <RotateCw className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMemberForFreeze(m);
                            setIsFreezeModalOpen(true);
                          }}
                          className="p-1 rounded-lg border border-border hover:bg-muted text-blue-500"
                          title="Freeze"
                        >
                          <PauseCircle className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleOpen360(m)}
                          className="rounded-lg px-2 py-1 text-xs font-bold bg-muted hover:bg-border transition"
                        >
                          360
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}