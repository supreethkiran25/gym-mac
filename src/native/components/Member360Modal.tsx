import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { useGymStore } from "../gym-store";

export function Member360Modal() {
  const {
    selectedMember360,
    setSelectedMember360,
    checkInMember,
    checkOutMember,
    deleteMember,
    openUPIQRModal,
    settleMemberDue,
    settings,
    theme,
  } = useGymStore();

  if (!selectedMember360) return null;

  const m = selectedMember360;
  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const isPending = m.due > 0;
  const isInside = m.isCurrentlyInside;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `Hi ${m.name}, greetings from ${settings.name}! Let us know if you need help with your workout schedule or diet plan.`,
    );
    const cleanPhone = m.phone.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${text}`);
  };

  const handleSettleDues = () => {
    openUPIQRModal(m.due, m.name, `Clear Dues for ${m.plan}`);
    settleMemberDue(m.id, m.due, "UPI");
    setSelectedMember360(null);
  };

  const handleDelete = () => {
    Alert.alert("Delete Member", `Are you sure you want to remove ${m.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteMember(m.id);
          setSelectedMember360(null);
        },
      },
    ]);
  };

  return (
    <Modal visible={!!selectedMember360} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatarRow}>
                <View style={[styles.avatar, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
                  <Text style={[styles.avatarText, { color: textPrimary }]}>
                    {m.name.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.title, { color: textPrimary }]}>{m.name}</Text>
                  <Text style={[styles.plan, { color: emerald }]}>{m.plan}</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setSelectedMember360(null)}>
                <Text style={{ color: textMuted, fontSize: 16, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Attendance & Streak Vitals */}
            <View style={[styles.vitalsBox, { backgroundColor: bg, borderColor: border }]}>
              <View style={styles.vitalItem}>
                <Text style={[styles.vitalLabel, { color: textMuted }]}>Attendance Rate</Text>
                <Text style={[styles.vitalValue, { color: textPrimary }]}>{m.attendanceRate}%</Text>
              </View>
              <View style={styles.vitalItem}>
                <Text style={[styles.vitalLabel, { color: textMuted }]}>Monthly Visits</Text>
                <Text style={[styles.vitalValue, { color: textPrimary }]}>
                  {m.totalVisitsThisMonth}
                </Text>
              </View>
              <View style={styles.vitalItem}>
                <Text style={[styles.vitalLabel, { color: textMuted }]}>Active Streak</Text>
                <Text style={[styles.vitalValue, { color: emerald }]}>🔥 {m.streakDays}d</Text>
              </View>
            </View>

            {/* Details List */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: textPrimary }]}>Membership Details</Text>
              <View style={[styles.infoGrid, { backgroundColor: bg, borderColor: border }]}>
                <Text style={[styles.infoRow, { color: textMuted }]}>
                  Phone: <Text style={{ color: textPrimary, fontWeight: "600" }}>{m.phone}</Text>
                </Text>
                <Text style={[styles.infoRow, { color: textMuted }]}>
                  Email: <Text style={{ color: textPrimary }}>{m.email}</Text>
                </Text>
                <Text style={[styles.infoRow, { color: textMuted }]}>
                  Plan Validity:{" "}
                  <Text style={{ color: textPrimary }}>
                    {m.startDate} → {m.endDate}
                  </Text>
                </Text>
                <Text style={[styles.infoRow, { color: textMuted }]}>
                  Outstanding Dues:{" "}
                  <Text style={{ color: isPending ? "#f59e0b" : emerald, fontWeight: "700" }}>
                    ₹{m.due}
                  </Text>
                </Text>
                {m.assignedWorkout && (
                  <Text style={[styles.infoRow, { color: textMuted }]}>
                    Workout Split: <Text style={{ color: textPrimary }}>{m.assignedWorkout}</Text>
                  </Text>
                )}
                {m.assignedDiet && (
                  <Text style={[styles.infoRow, { color: textMuted }]}>
                    Diet Plan: <Text style={{ color: textPrimary }}>{m.assignedDiet}</Text>
                  </Text>
                )}
                {m.notes && (
                  <Text style={[styles.infoRow, { color: textMuted }]}>
                    Notes: <Text style={{ color: textPrimary }}>{m.notes}</Text>
                  </Text>
                )}
              </View>
            </View>

            {/* Actions Bar */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => (isInside ? checkOutMember(m.id) : checkInMember(m.id))}
                style={[
                  styles.btn,
                  { backgroundColor: isInside ? (isDark ? "#451a03" : "#fee2e2") : emerald },
                ]}
              >
                <Text
                  style={{
                    color: isInside ? "#ef4444" : "#ffffff",
                    fontWeight: "700",
                    fontSize: 12,
                  }}
                >
                  {isInside ? "Check Out of Floor" : "Check In to Floor"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleWhatsApp}
                style={[
                  styles.btn,
                  { backgroundColor: surface, borderColor: border, borderWidth: 1 },
                ]}
              >
                <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 12 }}>
                  💬 WhatsApp Direct
                </Text>
              </TouchableOpacity>

              {isPending && (
                <TouchableOpacity
                  onPress={handleSettleDues}
                  style={[styles.btn, { backgroundColor: textPrimary }]}
                >
                  <Text style={{ color: bg, fontWeight: "700", fontSize: 12 }}>
                    ⚡ Settle ₹{m.due} Due with UPI QR
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleDelete}
                style={[styles.btn, { borderColor: "#ef4444", borderWidth: 1 }]}
              >
                <Text style={{ color: "#ef4444", fontWeight: "700", fontSize: 12 }}>
                  Delete Member Profile
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  card: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: "85%",
  },
  scrollContent: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "800",
    fontSize: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  plan: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  vitalsBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  vitalItem: {
    alignItems: "center",
    gap: 2,
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  infoGrid: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  infoRow: {
    fontSize: 12,
  },
  actionButtons: {
    gap: 8,
    marginTop: 4,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
