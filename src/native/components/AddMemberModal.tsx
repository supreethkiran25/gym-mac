import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useGymStore } from "../gym-store";

export function AddMemberModal() {
  const { isAddMemberOpen, setIsAddMemberOpen, addMember, settings, theme } = useGymStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState(settings.membershipPlans[0]?.name || "Monthly Flex Pass");
  const [amountPaid, setAmountPaid] = useState("2800");
  const [due, setDue] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "Cash" | "Card">("UPI");
  const [notes, setNotes] = useState("");

  if (!isAddMemberOpen) return null;

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter member name");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const selectedPlan =
      settings.membershipPlans.find((p) => p.name === plan) || settings.membershipPlans[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + (selectedPlan ? selectedPlan.durationMonths : 1));

    const totalAmt = Number(amountPaid) + Number(due);

    addMember({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, "")}@example.com`,
      plan,
      status: Number(due) > 0 ? "Pending Dues" : "Active",
      startDate: today,
      endDate: endDate.toISOString().split("T")[0],
      lastPaymentDate: today,
      amountPaid: Number(amountPaid) || 0,
      totalAmount: totalAmt,
      due: Number(due) || 0,
      paymentMethod,
      notes: notes.trim() || "Enrolled at front desk.",
    });

    setName("");
    setPhone("+91 ");
    setEmail("");
    setNotes("");
    setIsAddMemberOpen(false);
  };

  return (
    <Modal visible={isAddMemberOpen} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>Add New Member</Text>
            <TouchableOpacity onPress={() => setIsAddMemberOpen(false)}>
              <Text style={{ color: textMuted, fontSize: 16, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} contentContainerStyle={{ gap: 10 }}>
            <View>
              <Text style={[styles.label, { color: textMuted }]}>Full Name *</Text>
              <TextInput
                placeholder="e.g. Siddharth Verma"
                placeholderTextColor={textMuted}
                value={name}
                onChangeText={setName}
                style={[
                  styles.input,
                  { backgroundColor: bg, borderColor: border, color: textPrimary },
                ]}
              />
            </View>

            <View>
              <Text style={[styles.label, { color: textMuted }]}>Phone Number *</Text>
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
            </View>

            <View>
              <Text style={[styles.label, { color: textMuted }]}>Membership Plan</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexDirection: "row", marginTop: 4 }}
              >
                {settings.membershipPlans.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => {
                      setPlan(p.name);
                      setAmountPaid(String(p.price));
                      setDue("0");
                    }}
                    style={[
                      styles.planChip,
                      plan === p.name
                        ? { backgroundColor: textPrimary }
                        : { backgroundColor: bg, borderColor: border, borderWidth: 1 },
                    ]}
                  >
                    <Text
                      style={[styles.planChipText, { color: plan === p.name ? bg : textMuted }]}
                    >
                      {p.name} (₹{p.price})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.rowTwo}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: textMuted }]}>Amount Paid (₹)</Text>
                <TextInput
                  placeholder="2800"
                  placeholderTextColor={textMuted}
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    { backgroundColor: bg, borderColor: border, color: textPrimary },
                  ]}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: textMuted }]}>Pending Due (₹)</Text>
                <TextInput
                  placeholder="0"
                  placeholderTextColor={textMuted}
                  value={due}
                  onChangeText={setDue}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    { backgroundColor: bg, borderColor: border, color: textPrimary },
                  ]}
                />
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: textMuted }]}>Payment Method</Text>
              <View style={styles.methodRow}>
                {(["UPI", "Cash", "Card"] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => setPaymentMethod(m)}
                    style={[
                      styles.methodBtn,
                      paymentMethod === m
                        ? { backgroundColor: textPrimary }
                        : { backgroundColor: bg, borderColor: border, borderWidth: 1 },
                    ]}
                  >
                    <Text
                      style={[styles.methodText, { color: paymentMethod === m ? bg : textMuted }]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View>
              <Text style={[styles.label, { color: textMuted }]}>Notes / Goals</Text>
              <TextInput
                placeholder="e.g. Preparing for marathon, needs morning locker"
                placeholderTextColor={textMuted}
                value={notes}
                onChangeText={setNotes}
                style={[
                  styles.input,
                  { backgroundColor: bg, borderColor: border, color: textPrimary },
                ]}
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: textPrimary }]}
            >
              <Text style={[styles.saveBtnText, { color: bg }]}>✓ Enroll & Issue Pass</Text>
            </TouchableOpacity>
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
    padding: 20,
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
  form: {
    maxHeight: 480,
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
    marginTop: 4,
  },
  planChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    marginRight: 6,
  },
  planChipText: {
    fontSize: 11,
    fontWeight: "700",
  },
  rowTwo: {
    flexDirection: "row",
    gap: 10,
  },
  methodRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  methodText: {
    fontSize: 11,
    fontWeight: "700",
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    fontWeight: "700",
    fontSize: 13,
  },
});
