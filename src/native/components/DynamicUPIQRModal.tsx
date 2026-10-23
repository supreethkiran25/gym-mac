import React from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Image } from "react-native";
import { useGymStore } from "../gym-store";

export function DynamicUPIQRModal() {
  const { upiQRState, closeUPIQRModal, settings, theme } = useGymStore();

  if (!upiQRState.isOpen) return null;

  const isDark = theme === "dark";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  // Build standard UPI intent string
  const upiIntent = `upi://pay?pa=${encodeURIComponent(settings.upiId)}&pn=${encodeURIComponent(settings.name)}&am=${upiQRState.amount}&cu=INR&tn=${encodeURIComponent(upiQRState.description || "GymFlow Payment")}`;
  const qrImageUri = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiIntent)}`;

  return (
    <Modal visible={upiQRState.isOpen} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: textPrimary }]}>Dynamic UPI QR Payment</Text>
            <TouchableOpacity onPress={closeUPIQRModal}>
              <Text style={{ color: textMuted, fontSize: 16, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.amountBox}>
            <Text style={[styles.amountLabel, { color: textMuted }]}>Amount Payable</Text>
            <Text style={[styles.amountValue, { color: emerald }]}>
              {settings.currencySymbol}
              {upiQRState.amount.toLocaleString("en-IN")}
            </Text>
            <Text style={[styles.description, { color: textMuted }]}>
              {upiQRState.memberName ? `Payer: ${upiQRState.memberName} • ` : ""}
              {upiQRState.description}
            </Text>
          </View>

          {/* QR Code Container */}
          <View style={styles.qrContainer}>
            <Image source={{ uri: qrImageUri }} style={styles.qrImage} resizeMode="contain" />
          </View>

          <Text style={[styles.upiIdText, { color: textMuted }]}>
            UPI ID: <Text style={{ color: textPrimary, fontWeight: "700" }}>{settings.upiId}</Text>
          </Text>

          <Text style={[styles.supportedApps, { color: textMuted }]}>
            Scan with GPay, PhonePe, Paytm, CRED or BHIM UPI
          </Text>

          <TouchableOpacity
            onPress={closeUPIQRModal}
            style={[styles.doneBtn, { backgroundColor: textPrimary }]}
          >
            <Text style={[styles.doneBtnText, { color: isDark ? "#0f172a" : "#ffffff" }]}>
              ✓ Mark Paid & Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  amountBox: {
    alignItems: "center",
    gap: 2,
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  amountValue: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  description: {
    fontSize: 11,
    textAlign: "center",
  },
  qrContainer: {
    padding: 12,
    backgroundColor: "#ffffff",
    borderRadius: 16,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  upiIdText: {
    fontSize: 11,
  },
  supportedApps: {
    fontSize: 10,
    textAlign: "center",
  },
  doneBtn: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  doneBtnText: {
    fontWeight: "700",
    fontSize: 12,
  },
});
