import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PreferencesScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [notifications, setNotifications] = useState(true);
  const [mealReminders, setMealReminders] = useState(true);
  const [weeklyPlan, setWeeklyPlan] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Preferences</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 20 }]}
      >
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons
                name="bell-outline"
                size={24}
                color={Colors.text.primary}
              />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Push Notifications</Text>
                <Text style={styles.preferenceDescription}>
                  Receive app notifications
                </Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#D1D5DB", true: Colors.lilac[300] }}
              thumbColor={notifications ? Colors.lilac[900] : "#F3F4F6"}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons
                name="clock-alert-outline"
                size={24}
                color={Colors.text.primary}
              />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Meal Reminders</Text>
                <Text style={styles.preferenceDescription}>
                  Get reminded at meal times
                </Text>
              </View>
            </View>
            <Switch
              value={mealReminders}
              onValueChange={setMealReminders}
              trackColor={{ false: "#D1D5DB", true: Colors.lilac[300] }}
              thumbColor={mealReminders ? Colors.lilac[900] : "#F3F4F6"}
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons
                name="calendar-week"
                size={24}
                color={Colors.text.primary}
              />
              <View style={styles.preferenceInfo}>
                <Text style={styles.preferenceLabel}>Weekly Plan Updates</Text>
                <Text style={styles.preferenceDescription}>
                  Get notified about new meal plans
                </Text>
              </View>
            </View>
            <Switch
              value={weeklyPlan}
              onValueChange={setWeeklyPlan}
              trackColor={{ false: "#D1D5DB", true: Colors.lilac[300] }}
              thumbColor={weeklyPlan ? Colors.lilac[900] : "#F3F4F6"}
            />
          </View>
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Settings</Text>

          <Pressable style={styles.menuItem}>
            <View style={styles.preferenceLeft}>
              <MaterialCommunityIcons
                name="translate"
                size={24}
                color={Colors.text.primary}
              />
              <Text style={styles.preferenceLabel}>Language</Text>
            </View>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuItemValue}>English</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={Colors.text.tertiary}
              />
            </View>
          </Pressable>


        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  preferenceInfo: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "500",
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  menuItemValue: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
