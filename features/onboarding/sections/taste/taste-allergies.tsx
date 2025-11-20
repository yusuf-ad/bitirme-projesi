import { POPULAR_INGREDIENTS } from "@/lib/constants";
import { searchIngredients, type Ingredient } from "@/lib/spoonacular";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface TasteAllergiesProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedAllergies: string[]) => void;
  initialSelection?: string[];
}

type AllergyItem =
  | Ingredient
  | (typeof POPULAR_INGREDIENTS)[number]
  | { name: string; image?: string };

const INGREDIENT_IMAGE_BASE_URL =
  "https://spoonacular.com/cdn/ingredients_100x100";

const createFallbackAllergyItem = (key: string): AllergyItem => {
  if (key.startsWith("name-")) {
    const formatted = key
      .replace("name-", "")
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
    return { name: formatted };
  }

  return { name: key };
};

export function TasteAllergies({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteAllergiesProps) {
  const [selectedAllergies, setSelectedAllergies] =
    useState<string[]>(initialSelection);
  const [selectedAllergiesMap, setSelectedAllergiesMap] = useState<
    Map<string, AllergyItem>
  >(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Ingredient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    try {
      setIsSearching(true);
      const { ingredients } = await searchIngredients(query, 0, 20);
      setSearchResults(ingredients);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching ingredients:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const getIngredientKey = (item: AllergyItem) => {
    if ("id" in item && typeof item.id === "number") {
      return `${item.id}`;
    }

    const spoonacularId = (item as (typeof POPULAR_INGREDIENTS)[number])
      .spoonacularId;
    if (typeof spoonacularId === "number") {
      return `${spoonacularId}`;
    }

    return `name-${(item as any).name?.toLowerCase?.() ?? "unknown"}`;
  };

  useEffect(() => {
    setSelectedAllergies(initialSelection);
    setSelectedAllergiesMap((previousMap) => {
      if (initialSelection.length === 0) {
        return new Map();
      }

      const restoredMap = new Map<string, AllergyItem>();

      initialSelection.forEach((key) => {
        if (previousMap.has(key)) {
          restoredMap.set(key, previousMap.get(key)!);
          return;
        }

        const fromPopular = POPULAR_INGREDIENTS.find(
          (ingredient) => getIngredientKey(ingredient) === key
        );

        if (fromPopular) {
          restoredMap.set(key, fromPopular);
          return;
        }

        restoredMap.set(key, createFallbackAllergyItem(key));
      });

      return restoredMap;
    });
  }, [initialSelection]);

  const toggleAllergy = (item: AllergyItem) => {
    const key = getIngredientKey(item);
    const isCurrentlySelected = selectedAllergiesMap.has(key);

    if (isCurrentlySelected) {
      const newMap = new Map(selectedAllergiesMap);
      newMap.delete(key);
      setSelectedAllergiesMap(newMap);
      setSelectedAllergies(Array.from(newMap.keys()));
      onSelectionChange?.(Array.from(newMap.keys()));
    } else {
      const newMap = new Map(selectedAllergiesMap);
      newMap.set(key, item);
      setSelectedAllergiesMap(newMap);
      setSelectedAllergies(Array.from(newMap.keys()));
      onSelectionChange?.(Array.from(newMap.keys()));
    }
  };

  // Display items - either search results or popular ingredients
  const displayItems = hasSearched ? searchResults : POPULAR_INGREDIENTS;

  // Selected items to display in the selected section
  const selectedItems = Array.from(selectedAllergiesMap.values());

  // Unselected items from display - filter out already selected
  const unselectedItems = displayItems.filter(
    (item) => !selectedAllergiesMap.has(getIngredientKey(item))
  );

  const renderAllergyItem = ({ item }: { item: AllergyItem }) => {
    const ingredientName = (item as any).name;
    const ingredientImage = (item as any).image;

    return (
      <Pressable onPress={() => toggleAllergy(item)} style={styles.allergyItem}>
        {ingredientImage ? (
          <Image
            source={{
              uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
            }}
            style={styles.allergyIcon}
          />
        ) : (
          <View style={styles.allergyIconPlaceholder} />
        )}
        <Text style={styles.allergyLabel} numberOfLines={1}>
          {ingredientName}
        </Text>
      </Pressable>
    );
  };

  const renderSelectedItem = (
    item: AllergyItem
  ) => {
    const ingredientName = (item as any).name;
    const ingredientImage = (item as any).image;

    return (
      <Pressable
        onPress={() => toggleAllergy(item)}
        style={[styles.allergyItem, styles.allergyItemSelected]}
      >
        {ingredientImage ? (
          <Image
            source={{
              uri: `${INGREDIENT_IMAGE_BASE_URL}/${ingredientImage}`,
            }}
            style={styles.allergyIcon}
          />
        ) : (
          <View style={styles.allergyIconPlaceholder} />
        )}
        <Text
          style={[styles.allergyLabel, styles.allergyLabelSelected]}
          numberOfLines={1}
        >
          {ingredientName}
        </Text>
        <View style={styles.checkmark}>
          <MaterialCommunityIcons name="check" size={14} color="#FFFFFF" />
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color="#737780"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search ingredients..."
          placeholderTextColor="#737780"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {isSearching && (
          <ActivityIndicator
            size="small"
            color="#548A6A"
            style={styles.searchLoader}
          />
        )}
      </View>

      {/* Selected Items Section */}
      {selectedItems.length > 0 && (
        <View
          style={{
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={styles.sectionLabel}>Selected</Text>

            {/* Counter */}
            <Text style={styles.counterText}>
              {selectedAllergies.length} selected
            </Text>
          </View>
          <FlatList
            data={selectedItems}
            renderItem={({ item }) => renderSelectedItem(item)}
            keyExtractor={(item) => `selected-${getIngredientKey(item)}`}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
          />
        </View>
      )}

      {/* Section Label */}
      {!isSearching && (
        <Text
          style={[
            styles.sectionLabel,
            {
              marginBottom: 12,
            },
          ]}
        >
          {hasSearched ? "Search Results" : "Common products"}
        </Text>
      )}

      {/* Loading State */}
      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#548A6A" />
        </View>
      ) : hasSearched && displayItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No ingredients found</Text>
        </View>
      ) : (
        <>
          {/* Allergies Grid */}
          <FlatList
            data={unselectedItems}
            renderItem={renderAllergyItem}
            keyExtractor={(item) => getIngredientKey(item)}
            numColumns={3}
            scrollEnabled={false}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.gridRow}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 20,
  },
  textContainer: {
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#22252B",
    marginBottom: 8,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#444955",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E3ED",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    color: "#22252B",
  },
  sectionLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    color: "#000000",
    marginLeft: 15,
  },
  gridContent: {
    paddingHorizontal: 15,
    gap: 10,
  },
  gridRow: {
    gap: 10,
  },
  allergyItem: {
    flex: 1,
    maxWidth: "31%",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E3ED",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 100,
  },
  allergyItemSelected: {
    backgroundColor: "#FFFFFF",
    borderColor: "#548A6A",
    borderWidth: 2,
  },
  allergyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 6,
    resizeMode: "contain",
  },
  allergyIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 6,
    backgroundColor: "#E8E3ED",
  },
  allergyLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#000000",
    textAlign: "center",
  },
  allergyLabelSelected: {
    color: "#548A6A",
    fontWeight: "600",
  },
  checkmark: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#548A6A",
    alignItems: "center",
    justifyContent: "center",
  },

  counterText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#548A6A",
  },
  searchLoader: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    color: "#737780",
  },
});
