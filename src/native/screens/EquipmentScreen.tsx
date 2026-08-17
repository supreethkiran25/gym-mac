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
import { useGymStore, GymEquipment } from "../gym-store";

export function EquipmentScreen() {
  const {
    equipment,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    serviceEquipment,
    theme,
  } = useGymStore();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEq, setEditingEq] = useState<GymEquipment | null>(null);

  // Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Strength" | "Cardio" | "Cables" | "Free Weights">("Strength");
  const [serialNumber, setSerialNumber] = useState("");
  const [location, setLocation] = useState("Main Strength Bay");
  const [vendorName, setVendorName] = useState("");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const handleOpenAdd = () => {
    setEditingEq(null);
    setName("");
    setCategory("Strength");
    setSerialNumber(`EQ-${Math.floor(1000 + Math.random() * 9000)}`);
    setLocation("Main Strength Bay");
    setVendorName("Life Fitness India");
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (eq: GymEquipment) => {
    setEditingEq(eq);
    setName(eq.name);
    setCategory(eq.category);
    setSerialNumber(eq.serialNumber);
    setLocation(eq.location);
    setVendorName(eq.vendorName || "");
    setIsAddModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;

    if (editingEq) {
      updateEquipment(editingEq.id, {
        name: name.trim(),
        category,
        serialNumber: serialNumber.trim(),
        location: location.trim(),
        vendorName: vendorName.trim(),
      });
    } else {
      addEquipment({
        name: name.trim(),
        category,
        status: "Operational",
        lastServiced: new Date().toISOString().split("T")[0],
        nextServiceDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split("T")[0],
        serialNumber: serialNumber.trim(),
        location: location.trim(),
        vendorName: vendorName.trim(),
      });
    }
    setIsAddModalOpen(false);
  };

  const handleDelete = (id: string, eqName: string) => {
    Alert.alert("Delete Equipment", `Remove ${eqName} from inventory?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteEquipment(id) },
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: textPrimary }]}>Equipment & Machine Health</Text>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {equipment.filter((e) => e.status === "Operational").length} / {equipment.length} Active Machines
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleOpenAdd}
          style={[styles.addBtn, { backgroundColor: textPrimary }]}
        >
          <Text style={[styles.addBtnText, { color: bg }]}>+ Add Item</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {equipment.map((eq) => {
          const isDue = eq.status === "Service Due";

          return (
            <View
              key={eq.id}
              style={[styles.card, { backgroundColor: surface, borderColor: border }]}
            >
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[styles.eqName, { color: textPrimary }]}>{eq.name}</Text>
                  <Text style={[styles.eqMeta, { color: textMuted }]}>
                    {eq.category} • Tag: {eq.serialNumber} • {eq.location}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: isDue ? (isDark ? "#451a03" : "#fef3c7") : (isDark ? "#064e3b" : "#d1fae5") },
                  ]}
                >
                  <Text style={[styles.statusText, { color: isDue ? "#f59e0b" : emerald }]}>
                    {eq.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.cardBody, { borderColor: border }]}>
                <Text style={[styles.bodyText, { color: textMuted }]}>
                  Last Serviced: <Text style={{ color: textPrimary }}>{eq.lastServiced}</Text> • Next Due: <Text style={{ color: textPrimary }}>{eq.nextServiceDate}</Text>
                </Text>
                {eq.vendorName && (
                  <Text style={[styles.bodyText, { color: textMuted }]}>Vendor: {eq.vendorName}</Text>
                )}
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.leftActions}>
                  <TouchableOpacity
                    onPress={() => handleOpenEdit(eq)}
                    style={[styles.smallBtn, { borderColor: border, borderWidth: 1 }]}
                  >
                    <Text style={[styles.smallBtnText, { color: textPrimary }]}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(eq.id, eq.name)}
                    style={[styles.smallBtn, { borderColor: border, borderWidth: 1 }]}
                  >
                    <Text style={[styles.smallBtnText, { color: "#ef4444" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => serviceEquipment(eq.id)}
                  style={[styles.serviceBtn, { backgroundColor: emerald }]}
                >
                  <Text style={styles.serviceBtnText}>🔧 Log Service</Text>
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
              {editingEq ? `Edit ${editingEq.name}` : "Add Equipment Machine"}
            </Text>

            <View style={styles.modalForm}>
              <Text style={[styles.inputLabel, { color: textMuted }]}>Machine Name</Text>
              <TextInput
                placeholder="e.g. LifeFitness Incline Bench"
                placeholderTextColor={textMuted}
                value={name}
                onChangeText={setName}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Serial / Asset Tag</Text>
              <TextInput
                placeholder="e.g. LF-IB-001"
                placeholderTextColor={textMuted}
                value={serialNumber}
                onChangeText={setSerialNumber}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Zone / Location</Text>
              <TextInput
                placeholder="e.g. Free Weights Zone"
                placeholderTextColor={textMuted}
                value={location}
                onChangeText={setLocation}
                style={[styles.input, { backgroundColor: bg, borderColor: border, color: textPrimary }]}
              />

              <Text style={[styles.inputLabel, { color: textMuted }]}>Vendor / Partner</Text>
              <TextInput
                placeholder="e.g. Life Fitness India"
                placeholderTextColor={textMuted}
                value={vendorName}
                onChangeText={setVendorName}
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
                <Text style={{ color: bg, fontWeight: "700" }}>Save Machine</Text>
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
    alignItems: "flex-start",
  },
  eqName: {
    fontSize: 14,
    fontWeight: "700",
  },
  eqMeta: {
    fontSize: 11,
    marginTop: 2,
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
  serviceBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  serviceBtnText: {
    color: "#ffffff",
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
