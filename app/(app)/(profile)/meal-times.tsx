import { ProfessionalLoadingScreen } from "@/components/ProfessionalLoadingScreen";
import { Colors as StaticColors, getThemeColors } from "@/constants/theme";
import { TimePicker } from "@/features/onboarding/sections/meal-time/components/time-picker";
import { useHaptics } from "@/hooks/useHaptics";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/lib/supabase";
import { updateUserMealTimes } from "@/lib/supabase-onboarding";
import { useOnboarding } from "@/providers/onboarding-provider";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MealType = "breakfast" | "lunch" | "dinner";

interface TimeValue {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

export default function MealTimesScreen() {
  const onboarding = useOnboarding();
  const { top, bottom } = useSafeAreaInsets();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const { selection } = useHaptics();

  const [editingMeal, setEditingMeal] = useState<MealType | null>(null);
  const [tempTime, setTempTime] = useState<TimeValue | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Animation for modal
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    onboarding.loadOnboardingData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (editingMeal) {
      Animated.spring(modalAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [editingMeal, modalAnim]);

  const formatTime = (time: TimeValue) => {
    return `${time.hour}:${time.minute.toString().padStart(2, "0")} ${time.period}`;
  };

  const getMealTime = (meal: MealType): TimeValue => {
    switch (meal) {
      case "breakfast":
        return onboarding.breakfastTime;
      case "lunch":
        return onboarding.lunchTime;
      case "dinner":
        return onboarding.dinnerTime;
    }
  };

  const getMealIcon = (meal: MealType) => {
    switch (meal) {
      case "breakfast":
        return "weather-sunset-up";
      case "lunch":
        return "white-balance-sunny";
      case "dinner":
        return "weather-night";
    }
  };

  const getMealEmoji = (meal: MealType) => {
    switch (meal) {
      case "breakfast":
        return "🍳";
      case "lunch":
        return "🥗";
      case "dinner":
        return "🍽️";
    }
  };

  const handleEditMeal = (meal: MealType) => {
    selection();
    setTempTime(getMealTime(meal));
    setEditingMeal(meal);
  };

  const handleTimeChange = (hour: number, minute: number, period: "AM" | "PM") => {
    setTempTime({ hour, minute, period });
  };

  const handleSave = async () => {
    if (!editingMeal || !tempTime) return;

    selection();
    setIsSaving(true);

    try {
      // Update local state
      switch (editingMeal) {
        case "breakfast":
          onboarding.setBreakfastTime(tempTime);
          break;
        case "lunch":
          onboarding.setLunchTime(tempTime);
          break;
        case "dinner":
          onboarding.setDinnerTime(tempTime);
          break;
      }

      // Save directly to Supabase with the new time value
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const mealData = {
          breakfast: editingMeal === "breakfast" ? tempTime : onboarding.breakfastTime,
          lunch: editingMeal === "lunch" ? tempTime : onboarding.lunchTime,
          dinner: editingMeal === "dinner" ? tempTime : onboarding.dinnerTime,
        };
        await updateUserMealTimes(user.id, mealData);
      }

      setEditingMeal(null);
      setTempTime(null);
    } catch (error) {
      console.error("Failed to save meal time:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    selection();
    setEditingMeal(null);
    setTempTime(null);
  };

  if (onboarding.isLoading) {
    return <ProfessionalLoadingScreen />;
  }

  const meals: MealType[] = ["breakfast", "lunch", "dinner"];

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: Colors.background.primary }]}>
      {/* Header */}
      <View style={[
          styles.header, 
          { 
              backgroundColor: Colors.background.surface,
              borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#E5E5E5"
          }
      ]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <Text style={[styles.headerTitle, { color: Colors.text.primary }]}>{t("profile.mealTimes")}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Daily Schedule Section */}
        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("mealTimes.dailySchedule") || "DAILY SCHEDULE"}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          {meals.map((meal, index) => (
            <View key={meal}>
              <Pressable
                style={styles.mealTimeRow}
                onPress={() => handleEditMeal(meal)}
              >
                <View style={styles.mealTimeLeft}>
                  <View style={[styles.mealTimeIcon, { backgroundColor: isDark ? Colors.lilac[900] + "20" : Colors.lilac[100] }]}>
                    <MaterialCommunityIcons
                      name={getMealIcon(meal) as any}
                      size={22}
                      color={Colors.lilac[900]}
                    />
                  </View>
                  <View style={styles.mealTimeInfo}>
                    <Text style={[styles.mealTimeLabel, { color: Colors.text.primary }]}>
                      {t(`mealTimes.${meal}`)}
                    </Text>
                    <Text style={[styles.mealTimeValue, { color: Colors.text.secondary }]}>
                      {formatTime(getMealTime(meal))}
                    </Text>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="pencil-outline"
                  size={20}
                  color={Colors.text.secondary}
                />
              </Pressable>
              {index < meals.length - 1 && <View style={[styles.divider, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F0F0" }]} />}
            </View>
          ))}
        </View>

        {/* Notifications Link */}
        <Text style={[styles.sectionLabel, { color: Colors.text.secondary }]}>{t("mealTimes.reminders") || "REMINDERS"}</Text>
        <View style={[styles.card, { backgroundColor: Colors.background.surface }]}>
          <Pressable
            style={styles.linkRow}
            onPress={() => {
              selection();
              router.push("/(app)/(profile)/notifications");
            }}
          >
            <View style={styles.linkLeft}>
              <View style={[styles.linkIcon, { backgroundColor: isDark ? Colors.background.secondary : "#F5F5F5" }]}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={20}
                  color={Colors.lilac[900]}
                />
              </View>
              <View style={styles.linkInfo}>
                <Text style={[styles.linkTitle, { color: Colors.text.primary }]}>
                  {t("mealTimes.mealReminders") || "Meal Reminders"}
                </Text>
                <Text style={[styles.linkDescription, { color: Colors.text.secondary }]}>
                  {t("mealTimes.mealRemindersDesc") || "Get notified when it's time to eat"}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={22}
              color={Colors.text.secondary}
            />
          </Pressable>
        </View>

        {/* Footer Text */}
        <Text style={[styles.footerText, { color: Colors.text.secondary }]}>
          {t("mealTimes.footerText") || "Your meal times are used to schedule reminders and personalize your meal plan recommendations."}
        </Text>
      </ScrollView>

      {/* Time Picker Modal */}
      <Modal
        visible={editingMeal !== null}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={handleCancel} />
          <Animated.View
            style={[
              styles.modalContent,
              {
                backgroundColor: Colors.background.surface,
                transform: [
                  {
                    scale: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
                opacity: modalAnim,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalEmoji}>
                {editingMeal && getMealEmoji(editingMeal)}
              </Text>
              <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>
                {editingMeal && t(`mealTimes.${editingMeal}`)}
              </Text>
              <Text style={[styles.modalSubtitle, { color: Colors.text.secondary }]}>
                {t("mealTimes.selectTime") || "Select your preferred time"}
              </Text>
            </View>

            {/* Time Picker */}
            <View style={styles.pickerContainer}>
              {tempTime && (
                <TimePicker
                  onTimeChange={handleTimeChange}
                  initialHour={tempTime.hour}
                  initialMinute={tempTime.minute}
                  initialPeriod={tempTime.period}
                />
              )}
            </View>

            {/* Modal Actions */}
            <View style={[styles.modalActions, { borderTopColor: isDark ? "rgba(255,255,255,0.1)" : "#F0F0F0" }]}>
              <Pressable
                style={[styles.cancelButton, { backgroundColor: isDark ? Colors.background.secondary : "#F5F5F5" }]}
                onPress={handleCancel}
              >
                <Text style={[styles.cancelButtonText, { color: Colors.text.secondary }]}>
                  {t("common.cancel")}
                </Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled, { backgroundColor: Colors.lilac[900] }]}
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? t("common.saving") || "Saving..." : t("common.save")}
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: StaticColors.background.secondary,
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
    color: StaticColors.text.primary,
  },
  headerRight: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  mealTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  mealTimeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  mealTimeIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: StaticColors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  mealTimeInfo: {
    gap: 2,
  },
  mealTimeLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: StaticColors.text.primary,
  },
  mealTimeValue: {
    fontSize: 14,
    color: StaticColors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginLeft: 52,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  linkLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: StaticColors.text.primary,
    marginBottom: 2,
  },
  linkDescription: {
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
    paddingHorizontal: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    width: "100%",
    maxWidth: 360,
    overflow: "hidden",
  },
  modalHeader: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  modalEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: StaticColors.text.primary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: StaticColors.text.secondary,
  },
  pickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: StaticColors.text.secondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: StaticColors.lilac[900],
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
