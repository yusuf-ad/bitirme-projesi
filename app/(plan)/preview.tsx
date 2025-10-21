import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Meal type badge colors
const MEAL_COLORS = {
  breakfast: "#A8D8C0",
  lunch: "#F8F2E6",
  dinner: "#C3B1E1",
};

interface Meal {
  id: number;
  title: string;
  readyInMinutes?: number;
  servings?: number;
  imageType?: string;
}

interface DayMeals {
  meals: Meal[];
  nutrients?: {
    calories: number;
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

interface WeekMealPlan {
  week: {
    monday: DayMeals;
    tuesday: DayMeals;
    wednesday: DayMeals;
    thursday: DayMeals;
    friday: DayMeals;
    saturday: DayMeals;
    sunday: DayMeals;
  };
}

// Mock data - bu gerçek API response'dan gelecek
const mockMealPlan: WeekMealPlan = {
  week: {
    monday: {
      meals: [
        { id: 1, title: "Quinoa Breakfast With Apples And Cinnamon" },
        { id: 2, title: "Southwest Chicken And Barley Soup" },
        { id: 3, title: "Zesty Orange & Chili Chicken" },
      ],
      nutrients: { calories: 2000, protein: 150, fat: 50, carbohydrates: 250 },
    },
    tuesday: {
      meals: [
        { id: 4, title: "Spicy Soba Noodle Salad" },
        { id: 5, title: "Tropical BBQ Pizza" },
      ],
      nutrients: { calories: 1800, protein: 140, fat: 45, carbohydrates: 230 },
    },
    wednesday: {
      meals: [],
      nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 },
    },
    thursday: {
      meals: [],
      nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 },
    },
    friday: {
      meals: [],
      nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 },
    },
    saturday: {
      meals: [],
      nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 },
    },
    sunday: {
      meals: [],
      nutrients: { calories: 0, protein: 0, fat: 0, carbohydrates: 0 },
    },
  },
};

const MEAL_TYPES = ["breakfast", "lunch", "dinner"] as const;

const formatDate = (dayName: string): string => {
  const daysMap: { [key: string]: number } = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 0,
  };

  const today = new Date();
  const currentDay = today.getDay();
  const targetDay = daysMap[dayName.toLowerCase()];
  const daysToAdd = (targetDay - currentDay + 7) % 7;

  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysToAdd);

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const dayNameCapitalized = dayName.charAt(0).toUpperCase() + dayName.slice(1);
  const month = monthNames[targetDate.getMonth()];
  const day = targetDate.getDate();

  return `${dayNameCapitalized}, ${month} ${day}`;
};

export default function MealPlanPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [mealPlan, setMealPlan] = useState<WeekMealPlan>(mockMealPlan);

  useEffect(() => {
    if (params.mealPlanData) {
      try {
        const data = JSON.parse(params.mealPlanData as string);
        setMealPlan(data);
      } catch (error) {
        console.error("Error parsing meal plan data:", error);
      }
    }
  }, [params.mealPlanData]);

  const handleSaveMealPlan = () => {
    // TODO: Save meal plan logic
    console.log("Saving meal plan...");
  };

  const getMealImageUrl = (meal: Meal): string => {
    if (meal.id && meal.imageType) {
      return `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`;
    }
    return "";
  };

  const renderMealBadge = (mealType: string) => {
    const backgroundColor =
      MEAL_COLORS[mealType.toLowerCase() as keyof typeof MEAL_COLORS] ||
      MEAL_COLORS.breakfast;
    const label = mealType.charAt(0).toUpperCase() + mealType.slice(1);

    return (
      <View
        style={[
          styles.mealBadge,
          { backgroundColor, borderColor: Colors.lilac[900] },
        ]}
      >
        <Text style={styles.mealBadgeText}>{label}</Text>
      </View>
    );
  };

  const renderMealItem = (meal: Meal, index: number) => {
    const mealType = MEAL_TYPES[index % 3];
    const imageUrl = getMealImageUrl(meal);

    return (
      <View key={meal.id} style={styles.mealItem}>
        <View style={styles.mealContent}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.mealImage}
              resizeMode="cover"
            />
          ) : null}
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>{meal.title}</Text>
            {renderMealBadge(mealType)}
          </View>
        </View>
        <View style={styles.replaceButton}>
          <ReplaceIcon />
        </View>
      </View>
    );
  };

  const renderDaySection = (dayKey: string, dayData: DayMeals) => {
    if (!dayData.meals || dayData.meals.length === 0) return null;

    return (
      <View key={dayKey} style={styles.daySection}>
        <Text style={styles.dayHeader}>{formatDate(dayKey)}</Text>
        {dayData.meals.map((meal, index) => renderMealItem(meal, index))}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
            onPress={() => router.back()}
          />
        </View>
        <Text style={styles.headerTitle}>Meal plan preview</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.description}>
          Here are the recipes we&apos;ve chosen for your meal plan. Feel free
          to swap out any that you don&apos;t like!
        </Text>

        {/* Days */}
        {Object.entries(mealPlan.week).map(([dayKey, dayData]) =>
          renderDaySection(dayKey, dayData)
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <CustomButton
          containerStyle={styles.saveButton}
          onPress={handleSaveMealPlan}
        >
          <Text style={styles.saveButtonText}>Save Meal Plan</Text>
        </CustomButton>
      </View>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerLeft: {
    width: 48,
    height: 48,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  headerRight: {
    width: 48,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  daySection: {
    marginBottom: 0,
  },
  dayHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141217",
    marginTop: 20,
    marginBottom: 12,
  },
  mealItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  mealContent: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
  },
  mealImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  mealInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 6,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  mealBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 1,
    borderRadius: 16,
    borderWidth: 1,
  },
  mealBadgeText: {
    fontSize: 12,
    lineHeight: 18,
    color: "#000000",
  },
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: Colors.lilac[600],
    borderRadius: 12,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: Colors.text.primary,
    textAlign: "center",
  },
});
