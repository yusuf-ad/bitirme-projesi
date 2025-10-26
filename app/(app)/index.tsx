import { Colors } from "@/constants/theme";
import { DailyOverview } from "@/features/home";
import CalendarSection from "@/features/home/components/calendar-section";
import Header from "@/features/home/components/header";
import type { MealPlanItemRecord, MealPlanRecord } from "@/features/meal-plan";
import { DailyMealsList, MealPlanEmptyState } from "@/features/meal-plan";
import { useAuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const formatDateForQuery = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function MealplanTab() {
  const { session } = useAuthContext();
  const { bottom, top } = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [activePlan, setActivePlan] = useState<MealPlanRecord | null>(null);
  const [dailyItems, setDailyItems] = useState<MealPlanItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract first name from user data or use default
  const fullName = session?.user?.user_metadata?.fullName || "User";
  const firstName = fullName.split(" ")[0];

  function handleCreateMealPlan() {
    router.push("/(plan)/create");
  }

  const handleDateSelect = useCallback((date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    setSelectedDate(normalized);
  }, []);

  // Pull the active plan for the selected date and load that day's meals.
  const fetchMealsForDate = useCallback(
    async (date: Date) => {
      const userId = session?.user?.id;
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const dateString = formatDateForQuery(date);

        const { data: plans, error: planError } = await supabase
          .from("meal_plans")
          .select("id, user_id, name, start_date, end_date")
          .eq("user_id", userId)
          .lte("start_date", dateString)
          .gte("end_date", dateString)
          .order("start_date", { ascending: false })
          .limit(1);

        if (planError) {
          throw planError;
        }

        if (!plans || plans.length === 0) {
          setActivePlan(null);
          setDailyItems([]);
          return;
        }

        const plan = plans[0];
        setActivePlan(plan);

        const { data: items, error: itemsError } = await supabase
          .from("meal_plan_items")
          .select(
            "id, meal_plan_id, spoonacular_recipe_id, recipe_name, recipe_image_url, calories_per_serving, ready_in_minutes, meal_date, meal_type"
          )
          .eq("meal_plan_id", plan.id)
          .eq("meal_date", dateString)
          .order("meal_type", { ascending: true });

        if (itemsError) {
          throw itemsError;
        }

        setDailyItems(items ?? []);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Unable to load meal plan.";
        setError(message);
        setActivePlan(null);
        setDailyItems([]);
      } finally {
        setIsLoading(false);
      }
    },
    [session?.user?.id]
  );

  useEffect(() => {
    fetchMealsForDate(selectedDate);
  }, [fetchMealsForDate, selectedDate]);

  const hasMeals = dailyItems.length > 0;

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      showsVerticalScrollIndicator={false}
      // safe area boşluğu + tabbar yüksekliği
      contentContainerStyle={{
        paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2),
      }}
      bounces={false}
    >
      {/* Header */}
      <Header firstName={firstName} motivationText="Let's plan your meals!" />

      {/* Calendar */}
      <CalendarSection
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Meals for selected date */}
      <View
        style={[
          styles.section,
          {
            paddingBottom: bottom,
          },
        ]}
      >
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color={Colors.lilac[900]} />
          </View>
        ) : hasMeals ? (
          <>
            <View style={styles.section}>
              <DailyOverview />
            </View>

            <DailyMealsList items={dailyItems} selectedDate={selectedDate} />
          </>
        ) : (
          <MealPlanEmptyState onCreatePress={handleCreateMealPlan} />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: Colors.background.secondary,
  },
  section: {
    paddingTop: 8,
  },
  loaderContainer: {
    paddingVertical: 32,
  },
});
