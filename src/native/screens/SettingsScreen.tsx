import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useGymStore, MembershipPlan } from "../gym-store";

export function SettingsScreen() {
  const {
    settings,
    updateSettings,
    addPlan,
    updatePlan,
    deletePlan,
    resetToDefaultData,
    theme,
    setTheme,
    toggleTheme,
  } = useGymStore();

  const [activeTab, setActiveTab] = useState<"profile" | "plans" | "tax" | "theme" | "backup">("profile");

  // Profile Form
  const [gymName, setGymName] = useState(settings.name);
  const [location, setLocation] = useState(settings.location);
  const [phone, setPhone] = useState(settings.phone);
  const [upiId, setUpiId] = useState(settings.upiId);
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);

  // Plan Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planPrice, setPlanPrice] = useState("3500");
  const [planMonths, setPlanMonths] = useState("1");
  const [planType, setPlanType] = useState<"Standard" | "Premium" | "PT Package">("Standard");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const handleSaveProfile = () => {
    updateSettings({
      name: gymName,
      location,
      phone,
      upiId,
      invoicePrefix,
      gstNumber,
    });
    Alert.alert("Success", "Settings and business profile saved!");
  };

  const handleSavePlan = () => {
    if (!planName.trim()) return;
    addPlan({
      name: planName.trim(),
      price: Number(planPrice) || 3000,
      durationMonths: Number(planMonths) || 1,
      type: planType,
      perks: ["Full gym floor access", "Locker & shower facilities"],
    });
    setPlanName("");
    setIsPlanModalOpen(false);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textPrimary }]}>Settings & Brand Studio</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            Facility profile, custom plan pricing, and theme preferences
          </Text>
        </View>

        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.themePill, { backgroundColor: surface, borderColor: border }]}
        >
          <Text style={[styles.themePillText, { color: textPrimary }]}>
            {isDark ? "🌙 Dark" : "☀️ Light"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsRow}>
        {[
          { id: "profile", label: "Profile" },
          { id: "plans", label: "Plans Manager" },
          { id: "tax", label: "GST & Tax" },
          { id: "theme", label: "Appearance" },
          { id: "backup", label: "Data Reset" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id as any)}
            style={[
              styles.tabBtn,
              activeTab === tab.id
                ? { backgroundColor: textPrimary }
                : { backgroundColor: surface, borderColor: border, borderWidth: 1 },
            ]}
          >
            <Text
              style={[
                styles.tabBtnText,
                { color: activeTab === tab.id ? bg : textMuted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Facility & Contact Info</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: textMuted }]}>Gym Name</Text>
            <TextInput
              value={gymName}
              onChangeText={setGymName}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
            />

            <Text style={[styles.label, { color: textMuted }]}>Location / Branch</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
            />

            <Text style={[styles.label, { color: textMuted }]}>UPI Merchant VPA (for QR Payments)</Text>
            <TextInput
              value={upiId}
              onChangeText={setUpiId}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.primaryBtn, { backgroundColor: textPrimary }]}
            >
              <Text style={[styles.primaryBtnText, { color: bg }]}>Save Business Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Plans Tab */}
      {activeTab === "plans" && (
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={[styles.cardTitle, { color: textPrimary }]}>Membership Pricing Tiers</Text>
            <TouchableOpacity
              onPress={() => setIsPlanModalOpen(true)}
              style={[styles.addPlanBtn, { backgroundColor: textPrimary }]}
            >
              <Text style={[styles.addPlanBtnText, { color: bg }]}>+ Create Plan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {settings.membershipPlans.map((p) => (
              <View
                key={p.id}
                style={[styles.planCard, { backgroundColor: surface, borderColor: border }]}
              >
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[styles.planName, { color: textPrimary }]}>{p.name}</Text>
                    <Text style={[styles.planSub, { color: textMuted }]}>
                      {p.durationMonths} Months Duration • {p.activeCount} active
                    </Text>
                  </View>
                  <Text style={[styles.planPrice, { color: emerald }]}>
                    {settings.currencySymbol}{p.price.toLocaleString("en-IN")}
                  </Text>
                </View>

                <View style={styles.planFooter}>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Delete Plan", `Remove ${p.name}?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Delete", style: "destructive", onPress: () => deletePlan(p.id) },
                      ]);
                    }}
                  >
                    <Text style={{ color: "#ef4444", fontSize: 11, fontWeight: "600" }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tax Tab */}
      {activeTab === "tax" && (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>GST & Tax Preferences</Text>

          <View style={styles.form}>
            <Text style={[styles.label, { color: textMuted }]}>GSTIN ID</Text>
            <TextInput
              value={gstNumber}
              onChangeText={setGstNumber}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
            />

            <Text style={[styles.label, { color: textMuted }]}>Invoice Prefix</Text>
            <TextInput
              value={invoicePrefix}
              onChangeText={setInvoicePrefix}
              style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
            />

            <TouchableOpacity
              onPress={handleSaveProfile}
              style={[styles.primaryBtn, { backgroundColor: textPrimary }]}
            >
              <Text style={[styles.primaryBtnText, { color: bg }]}>Save Tax Info</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Appearance Tab */}
      {activeTab === "theme" && (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: textPrimary }]}>Interface Appearance</Text>
          <View style={styles.themeOptions}>
            <TouchableOpacity
              onPress={() => setTheme("dark")}
              style={[
                styles.themeCard,
                { backgroundColor: "#0f172a", borderColor: isDark ? emerald : border, borderWidth: isDark ? 2 : 1 },
              ]}
            >
              <Text style={{ color: "#ffffff", fontWeight: "700" }}>🌙 Onyx Dark Mode</Text>
              <Text style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>
                Optimized for OLED displays & gym front-desks
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setTheme("light")}
              style={[
                styles.themeCard,
                { backgroundColor: "#ffffff", borderColor: !isDark ? emerald : border, borderWidth: !isDark ? 2 : 1 },
              ]}
            >
              <Text style={{ color: "#0f172a", fontWeight: "700" }}>☀️ Editorial Light Mode</Text>
              <Text style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>
                Crisp layout for brightly lit reception tablets
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Backup & Reset Tab */}
      {activeTab === "backup" && (
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.cardTitle, { color: "#ef4444" }]}>Demo Data Management</Text>
          <Text style={[styles.bodyText, { color: textMuted }]}>
            Reset all mock gym members, staff, equipment, and cashflow to default state.
          </Text>

          <TouchableOpacity
            onPress={() => {
              Alert.alert("Reset Demo Data", "Restore all demo records to initial state?", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Reset",
                  style: "destructive",
                  onPress: () => {
                    resetToDefaultData();
                    Alert.alert("Reset Complete", "All data restored to default state.");
                  },
                },
              ]);
            }}
            style={[styles.resetBtn, { borderColor: "#ef4444", borderWidth: 1 }]}
          >
            <Text style={{ color: "#ef4444", fontWeight: "700" }}>⚠️ Reset to Default Demo Data</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Plan Add Modal */}
      <Modal visible={isPlanModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>Create Membership Plan</Text>

            <View style={styles.form}>
              <Text style={[styles.label, { color: textMuted }]}>Plan Name</Text>
              <TextInput
                placeholder="e.g. 6-Month Transformation"
                placeholderTextColor={textMuted}
                value={planName}
                onChangeText={setPlanName}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.label, { color: textMuted }]}>Price (₹)</Text>
              <TextInput
                placeholder="12000"
                placeholderTextColor={textMuted}
                value={planPrice}
                onChangeText={setPlanPrice}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.label, { color: textMuted }]}>Duration (Months)</Text>
              <TextInput
                placeholder="6"
                placeholderTextColor={textMuted}
                value={planMonths}
                onChangeText={setPlanMonths}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                onPress={() => setIsPlanModalOpen(false)}
                style={[styles.cancelBtn, { borderColor: border, borderWidth: 1 }]}
              >
                <Text style={{ color: textPrimary, fontWeight: "600" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSavePlan}
                style={[styles.saveBtn, { backgroundColor: textPrimary }]}
              >
                <Text style={{ color: bg, fontWeight: "700" }}>Save Plan</Text>
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
  themePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  tabsRow: {
    flexDirection: "row",
  },
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 6,
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  form: {
    gap: 8,
  },
  label: {
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
  primaryBtn: {
    height: 42,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  primaryBtnText: {
    fontWeight: "700",
    fontSize: 12,
  },
  section: {
    gap: 10,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addPlanBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addPlanBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  list: {
    gap: 10,
  },
  planCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  planName: {
    fontSize: 13,
    fontWeight: "700",
  },
  planSub: {
    fontSize: 11,
    marginTop: 2,
  },
  planPrice: {
    fontSize: 15,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  planFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  themeOptions: {
    gap: 10,
  },
  themeCard: {
    padding: 14,
    borderRadius: 14,
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 16,
  },
  resetBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
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
