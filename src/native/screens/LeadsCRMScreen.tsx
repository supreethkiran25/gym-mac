import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Linking,
  Modal,
  Alert,
} from "react-native";
import { useGymStore, Lead, LeadStage } from "../gym-store";

export function LeadsCRMScreen() {
  const { leads, addLead, updateLeadStage, convertLeadToMember, deleteLead, theme, settings } =
    useGymStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStage, setFilterStage] = useState<string>("All");

  // Form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [source, setSource] = useState<
    "Walk-In" | "Instagram" | "Google Maps" | "Referral" | "Website"
  >("Instagram");
  const [stage, setStage] = useState<LeadStage>("Trial Scheduled");
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [trialDate, setTrialDate] = useState("Today, 5:00 PM");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const handleSaveLead = () => {
    if (!name.trim()) return;
    addLead({
      name: name.trim(),
      phone: phone.trim(),
      email: `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      source,
      stage,
      fitnessGoal: fitnessGoal.trim() || "General Fitness & Weight Loss",
      trialDate,
      notes: "Inquired at front desk about membership plans.",
    });
    setName("");
    setIsAddModalOpen(false);
  };

  const handleWhatsAppLead = (l: Lead) => {
    const text = encodeURIComponent(
      `Hi ${l.name}, this is ${settings.name}! We're thrilled to invite you for your free trial workout session: ${l.trialDate || "Today"}. Let us know if you need directions!`,
    );
    const cleanPhone = l.phone.replace(/[^0-9]/g, "");
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${text}`);
  };

  const filteredLeads = leads.filter((l) => {
    if (filterStage === "All") return true;
    return l.stage === filterStage;
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={styles.content}
    >
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textPrimary }]}>Prospect & Trial CRM</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length} Active Funnel
            Prospects
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsAddModalOpen(true)}
          style={[styles.addBtn, { backgroundColor: textPrimary }]}
        >
          <Text style={[styles.addBtnText, { color: bg }]}>+ Add Lead</Text>
        </TouchableOpacity>
      </View>

      {/* Stage Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stageFilterRow}>
        {(["All", "Inquiry", "Trial Scheduled", "Trial Completed", "Won"] as const).map((st) => (
          <TouchableOpacity
            key={st}
            onPress={() => setFilterStage(st)}
            style={[
              styles.stageTab,
              filterStage === st
                ? { backgroundColor: textPrimary }
                : { backgroundColor: surface, borderColor: border, borderWidth: 1 },
            ]}
          >
            <Text style={[styles.stageTabText, { color: filterStage === st ? bg : textMuted }]}>
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lead Cards */}
      <View style={styles.list}>
        {filteredLeads.map((lead) => {
          const isWon = lead.stage === "Won";

          return (
            <View
              key={lead.id}
              style={[styles.card, { backgroundColor: surface, borderColor: border }]}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.leadName, { color: textPrimary }]}>{lead.name}</Text>
                  <Text style={[styles.leadMeta, { color: textMuted }]}>
                    Source: {lead.source} • {lead.createdAt}
                  </Text>
                </View>
                <View
                  style={[
                    styles.stageBadge,
                    {
                      backgroundColor: isWon
                        ? isDark
                          ? "#064e3b"
                          : "#d1fae5"
                        : isDark
                          ? "#581c87"
                          : "#f3e8ff",
                    },
                  ]}
                >
                  <Text style={[styles.stageBadgeText, { color: isWon ? emerald : "#9333ea" }]}>
                    {lead.stage}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardBody, { borderColor: border }]}>
                <Text style={[styles.bodyText, { color: textMuted }]}>
                  🎯 Goal:{" "}
                  <Text style={{ color: textPrimary, fontWeight: "600" }}>{lead.fitnessGoal}</Text>
                </Text>
                {lead.trialDate && (
                  <Text style={[styles.bodyText, { color: textMuted }]}>
                    🗓️ Trial:{" "}
                    <Text style={{ color: textPrimary, fontWeight: "600" }}>{lead.trialDate}</Text>
                  </Text>
                )}
                <Text style={[styles.bodyText, { color: textMuted }]}>📞 {lead.phone}</Text>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  onPress={() => handleWhatsAppLead(lead)}
                  style={[
                    styles.actionBtn,
                    { backgroundColor: surface, borderColor: border, borderWidth: 1 },
                  ]}
                >
                  <Text style={[styles.actionBtnText, { color: textPrimary }]}>💬 WhatsApp</Text>
                </TouchableOpacity>

                {!isWon ? (
                  <TouchableOpacity
                    onPress={() => convertLeadToMember(lead.id, settings.membershipPlans[0].name)}
                    style={[styles.actionBtn, { backgroundColor: emerald }]}
                  >
                    <Text style={[styles.actionBtnText, { color: "#ffffff" }]}>
                      Convert to Member →
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[styles.actionBtn, { backgroundColor: isDark ? "#064e3b" : "#d1fae5" }]}
                  >
                    <Text style={[styles.actionBtnText, { color: emerald }]}>
                      ✓ Enrolled Member
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Add Lead Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Add New Prospect Lead</Text>

            <View style={styles.modalForm}>
              <Text style={[styles.inputLabel, { color: textMuted }]}>Full Name</Text>
              <TextInput
                placeholder="e.g. Rahul Kapoor"
                placeholderTextColor={textMuted}
                value={name}
                onChangeText={setName}
                style={[
                  styles.input,
                  { backgroundColor: bg, borderColor: border, color: textPrimary },
                ]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Phone Number</Text>
              <TextInput
                placeholder="+91 98765 43210"
                placeholderTextColor={textMuted}
                value={phone}
                onChangeText={setPhone}
                style={[
                  styles.input,
                  { backgroundColor: bg, borderColor: border, color: textPrimary },
                ]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Fitness Goal</Text>
              <TextInput
                placeholder="e.g. Muscle Gain & Strength"
                placeholderTextColor={textMuted}
                value={fitnessGoal}
                onChangeText={setFitnessGoal}
                style={[
                  styles.input,
                  { backgroundColor: bg, borderColor: border, color: textPrimary },
                ]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Trial Slot Date & Time</Text>
              <TextInput
                placeholder="Tomorrow, 6:30 PM"
                placeholderTextColor={textMuted}
                value={trialDate}
                onChangeText={setTrialDate}
                style={[
                  styles.input,
                  { backgroundColor: bg, borderColor: border, color: textPrimary },
                ]}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setIsAddModalOpen(false)}
                style={[styles.cancelBtn, { borderColor: border, borderWidth: 1 }]}
              >
                <Text style={{ color: textPrimary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveLead}
                style={[styles.saveBtn, { backgroundColor: textPrimary }]}
              >
                <Text style={{ color: bg, fontWeight: "700" }}>Save Lead</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 14,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: {
    fontWeight: "700",
    fontSize: 12,
  },
  stageFilterRow: {
    flexDirection: "row",
    gap: 6,
  },
  stageTab: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 6,
  },
  stageTabText: {
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leadName: {
    fontSize: 14,
    fontWeight: "700",
  },
  leadMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stageBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardBody: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 8,
    gap: 4,
  },
  bodyText: {
    fontSize: 11,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    gap: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  modalForm: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  input: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 12,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
