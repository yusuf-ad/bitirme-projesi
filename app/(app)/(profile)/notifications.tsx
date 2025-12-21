import { Colors as StaticColors, getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Animated,
    Linking,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Safe notification module access
const getNotifications = () => {
  try {
    return require("expo-notifications");
  } catch {
    return null;
  }
};

// Safe device check without native module dependency
const isPhysicalDevice = (): boolean => {
  try {
    const Device = require("expo-device");
    return Device.isDevice ?? true;
  } catch {
    return Platform.OS !== "web";
  }
};

// Helper to convert 12h to 24h format
const convertTo24Hour = (hour: number, minute: number, period: "AM" | "PM") => {
  let hour24 = hour;
  if (period === "PM" && hour !== 12) {
    hour24 = hour + 12;
  } else if (period === "AM" && hour === 12) {
    hour24 = 0;
  }
  return { hour: hour24, minute };
};

// Helper to format time for display
const formatTime = (hour: number, minute: number, period: "AM" | "PM") => {
  const paddedMinute = minute.toString().padStart(2, "0");
  return `${hour}:${paddedMinute} ${period}`;
};

const NOTIFICATION_PREFS_KEY = "profile_notification_preferences";

// Configure notification handler (wrapped in try-catch for Expo Go compatibility)
try {
  const Notifications = getNotifications();
  Notifications?.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log("Notification handler setup skipped (Expo Go limitation)");
}

interface NotificationPreferences {
  mealReminders: boolean;
  breakfastReminder: boolean;
  lunchReminder: boolean;
  dinnerReminder: boolean;
  weeklyRecap: boolean;
  shoppingReminders: boolean;
}

const defaultNotifications: NotificationPreferences = {
  mealReminders: true,
  breakfastReminder: true,
  lunchReminder: true,
  dinnerReminder: true,
  weeklyRecap: true,
  shoppingReminders: false,
};

const SUB_OPTIONS_HEIGHT = 400; // Increased height to prevent clipping on Android (approx height of sub-options)

export default function NotificationsScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const { selection } = useHaptics();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const onboarding = useOnboarding();
  const [prefs, setPrefs] =
    useState<NotificationPreferences>(defaultNotifications);
  const [isLoaded, setIsLoaded] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Animation values
  const expandAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadPreferences();
    checkPermissionStatus();
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate sub-options when mealReminders changes
  useEffect(() => {
    if (prefs.mealReminders) {
      // Expand animation
      Animated.parallel([
        Animated.spring(expandAnim, {
          toValue: 1,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          delay: 100,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Collapse animation
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.spring(expandAnim, {
          toValue: 0,
          useNativeDriver: false,
          tension: 50,
          friction: 8,
        }),
      ]).start();
    }
  }, [prefs.mealReminders, expandAnim, opacityAnim]);

  const checkPermissionStatus = async () => {
    try {
      const Notifications = getNotifications();
      if (!Notifications) {
        setPermissionStatus("undetermined");
        return;
      }
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionStatus(status);
    } catch {
      setPermissionStatus("undetermined");
    }
  };

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (stored) {
        setPrefs({ ...defaultNotifications, ...JSON.parse(stored) });
      }
    } catch (error) {
      console.error("Failed to load notification preferences", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const requestPermission = async () => {
    if (!isPhysicalDevice()) {
      Alert.alert(
        t("notifications.physicalDeviceRequired"),
        t("notifications.physicalDeviceRequiredDesc")
      );
      return;
    }

    const Notifications = getNotifications();
    if (!Notifications) {
      Alert.alert(
        t("notifications.notificationsLimited"),
        t("notifications.notificationsLimitedDesc")
      );
      return;
    }

    setIsRequestingPermission(true);
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") {
        Alert.alert(
          t("notifications.permissionRequired"),
          t("notifications.permissionRequiredDesc"),
          [
            { text: t("common.cancel"), style: "cancel" },
            {
              text: t("notifications.openSettings"),
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const updatePreference = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    selection();

    // If enabling a notification, check permission first
    if (value && permissionStatus !== "granted") {
      await requestPermission();
      const Notifications = getNotifications();
      if (!Notifications) return;
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        return; // Don't enable if permission not granted
      }
    }

    let updated = { ...prefs, [key]: value };

    // If turning on mealReminders, enable all sub-reminders
    if (key === "mealReminders" && value) {
      updated.breakfastReminder = true;
      updated.lunchReminder = true;
      updated.dinnerReminder = true;
    }
    // If turning off mealReminders, disable all sub-reminders
    if (key === "mealReminders" && !value) {
      updated.breakfastReminder = false;
      updated.lunchReminder = false;
      updated.dinnerReminder = false;
    }

    setPrefs(updated);
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));

    // Schedule or cancel notifications based on preference
    if (key === "mealReminders") {
      if (value) {
        await scheduleMealReminders(updated);
      } else {
        await cancelMealReminders();
      }
    }

    // Handle shopping reminders
    if (key === "shoppingReminders") {
      if (value) {
        await scheduleShoppingReminder();
      } else {
        await cancelShoppingReminder();
      }
    }

    // Handle weekly recap
    if (key === "weeklyRecap") {
      if (value) {
        await scheduleWeeklyRecap();
      } else {
        await cancelWeeklyRecap();
      }
    }
  };

  const scheduleMealReminders = async (
    currentPrefs?: NotificationPreferences
  ) => {
    const Notifications = getNotifications();
    if (!Notifications) return;

    try {
      const prefsToUse = currentPrefs || prefs;

      // Cancel all existing meal reminders first
      await cancelMealReminders();

      // Get user's meal times from onboarding data
      const { breakfastTime, lunchTime, dinnerTime } = onboarding;

      // Convert to 24h format
      const breakfast24 = convertTo24Hour(
        breakfastTime.hour,
        breakfastTime.minute,
        breakfastTime.period
      );
      const lunch24 = convertTo24Hour(
        lunchTime.hour,
        lunchTime.minute,
        lunchTime.period
      );
      const dinner24 = convertTo24Hour(
        dinnerTime.hour,
        dinnerTime.minute,
        dinnerTime.period
      );

      // Schedule breakfast reminder if enabled
      if (prefsToUse.breakfastReminder) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🍳 Breakfast Time!",
            body: "Start your day right. Check your meal plan for breakfast ideas.",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: breakfast24.hour,
            minute: breakfast24.minute,
          },
          identifier: "meal-reminder-breakfast",
        });
      }

      // Schedule lunch reminder if enabled
      if (prefsToUse.lunchReminder) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🥗 Lunch Time!",
            body: "Time for a healthy lunch. See what's on your meal plan.",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: lunch24.hour,
            minute: lunch24.minute,
          },
          identifier: "meal-reminder-lunch",
        });
      }

      // Schedule dinner reminder if enabled
      if (prefsToUse.dinnerReminder) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "🍽️ Dinner Time!",
            body: "Ready to cook? Check your dinner recipe.",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DAILY,
            hour: dinner24.hour,
            minute: dinner24.minute,
          },
          identifier: "meal-reminder-dinner",
        });
      }

      console.log("Scheduled meal reminders:", {
        breakfast: prefsToUse.breakfastReminder
          ? `${breakfast24.hour}:${breakfast24.minute}`
          : "disabled",
        lunch: prefsToUse.lunchReminder
          ? `${lunch24.hour}:${lunch24.minute}`
          : "disabled",
        dinner: prefsToUse.dinnerReminder
          ? `${dinner24.hour}:${dinner24.minute}`
          : "disabled",
      });
    } catch (error) {
      console.log(
        "Failed to schedule notifications (Expo Go limitation):",
        error
      );
    }
  };

  const cancelMealReminders = async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync(
        "meal-reminder-breakfast"
      );
    } catch {}
    try {
      await Notifications.cancelScheduledNotificationAsync(
        "meal-reminder-lunch"
      );
    } catch {}
    try {
      await Notifications.cancelScheduledNotificationAsync(
        "meal-reminder-dinner"
      );
    } catch {}
  };

  // Schedule shopping reminder - Every Saturday at 10:00 AM
  const scheduleShoppingReminder = async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await cancelShoppingReminder();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🛒 Shopping Day!",
          body: "Time to check your shopping list and stock up for the week.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 7, // Saturday (1=Sunday, 7=Saturday)
          hour: 10,
          minute: 0,
        },
        identifier: "shopping-reminder",
      });

      console.log("Scheduled shopping reminder: Saturday 10:00 AM");
    } catch (error) {
      console.log("Failed to schedule shopping reminder:", error);
    }
  };

  const cancelShoppingReminder = async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync("shopping-reminder");
    } catch {}
  };

  // Schedule weekly recap - Every Sunday at 6:00 PM
  const scheduleWeeklyRecap = async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await cancelWeeklyRecap();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📊 Weekly Recap",
          body: "See how your meal planning went this week! Tap to view your stats.",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: 1, // Sunday (1=Sunday)
          hour: 18,
          minute: 0,
        },
        identifier: "weekly-recap",
      });

      console.log("Scheduled weekly recap: Sunday 6:00 PM");
    } catch (error) {
      console.log("Failed to schedule weekly recap:", error);
    }
  };

  const cancelWeeklyRecap = async () => {
    const Notifications = getNotifications();
    if (!Notifications) return;
    try {
      await Notifications.cancelScheduledNotificationAsync("weekly-recap");
    } catch {}
  };

  const updateMealReminderPreference = async (
    key: "breakfastReminder" | "lunchReminder" | "dinnerReminder",
    value: boolean
  ) => {
    selection();

    const updated = { ...prefs, [key]: value };

    // If all meal reminders are off, turn off main toggle
    if (
      !updated.breakfastReminder &&
      !updated.lunchReminder &&
      !updated.dinnerReminder
    ) {
      updated.mealReminders = false;
    } else {
      updated.mealReminders = true;
    }

    setPrefs(updated);
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(updated));

    // Reschedule notifications
    if (updated.mealReminders) {
      await scheduleMealReminders(updated);
    } else {
      await cancelMealReminders();
    }
  };

  const handleTestNotification = async () => {
    selection();

    const Notifications = getNotifications();
    if (!Notifications) {
      Alert.alert(
        t("notifications.notificationsLimited"),
        t("notifications.notificationsLimitedDesc")
      );
      return;
    }

    if (permissionStatus !== "granted") {
      await requestPermission();
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🎉 Test Notification",
          body: "Great! Notifications are working perfectly.",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
        },
      });

      Alert.alert(
        "Notification Scheduled",
        "You'll receive a test notification in 2 seconds."
      );
    } catch (error) {
      console.log("Test notification failed:", error);
      Alert.alert(
        "Notifications Limited",
        "Notifications may not work in Expo Go. Use a development build for full functionality."
      );
    }
  };

  // Format meal times for display
  const breakfastTimeStr = formatTime(
    onboarding.breakfastTime.hour,
    onboarding.breakfastTime.minute,
    onboarding.breakfastTime.period
  );
  const lunchTimeStr = formatTime(
    onboarding.lunchTime.hour,
    onboarding.lunchTime.minute,
    onboarding.lunchTime.period
  );
  const dinnerTimeStr = formatTime(
    onboarding.dinnerTime.hour,
    onboarding.dinnerTime.minute,
    onboarding.dinnerTime.period
  );

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case "granted":
        return "#22C55E";
      case "denied":
        return "#EF4444";
      default:
        return Colors.text.secondary;
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case "granted":
        return t("common.enabled");
      case "denied":
        return t("common.disabled");
      case "undetermined":
        return t("common.notSet");
      default:
        return t("common.unknown");
    }
  };

  if (!isLoaded) {
    return (
      <View
        style={[styles.container, styles.loadingContainer, { paddingTop: top }]}
      >
        <ActivityIndicator size="large" color={Colors.lilac[900]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: Colors.background.primary }]}>
      <View style={[styles.header, { backgroundColor: Colors.background.surface, borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E5E5" }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("notifications.title")}</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Permission Status Banner */}
        <Pressable
          style={[
            styles.permissionBanner,
            { backgroundColor: isDark ? (permissionStatus === "granted" ? "rgba(34, 197, 94, 0.15)" : permissionStatus === "denied" ? "rgba(239, 68, 68, 0.15)" : Colors.lilac[900] + "20") : undefined },
            !isDark && permissionStatus === "granted" && styles.permissionBannerGranted,
            !isDark && permissionStatus === "denied" && styles.permissionBannerDenied,
          ]}
          onPress={
            permissionStatus !== "granted" ? requestPermission : undefined
          }
          disabled={isRequestingPermission}
        >
          <View style={[styles.permissionIconContainer, { backgroundColor: isDark ? Colors.background.surface : "#FFFFFF" }]}>
            {isRequestingPermission ? (
              <ActivityIndicator size="small" color={Colors.lilac[900]} />
            ) : (
              <MaterialCommunityIcons
                name={
                  permissionStatus === "granted"
                    ? "bell-check"
                    : "bell-off-outline"
                }
                size={24}
                color={
                  permissionStatus === "granted" ? "#22C55E" : Colors.lilac[900]
                }
              />
            )}
          </View>
          <View style={styles.permissionTextContainer}>
            <Text style={[styles.permissionTitle, { color: Colors.text.primary }]}>
              {permissionStatus === "granted"
                ? t("notifications.enabled")
                : t("notifications.enable")}
            </Text>
            <Text style={styles.permissionDescription}>
              {permissionStatus === "granted"
                ? t("notifications.enabledDesc")
                : t("notifications.enableDesc")}
            </Text>
          </View>
          <View
            style={[
              styles.permissionStatus,
              { backgroundColor: getPermissionStatusColor() + "20" },
            ]}
          >
            <Text
              style={[
                styles.permissionStatusText,
                { color: getPermissionStatusColor() },
              ]}
            >
              {getPermissionStatusText()}
            </Text>
          </View>
        </Pressable>

        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>
          {t("notifications.notificationTypes")}
        </Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          {/* Meal Reminders with expandable sub-options */}
          <View>
            <View style={styles.optionRow}>
              <View style={[styles.optionIconContainer, { backgroundColor: isDark ? Colors.background.tertiary : "#F5F5F5" }]}>
                <MaterialCommunityIcons
                  name="food-outline"
                  size={20}
                  color={
                    prefs.mealReminders
                      ? Colors.lilac[900]
                      : Colors.text.secondary
                  }
                />
              </View>
              <View style={styles.optionCopy}>
                <Text style={[styles.optionTitle, { color: Colors.text.primary }]}>
                  {t("notifications.mealReminders")}
                </Text>
                <Text style={[styles.optionDescription, { color: Colors.text.secondary }]}>
                  {t("notifications.mealRemindersDesc")}
                </Text>
              </View>
              <Switch
                value={prefs.mealReminders}
                onValueChange={(value) =>
                  updatePreference("mealReminders", value)
                }
                trackColor={{
                  false: isDark ? Colors.gray[700] : Colors.gray[200],
                  true: isDark ? Colors.lilac[700] : Colors.lilac[200],
                }}
                thumbColor={prefs.mealReminders ? Colors.lilac[900] : "#FFFFFF"}
              />
            </View>

            {/* Sub-options for individual meals - Animated */}
            <Animated.View
              style={[
                styles.subOptionsContainer,
                {
                  maxHeight: expandAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, SUB_OPTIONS_HEIGHT],
                  }),
                  opacity: opacityAnim,
                  overflow: "hidden",
                  backgroundColor: isDark ? Colors.background.secondary : "#FAFAFA",
                  borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0",
                },
              ]}
            >
              {/* Breakfast */}
              <Animated.View
                style={[
                  styles.subOptionRow,
                  {
                    transform: [
                      {
                        translateX: expandAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.subOptionLeft}>
                  <Text style={styles.mealEmoji}>🍳</Text>
                  <View>
                    <Text style={[styles.subOptionTitle, { color: Colors.text.primary }]}>
                      {t("mealTimes.breakfast")}
                    </Text>
                    <Text style={[styles.subOptionTime, { color: Colors.lilac[900] }]}>{breakfastTimeStr}</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.breakfastReminder}
                  onValueChange={(value) =>
                    updateMealReminderPreference("breakfastReminder", value)
                  }
                  trackColor={{
                    false: isDark ? Colors.gray[700] : Colors.gray[200],
                    true: isDark ? Colors.lilac[700] : Colors.lilac[200],
                  }}
                  thumbColor={
                    prefs.breakfastReminder ? Colors.lilac[900] : "#FFFFFF"
                  }
                />
              </Animated.View>

              {/* Lunch */}
              <Animated.View
                style={[
                  styles.subOptionRow,
                  {
                    transform: [
                      {
                        translateX: expandAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.subOptionLeft}>
                  <Text style={styles.mealEmoji}>🥗</Text>
                  <View>
                    <Text style={[styles.subOptionTitle, { color: Colors.text.primary }]}>
                      {t("mealTimes.lunch")}
                    </Text>
                    <Text style={[styles.subOptionTime, { color: Colors.lilac[900] }]}>{lunchTimeStr}</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.lunchReminder}
                  onValueChange={(value) =>
                    updateMealReminderPreference("lunchReminder", value)
                  }
                  trackColor={{
                    false: isDark ? Colors.gray[700] : Colors.gray[200],
                    true: isDark ? Colors.lilac[700] : Colors.lilac[200],
                  }}
                  thumbColor={
                    prefs.lunchReminder ? Colors.lilac[900] : "#FFFFFF"
                  }
                />
              </Animated.View>

              {/* Dinner */}
              <Animated.View
                style={[
                  styles.subOptionRow,
                  {
                    transform: [
                      {
                        translateX: expandAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-20, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.subOptionLeft}>
                  <Text style={styles.mealEmoji}>🍽️</Text>
                  <View>
                    <Text style={[styles.subOptionTitle, { color: Colors.text.primary }]}>
                      {t("mealTimes.dinner")}
                    </Text>
                    <Text style={[styles.subOptionTime, { color: Colors.lilac[900] }]}>{dinnerTimeStr}</Text>
                  </View>
                </View>
                <Switch
                  value={prefs.dinnerReminder}
                  onValueChange={(value) =>
                    updateMealReminderPreference("dinnerReminder", value)
                  }
                  trackColor={{
                    false: isDark ? Colors.gray[700] : Colors.gray[200],
                    true: isDark ? Colors.lilac[700] : Colors.lilac[200],
                  }}
                  thumbColor={
                    prefs.dinnerReminder ? Colors.lilac[900] : "#FFFFFF"
                  }
                />
              </Animated.View>

              {/* Edit times link */}
              <Pressable
                style={[styles.editTimesLink, { borderTopColor: isDark ? "rgba(255,255,255,0.05)" : "#EEEEEE" }]}
                onPress={() => router.push("/(app)/(profile)/meal-times")}
              >
                <MaterialCommunityIcons
                  name="clock-edit-outline"
                  size={16}
                  color={Colors.lilac[900]}
                />
                <Text style={[styles.editTimesText, { color: Colors.lilac[900] }]}>
                  {t("notifications.editMealTimes")}
                </Text>
              </Pressable>
            </Animated.View>
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }]} />

          {/* Shopping Reminders */}
          <View style={styles.optionRow}>
            <View style={[styles.optionIconContainer, { backgroundColor: isDark ? Colors.background.tertiary : "#F5F5F5" }]}>
              <MaterialCommunityIcons
                name="cart-outline"
                size={20}
                color={
                  prefs.shoppingReminders
                    ? Colors.lilac[900]
                    : Colors.text.secondary
                }
              />
            </View>
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, { color: Colors.text.primary }]}>
                {t("notifications.shoppingReminders")}
              </Text>
              <Text style={[styles.optionDescription, { color: Colors.text.secondary }]}>
                {prefs.shoppingReminders
                  ? t("notifications.shoppingRemindersEnabled")
                  : t("notifications.shoppingRemindersDesc")}
              </Text>
            </View>
            <Switch
              value={prefs.shoppingReminders}
              onValueChange={(value) =>
                updatePreference("shoppingReminders", value)
              }
              trackColor={{
                false: isDark ? Colors.gray[700] : Colors.gray[200],
                true: isDark ? Colors.lilac[700] : Colors.lilac[200],
              }}
              thumbColor={
                prefs.shoppingReminders ? Colors.lilac[900] : "#FFFFFF"
              }
            />
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }]} />

          {/* Weekly Recap */}
          <View style={styles.optionRow}>
            <View style={[styles.optionIconContainer, { backgroundColor: isDark ? Colors.background.tertiary : "#F5F5F5" }]}>
              <MaterialCommunityIcons
                name="calendar-week"
                size={20}
                color={
                  prefs.weeklyRecap ? Colors.lilac[900] : Colors.text.secondary
                }
              />
            </View>
            <View style={styles.optionCopy}>
              <Text style={[styles.optionTitle, { color: Colors.text.primary }]}>
                {t("notifications.weeklyRecap")}
              </Text>
              <Text style={[styles.optionDescription, { color: Colors.text.secondary }]}>
                {prefs.weeklyRecap
                  ? t("notifications.weeklyRecapEnabled")
                  : t("notifications.weeklyRecapDesc")}
              </Text>
            </View>
            <Switch
              value={prefs.weeklyRecap}
              onValueChange={(value) => updatePreference("weeklyRecap", value)}
              trackColor={{
                false: isDark ? Colors.gray[700] : Colors.gray[200],
                true: isDark ? Colors.lilac[700] : Colors.lilac[200],
              }}
              thumbColor={prefs.weeklyRecap ? Colors.lilac[900] : "#FFFFFF"}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("notifications.actions")}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          <Pressable style={styles.listRow} onPress={handleTestNotification}>
            <View style={[styles.rowIconContainer, { backgroundColor: isDark ? Colors.lilac[900] + "20" : "#F0EDFF" }]}>
              <MaterialCommunityIcons
                name="bell-ring-outline"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>
                {t("notifications.testNotification")}
              </Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("notifications.testNotificationDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F0F0F0" }]} />
          <Pressable
            style={styles.listRow}
            onPress={() => Linking.openSettings()}
          >
            <View style={[styles.rowIconContainer, { backgroundColor: isDark ? Colors.lilac[900] + "20" : "#F0EDFF" }]}>
              <MaterialCommunityIcons
                name="cog-outline"
                size={20}
                color={Colors.lilac[900]}
              />
            </View>
            <View style={styles.rowCopy}>
              <Text style={[styles.rowTitle, { color: Colors.text.primary }]}>
                {t("notifications.systemSettings")}
              </Text>
              <Text style={[styles.rowDescription, { color: Colors.text.secondary }]}>
                {t("notifications.systemSettingsDesc")}
              </Text>
            </View>
            <MaterialCommunityIcons
              name="open-in-new"
              size={18}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>

        <Text style={[styles.footerText, { color: StaticColors.text.secondary }]}>{t("notifications.footerText")}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: StaticColors.background.secondary, // Dynamic in render
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    // backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    // borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: StaticColors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    // backgroundColor: "#F0EDFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  permissionBannerGranted: {
    // backgroundColor: "#ECFDF5", // Handled inline
  },
  permissionBannerDenied: {
    // backgroundColor: "#FEF2F2", // Handled inline
  },
  permissionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: StaticColors.text.primary,
    marginBottom: 2,
  },
  permissionDescription: {
    fontSize: 12,
    color: StaticColors.text.secondary,
    lineHeight: 16,
  },
  permissionStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  permissionStatusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 1,
    fontWeight: "600",
    textTransform: "uppercase",
    color: StaticColors.text.secondary,
    marginTop: 8,
  },
  card: {
    // backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    // backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  optionCopy: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: StaticColors.text.primary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: StaticColors.text.secondary,
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 48,
  },
  subOptionsContainer: {
    // backgroundColor: "#FAFAFA",
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    borderTopWidth: 1,
    // borderTopColor: "#F0F0F0",
  },
  subOptionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingLeft: 8,
  },
  subOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mealEmoji: {
    fontSize: 24,
    width: 32,
    textAlign: "center",
  },
  subOptionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: StaticColors.text.primary,
  },
  subOptionTime: {
    fontSize: 12,
    color: StaticColors.lilac[900],
    fontWeight: "500",
    marginTop: 1,
  },
  editTimesLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
    // borderTopColor: "#EEEEEE",
  },
  editTimesText: {
    fontSize: 13,
    fontWeight: "600",
    color: StaticColors.lilac[900],
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 12,
  },
  rowIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    // backgroundColor: "#F0EDFF",
    justifyContent: "center",
    alignItems: "center",
  },
  rowCopy: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: StaticColors.text.primary,
    marginBottom: 2,
  },
  rowDescription: {
    fontSize: 12,
    color: StaticColors.text.secondary,
    lineHeight: 16,
  },
  footerText: {
    fontSize: 12,
    color: StaticColors.text.secondary,
    textAlign: "center",
    lineHeight: 18,
    marginTop: 8,
  },
});
