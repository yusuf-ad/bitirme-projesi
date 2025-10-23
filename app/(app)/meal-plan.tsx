import { Colors } from "@/constants/theme";
import CalendarSection from "@/features/home/components/calendar-section";
import DailyOverview from "@/features/home/components/daily-overview";
import Header from "@/features/home/components/header";
import TodayMealsSection from "@/features/home/components/today-meals-section";
import { MealPlanEmptyState } from "@/features/meal-plan";
import { useAuthContext } from "@/hooks/use-auth-context";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MealplanTab() {
  const { session } = useAuthContext();
  const { bottom, top } = useSafeAreaInsets();
  const [hasMealPlan, setHasMealPlan] = useState(false);

  // Extract first name from user data or use default
  const fullName = session?.user?.user_metadata?.fullName || "User";
  const firstName = fullName.split(" ")[0];

  function handleCreateMealPlan() {
    router.push("/(plan)/create");
  }

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
      <CalendarSection />

      {/* Daily overview */}

      {/* Today's Meals */}
      {hasMealPlan ? (
        <>
          <DailyOverview />
          <TodayMealsSection />
        </>
      ) : (
        <MealPlanEmptyState onCreatePress={handleCreateMealPlan} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
