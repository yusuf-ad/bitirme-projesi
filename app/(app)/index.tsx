import { Colors } from "@/constants/theme";
import CalendarSection from "@/features/home/components/calendar-section";
import DailyOverview from "@/features/home/components/daily-overview";
import Header from "@/features/home/components/header";
import TodayMealsSection from "@/features/home/components/today-meals-section";
import { useAuthContext } from "@/hooks/use-auth-context";
import { useCallback, useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeTab() {
  const { session } = useAuthContext();
  const { bottom, top } = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const handleDateSelect = useCallback((date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    setSelectedDate(normalized);
  }, []);

  // Extract first name from user data or use default
  const fullName = session?.user?.user_metadata?.fullName || "User";
  const firstName = fullName.split(" ")[0];

  return (
    <ScrollView
      style={[styles.container, { paddingTop: top }]}
      showsVerticalScrollIndicator={false}
      // safe area boşluğu + tabbar yüksekliği
      contentContainerStyle={{
        paddingBottom: bottom + 52 * (Platform.OS === "ios" ? 1 : 2),
      }}
    >
      {/* Header */}
      <Header firstName={firstName} motivationText="Let's plan your meals" />

      {/* Calendar */}
      <CalendarSection
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Daily overview */}
      <DailyOverview />

      {/* Today's Meals */}
      <TodayMealsSection />
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
