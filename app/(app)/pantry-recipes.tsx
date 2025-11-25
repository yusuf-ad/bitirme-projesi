import { Colors } from "@/constants/theme";
import { pantryService } from "@/features/pantry/services/pantry-service";
import { RecipeByIngredient } from "@/lib/spoonacular";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PantryRecipesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [recipes, setRecipes] = useState<RecipeByIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get pantry items
      const items = await pantryService.getAllItems();
      const pantryIngredients = items
        .filter((i) => i.status === "pantry")
        .map((i) => i.name);

      if (pantryIngredients.length === 0) {
        setError("No ingredients in pantry");
        setIsLoading(false);
        return;
      }

      // Call API
      const response = await fetch("/api/suggest-recipes-by-ingredients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ingredients: pantryIngredients }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const data = await response.json();
      setRecipes(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const renderItem = ({ item }: { item: RecipeByIngredient }) => (
    <Pressable style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Used: {item.usedIngredientCount}</Text>
          <Text style={styles.statText}>
            Missing: {item.missedIngredientCount}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Recipes from Pantry</Text>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.lilac[600]} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={fetchRecipes} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text.primary,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
    flexDirection: "row",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 100,
    height: 100,
    backgroundColor: Colors.gray[200],
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: Colors.text.primary,
  },
  stats: {
    flexDirection: "row",
    gap: 12,
  },
  statText: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  errorText: {
    fontSize: 16,
    color: Colors.semantic.error.main,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.lilac[600],
    borderRadius: 8,
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
});
