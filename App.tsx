import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { GymProvider, useGymStore } from "./src/native/gym-store";

// Native Screens
import { OverviewScreen } from "./src/native/screens/OverviewScreen";
import { MembersScreen } from "./src/native/screens/MembersScreen";
import { LeadsCRMScreen } from "./src/native/screens/LeadsCRMScreen";
import { AttendanceFloorScreen } from "./src/native/screens/AttendanceFloorScreen";
import { POSStoreScreen } from "./src/native/screens/POSStoreScreen";
import { PaymentsScreen } from "./src/native/screens/PaymentsScreen";
import { EquipmentScreen } from "./src/native/screens/EquipmentScreen";
import { StaffScreen } from "./src/native/screens/StaffScreen";
import { SettingsScreen } from "./src/native/screens/SettingsScreen";

// Global Native Modals
import { DynamicUPIQRModal } from "./src/native/components/DynamicUPIQRModal";
import { InstantCheckInModal } from "./src/native/components/InstantCheckInModal";
import { Member360Modal } from "./src/native/components/Member360Modal";
import { AddMemberModal } from "./src/native/components/AddMemberModal";

type ScreenTab =
  | "Overview"
  | "Members"
  | "Leads"
  | "Attendance"
  | "POS"
  | "Payments"
  | "Equipment"
  | "Staff"
  | "Settings";

function MainAppNavigator() {
  const { theme, members, leads } = useGymStore();
  const [activeTab, setActiveTab] = useState<ScreenTab>("Overview");

  const isDark = theme === "dark";
  const bg = isDark ? "#0f172a" : "#f8fafc";
  const surface = isDark ? "#1e293b" : "#ffffff";
  const textPrimary = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const border = isDark ? "rgba(255,255,255,0.08)" : "#e2e8f0";
  const emerald = "#10b981";

  const insideCount = members.filter((m) => m.isCurrentlyInside).length;
  const activeLeadsCount = leads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;

  const renderActiveScreen = () => {
    switch (activeTab) {
      case "Overview":
        return <OverviewScreen />;
      case "Members":
        return <MembersScreen />;
      case "Leads":
        return <LeadsCRMScreen />;
      case "Attendance":
        return <AttendanceFloorScreen />;
      case "POS":
        return <POSStoreScreen />;
      case "Payments":
        return <PaymentsScreen />;
      case "Equipment":
        return <EquipmentScreen />;
      case "Staff":
        return <StaffScreen />;
      case "Settings":
        return <SettingsScreen />;
      default:
        return <OverviewScreen />;
    }
  };

  const navItems: { id: ScreenTab; label: string; icon: string; badge?: number }[] = [
    { id: "Overview", label: "Overview", icon: "📊" },
    { id: "Members", label: "Members", icon: "👥" },
    { id: "Leads", label: "CRM", icon: "🎯", badge: activeLeadsCount },
    { id: "Attendance", label: "Floor", icon: "⚡", badge: insideCount },
    { id: "POS", label: "Shop", icon: "🛍️" },
    { id: "Payments", label: "Finances", icon: "💳" },
    { id: "Equipment", label: "Assets", icon: "🏋️" },
    { id: "Staff", label: "Staff", icon: "👔" },
    { id: "Settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Top Header Rail for Navigation */}
      <View style={[styles.topNavRail, { backgroundColor: surface, borderColor: border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setActiveTab(item.id)}
                style={[
                  styles.navPill,
                  isActive
                    ? { backgroundColor: textPrimary }
                    : { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#f1f5f9" },
                ]}
              >
                <Text style={styles.navPillIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.navPillLabel,
                    { color: isActive ? bg : textMuted, fontWeight: isActive ? "700" : "500" },
                  ]}
                >
                  {item.label}
                </Text>
                {item.badge !== undefined && item.badge > 0 && (
                  <View
                    style={[
                      styles.badgeCircle,
                      { backgroundColor: isActive ? bg : emerald },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeCircleText,
                        { color: isActive ? textPrimary : "#ffffff" },
                      ]}
                    >
                      {item.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Screen Viewport */}
      <View style={styles.screenContainer}>
        {renderActiveScreen()}
      </View>

      {/* Global Native Modals */}
      <DynamicUPIQRModal />
      <InstantCheckInModal />
      <Member360Modal />
      <AddMemberModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GymProvider>
      <MainAppNavigator />
    </GymProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topNavRail: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  navScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  navPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  navPillIcon: {
    fontSize: 12,
  },
  navPillLabel: {
    fontSize: 11,
  },
  badgeCircle: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeCircleText: {
    fontSize: 9,
    fontWeight: "800",
  },
  screenContainer: {
    flex: 1,
  },
});
