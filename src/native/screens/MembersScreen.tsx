import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { useGymStore, Member } from "../gym-store";

export function MembersScreen() {
  const {
    members,
    theme,
    settings,
    setIsAddMemberOpen,
    setSelectedMember360,
    checkInMember,
    checkOutMember,
  } = useGymStore();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Expiring" | "Pending Dues">("All");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.plan.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === "All") return true;
    if (filterStatus === "Pending Dues") return m.due > 0;
    return m.status === filterStatus;
  });

  const handleWhatsAppNudge = (m: Member) => {
    const text = encodeURIComponent(
      m.due > 0
        ? `Hi ${m.name}, reminder from ${settings.name}: You have a pending balance of ${settings.currencySymbol}${m.due}. Kindly clear at the front desk.`
        : `Hi ${m.name}, your membership at ${settings.name} for ${m.plan} is active. See you on the floor!`
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${text}`);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Search Bar & Add Button */}
      <View style={styles.topBar}>
        <TextInput
          placeholder="Search members by name, phone, plan..."
          placeholderTextColor={textMuted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, { backgroundColor: surface, borderColor: border, color: textPrimary }]}
        />
        <TouchableOpacity
          onPress={() => setIsAddMemberOpen(true)}
          style={[styles.addBtn, { backgroundColor: textPrimary }]}
        >
          <Text style={[styles.addBtnText, { color: bg }]}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["All", "Active", "Expiring", "Pending Dues"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilterStatus(tab)}
            style={[
              styles.filterTab,
              filterStatus === tab
                ? { backgroundColor: textPrimary }
                : { backgroundColor: surface, borderColor: border, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: filterStatus === tab ? bg : textMuted },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Member Cards List */}
      <View style={styles.list}>
        {filteredMembers.map((m) => {
          const isPending = m.due > 0;
          const isInside = m.isCurrentlyInside;

          return (
            <TouchableOpacity
              key={m.id}
              onPress={() => setSelectedMember360(m)}
              style={[styles.memberCard, { backgroundColor: surface, borderColor: border }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.avatarRow}>
                  <View style={[styles.avatar, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
                    <Text style={[styles.avatarText, { color: textPrimary }]}>
                      {m.name.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.memberName, { color: textPrimary }]}>{m.name}</Text>
                    <Text style={[styles.memberPlan, { color: textMuted }]}>{m.plan}</Text>
                  </View>
                </View>

                <View style={styles.statusBadges}>
                  {isInside && (
                    <View style={[styles.badge, { backgroundColor: isDark ? "#064e3b" : "#d1fae5" }]}>
                      <Text style={[styles.badgeLabel, { color: emerald }]}>Inside</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.badge,
                      {
                        backgroundColor: isPending
                          ? isDark ? "#451a03" : "#fef3c7"
                          : isDark ? "#064e3b" : "#d1fae5",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeLabel,
                        { color: isPending ? "#f59e0b" : emerald },
                      ]}
                    >
                      {isPending ? `Due ₹${m.due}` : m.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Attendance and Phone info */}
              <View style={[styles.cardBody, { borderColor: border }]}>
                <Text style={[styles.infoText, { color: textMuted }]}>
                  📞 {m.phone} • Attendance: <Text style={{ color: textPrimary, fontWeight: "700" }}>{m.attendanceRate}%</Text>
                </Text>
                <Text style={[styles.infoText, { color: textMuted }]}>
                  Expires: <Text style={{ color: textPrimary, fontWeight: "600" }}>{m.endDate}</Text> • Visits: {m.totalVisitsThisMonth}/mo
                </Text>
              </View>

              {/* Quick Action Footer */}
              <View style={styles.cardFooter}>
                <TouchableOpacity
                  onPress={() => (isInside ? checkOutMember(m.id) : checkInMember(m.id))}
                  style={[
                    styles.footerBtn,
                    { backgroundColor: isInside ? (isDark ? "#451a03" : "#fee2e2") : (isDark ? "#064e3b" : "#d1fae5") },
                  ]}
                >
                  <Text style={[styles.footerBtnText, { color: isInside ? "#ef4444" : emerald }]}>
                    {isInside ? "Check Out" : "Check In"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleWhatsAppNudge(m)}
                  style={[styles.footerBtn, { backgroundColor: surface, borderColor: border, borderWidth: 1 }]}
                >
                  <Text style={[styles.footerBtnText, { color: textPrimary }]}>💬 WhatsApp</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedMember360(m)}
                  style={[styles.footerBtn, { backgroundColor: surface, borderColor: border, borderWidth: 1 }]}
                >
                  <Text style={[styles.footerBtnText, { color: emerald }]}>Profile 360 →</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
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
    gap: 12,
  },
  topBar: {
    flexDirection: "row",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  addBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnText: {
    fontWeight: "700",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    gap: 6,
    overflow: "hidden",
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
  memberCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "800",
    fontSize: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
  },
  memberPlan: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadges: {
    flexDirection: "row",
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 4,
  },
  infoText: {
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  footerBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
