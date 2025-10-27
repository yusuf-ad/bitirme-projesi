import { getRecipeDetails, Recipe } from "@/lib/spoonacular";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function MealDetailPage() {
  const { id } = useLocalSearchParams();
  const [meal, setMeal] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMealDetails = async () => {
      try {
        if (!id) throw new Error("Meal ID not found");
        const mealId = Array.isArray(id) ? parseInt(id[0]) : parseInt(id);
        const details = await getRecipeDetails(mealId);
        setMeal(details);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load meal details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMealDetails();
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Error: {error}</Text>
      </View>
    );
  }

  if (!meal) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No meal found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>
        {meal.title}
      </Text>

      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
        Ingredients
      </Text>

      {meal.extendedIngredients && meal.extendedIngredients.length > 0 ? (
        <FlatList
          scrollEnabled={false}
          data={meal.extendedIngredients}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: "#ccc",
              }}
            >
              <Text style={{ fontSize: 14 }}>{item.original}</Text>
            </View>
          )}
        />
      ) : (
        <Text>No ingredients found</Text>
      )}
    </ScrollView>
  );
}
