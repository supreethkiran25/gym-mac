import React from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Activity,
  CreditCard,
  Plus,
  UserCheck,
  Search,
  MoreHorizontal,
} from "lucide-react";
import { useGymStore } from "../../lib/gym-store";

export function MobileBottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const {
    setIsAddMemberOpen,
    setIsRecordPaymentOpen,
    setIsCheckInOpen,
    setIsCommandPaletteOpen,
    members,
  } = useGymStore();

  const insideCount = members.filter((m) => m.isCurrentlyInside).length;

  const items = [
    { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { to: "/dashboard/members", label: "Members", icon: Users },
    { to: "/dashboard/attendance", label: "Live Floor", icon: Activity, badge: insideCount },
    { to: "/dashboard/payments", label: "Finances", icon: CreditCard },
  ];

  return (
    <>
      {/* Mobile Floating Quick Action Dock */}
      <div className="fixed bottom-16 right-4 z-40 flex flex-col gap-2 md:hidden">
        <button
          onClick={() => setIsCheckInOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-white shadow-xl hover:scale-105 active:scale-95 transition"
          title="Instant Check In"
        >
          <UserCheck className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Sticky Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border bg-surface/95 px-2 backdrop-blur md:hidden">
        {items.map((item) => {
          const isActive =
            item.to === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition ${
                isActive
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative">
                <item.icon className="h-5 w-5" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 grid h-4 min-w-4 place-items-center rounded-full bg-emerald text-[9px] font-bold text-white px-1">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}

        {/* Global Command / More trigger */}
        <button
          onClick={() => setIsCommandPaletteOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium text-muted-foreground hover:text-foreground"
        >
          <Search className="h-5 w-5" />
          <span className="mt-1">Actions</span>
        </button>
      </nav>
    </>
  );
}
