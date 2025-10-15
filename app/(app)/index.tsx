import { Colors } from "@/constants/theme";
import CalendarDay from "@/features/home/components/calendar-day";
import DailyOverview from "@/features/home/components/daily-overview";
import MealCard from "@/features/home/components/meal-card";
import { mockCalendarDays, mockMeals } from "@/features/home/data/mock-data";
import { useAuthContext } from "@/hooks/use-auth-context";
import MacroCard from "@/shared/components/macro-card";
import { Image } from "expo-image";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function HomeTab() {
  const { session } = useAuthContext();
  const { bottom } = useSafeAreaInsets();

  // Extract first name from user data or use default
  const firstName =
    session?.user?.user_metadata?.full_name?.split(" ")[0] || "User";

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
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.greeting}>Hello, {firstName}!</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.profilePictureContainer}>
              <Image
                source={require("@/assets/images/profile-picture.png")}
                style={styles.profilePicture}
              />
            </View>
          </View>
        </View>

        {/* Calendar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.calendarScrollView}
          contentContainerStyle={styles.calendarContent}
        >
          {mockCalendarDays.map((day) => (
            <CalendarDay
              key={day.day}
              day={day.day}
              dayOfWeek={day.dayOfWeek}
              isSelected={day.isSelected}
            />
          ))}
        </ScrollView>

        {/* Daily overview */}
        <DailyOverview />

        {/* Macro Cards */}
        <View style={styles.macroCardsContainer}>
          <MacroCard
            label="Carbs"
            currentValue={241}
            maxValue={359}
            unit="g"
            color="#5B9FFF"
            lightColor="#DDE8FF"
            decorationColor="#A3C8FF"
          />
          <MacroCard
            label="Protein"
            currentValue={120}
            maxValue={143}
            unit="g"
            color="#4CAF50"
            lightColor="#D7F0D9"
            decorationColor="#337735ff"
          />
          <MacroCard
            label="Fat"
            currentValue={179}
            maxValue={370}
            unit="g"
            color="#FFB84D"
            lightColor="#FFF0D9"
            decorationColor="#a57733ff"
          />
        </View>

        {/* Today's Meals */}
        <View style={styles.todayMealsSection}>
          {mockMeals.map((meal) => (
            <MealCard
              key={meal.id}
              mealType={meal.mealType}
              mealTime={meal.mealTime}
              mealIcon={meal.mealIcon}
              recipeName={meal.recipeName}
              recipeDescription={meal.recipeDescription}
              recipeImage={meal.recipeImage}
              prepTime={meal.prepTime}
              calories={meal.calories}
            />
          ))}
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    color: Colors.text.primary,
    marginBottom: -4,
  },
  date: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[300],
    marginTop: 10,
  },
  headerRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profilePictureContainer: {
    width: 36,
    height: 36,
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  calendarScrollView: {
    marginHorizontal: -16,
    marginBottom: 24,
  },
  calendarContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  todayProgressSection: {
    gap: 12,
    marginBottom: 24,
  },
  todayProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    height: 16,
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  todayProgressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,
  },
  caloriesContainer: {
    width: 64,
    height: 38,
  },
  caloriesLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[400],
  },
  caloriesValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  fireIcon: {
    width: 16,
    height: 16,
  },
  caloriesValue: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 16,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  macroProgressContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  macroCardsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  todayMealsSection: {
    gap: 12,
    paddingBottom: 24,
  },
});
