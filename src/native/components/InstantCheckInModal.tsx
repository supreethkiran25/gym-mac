import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { useGymStore } from "../gym-store";

export function InstantCheckInModal() {
  const {
    isCheckInOpen,
    setIsCheckInOpen,
    members,
    checkInMember,
    checkOutMember,
    theme,
  } = useGymStore();

  const [search, setSearch] = useState("");

  if (!isCheckInOpen) return null;

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const matchingMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search)
  );

  return (
    <Modal visible={isCheckInOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>Instant Floor Check-In</Text>
            <TouchableOpacity onPress={() => setIsCheckInOpen(false)}>
              <Text style={{ color: textMuted, fontSize: 16, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            placeholder="Search member name or mobile number..."
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
            autoFocus
            style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
          />

          <ScrollView style={styles.list}>
            {matchingMembers.map((m) => {
              const isInside = m.isCurrentlyInside;

              return (
                <View
                  key={m.id}
                  style={[styles.memberRow, { borderBottomColor: border }]}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={[styles.name, { color: textPrimary }]}>{m.name}</Text>
                    <Text style={[styles.sub, { color: textMuted }]}>
                      {m.plan} • {m.phone}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      if (isInside) {
                        checkOutMember(m.id);
                      } else {
                        checkInMember(m.id);
                      }
                      setIsCheckInOpen(false);
                    }}
                    style={[
                      styles.actionBtn,
                      { backgroundColor: isInside ? (isDark ? "#451a03" : "#fee2e2") : emerald },
                    ]}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: isInside ? "#ef4444" : "#ffffff" },
                      ]}
                    >
                      {isInside ? "Check Out" : "Check In"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
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
    padding: 20,
    maxHeight: "80%",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 13,
  },
  list: {
    maxHeight: 320,
  },
  memberRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
  },
  sub: {
    fontSize: 11,
    marginTop: 2,
  },
  actionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    fontWeight: "700",
    fontSize: 11,
  },
});
