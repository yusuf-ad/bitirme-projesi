import { getThemeColors } from "@/constants/theme";
import { DailyOverview } from "@/features/home";
import CalendarSection from "@/features/home/components/calendar-section";
import Header from "@/features/home/components/header";
import { DailyMealsList, MealPlanEmptyState } from "@/features/meal-plan";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useMealPlansQuery } from "@/hooks/use-meal-plans-query";
import { useTheme } from "@/providers/theme-provider";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  StyleSheet,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MealplanTab() {
  const { session } = useAuthContext();
  const { bottom, top } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true); // true = content tab (lighter dark mode)
  const params = useLocalSearchParams<{ date?: string }>();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [hasHydratedInitialDate, setHasHydratedInitialDate] = useState(false);

  // Animated container for smooth theme transitions
  const containerAnimation = useAnimatedStyle(() => ({
    backgroundColor: withTiming(Colors.background.secondary, { duration: 300 }),
  }));

  useEffect(() => {
    if (hasHydratedInitialDate) {
      return;
    }
    const rawParam = Array.isArray(params.date) ? params.date[0] : params.date;
    if (!rawParam) {
      setHasHydratedInitialDate(true);
      return;
    }
    const parsed = new Date(rawParam);
    if (!Number.isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      setSelectedDate(parsed);
    }
    setHasHydratedInitialDate(true);
  }, [params.date, hasHydratedInitialDate]);

  const { data, isLoading, refetch } = useMealPlansQuery(
    session?.user?.id,
    selectedDate
  );

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

  const hasMeals = (data?.items?.length ?? 0) > 0;

  // Calculate total calories from meal plan items
  const totalCalories =
    data?.items?.reduce((total, item) => {
      return total + (item.calories_per_serving || 0);
    }, 0) ?? 0;

  // Calculate total macros from meal plan items
  const totalCarbs =
    data?.items?.reduce((total, item) => {
      return total + (item.carbs_per_serving || 0);
    }, 0) ?? 0;

  const totalProtein =
    data?.items?.reduce((total, item) => {
      return total + (item.protein_per_serving || 0);
    }, 0) ?? 0;

  const totalFat =
    data?.items?.reduce((total, item) => {
      return total + (item.fat_per_serving || 0);
    }, 0) ?? 0;

  return (
    <Animated.ScrollView
      style={[styles.container, containerAnimation, { paddingTop: top }]}
      showsVerticalScrollIndicator={false}
      // safe area boşluğu + tabbar yüksekliği
      contentContainerStyle={{
        paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2),
      }}
      bounces={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={() => refetch()}
          tintColor={isDark ? Colors.lilac[400] : Colors.lilac[900]}
        />
      }
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
              <DailyOverview
                totalCalories={totalCalories}
                totalCarbs={totalCarbs}
                totalProtein={totalProtein}
                totalFat={totalFat}
              />
            </View>

            <DailyMealsList items={data!.items} selectedDate={selectedDate} />
          </>
        ) : (
          <MealPlanEmptyState onCreatePress={handleCreateMealPlan} />
        )}
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    paddingTop: 8,
  },
  loaderContainer: {
    paddingVertical: 32,
  },
});
