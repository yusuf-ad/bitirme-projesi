import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Meal {
  id: number;
  title: string;
  readyInMinutes?: number;
  servings?: number;
  imageType?: string;
  image?: string;
  sourceUrl?: string;
  nutrition?: {
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
  };
}

interface MealTypeData {
  results: Meal[];
  totalResults: number;
}

interface MealPlan {
  breakfast: MealTypeData;
  lunch: MealTypeData;
  dinner: MealTypeData;
}

export default function MealPlanPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [mealPlan, setMealPlan] = useState<MealPlan>();
  const [selectedMealIndices, setSelectedMealIndices] = useState<{
    breakfast: number;
    lunch: number;
    dinner: number;
  }>({
    breakfast: 0,
    lunch: 0,
    dinner: 0,
  });

  useEffect(() => {
    if (params.mealPlanData) {
      try {
        const data = JSON.parse(params.mealPlanData as string);

        // Check if data has breakfast, lunch, dinner structure
        if (
          data &&
          data.breakfast &&
          data.lunch &&
          data.dinner &&
          data.breakfast.results &&
          data.lunch.results &&
          data.dinner.results
        ) {
          setMealPlan(data);
          setSelectedMealIndices({
            breakfast: 0,
            lunch: 0,
            dinner: 0,
          });
        } else {
          console.error("Invalid meal plan structure:", data);
        }
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
    // First check if there's a direct image property from API
    if (meal.image) {
      // If it's already a full URL
      if (meal.image.startsWith("http")) {
        return meal.image;
      }
      // If it's just filename, construct URL
      return `https://spoonacular.com/recipeImages/${meal.image}`;
    }
    // Fallback to constructing URL from id
    if (meal.id) {
      return `https://spoonacular.com/recipeImages/${meal.id}-312x231.jpg`;
    }
    return "";
  };

  const renderMealItem = (
    meal: Meal,
    mealType: "breakfast" | "lunch" | "dinner"
  ) => {
    const imageUrl = getMealImageUrl(meal);

    const handleReplace = () => {
      const currentIndex = selectedMealIndices[mealType];
      const mealTypeData = mealPlan?.[mealType];

      if (!mealTypeData) return;

      const nextIndex = currentIndex + 1;

      // Check if next index exists
      if (nextIndex >= mealTypeData.results.length) {
        Alert.alert(
          "No more recipes",
          `No more ${mealType} recipes available. You've reached the end of the list.`
        );
        return;
      }

      // Update to next recipe
      setSelectedMealIndices((prev) => ({
        ...prev,
        [mealType]: nextIndex,
      }));
    };

    return (
      <View key={meal.id} style={styles.mealItem}>
        <View style={styles.mealContent}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.mealImage}
              resizeMode="cover"
              onError={(error) => {
                console.log("Image failed to load:", imageUrl, error);
              }}
            />
          ) : (
            <View style={[styles.mealImage, styles.placeholderImage]} />
          )}
          <View style={styles.mealInfo}>
            <Text style={styles.mealTitle}>{meal.title}</Text>
            <View style={styles.mealDetails}>
              {meal.nutrition?.calories && (
                <Text style={styles.mealDetailText}>
                  {Math.round(meal.nutrition.calories)} cal
                </Text>
              )}
              <Text>|</Text>
              {meal.readyInMinutes && (
                <Text style={styles.mealDetailText}>
                  {meal.readyInMinutes} min
                </Text>
              )}
            </View>
          </View>
        </View>
        <CustomButton
          containerStyle={styles.replaceButton}
          onPress={handleReplace}
        >
          <ReplaceIcon />
        </CustomButton>
      </View>
    );
  };

  const renderDayMeals = (mealType: "breakfast" | "lunch" | "dinner") => {
    const dayData = mealPlan?.[mealType];

    if (!dayData || dayData.results.length === 0) return null;

    const currentIndex = selectedMealIndices[mealType];
    const currentMeal = dayData.results[currentIndex];

    if (!currentMeal) return null;

    return (
      <View key={mealType}>
        <Text style={styles.mealTypeHeader}>
          {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
        </Text>
        {renderMealItem(currentMeal, mealType)}
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

        {/* Meal Types */}
        {renderDayMeals("breakfast")}
        {renderDayMeals("lunch")}
        {renderDayMeals("dinner")}
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
  placeholderImage: {
    backgroundColor: Colors.gray[300],
  },
  mealInfo: {
    flex: 1,
    gap: 6,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: Colors.text.primary,
  },
  mealDetails: {
    flexDirection: "row",
    gap: 12,
  },
  mealDetailText: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 18,
    color: Colors.text.secondary,
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
  mealTypeHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141217",
    marginTop: 20,
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
    paddingVertical: 14,
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
