import { ConfirmationModal } from "@/components/ConfirmationModal";
import { Colors, getThemeColors } from "@/constants/theme";
import { DateModal } from "@/features/meal-plan/components/date-modal";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useMealPlansQuery } from "@/hooks/use-meal-plans-query";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface QuickDateOption {
  dayShort: string;
  dateNum: number;
  date: Date;
}

export default function CreateMealPlan() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const startDateModalRef = useRef<BottomSheetModal>(null);
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[700];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const params = useLocalSearchParams<{ date?: string }>();
  const initialStartDate = (() => {
    if (params?.date) {
      const d = new Date(params.date);
      d.setHours(0, 0, 0, 0);
      // If param date is in the past, default to today
      if (d < today) {
        return new Date(today);
      }
      return d;
    }
    return new Date(today);
  })();

  const [startDate, setStartDate] = useState<Date>(initialStartDate);
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);

  const { session } = useAuthContext();
  const { data: mealPlanData } = useMealPlansQuery(
    session?.user?.id,
    startDate
  );
  const hasExistingPlan = !!mealPlanData?.plan;
  const hasMeals = (mealPlanData?.items?.length ?? 0) > 0;

  // Check if selected date is in the past
  const isPastDate = useMemo(() => {
    const normalizedStartDate = new Date(startDate);
    normalizedStartDate.setHours(0, 0, 0, 0);
    return normalizedStartDate < today;
  }, [startDate]);

  // Quick select - next 7 days
  const quickDateOptions = useMemo((): QuickDateOption[] => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const options: QuickDateOption[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      options.push({
        dayShort: days[date.getDay()],
        dateNum: date.getDate(),
        date,
      });
    }
    return options;
  }, []);

  const isDateSelected = useCallback(
    (date: Date): boolean => {
      return (
        date.getDate() === startDate.getDate() &&
        date.getMonth() === startDate.getMonth() &&
        date.getFullYear() === startDate.getFullYear()
      );
    },
    [startDate]
  );

  const checkIsToday = useCallback((date: Date): boolean => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isToday = (date: Date): boolean => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isTomorrow = (date: Date): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return (
      date.getDate() === tomorrow.getDate() &&
      date.getMonth() === tomorrow.getMonth() &&
      date.getFullYear() === tomorrow.getFullYear()
    );
  };

  const formatDateDisplay = (
    date: Date
  ): { day: string; date: string; label: string } => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[date.getDay()];
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const dateNum = date.getDate();
    const year = date.getFullYear();

    let label = "";
    if (isToday(date)) label = "Today";
    else if (isTomorrow(date)) label = "Tomorrow";

    return {
      day: dayName,
      date: `${month} ${dateNum}, ${year}`,
      label,
    };
  };

  const startDateDisplay = formatDateDisplay(startDate);

  const handleStartDatePress = () => {
    startDateModalRef.current?.present();
  };

  const handleStartDateSelect = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    // Prevent selecting past dates
    if (normalized < today) {
      Alert.alert(
        "Invalid date",
        "You can only create meal plans for today or future dates."
      );
      return;
    }

    setStartDate(date);
    startDateModalRef.current?.close();
  };

  const handleQuickSelect = useCallback((date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    // Prevent selecting past dates (safety check)
    if (normalized < today) {
      return;
    }

    setStartDate(date);
  }, []);

  const handleNext = () => {
    // Prevent navigation if past date selected (safety check)
    if (isPastDate) {
      Alert.alert(
        "Invalid date",
        "You can only create meal plans for today or future dates."
      );
      return;
    }

    // Show confirmation if there's an existing meal plan with meals
    if (hasExistingPlan && hasMeals) {
      setShowOverwriteModal(true);
      return;
    }

    router.push({
      pathname: "/(plan)/select-meals",
      params: {
        startDate: startDate.toISOString(),
      },
    });
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: themeColors.background.primary,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}
      <Animated.View entering={FadeIn.duration(300)} style={[styles.header, { backgroundColor: themeColors.background.primary, borderColor: isDark ? themeColors.border.light : Colors.lilac[100] }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.headerButton, { backgroundColor: isDark ? themeColors.background.surface : Colors.gray[100] }]}
          hitSlop={12}
        >
          <Ionicons name="close" size={24} color={themeColors.text.primary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Create Meal Plan</Text>
        <View style={styles.headerButtonPlaceholder} />
      </Animated.View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animated.View
          entering={FadeInDown.duration(400).delay(100)}
          style={styles.heroSection}
        >
          <LinearGradient
            colors={isDark ? ["rgba(191, 90, 242, 0.2)", "rgba(191, 90, 242, 0.1)"] : [Colors.lilac[100], Colors.lilac[200]]}
            style={styles.iconContainer}
          >
            <Ionicons
              name="calendar-outline"
              size={44}
              color={accentColor}
            />
          </LinearGradient>
          <Text style={[styles.heroTitle, { color: themeColors.text.primary }]}>Choose Your Date</Text>
          <Text style={[styles.heroDescription, { color: themeColors.text.secondary }]}>
            Select a date to create your personalized meal plan
          </Text>
        </Animated.View>

        {/* Selected Date Card */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(200)}
          style={styles.selectedDateSection}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text.tertiary }]}>SELECTED DATE</Text>
          <Pressable
            onPress={handleStartDatePress}
            style={[styles.selectedDateCard, { backgroundColor: themeColors.background.surface }]}
          >
            <View style={styles.dateCardLeft}>
              <View style={[styles.calendarIconWrapper, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100] }]}>
                <Ionicons name="calendar" size={24} color={accentColor} />
              </View>
              <View style={styles.dateInfo}>
                {startDateDisplay.label ? (
                  <View style={[styles.labelBadge, { backgroundColor: accentColor }]}>
                    <Text style={styles.labelBadgeText}>
                      {startDateDisplay.label}
                    </Text>
                  </View>
                ) : null}
                <Text style={[styles.dayName, { color: themeColors.text.primary }]}>{startDateDisplay.day}</Text>
                <Text style={[styles.fullDate, { color: themeColors.text.secondary }]}>{startDateDisplay.date}</Text>
              </View>
            </View>
            <View style={[styles.changeButton, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100] }]}>
              <Text style={[styles.changeButtonText, { color: accentColor }]}>Change</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={accentColor}
              />
            </View>
          </Pressable>
        </Animated.View>

        {/* Quick Select Section */}
        <Animated.View
          entering={FadeInUp.duration(400).delay(350)}
          style={styles.quickSelectSection}
        >
          <Text style={[styles.sectionLabel, { color: themeColors.text.tertiary }]}>QUICK SELECT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickSelectRow}
          >
            {quickDateOptions.map((option, index) => {
              const selected = isDateSelected(option.date);
              const isTodayDate = checkIsToday(option.date);
              const isTodayNotSelected = isTodayDate && !selected;

              return (
                <Animated.View
                  key={option.date.toISOString()}
                  entering={FadeInUp.duration(300).delay(400 + index * 50)}
                >
                  <Pressable
                    onPress={() => handleQuickSelect(option.date)}
                    style={({ pressed }) => [
                      styles.quickDateCard,
                      { backgroundColor: themeColors.background.surface },
                      selected && [styles.quickDateCardSelected, { backgroundColor: accentColor }],
                      isTodayNotSelected && [styles.quickDateCardToday, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100], borderColor: accentColor }],
                      pressed && styles.quickDateCardPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayShortText,
                        { color: themeColors.text.secondary },
                        selected && styles.dayShortTextSelected,
                      ]}
                    >
                      {option.dayShort}
                    </Text>
                    <Text
                      style={[
                        styles.dateNumText,
                        { color: themeColors.text.primary },
                        selected && styles.dateNumTextSelected,
                      ]}
                    >
                      {option.dateNum}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Warning Message */}
        {hasExistingPlan && hasMeals && (
          <Animated.View
            entering={FadeInUp.duration(400).delay(600)}
            style={styles.warningContainer}
          >
            <View style={styles.warningIconWrapper}>
              <Ionicons
                name="alert-circle"
                size={22}
                color={Colors.semantic.warning.dark}
              />
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Plan Already Exists</Text>
              <Text style={styles.warningText}>
                A meal plan already exists for this date. Creating a new one
                will replace it.
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer */}
      <Animated.View
        entering={FadeInUp.duration(400).delay(650)}
        style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: themeColors.background.primary, borderTopColor: themeColors.border.light }]}
      >
        <CustomButton
          containerStyle={[
            styles.nextButton,
            { backgroundColor: accentColor },
            isPastDate && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isPastDate}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </CustomButton>
      </Animated.View>

      <DateModal
        ref={startDateModalRef}
        dateType="start"
        currentDate={startDate}
        onDateSelect={handleStartDateSelect}
      />

      <ConfirmationModal
        visible={showOverwriteModal}
        onClose={() => setShowOverwriteModal(false)}
        onConfirm={() => {
          setShowOverwriteModal(false);
          router.push({
            pathname: "/(plan)/select-meals",
            params: {
              startDate: startDate.toISOString(),
            },
          });
        }}
        title="Overwrite Existing Plan?"
        description="A meal plan already exists for this date. Creating a new one will replace it."
        confirmText="Continue"
        cancelText="Cancel"
        confirmStyle="destructive"
        icon="swap-horizontal"
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.background.primary,
    borderColor: Colors.lilac[100],
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonPlaceholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 8,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 21,
    color: Colors.text.secondary,
    textAlign: "center",
  },
  selectedDateSection: {
    marginBottom: 24,
  },
  quickSelectSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text.tertiary,
    marginBottom: 14,
    letterSpacing: 0.8,
  },
  quickSelectRow: {
    flexDirection: "row",
    gap: 12,
    paddingRight: 20,
  },
  quickDateCard: {
    width: 52,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.background.surface,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    opacity: 0.6,
  },
  quickDateCardSelected: {
    backgroundColor: Colors.lilac[900],
    opacity: 1,
  },
  quickDateCardToday: {
    backgroundColor: Colors.lilac[100],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors.lilac[500],
  },
  quickDateCardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  dayShortText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.gray[700],
    letterSpacing: 0.3,
  },
  dayShortTextSelected: {
    color: Colors.background.primary,
  },
  dateNumText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.gray[700],
  },
  dateNumTextSelected: {
    color: Colors.background.primary,
  },
  selectedDateCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background.primary,
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dateCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  calendarIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  dateInfo: {
    gap: 2,
  },
  labelBadge: {
    backgroundColor: Colors.lilac[600],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  labelBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayName: {
    fontSize: 17,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  fullDate: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  changeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[700],
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.semantic.warning.light,
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.semantic.warning.main,
  },
  warningIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 230, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.semantic.warning.dark,
    marginBottom: 4,
  },
  warningText: {
    fontSize: 13,
    color: Colors.semantic.warning.dark,
    lineHeight: 18,
    opacity: 0.85,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.background.primary,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    backgroundColor: Colors.lilac[800],
    borderRadius: 14,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
});
