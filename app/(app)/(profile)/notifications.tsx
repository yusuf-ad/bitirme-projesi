import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const NOTIFICATION_PREFS_KEY = "profile_notification_preferences";

interface NotificationPreferences {
  mealReminders: boolean;
  weeklyRecap: boolean;
  productUpdates: boolean;
}

const defaultNotifications: NotificationPreferences = {
  mealReminders: true,
  weeklyRecap: true,
  productUpdates: false,
};

export default function NotificationsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const [prefs, setPrefs] =
    useState<NotificationPreferences>(defaultNotifications);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) {
        setPrefs(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load notification preferences", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    Haptics.selectionAsync();
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    await AsyncStorage.setItem(
      NOTIFICATION_PREFS_KEY,
      JSON.stringify(updated)
    );
  };

  const handleTestNotification = () => {
    Alert.alert(
      "Test notification scheduled",
      "You'll receive a sample reminder on your device shortly."
    );
  };

  const options = [
    {
      id: "mealReminders",
      title: "Meal reminders",
      description: "Gentle nudges before breakfast, lunch and dinner.",
      value: prefs.mealReminders,
      onToggle: (value: boolean) => updatePreference("mealReminders", value),
    },
    {
      id: "weeklyRecap",
      title: "Weekly recap",
      description: "Sunday digest with streaks and top recipes.",
      value: prefs.weeklyRecap,
      onToggle: (value: boolean) => updatePreference("weeklyRecap", value),
    },
    {
      id: "productUpdates",
      title: "Product updates",
      description: "Occasional notes about new features and betas.",
      value: prefs.productUpdates,
      onToggle: (value: boolean) =>
        updatePreference("productUpdates", value),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>Alerts</Text>
        <View style={styles.card}>
          {options.map((option, index) => (
            <View key={option.id}>
              <View style={styles.optionRow}>
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>
                    {option.description}
                  </Text>
                </View>
                <Switch
                  value={isLoaded ? option.value : false}
                  onValueChange={option.onToggle}
                  trackColor={{
                    false: Colors.gray[200],
                    true: Colors.lilac[200],
                  }}
                  thumbColor={option.value ? Colors.lilac[900] : "#FFFFFF"}
                />
              </View>
              {index < options.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Schedules</Text>
        <View style={styles.card}>
          <Pressable
            style={styles.listRow}
            onPress={() => router.push("/(app)/(profile)/meal-times")}
          >
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Meal timing</Text>
              <Text style={styles.rowDescription}>
                Align notifications with your breakfast, lunch and dinner slots.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.listRow} onPress={handleTestNotification}>
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>Send test notification</Text>
              <Text style={styles.rowDescription}>
                Make sure notifications are enabled on your device.
              </Text>
            </View>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={22}
              color={Colors.text.secondary}
            />
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
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
    color: Colors.text.secondary,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    gap: 16,
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    gap: 16,
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
});

