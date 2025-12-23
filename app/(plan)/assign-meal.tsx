import { Colors, getThemeColors } from "@/constants/theme";
import { DateModal } from "@/features/meal-plan/components/date-modal";
import { MealSlot } from "@/features/meal-plan/types";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { getUserMealTimes } from "@/lib/supabase-onboarding";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { StickyFooter } from "@/shared/components/sticky-footer";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    AccessibilityInfo,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type MealTypeOption = {
  id: MealSlot;
  label: string;
  window: string;
  icon: ReturnType<typeof require>;
};

type RecipePlanPayload = {
  id: number;
  title: string;
  image?: string | null;
  readyInMinutes?: number | null;
  macros?: {
    calories?: number | null;
    carbs?: number | null;
    protein?: number | null;
    fat?: number | null;
  } | null;
};

const MEAL_TYPE_OPTIONS: MealTypeOption[] = [
  {
    id: "breakfast",
    label: "Breakfast",
    window: "07:00 - 08:00",
    icon: require("@/assets/icons/breakfast-icon.svg"),
  },
  {
    id: "lunch",
    label: "Lunch",
    window: "12:00 - 13:00",
    icon: require("@/assets/icons/lunch-icon.svg"),
  },
  {
    id: "dinner",
    label: "Dinner",
    window: "19:00 - 20:00",
    icon: require("@/assets/icons/dinner-icon.svg"),
  },
];

const formatDateForStorage = (date: Date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${normalized.getFullYear()}-${pad(normalized.getMonth() + 1)}-${pad(
    normalized.getDate()
  )}`;
};

const formatDisplayDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return formatter.format(date);
};

const normalizeNumber = (value?: number | null, precision: number = 2) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
};

const ensurePlanForDate = async (userId: string, mealDate: string) => {
  const { data: existingPlans, error: planError } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", userId)
    .lte("start_date", mealDate)
    .gte("end_date", mealDate)
    .order("start_date", { ascending: false })
    .limit(1);

  if (planError) {
    throw planError;
  }

  if (existingPlans && existingPlans.length > 0) {
    return existingPlans[0].id;
  }

  const { data: newPlan, error: insertError } = await supabase
    .from("meal_plans")
    .insert([
      {
        user_id: userId,
        name: `Plan ${mealDate}`,
        start_date: mealDate,
        end_date: mealDate,
      },
    ])
    .select("id")
    .single();

  if (insertError) {
    throw insertError;
  }

  if (!newPlan) {
    throw new Error("Meal plan could not be created.");
  }

  return newPlan.id;
};

export default function AssignMealScreen() {
  const router = useRouter();
  const { session } = useAuthContext();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark);
  const queryClient = useQueryClient();
  const { top, bottom } = useSafeAreaInsets();
  const dateModalRef = useRef<BottomSheetModal>(null);

  const [mealOptions, setMealOptions] = useState<MealTypeOption[]>(MEAL_TYPE_OPTIONS);

  useEffect(() => {
    async function fetchMealTimes() {
      if (!session?.user?.id) return;
      
      const times = await getUserMealTimes(session.user.id);
      if (!times) return;

      const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(":").map(Number);
        const endH = (h + 1) % 24;
        const pad = (n: number) => n.toString().padStart(2, "0");
        return `${pad(h)}:${pad(m)} - ${pad(endH)}:${pad(m)}`;
      };

      setMealOptions((prev) =>
        prev.map((opt) => {
          let customTime = null;
          if (opt.id === "breakfast" && times.breakfast_time) {
            customTime = formatTime(times.breakfast_time);
          } else if (opt.id === "lunch" && times.lunch_time) {
            customTime = formatTime(times.lunch_time);
          } else if (opt.id === "dinner" && times.dinner_time) {
            customTime = formatTime(times.dinner_time);
          }
          
          if (customTime) {
            return { ...opt, window: customTime };
          }
          return opt;
        })
      );
    }
    fetchMealTimes();
  }, [session?.user?.id]);

  const params = useLocalSearchParams<{ recipe?: string; mealSlot?: string }>();
  const payload = useMemo<RecipePlanPayload | null>(() => {
    const rawValue = Array.isArray(params.recipe)
      ? params.recipe[0]
      : params.recipe;
    if (!rawValue) {
      return null;
    }
    try {
      const parsed = JSON.parse(rawValue);
      if (typeof parsed?.id !== "number" || typeof parsed?.title !== "string") {
        return null;
      }
      return parsed as RecipePlanPayload;
    } catch (error) {
      console.warn("Failed to parse recipe payload", error);
      return null;
    }
  }, [params.recipe]);

  const today = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  })();

  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [selectedMealType, setSelectedMealType] = useState<MealSlot>(() => {
    const mealSlotParam = params.mealSlot;
    if (
      mealSlotParam === "breakfast" ||
      mealSlotParam === "lunch" ||
      mealSlotParam === "dinner"
    ) {
      return mealSlotParam;
    }
    return "breakfast";
  });
  const [isSaving, setIsSaving] = useState(false);

  const imageSource = payload?.image ? { uri: payload.image } : null;

  const macros = [
    {
      label: "Calories",
      value:
        typeof payload?.macros?.calories === "number"
          ? `${Math.round(payload.macros.calories)} kcal`
          : "—",
    },
    {
      label: "Protein",
      value:
        typeof payload?.macros?.protein === "number"
          ? `${Math.round(payload.macros.protein)}g`
          : "—",
    },
    {
      label: "Carbs",
      value:
        typeof payload?.macros?.carbs === "number"
          ? `${Math.round(payload.macros.carbs)}g`
          : "—",
    },
    {
      label: "Fat",
      value:
        typeof payload?.macros?.fat === "number"
          ? `${Math.round(payload.macros.fat)}g`
          : "—",
    },
  ];

  const handleMealTypePress = useCallback(
    async (option: MealSlot) => {
      if (selectedMealType === option) {
        return;
      }
      await Haptics.selectionAsync();
      setSelectedMealType(option);
    },
    [selectedMealType]
  );

  const handleOpenDatePicker = useCallback(async () => {
    await Haptics.selectionAsync();
    dateModalRef.current?.present();
  }, []);

  const handleDateSelect = useCallback((date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    setSelectedDate(normalized);
  }, []);

  const handleAddToPlan = useCallback(async () => {
    if (!payload) {
      return;
    }

    if (!session?.user?.id) {
      Alert.alert(
        "Sign in required",
        "You need to sign in to save meals to your plan."
      );
      return;
    }

    // Check if selected date is in the past
    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    if (normalizedSelectedDate < today) {
      Alert.alert(
        "Cannot add to past date",
        "You can only add meals to today or future dates."
      );
      return;
    }

    setIsSaving(true);

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const mealDateString = formatDateForStorage(selectedDate);
      const planId = await ensurePlanForDate(session.user.id, mealDateString);

      const itemPayload = {
        spoonacular_recipe_id: payload.id,
        recipe_name: payload.title,
        recipe_image_url: payload.image || null,
        ready_in_minutes: payload.readyInMinutes ?? null,
        calories_per_serving:
          typeof payload?.macros?.calories === "number"
            ? Math.round(payload.macros.calories)
            : null,
        carbs_per_serving: normalizeNumber(payload?.macros?.carbs),
        protein_per_serving: normalizeNumber(payload?.macros?.protein),
        fat_per_serving: normalizeNumber(payload?.macros?.fat),
        meal_date: mealDateString,
        meal_type: selectedMealType,
      };

      const { data: existingItems, error: existingError } = await supabase
        .from("meal_plan_items")
        .select("id")
        .eq("meal_plan_id", planId)
        .eq("meal_date", mealDateString)
        .eq("meal_type", selectedMealType)
        .limit(1);

      if (existingError) {
        throw existingError;
      }

      if (existingItems && existingItems.length > 0) {
        const { error: updateError } = await supabase
          .from("meal_plan_items")
          .update(itemPayload)
          .eq("id", existingItems[0].id);

        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from("meal_plan_items")
          .insert([{ ...itemPayload, meal_plan_id: planId }]);

        if (insertError) {
          throw insertError;
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["meal-plans"],
      });

      AccessibilityInfo.announceForAccessibility("Meal scheduled");

      router.replace({
        pathname: "/(app)",
        params: { date: mealDateString },
      });
    } catch (error) {
      console.error("Failed to add meal to plan", error);
      const message =
        error instanceof Error
          ? error.message
          : "Please try again in a moment.";
      Alert.alert("Unable to add meal", message);
    } finally {
      setIsSaving(false);
    }
  }, [
    payload,
    session?.user?.id,
    selectedDate,
    selectedMealType,
    queryClient,
    router,
  ]);

  const renderContent = () => {
    if (!payload) {
      return (
        <View style={styles.errorState}>
          <Text style={[styles.errorTitle, { color: themeColors.text.primary }]}>Recipe unavailable</Text>
          <Text style={[styles.errorDescription, { color: themeColors.text.secondary }]}>
            We couldn&apos;t load the recipe details. Please return to the
            recipes list and try again.
          </Text>
          <CustomButton
            onPress={() => router.back()}
            containerStyle={[styles.errorButton, { backgroundColor: isDark ? themeColors.accent.lilac : Colors.lilac[900] }]}
          >
            <Text style={styles.errorButtonText}>Go back</Text>
          </CustomButton>
        </View>
      );
    }

    return (
      <>
        <ScrollView
          style={[styles.scrollView, { backgroundColor: themeColors.background.primary }]}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.recipeCard, { 
              backgroundColor: isDark ? themeColors.background.surface : Colors.background.surface,
              shadowOpacity: isDark ? 0.3 : 0.12,
            }]}>
            <View style={[styles.recipeImageWrapper, { backgroundColor: themeColors.background.tertiary }]}>
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={styles.recipeImage}
                  contentFit="cover"
                  transition={200}
                  accessibilityLabel={`${payload.title} cover`}
                />
              ) : (
                <View
                  style={[styles.recipeImage, styles.recipeImagePlaceholder, { backgroundColor: themeColors.background.tertiary }]}
                />
              )}
              {payload.readyInMinutes && (
                <View style={[styles.timeBadge, { backgroundColor: "rgba(0, 0, 0, 0.7)" }]}>
                  <Text style={[styles.timeBadgeText, { color: "#fff" }]}>
                    {payload.readyInMinutes} min
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.recipeContent}>
              <View style={styles.recipeHeader}>
                <Text style={[styles.recipeTitle, { color: themeColors.text.primary }]} numberOfLines={2}>
                  {payload.title}
                </Text>
                <Text style={[styles.recipeCalories, { color: isDark ? themeColors.accent.lilac : Colors.lilac[900] }]}>{macros[0].value}</Text>
              </View>

              <View style={[styles.macroGrid, { backgroundColor: isDark ? themeColors.background.tertiary : Colors.lilac[100] }]}>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: isDark ? themeColors.text.primary : Colors.lilac[900] }]}>{macros[1].value}</Text>
                  <Text style={[styles.macroLabel, { color: themeColors.text.secondary }]}>Protein</Text>
                </View>
                <View style={[styles.macroDivider, { backgroundColor: isDark ? themeColors.border.medium : Colors.lilac[300] }]} />
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: isDark ? themeColors.text.primary : Colors.lilac[900] }]}>{macros[2].value}</Text>
                  <Text style={[styles.macroLabel, { color: themeColors.text.secondary }]}>Carbs</Text>
                </View>
                <View style={[styles.macroDivider, { backgroundColor: isDark ? themeColors.border.medium : Colors.lilac[300] }]} />
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, { color: isDark ? themeColors.text.primary : Colors.lilac[900] }]}>{macros[3].value}</Text>
                  <Text style={[styles.macroLabel, { color: themeColors.text.secondary }]}>Fat</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Choose a meal slot</Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
              Pick where this recipe fits best in your routine.
            </Text>
            <View style={styles.mealOptions}>
              {mealOptions.map((option) => {
                const isActive = selectedMealType === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => handleMealTypePress(option.id)}
                    style={({ pressed }) => [
                      styles.mealOption,
                      { 
                        backgroundColor: isActive 
                            ? (isDark ? themeColors.background.tertiary : Colors.lilac[100])
                            : (isDark ? themeColors.background.surface : Colors.background.surface),
                        borderColor: isActive 
                            ? (isDark ? themeColors.accent.lilac : Colors.lilac[900])
                            : (isDark ? themeColors.border.light : Colors.gray[200]),
                      },
                      pressed && styles.mealOptionPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <View style={styles.mealOptionHeader}>
                      <Image
                        source={option.icon as any}
                        style={[styles.mealOptionIcon, { tintColor: isActive && isDark ? themeColors.accent.lilac : (isDark ? themeColors.text.primary : undefined) }]}
                      />
                      <Text
                        style={[
                          styles.mealOptionLabel,
                          { color: isActive ? (isDark ? themeColors.accent.lilac : Colors.text.primary) : themeColors.text.primary },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </View>
                    <Text style={[styles.mealOptionWindow, { color: themeColors.text.secondary }]}>{option.window}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text.primary }]}>Select a day</Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.text.secondary }]}>
              Today is selected by default. You can schedule ahead for the week.
            </Text>
            <Pressable
              onPress={handleOpenDatePicker}
              style={({ pressed }) => [
                styles.datePicker,
                { 
                    backgroundColor: isDark ? themeColors.background.surface : Colors.background.surface,
                    borderColor: themeColors.border.light 
                },
                pressed && styles.datePickerPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Choose meal date"
            >
              <View>
                <Text style={[styles.dateLabel, { color: themeColors.text.secondary }]}>Meal date</Text>
                <Text style={[styles.dateValue, { color: themeColors.text.primary }]}>
                  {formatDisplayDate(selectedDate)}
                </Text>
              </View>
              <Text style={[styles.dateHint, { color: isDark ? themeColors.accent.lilac : Colors.lilac[900] }]}>Change</Text>
            </Pressable>
          </View>
        </ScrollView>

        <StickyFooter
          text={isSaving ? "Adding..." : "Add to meal plan"}
          onPress={handleAddToPlan}
          isLoading={isSaving}
          containerStyle={styles.footer}
          accentColor={isDark ? themeColors.accent.lilac : Colors.lilac[900]}
        />
      </>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: top, backgroundColor: themeColors.background.primary }]}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View style={[styles.header, { borderBottomColor: themeColors.border.light }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.closeText, { color: isDark ? themeColors.accent.lilac : Colors.lilac[800] }]}>Close</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.text.primary }]}>Plan this recipe</Text>
        <View style={styles.headerRight} />
      </View>

      {renderContent()}

      <DateModal
        ref={dateModalRef}
        dateType="start"
        currentDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  headerRight: {
    width: 48,
  },
  closeText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.lilac[800],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 24,
  },
  recipeCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#7849B6",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  recipeImageWrapper: {
    width: "100%",
    height: 200,
    backgroundColor: Colors.gray[200],
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  recipeImagePlaceholder: {
    backgroundColor: Colors.gray[300],
  },
  timeBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backdropFilter: "blur(10px)",
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.inverse,
  },
  recipeContent: {
    padding: 20,
    gap: 16,
  },
  recipeHeader: {
    gap: 8,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 26,
  },
  recipeCalories: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  macroGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: Colors.lilac[100],
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.lilac[900],
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.text.secondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  macroDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.lilac[300],
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  mealOptions: {
    flexDirection: "row",
    gap: 12,
  },
  mealOption: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.background.surface,
    gap: 8,
    minHeight: 80,
    justifyContent: "center",
  },
  mealOptionPressed: {
    transform: [{ scale: 0.985 }],
  },
  mealOptionActive: {
    borderColor: Colors.lilac[900],
    backgroundColor: Colors.lilac[100],
  },
  mealOptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  mealOptionIcon: {
    width: 18,
    height: 18,
  },
  mealOptionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
    lineHeight: 18,
    flex: 1,
  },
  mealOptionLabelActive: {
    color: Colors.lilac[900],
  },
  mealOptionWindow: {
    fontSize: 11,
    color: Colors.gray[600],
    lineHeight: 14,
    fontWeight: "500",
  },
  datePicker: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border.light,
    padding: 16,
    backgroundColor: Colors.background.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  datePickerPressed: {
    transform: [{ scale: 0.99 }],
  },
  dateLabel: {
    fontSize: 13,
    color: Colors.gray[500],
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  dateHint: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lilac[900],
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: "center",
  },
  errorButton: {
    backgroundColor: Colors.lilac[900],
  },
  errorButtonText: {
    color: Colors.background.surface,
    fontSize: 16,
    fontWeight: "600",
  },
});
