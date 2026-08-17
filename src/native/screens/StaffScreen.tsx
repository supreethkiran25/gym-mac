import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { useGymStore, StaffMember } from "../gym-store";

export function StaffScreen() {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    payStaffSalary,
    toggleStaffStatus,
    settings,
    theme,
  } = useGymStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Head Coach" | "Personal Trainer" | "Nutritionist" | "Front Desk Manager" | "Floor Trainer">("Personal Trainer");
  const [phone, setPhone] = useState("+91 ");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("45000");
  const [shift, setShift] = useState("Morning 6:00 AM - 2:00 PM");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setName("");
    setRole("Personal Trainer");
    setPhone("+91 ");
    setEmail("");
    setSalary("45000");
    setShift("Morning 6:00 AM - 2:00 PM");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setName(s.name);
    setRole(s.role);
    setPhone(s.phone);
    setEmail(s.email);
    setSalary(String(s.salary));
    setShift(s.shift);
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingStaff) {
      updateStaff(editingStaff.id, {
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        salary: Number(salary) || 45000,
        shift: shift.trim(),
      });
    } else {
      addStaff({
        name: name.trim(),
        role,
        phone: phone.trim(),
        email: email.trim(),
        salary: Number(salary) || 45000,
        shift: shift.trim(),
        status: "On Floor",
        avatar: name.slice(0, 2).toUpperCase(),
      });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, staffName: string) => {
    Alert.alert("Delete Staff Member", `Remove ${staffName} from records?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteStaff(id) },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textPrimary }]}>Staff & Payroll</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {staff.filter((s) => s.status === "On Floor").length} Active on Gym Floor
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenAdd}
          style={[styles.addBtn, { backgroundColor: textPrimary }]}
        >
          <Text style={[styles.addBtnText, { color: bg }]}>+ Add Staff</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {staff.map((s) => {
          const isOnFloor = s.status === "On Floor";

          return (
            <View
              key={s.id}
              style={[styles.card, { backgroundColor: surface, borderColor: border }]}
            >
              <View style={styles.rowBetween}>
                <View style={styles.avatarRow}>
                  <View style={[styles.avatar, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
                    <Text style={[styles.avatarText, { color: textPrimary }]}>{s.avatar || "ST"}</Text>
                  </View>
                  <View>
                    <Text style={[styles.name, { color: textPrimary }]}>{s.name}</Text>
                    <Text style={[styles.role, { color: emerald }]}>{s.role}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => toggleStaffStatus(s.id, isOnFloor ? "Off Duty" : "On Floor")}
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isOnFloor ? (isDark ? "#064e3b" : "#d1fae5") : (isDark ? "#334155" : "#e2e8f0") },
                  ]}
                >
                  <Text style={[styles.statusText, { color: isOnFloor ? emerald : textMuted }]}>
                    {s.status}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.cardBody, { borderColor: border }]}>
                <Text style={[styles.bodyText, { color: textMuted }]}>
                  Shift: <Text style={{ color: textPrimary }}>{s.shift}</Text>
                </Text>
                <Text style={[styles.bodyText, { color: textMuted }]}>
                  Salary: <Text style={{ color: textPrimary, fontWeight: "700" }}>{settings.currencySymbol}{s.salary.toLocaleString("en-IN")}/mo</Text> • 📞 {s.phone}
                </Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.leftActions}>
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(s)}
                    style={[styles.smallBtn, { borderColor: border, borderWidth: 1 }]}
                  >
                    <Text style={[styles.smallBtnText, { color: textPrimary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(s.id, s.name)}
                    style={[styles.smallBtn, { borderColor: border, borderWidth: 1 }]}
                  >
                    <Text style={[styles.smallBtnText, { color: "#ef4444" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    payStaffSalary(s.id);
                    Alert.alert("Salary Disbursed", `Disbursed ${settings.currencySymbol}${s.salary} to ${s.name}!`);
                  }}
                  style={[styles.payBtn, { backgroundColor: textPrimary }]}
                >
                  <Text style={[styles.payBtnText, { color: bg }]}>💰 Pay Salary</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Add / Edit Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: surface, borderColor: border }]}>
            <Text style={[styles.modalTitle, { color: textPrimary }]}>
              {editingStaff ? `Edit ${editingStaff.name}` : "Add Staff Member"}
            </Text>

            <View style={styles.modalForm}>
              <Text style={[styles.inputLabel, { color: textMuted }]}>Full Name</Text>
              <TextInput
                placeholder="e.g. Vikram Malhotra"
                placeholderTextColor={textMuted}
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Phone Number</Text>
              <TextInput
                placeholder="+91 98765 43210"
                placeholderTextColor={textMuted}
                value={phone}
                onChangeText={setPhone}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Monthly Salary (₹)</Text>
              <TextInput
                placeholder="45000"
                placeholderTextColor={textMuted}
                value={salary}
                onChangeText={setSalary}
                keyboardType="numeric"
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Shift Hours</Text>
              <TextInput
                placeholder="e.g. Morning 6:00 AM - 2:00 PM"
                placeholderTextColor={textMuted}
                value={shift}
                onChangeText={setShift}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
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
                onPress={handleSave}
                style={[styles.saveBtn, { backgroundColor: textPrimary }]}
              >
                <Text style={{ color: bg, fontWeight: "700" }}>Save Staff</Text>
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
  list: {
    gap: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  rowBetween: {
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
  name: {
    fontSize: 14,
    fontWeight: "700",
  },
  role: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftActions: {
    flexDirection: "row",
    gap: 6,
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smallBtnText: {
    fontSize: 11,
    fontWeight: "600",
  },
  payBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  payBtnText: {
    fontWeight: "700",
    fontSize: 11,
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
