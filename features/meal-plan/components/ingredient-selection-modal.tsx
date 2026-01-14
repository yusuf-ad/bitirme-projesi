import { Colors, getThemeColors } from "@/constants/theme";
import { PantryItem } from "@/features/pantry/types";
import { usePantryQuery } from "@/hooks/use-pantry-query";
import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { useTheme } from "@/providers/theme-provider";
import { MaterialIcons } from "@expo/vector-icons";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const INGREDIENT_IMAGE_BASE_URL =
  "https://spoonacular.com/cdn/ingredients_100x100";

export interface SelectedIngredient {
  id: string;
  name: string;
  image?: string;
  source: "pantry" | "popular" | "manual";
}

export interface IngredientSelectionModalHandle {
  present: () => void;
  dismiss: () => void;
}

interface IngredientSelectionModalProps {
  selectedIngredients: SelectedIngredient[];
  onApply: (ingredients: SelectedIngredient[]) => void;
}

// Ingredient Card Component
function IngredientCard({
  name,
  imageUrl,
  isSelected,
  onToggle,
}: {
  name: string;
  imageUrl?: string;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  return (
    <Pressable
      style={[
        styles.ingredientCard,
        isSelected && styles.ingredientCardSelected,
      ]}
      onPress={onToggle}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.ingredientImage,
            { backgroundColor: themeColors.background.surface },
          ]}
          resizeMode="contain"
        />
      ) : (
        <View
          style={[
            styles.ingredientImage,
            styles.ingredientImagePlaceholder,
            {
              borderColor: isDark ? themeColors.border.light : Colors.gray[200],
            },
          ]}
        >
          <MaterialIcons
            name="restaurant"
            size={24}
            color={isDark ? themeColors.text.tertiary : Colors.gray[400]}
          />
        </View>
      )}
      <Text
        style={[styles.ingredientName, { color: themeColors.text.primary }]}
        numberOfLines={2}
      >
        {name}
      </Text>
      {isSelected && (
        <View
          style={[
            styles.selectedBadge,
            { borderColor: themeColors.background.primary },
          ]}
        >
          <MaterialIcons name="check" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

export const IngredientSelectionModal = forwardRef<
  IngredientSelectionModalHandle,
  IngredientSelectionModalProps
>(({ selectedIngredients, onApply }, ref) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [localSelected, setLocalSelected] = useState<
    Map<string, SelectedIngredient>
  >(new Map());

  // Fetch pantry items
  const { data: pantryItems = [] } = usePantryQuery();

  // Filter only pantry stock items
  const pantryStockItems = useMemo(
    () => pantryItems.filter((item: PantryItem) => item.status === "pantry"),
    [pantryItems]
  );

  // Popular ingredients for "Popular" section
  const popularIngredients = useMemo(() => {
    return POPULAR_INGREDIENTS.slice(0, 20).map((ing) => ({
      id: `popular-${ing.spoonacularId}`,
      name: ing.name,
      image: ing.image,
      spoonacularId: ing.spoonacularId,
    }));
  }, []);

  // Initialize local selection when modal opens
  const present = useCallback(() => {
    const map = new Map<string, SelectedIngredient>();
    selectedIngredients.forEach((ing) => {
      map.set(ing.id, ing);
    });
    setLocalSelected(map);
    setSearchQuery("");
    setVisible(true);
  }, [selectedIngredients]);

  const dismiss = useCallback(() => {
    setVisible(false);
  }, []);

  useImperativeHandle(ref, () => ({
    present,
    dismiss,
  }));

  const toggleIngredient = (ingredient: SelectedIngredient) => {
    setLocalSelected((prev) => {
      const newMap = new Map(prev);
      if (newMap.has(ingredient.id)) {
        newMap.delete(ingredient.id);
      } else {
        newMap.set(ingredient.id, ingredient);
      }
      return newMap;
    });
  };

  const handleClearAll = () => {
    setLocalSelected(new Map());
  };

  const addManualIngredient = () => {
    if (!searchQuery.trim()) return;

    const manualId = `manual-${searchQuery
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    const ingredient: SelectedIngredient = {
      id: manualId,
      name: searchQuery.trim(),
      source: "manual",
    };

    setLocalSelected((prev) => {
      const newMap = new Map(prev);
      newMap.set(manualId, ingredient);
      return newMap;
    });
    setSearchQuery("");
  };

  const handleApply = () => {
    onApply(Array.from(localSelected.values()));
    dismiss();
  };

  // Filter ingredients based on search
  const filteredPantryItems = useMemo(() => {
    if (!searchQuery) return pantryStockItems;
    return pantryStockItems.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [pantryStockItems, searchQuery]);

  const filteredPopularIngredients = useMemo(() => {
    if (!searchQuery) return popularIngredients;
    return popularIngredients.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [popularIngredients, searchQuery]);

  // Check if search has no results
  const hasNoResults =
    searchQuery.length > 0 &&
    filteredPantryItems.length === 0 &&
    filteredPopularIngredients.length === 0;

  // Check if manual ingredient already exists
  const manualIngredientExists = useMemo(() => {
    if (!searchQuery.trim()) return false;
    const manualId = `manual-${searchQuery
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    return localSelected.has(manualId);
  }, [searchQuery, localSelected]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={dismiss}
    >
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: themeColors.background.primary,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text
            style={[styles.headerTitle, { color: themeColors.text.primary }]}
          >
            Search by Ingredients
          </Text>
          <Pressable onPress={dismiss} style={styles.closeButton}>
            <MaterialIcons
              name="close"
              size={24}
              color={themeColors.text.primary}
            />
          </Pressable>
        </View>

        {/* Search Input */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: themeColors.background.surface,
              borderColor: isDark ? themeColors.border.light : Colors.gray[200],
            },
          ]}
        >
          <MaterialIcons
            name="search"
            size={20}
            color={isDark ? themeColors.text.tertiary : Colors.gray[400]}
          />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text.primary }]}
            placeholder="Search ingredients..."
            placeholderTextColor={
              isDark ? themeColors.text.tertiary : Colors.gray[400]
            }
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={addManualIngredient}
            returnKeyType="done"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <MaterialIcons
                name="close"
                size={18}
                color={isDark ? themeColors.text.tertiary : Colors.gray[400]}
              />
            </Pressable>
          )}
        </View>

        {/* Add Custom Ingredient Button - shown when typing */}
        {searchQuery.trim().length > 0 && !manualIngredientExists && (
          <Pressable
            style={[
              styles.addCustomButton,
              {
                backgroundColor: isDark
                  ? "rgba(191, 90, 242, 0.15)"
                  : Colors.lilac[100],
                borderColor: isDark
                  ? themeColors.accent.lilac
                  : Colors.lilac[300],
              },
            ]}
            onPress={addManualIngredient}
          >
            <MaterialIcons
              name="add-circle-outline"
              size={20}
              color={isDark ? themeColors.accent.lilac : Colors.lilac[700]}
            />
            <Text
              style={[
                styles.addCustomButtonText,
                {
                  color: isDark ? themeColors.accent.lilac : Colors.lilac[700],
                },
              ]}
            >
              Add &ldquo;{searchQuery.trim()}&rdquo; as custom ingredient
            </Text>
          </Pressable>
        )}

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* My Pantry Section */}
          {filteredPantryItems.length > 0 && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.text.primary },
                ]}
              >
                My Pantry
              </Text>
              <View style={styles.ingredientsGrid}>
                {filteredPantryItems.map((item) => {
                  const ingredientId = `pantry-${item.id}`;
                  const imageUrl = item.spoonacular_image
                    ? `${INGREDIENT_IMAGE_BASE_URL}/${item.spoonacular_image}`
                    : undefined;

                  return (
                    <IngredientCard
                      key={ingredientId}
                      name={item.name}
                      imageUrl={imageUrl}
                      isSelected={localSelected.has(ingredientId)}
                      onToggle={() =>
                        toggleIngredient({
                          id: ingredientId,
                          name: item.spoonacular_name || item.name,
                          image: item.spoonacular_image,
                          source: "pantry",
                        })
                      }
                    />
                  );
                })}
              </View>
            </View>
          )}

          {/* Popular Section */}
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: themeColors.text.primary }]}
            >
              Popular
            </Text>
            <View style={styles.ingredientsGrid}>
              {filteredPopularIngredients.map((item) => {
                const imageUrl = item.image
                  ? `${INGREDIENT_IMAGE_BASE_URL}/${item.image}`
                  : undefined;

                return (
                  <IngredientCard
                    key={item.id}
                    name={item.name}
                    imageUrl={imageUrl}
                    isSelected={localSelected.has(item.id)}
                    onToggle={() =>
                      toggleIngredient({
                        id: item.id,
                        name: item.name,
                        image: item.image,
                        source: "popular",
                      })
                    }
                  />
                );
              })}
            </View>
          </View>

          {/* No Results Message */}
          {hasNoResults && (
            <View style={styles.noResultsContainer}>
              <MaterialIcons
                name="search-off"
                size={48}
                color={isDark ? themeColors.text.tertiary : Colors.gray[300]}
              />
              <Text
                style={[
                  styles.noResultsText,
                  { color: themeColors.text.secondary },
                ]}
              >
                No ingredients found for &ldquo;{searchQuery}&rdquo;
              </Text>
              <Text
                style={[
                  styles.noResultsSubtext,
                  { color: themeColors.text.tertiary },
                ]}
              >
                Tap the button above to add it as a custom ingredient
              </Text>
            </View>
          )}

          {/* Custom Ingredients Section - show if any manual ingredients are selected */}
          {Array.from(localSelected.values()).some(
            (ing) => ing.source === "manual"
          ) && (
            <View style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  { color: themeColors.text.primary },
                ]}
              >
                Custom Ingredients
              </Text>
              <View style={styles.customIngredientsList}>
                {Array.from(localSelected.values())
                  .filter((ing) => ing.source === "manual")
                  .map((ing) => (
                    <View
                      key={ing.id}
                      style={[
                        styles.customIngredientChip,
                        {
                          backgroundColor: isDark
                            ? "rgba(76, 175, 80, 0.2)"
                            : Colors.green[100],
                          borderColor: isDark
                            ? Colors.green[400]
                            : Colors.green[400],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.customIngredientText,
                          {
                            color: isDark
                              ? Colors.green[300]
                              : Colors.green[900],
                          },
                        ]}
                      >
                        {ing.name}
                      </Text>
                      <Pressable
                        onPress={() => toggleIngredient(ing)}
                        hitSlop={8}
                      >
                        <MaterialIcons
                          name="close"
                          size={16}
                          color={isDark ? Colors.green[300] : Colors.gray[500]}
                        />
                      </Pressable>
                    </View>
                  ))}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + 12,
              borderTopColor: isDark
                ? themeColors.border.light
                : Colors.gray[200],
            },
          ]}
        >
          <Pressable
            style={[
              styles.clearButton,
              {
                backgroundColor: isDark
                  ? themeColors.background.surface
                  : Colors.gray[100],
              },
            ]}
            onPress={handleClearAll}
          >
            <Text
              style={[
                styles.clearButtonText,
                { color: themeColors.text.primary },
              ]}
            >
              Clear All
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.applyButton,
              {
                backgroundColor: isDark
                  ? themeColors.accent.lilac
                  : Colors.lilac[900],
              },
            ]}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>
              Apply{localSelected.size > 0 ? ` (${localSelected.size})` : ""}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
});

IngredientSelectionModal.displayName = "IngredientSelectionModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 16,
  },
  ingredientsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  ingredientCard: {
    width: "22%",
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  ingredientCardSelected: {
    opacity: 1,
  },
  ingredientImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.background.surface,
  },
  ingredientImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  ingredientName: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.primary,
    textAlign: "center",
    lineHeight: 16,
  },
  selectedBadge: {
    position: "absolute",
    top: 0,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.lilac[600],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.background.primary,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  applyButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: Colors.lilac[900],
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  addCustomButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.lilac[100],
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
    borderStyle: "dashed",
  },
  addCustomButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lilac[700],
    flex: 1,
  },
  noResultsContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text.secondary,
    textAlign: "center",
  },
  noResultsSubtext: {
    fontSize: 13,
    color: Colors.gray[400],
    textAlign: "center",
  },
  customIngredientsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  customIngredientChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 14,
    paddingRight: 10,
    paddingVertical: 8,
    backgroundColor: Colors.green[100],
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.green[400],
  },
  customIngredientText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.green[900],
  },
});
