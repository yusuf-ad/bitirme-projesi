import EnergyIcon from "@/assets/icons/energy-icon";
import { Colors } from "@/constants/theme";
import CalorieProgressBar from "@/shared/components/calorie-progress-bar";
import { StyleSheet, Text, View } from "react-native";
import MacroCardsSection from "./macro-cards-section";

interface DailyOverviewProps {
  totalCalories?: number;
}

export default function DailyOverview({ totalCalories = 0 }: DailyOverviewProps) {
  const goalCalories = 2200;

  return (
    <View style={styles.container}>
      {/* Meal Header */}
      <View style={styles.header}>
        <View style={styles.mealInfo}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <EnergyIcon color={Colors.lilac[900]} width={16} height={16} />
            <Text style={styles.mealType}>Daily Overview</Text>
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <CalorieProgressBar
        currentValue={totalCalories}
        goalValue={goalCalories}
      />

      {/* Macro Cards */}
      <MacroCardsSection />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    justifyContent: "center",
    alignItems: "center",
  },
  mealIcon: {
    width: 40,
    height: 40,
  },
  mealInfo: {
    justifyContent: "center",
    gap: 4,
  },
  mealType: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text.primary,
  },
  mealTime: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 21,
    color: Colors.gray[400],
  },
  arrowButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  recipeImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  recipeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeTextContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
    padding: 4,
  },
  recipeName: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  recipeDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    width: 16,
    height: 16,
  },
  metaText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    color: Colors.gray[600],
  },
  separator: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    letterSpacing: -1,
    color: Colors.gray[600],
  },
});
