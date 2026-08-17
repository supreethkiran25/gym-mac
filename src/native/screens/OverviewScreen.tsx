import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useGymStore, Member } from "../gym-store";

export function OverviewScreen({ navigation }: any) {
  const {
    members,
    leads,
    staff,
    theme,
    settings,
    setIsCheckInOpen,
    setIsAddMemberOpen,
    setSelectedMember360,
    openUPIQRModal,
  } = useGymStore();

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const pendingDuesTotal = members.reduce((sum, m) => sum + m.due, 0);
  const expiringSoonCount = members.filter((m) => m.status === "Expiring").length;
  const staffOnFloor = staff.filter((s) => s.status === "On Floor").length;
  const atRiskMembers = members.filter((m) => m.attendanceRate < 70 || m.status === "Expired").slice(0, 3);

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.gymName, { color: textPrimary }]}>{settings.name}</Text>
          <Text style={[styles.gymSub, { color: textMuted }]}>{settings.location} • v6.0 Native</Text>
        </View>
        <TouchableOpacity
          onPress={() => openUPIQRModal(2800, "Walk-in Guest", "Flex Monthly Pass")}
          style={[styles.qrBadge, { backgroundColor: isDark ? "#064e3b" : "#d1fae5" }]}
        >
          <Text style={styles.qrBadgeText}>⚡ UPI Pay</Text>
        </TouchableOpacity>
      </View>

      {/* Floor Capacity Live Status Banner */}
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.rowBetween}>
          <View style={styles.rowCenter}>
            <View style={styles.pulseDot} />
            <Text style={[styles.cardTitle, { color: textPrimary }]}>Live Gym Floor Occupancy</Text>
          </View>
          <Text style={[styles.capacityNumber, { color: emerald }]}>{insideMembers.length} / 80</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${Math.min(100, (insideMembers.length / 80) * 100)}%` }]} />
        </View>
        <Text style={[styles.cardSubtitle, { color: textMuted }]}>
          {insideMembers.length > 0
            ? `${insideMembers.map((m) => m.name).slice(0, 2).join(", ")}${insideMembers.length > 2 ? ` +${insideMembers.length - 2} others` : ""}`
            : "No occupants right now. Ready for evening rush."}
        </Text>
      </View>

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => setIsCheckInOpen(true)}
          style={[styles.primaryBtn, { backgroundColor: emerald }]}
        >
          <Text style={styles.primaryBtnText}>✓ Instant Check-In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsAddMemberOpen(true)}
          style={[styles.secondaryBtn, { backgroundColor: surface, borderColor: border }]}
        >
          <Text style={[styles.secondaryBtnText, { color: textPrimary }]}>+ Add Member</Text>
        </TouchableOpacity>
      </View>

      {/* Key Metric Tiles (2x2 Grid) */}
      <View style={styles.metricsGrid}>
        <View style={[styles.metricTile, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.metricLabel, { color: textMuted }]}>Today's Revenue</Text>
          <Text style={[styles.metricValue, { color: textPrimary }]}>₹68,500</Text>
          <Text style={[styles.metricSub, { color: emerald }]}>+18% vs yesterday</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.metricLabel, { color: textMuted }]}>Pending Dues</Text>
          <Text style={[styles.metricValue, { color: "#f59e0b" }]}>
            {settings.currencySymbol}{pendingDuesTotal.toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.metricSub, { color: textMuted }]}>
            {members.filter((m) => m.due > 0).length} members
          </Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.metricLabel, { color: textMuted }]}>Prospect CRM</Text>
          <Text style={[styles.metricValue, { color: textPrimary }]}>{leads.length} Leads</Text>
          <Text style={[styles.metricSub, { color: "#8b5cf6" }]}>3 trial passes</Text>
        </View>

        <View style={[styles.metricTile, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.metricLabel, { color: textMuted }]}>Staff on Duty</Text>
          <Text style={[styles.metricValue, { color: textPrimary }]}>{staffOnFloor} / {staff.length}</Text>
          <Text style={[styles.metricSub, { color: emerald }]}>Shift active</Text>
        </View>
      </View>

      {/* Member Churn Prevention Radar */}
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.rowBetween}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>🔥 Retention & Churn Radar</Text>
          <Text style={[styles.badgeText, { color: "#f59e0b" }]}>{atRiskMembers.length} Ghost Members</Text>
        </View>
        <Text style={[styles.cardSubtitle, { color: textMuted }]}>
          Members with attendance &lt;70% or expired passes.
        </Text>

        <View style={styles.atRiskList}>
          {atRiskMembers.map((m) => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMember360(m)}
              style={[styles.memberRow, { borderBottomColor: border }]}
            >
              <View>
                <Text style={[styles.memberName, { color: textPrimary }]}>{m.name}</Text>
                <Text style={[styles.memberDetail, { color: textMuted }]}>
                  Attendance: {m.attendanceRate}% • Last visit: {m.lastVisit}
                </Text>
              </View>
              <Text style={[styles.rowActionText, { color: emerald }]}>View 360 →</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gymName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  gymSub: {
    fontSize: 12,
    marginTop: 2,
  },
  qrBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  qrBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10b981",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  capacityNumber: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  cardSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    fontWeight: "700",
    fontSize: 13,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricTile: {
    width: (Dimensions.get("window").width - 42) / 2,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  metricSub: {
    fontSize: 10,
    fontWeight: "600",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  atRiskList: {
    marginTop: 4,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "700",
  },
  memberDetail: {
    fontSize: 11,
    marginTop: 2,
  },
  rowActionText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
