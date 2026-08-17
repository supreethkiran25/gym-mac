import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useGymStore, Member } from "../gym-store";

export function PaymentsScreen() {
  const {
    members,
    settleMemberDue,
    openUPIQRModal,
    settings,
    theme,
  } = useGymStore();

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const pendingMembers = members.filter((m) => m.due > 0);
  const allInvoices = members.flatMap((m) =>
    m.invoices.map((inv) => ({ ...inv, memberName: m.name, phone: m.phone }))
  );

  const totalCollected = members.reduce((sum, m) => sum + m.amountPaid, 0);
  const totalPending = members.reduce((sum, m) => sum + m.due, 0);

  const handleSettleDue = (m: Member) => {
    openUPIQRModal(m.due, m.name, `Pending Balance Settlement: ${m.plan}`);
    settleMemberDue(m.id, m.due, "UPI");
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bg }]} contentContainerStyle={styles.content}>
      {/* Top Financial Overview Cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.kpiLabel, { color: textMuted }]}>Gross Collected (MTD)</Text>
          <Text style={[styles.kpiValue, { color: emerald }]}>
            {settings.currencySymbol}{totalCollected.toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.kpiSub, { color: emerald }]}>94.2% Collection Rate</Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: surface, borderColor: border }]}>
          <Text style={[styles.kpiLabel, { color: textMuted }]}>Pending Uncollected</Text>
          <Text style={[styles.kpiValue, { color: "#f59e0b" }]}>
            {settings.currencySymbol}{totalPending.toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.kpiSub, { color: textMuted }]}>
            {pendingMembers.length} Outstanding Accounts
          </Text>
        </View>
      </View>

      {/* Pending Balances Action List */}
      {pendingMembers.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textPrimary }]}>
            Immediate Action: Pending Member Dues ({pendingMembers.length})
          </Text>

          <View style={styles.list}>
            {pendingMembers.map((m) => (
              <View
                key={m.id}
                style={[styles.dueCard, { backgroundColor: surface, borderColor: border }]}
              >
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={[styles.name, { color: textPrimary }]}>{m.name}</Text>
                    <Text style={[styles.sub, { color: textMuted }]}>{m.plan} • {m.phone}</Text>
                  </View>
                  <Text style={[styles.dueAmount, { color: "#f59e0b" }]}>
                    Due: ₹{m.due}
                  </Text>
                </View>

                <View style={styles.dueFooter}>
                  <TouchableOpacity
                    onPress={() => handleSettleDue(m)}
                    style={[styles.settleBtn, { backgroundColor: emerald }]}
                  >
                    <Text style={styles.settleBtnText}>⚡ Settle with UPI QR</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Master Transaction Invoices Ledger */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: textPrimary }]}>
          Master Invoices Ledger ({allInvoices.length})
        </Text>

        <View style={styles.list}>
          {allInvoices.map((inv) => (
            <View
              key={inv.id}
              style={[styles.invCard, { backgroundColor: surface, borderColor: border }]}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.name, { color: textPrimary }]}>{inv.memberName}</Text>
                  <Text style={[styles.sub, { color: textMuted }]}>
                    {inv.invoiceNumber} • {inv.date} ({inv.method})
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.invAmount, { color: textPrimary }]}>
                    {settings.currencySymbol}{inv.amount.toLocaleString("en-IN")}
                  </Text>
                  <Text style={[styles.invStatus, { color: emerald }]}>{inv.status}</Text>
                </View>
              </View>
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
  kpiRow: {
    flexDirection: "row",
    gap: 10,
  },
  kpiCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 4,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: "600",
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
  dueCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
  },
  sub: {
    fontSize: 11,
    marginTop: 2,
  },
  dueAmount: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  dueFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  settleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settleBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 11,
  },
  invCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  invAmount: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "Courier",
  },
  invStatus: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },
});
