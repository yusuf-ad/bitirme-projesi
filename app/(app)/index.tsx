import { Colors } from "@/constants/theme";
import { DailyOverview } from "@/features/home";
import CalendarSection from "@/features/home/components/calendar-section";
import Header from "@/features/home/components/header";
import { DailyMealsList, MealPlanEmptyState } from "@/features/meal-plan";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useMealPlansQuery } from "@/hooks/use-meal-plans-query";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MealplanTab() {
  const { session } = useAuthContext();
  const { bottom, top } = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

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

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
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
          tintColor={Colors.lilac[900]}
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
              <DailyOverview />
            </View>

            <DailyMealsList items={data!.items} selectedDate={selectedDate} />
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
