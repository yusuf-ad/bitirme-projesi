import { Colors } from "@/constants/theme";
import CalendarSection from "@/features/home/components/calendar-section";
import DailyOverview from "@/features/home/components/daily-overview";
import Header from "@/features/home/components/header";
import MacroCardsSection from "@/features/home/components/macro-cards-section";
import TodayMealsSection from "@/features/home/components/today-meals-section";
import { useAuthContext } from "@/hooks/use-auth-context";
import { ScrollView, StyleSheet } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HomeTab() {
  const { session } = useAuthContext();
  const { bottom } = useSafeAreaInsets();

  console.log("sesssiisisisison:", session, "fgdfjkhgdfjkghdfgkjdfhkdjhkfhdkj");

  // Extract first name from user data or use default
  const firstName = session?.user.email || "User";

  // Format current date
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        // safe araea boşluğu + tabbar yüksekliği
        contentContainerStyle={{ paddingBottom: bottom + 52 }}
      >
        {/* Header */}
        <Header firstName={firstName} formattedDate={formattedDate} />

        {/* Calendar */}
        <CalendarSection />

        {/* Daily overview */}
        <DailyOverview />

        {/* Macro Cards */}
        <MacroCardsSection />

        {/* Today's Meals */}
        <TodayMealsSection />
      </ScrollView>
    </SafeAreaView>
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
