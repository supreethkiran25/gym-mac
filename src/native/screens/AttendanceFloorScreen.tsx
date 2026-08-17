import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useGymStore } from "../gym-store";

export function AttendanceFloorScreen() {
  const {
    members,
    checkInMember,
    checkOutMember,
    setIsCheckInOpen,
    theme,
  } = useGymStore();

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const insideMembers = members.filter((m) => m.isCurrentlyInside);
  const outsideMembers = members.filter((m) => !m.isCurrentlyInside);

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Live Floor Status Header */}
      <View style={[styles.heroCard, { backgroundColor: surface, borderColor: border }]}>
        <View style={styles.rowBetween}>
          <View>
            <Text style={[styles.heroTitle, { color: textPrimary }]}>Floor Occupancy & Heatmap</Text>
            <Text style={[styles.heroSub, { color: textMuted }]}>
              Real-time RFID & front-desk turnstile access
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsCheckInOpen(true)}
            style={[styles.checkInHeroBtn, { backgroundColor: emerald }]}
          >
            <Text style={styles.checkInHeroText}>+ Check-In</Text>
          </TouchableOpacity>
        </View>

        {/* Capacity Dial */}
        <View style={styles.capacityRow}>
          <Text style={[styles.bigCount, { color: emerald }]}>{insideMembers.length}</Text>
          <Text style={[styles.maxCap, { color: textMuted }]}>/ 80 Max Safe Capacity</Text>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              { width: `${Math.min(100, (insideMembers.length / 80) * 100)}%` },
            ]}
          />
        </View>
      </View>

      {/* Currently On Floor List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>
          Currently Inside Workout Floor ({insideMembers.length})
        </Text>

        {insideMembers.length > 0 ? (
          <View style={styles.list}>
            {insideMembers.map((m) => (
              <View
                key={m.id}
                style={[styles.occupantCard, { backgroundColor: surface, borderColor: border }]}
              >
                <View style={styles.avatarRow}>
                  <View style={styles.pulseDot} />
                  <View>
                    <Text style={[styles.name, { color: textPrimary }]}>{m.name}</Text>
                    <Text style={[styles.sub, { color: textMuted }]}>
                      In since {m.checkInTime || "Morning"} • {m.assignedWorkout || "Push-Pull-Legs"}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => checkOutMember(m.id)}
                  style={[styles.outBtn, { borderColor: border, borderWidth: 1 }]}
                >
                  <Text style={[styles.outBtnText, { color: "#ef4444" }]}>Check Out</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={[styles.emptyBox, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.emptyText, { color: textMuted }]}>
              No members currently on the gym floor.
            </Text>
          </View>
        )}
      </View>

      {/* Quick Check-In from Member List */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>
          Recent Members (Tap to Check In)
        </Text>

        <View style={styles.list}>
          {outsideMembers.slice(0, 5).map((m) => (
            <View
              key={m.id}
              style={[styles.quickCard, { backgroundColor: surface, borderColor: border }]}
            >
              <View>
                <Text style={[styles.name, { color: textPrimary }]}>{m.name}</Text>
                <Text style={[styles.sub, { color: textMuted }]}>{m.plan} • {m.phone}</Text>
              </View>

              <TouchableOpacity
                onPress={() => checkInMember(m.id)}
                style={[styles.inBtn, { backgroundColor: emerald }]}
              >
                <Text style={styles.inBtnText}>Check In</Text>
              </TouchableOpacity>
            </View>
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
  heroCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  heroSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkInHeroBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  checkInHeroText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  capacityRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 6,
  },
  bigCount: {
    fontSize: 32,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  maxCap: {
    fontSize: 12,
    fontWeight: "600",
  },
  barTrack: {
    height: 8,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: 8,
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  list: {
    gap: 8,
  },
  occupantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
  },
  sub: {
    fontSize: 11,
    marginTop: 2,
  },
  outBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  outBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyBox: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
  },
  quickCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  inBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  inBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 11,
  },
});
