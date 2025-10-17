import { Colors } from "@/constants/theme";
import CalendarSection from "@/features/home/components/calendar-section";
import DailyOverview from "@/features/home/components/daily-overview";
import Header from "@/features/home/components/header";
import TodayMealsSection from "@/features/home/components/today-meals-section";
import { useAuthContext } from "@/hooks/use-auth-context";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeTab() {
  const { session } = useAuthContext();
  const { bottom, top } = useSafeAreaInsets();

  // Extract first name from user data or use default
  const fullName = session?.user?.user_metadata?.fullName || "User";
  const firstName = fullName.split(" ")[0];

  // Format current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

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
      <Header firstName={firstName} formattedDate={formattedDate} />

      {/* Calendar */}
      <CalendarSection />

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
