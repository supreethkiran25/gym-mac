import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Radio,
  Send,
  MessageCircle,
  MessageSquare,
  Smartphone,
  Bell,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  X,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  Trash2,
  Bookmark,
  Share2,
} from "lucide-react";
import { useGymStore, BroadcastMessage, Member } from "../lib/gym-store";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/reminders")({
  component: BroadcastCenterPage,
});

function BroadcastCenterPage() {
  const {
    members,
    broadcasts,
    settings,
    sendBroadcastMessage,
    saveDraftBroadcast,
    deleteBroadcastMessage,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"history" | "drafts" | "templates">("history");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Composer Form State
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgCategory, setMsgCategory] = useState<BroadcastMessage["category"]>("Announcement");
  const [recipientsType, setRecipientsType] = useState<BroadcastMessage["recipientsType"]>("all");
  const [targetPlanName, setTargetPlanName] = useState(settings.membershipPlans[0]?.name || "");
  const [targetMemberId, setTargetMemberId] = useState(members[0]?.id || "");
  const [channels, setChannels] = useState<("WhatsApp" | "SMS" | "In-App" | "Push")[]>(["WhatsApp", "In-App"]);

  // Calculate matching recipient count
  const getRecipientMembers = (): Member[] => {
    switch (recipientsType) {
      case "all":
        return members;
      case "active":
        return members.filter((m) => m.status === "Active");
      case "expiring":
        return members.filter((m) => m.status === "Expiring");
      case "expired":
        return members.filter((m) => m.status === "Expired");
      case "partial_due":
        return members.filter((m) => m.due > 0);
      case "plan":
        return members.filter((m) => m.plan === targetPlanName);
      case "individual":
        return members.filter((m) => m.id === targetMemberId);
      default:
        return members;
    }
  };

  const targetedRecipients = getRecipientMembers();
  const recipientCount = targetedRecipients.length;

  const toggleChannel = (ch: "WhatsApp" | "SMS" | "In-App" | "Push") => {
    if (channels.includes(ch)) {
      if (channels.length > 1) {
        setChannels(channels.filter((c) => c !== ch));
      } else {
        toast.warning("At least one delivery channel is required.");
      }
    } else {
      setChannels([...channels, ch]);
    }
  };

  const insertTag = (tag: string) => {
    setMsgBody((prev) => prev + ` {${tag}} `);
  };

  const handleOpenComposerWithTemplate = (
    title: string,
    body: string,
    category: BroadcastMessage["category"],
    recipientGroup: BroadcastMessage["recipientsType"] = "all"
  ) => {
    setMsgTitle(title);
    setMsgBody(body);
    setMsgCategory(category);
    setRecipientsType(recipientGroup);
    setIsComposerOpen(true);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle.trim() || !msgBody.trim()) {
      toast.error("Please enter a subject and message body.");
      return;
    }

    sendBroadcastMessage({
      title: msgTitle.trim(),
      body: msgBody.trim(),
      category: msgCategory,
      recipientsType,
      targetPlanName: recipientsType === "plan" ? targetPlanName : undefined,
      targetMemberId: recipientsType === "individual" ? targetMemberId : undefined,
      recipientCount,
      channels,
    });

    toast.success(`Dispatched broadcast "${msgTitle}" to ${recipientCount} member(s)!`);
    setIsComposerOpen(false);

    // If WhatsApp channel is selected and there's 1 individual or small group, provide easy quick dispatch
    if (channels.includes("WhatsApp") && targetedRecipients.length > 0) {
      const first = targetedRecipients[0];
      const renderedText = msgBody
        .replace(/\{name\}/g, first.name)
        .replace(/\{gym\}/g, settings.name)
        .replace(/\{plan\}/g, first.plan)
        .replace(/\{due\}/g, `${settings.currencySymbol}${first.due}`)
        .replace(/\{expiry\}/g, first.expiry);

      const cleanPhone = first.phone.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(renderedText)}`, "_blank");
    }
  };

  const handleSaveDraft = () => {
    if (!msgTitle.trim()) {
      toast.error("Please enter a subject title for the draft.");
      return;
    }

    saveDraftBroadcast({
      title: msgTitle.trim(),
      body: msgBody.trim(),
      category: msgCategory,
      recipientsType,
      targetPlanName: recipientsType === "plan" ? targetPlanName : undefined,
      targetMemberId: recipientsType === "individual" ? targetMemberId : undefined,
      recipientCount,
      channels,
    });

    toast.info("Broadcast draft saved successfully.");
    setIsComposerOpen(false);
  };

  const filteredBroadcasts = broadcasts.filter((b) => {
    if (activeTab === "history" && b.status !== "Sent") return false;
    if (activeTab === "drafts" && b.status !== "Draft") return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.body.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Broadcast Messaging Center</h1>
            <span className="rounded-full bg-emerald-soft text-accent-foreground px-2.5 py-0.5 text-xs font-semibold">
              Multi-Channel Dispatch
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            Send studio announcements, dues alerts, schedule changes, and transformation challenges across WhatsApp, SMS, In-App, and Push.
          </p>
        </div>

        <button
          onClick={() => {
            setMsgTitle("");
            setMsgBody("");
            setIsComposerOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Compose Broadcast</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-surface p-1 max-w-fit">
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "history"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Radio className="h-3.5 w-3.5" />
          <span>Broadcast Log ({broadcasts.filter((b) => b.status === "Sent").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("drafts")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "drafts"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>Drafts ({broadcasts.filter((b) => b.status === "Draft").length})</span>
        </button>

        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
            activeTab === "templates"
              ? "bg-foreground text-background shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Quick Broadcast Templates</span>
        </button>
      </div>

      {/* Tab Content: Quick Templates */}
      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 text-xs">
                Renewal Notice
              </span>
              <span className="text-[11px] text-muted-foreground">Target: Expiring Members</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Membership Expiry in 3 Days</h4>
            <p className="text-xs text-muted-foreground bg-canvas p-3 rounded-xl border border-border">
              "Hi &#123;name&#125;, your &#123;gym&#125; membership (&#123;plan&#125;) expires on &#123;expiry&#125;. Please renew your plan at the front desk or via UPI to keep your access uninterrupted!"
            </p>
            <button
              onClick={() =>
                handleOpenComposerWithTemplate(
                  "Membership Renewal Reminder",
                  "Hi {name}, your {gym} membership ({plan}) expires on {expiry}. Please renew your plan at the front desk or via UPI to keep your access uninterrupted!",
                  "Renewal Notice",
                  "expiring"
                )
              }
              className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
            >
              Use This Template
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold px-2 py-0.5 text-xs">
                Gym Closure
              </span>
              <span className="text-[11px] text-muted-foreground">Target: All Members</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Holiday / Sunday Facility Notice</h4>
            <p className="text-xs text-muted-foreground bg-canvas p-3 rounded-xl border border-border">
              "Dear &#123;gym&#125; Family, please note that our gym will remain closed this Sunday for scheduled deep sanitization and floor maintenance. We reopen Monday at 5:30 AM."
            </p>
            <button
              onClick={() =>
                handleOpenComposerWithTemplate(
                  "Gym Maintenance Closure Notice",
                  "Dear {gym} Family, please note that our gym will remain closed this Sunday for scheduled deep sanitization and floor maintenance. We reopen Monday at 5:30 AM.",
                  "Gym Closure",
                  "all"
                )
              }
              className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
            >
              Use This Template
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 text-xs">
                Class Alert
              </span>
              <span className="text-[11px] text-muted-foreground">Target: Active Members</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">Early Morning 6 AM Session</h4>
            <p className="text-xs text-muted-foreground bg-canvas p-3 rounded-xl border border-border">
              "Rise & grind! Tomorrow's HIIT & Core conditioning batch begins promptly at 6:00 AM. Bring your hydration and energy. See you on the floor!"
            </p>
            <button
              onClick={() =>
                handleOpenComposerWithTemplate(
                  "Tomorrow's 6:00 AM HIIT Conditioning Session",
                  "Rise & grind! Tomorrow's HIIT & Core conditioning batch begins promptly at 6:00 AM. Bring your hydration and energy. See you on the floor!",
                  "Class Update",
                  "active"
                )
              }
              className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
            >
              Use This Template
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold px-2 py-0.5 text-xs">
                Challenge / Promo
              </span>
              <span className="text-[11px] text-muted-foreground">Target: All Members</span>
            </div>
            <h4 className="text-sm font-bold text-foreground">60-Day Transformation Challenge</h4>
            <p className="text-xs text-muted-foreground bg-canvas p-3 rounded-xl border border-border">
              "Registrations are officially open for the &#123;gym&#125; 60-Day Transformation Challenge! Win cash prizes, free annual memberships, and personalized trainer guidance. Sign up at the reception."
            </p>
            <button
              onClick={() =>
                handleOpenComposerWithTemplate(
                  "60-Day Transformation Challenge Registrations Open!",
                  "Registrations are officially open for the {gym} 60-Day Transformation Challenge! Win cash prizes, free annual memberships, and personalized trainer guidance. Sign up at the reception.",
                  "Promotion",
                  "all"
                )
              }
              className="w-full py-2 rounded-xl bg-foreground text-background text-xs font-semibold hover:opacity-90 transition"
            >
              Use This Template
            </button>
          </div>
        </div>
      )}

      {/* Tab Content: Log & Drafts */}
      {(activeTab === "history" || activeTab === "drafts") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search broadcast title, body..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-canvas text-xs outline-none focus:border-emerald"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              {filteredBroadcasts.length} Messages
            </span>
          </div>

          <div className="space-y-3">
            {filteredBroadcasts.map((b) => (
              <div
                key={b.id}
                className="rounded-2xl border border-border bg-surface p-5 space-y-3 shadow-2xs hover:border-foreground/40 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-bold text-foreground">
                      {b.category}
                    </span>
                    <h3 className="text-sm font-bold text-foreground">{b.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-emerald-soft text-accent-foreground font-mono font-bold px-2 py-0.5 text-[10px]">
                      {b.recipientCount} Recipients
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {b.sentAt || b.createdAt}
                    </span>
                    <button
                      onClick={() => deleteBroadcastMessage(b.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10"
                      title="Delete Broadcast"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground bg-canvas p-3 rounded-xl border border-border whitespace-pre-wrap">
                  {b.body}
                </p>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <span>Channels:</span>
                    {b.channels.map((ch) => (
                      <span key={ch} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-foreground font-semibold">
                        {ch}
                      </span>
                    ))}
                  </div>

                  <span className="text-[11px] text-muted-foreground font-mono">
                    Audience: {b.recipientsType.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}

            {filteredBroadcasts.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center text-muted-foreground text-xs">
                No {activeTab === "history" ? "sent broadcasts" : "draft broadcasts"} found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Broadcast Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background">
                  <Radio className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Compose Broadcast Announcement</h3>
                  <p className="text-[11px] text-muted-foreground">Directly reach targeted gym audiences</p>
                </div>
              </div>
              <button onClick={() => setIsComposerOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Message Subject / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Schedule Update or Renewal Reminder"
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  />
                </div>

                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Message Category</label>
                  <select
                    value={msgCategory}
                    onChange={(e) => setMsgCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="Announcement">General Announcement</option>
                    <option value="Renewal Notice">Membership Renewal Notice</option>
                    <option value="Gym Closure">Gym Closure / Holiday Notice</option>
                    <option value="Class Update">Class & Schedule Update</option>
                    <option value="Promotion">Promotion & Transformation Challenge</option>
                    <option value="Urgent Alert">Urgent Operational Alert</option>
                  </select>
                </div>
              </div>

              {/* Target Audience Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-muted-foreground font-semibold mb-1">Target Audience</label>
                  <select
                    value={recipientsType}
                    onChange={(e) => setRecipientsType(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                  >
                    <option value="all">All Members ({members.length})</option>
                    <option value="active">Active Members Only ({members.filter((m) => m.status === "Active").length})</option>
                    <option value="expiring">Expiring Soon Members ({members.filter((m) => m.status === "Expiring").length})</option>
                    <option value="expired">Expired Members ({members.filter((m) => m.status === "Expired").length})</option>
                    <option value="partial_due">Members with Pending Dues ({members.filter((m) => m.due > 0).length})</option>
                    <option value="plan">Specific Membership Plan</option>
                    <option value="individual">Single Individual Member</option>
                  </select>
                </div>

                {recipientsType === "plan" && (
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Select Membership Plan</label>
                    <select
                      value={targetPlanName}
                      onChange={(e) => setTargetPlanName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                    >
                      {settings.membershipPlans.map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name} ({members.filter((m) => m.plan === p.name).length} members)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {recipientsType === "individual" && (
                  <div>
                    <label className="block text-muted-foreground font-semibold mb-1">Select Member</label>
                    <select
                      value={targetMemberId}
                      onChange={(e) => setTargetMemberId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-canvas px-3 py-2 text-xs outline-none focus:border-emerald"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Delivery Channels */}
              <div>
                <label className="block text-muted-foreground font-semibold mb-1.5">Delivery Channels</label>
                <div className="flex flex-wrap gap-2">
                  {(["WhatsApp", "SMS", "In-App", "Push"] as const).map((ch) => {
                    const isSelected = channels.includes(ch);
                    return (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => toggleChannel(ch)}
                        className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? "border-emerald bg-emerald-soft text-accent-foreground"
                            : "border-border bg-canvas text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {ch === "WhatsApp" && <MessageCircle className="h-3.5 w-3.5" />}
                        {ch === "SMS" && <Smartphone className="h-3.5 w-3.5" />}
                        {ch === "In-App" && <Bell className="h-3.5 w-3.5" />}
                        {ch === "Push" && <Radio className="h-3.5 w-3.5" />}
                        <span>{ch}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Content & Template Tags */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-muted-foreground font-semibold">Message Body *</label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <span className="text-muted-foreground">Insert:</span>
                    {["name", "gym", "plan", "due", "expiry"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground hover:bg-foreground hover:text-background transition"
                      >
                        &#123;{tag}&#125;
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  required
                  rows={4}
                  placeholder="Type your broadcast message..."
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  className="w-full rounded-xl border border-border bg-canvas p-3 text-xs outline-none focus:border-emerald"
                />
              </div>

              {/* Recipient Count Summary */}
              <div className="rounded-xl border border-border bg-canvas p-3 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated Audience Reach:</span>
                <span className="font-bold font-mono text-emerald">{recipientCount} Member(s)</span>
              </div>

              {/* Buttons */}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                >
                  Save as Draft
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposerOpen(false)}
                    className="px-4 py-2 rounded-xl border border-border font-medium hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-foreground text-background font-semibold hover:opacity-90 shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Send Broadcast Now</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}