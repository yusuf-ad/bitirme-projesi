import { Colors, getThemeColors } from "@/constants/theme";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { useTheme } from "@/providers/theme-provider";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import { memo, useCallback, useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { PantryItem } from "../types";

interface ShoppingListItemsListProps {
  checkedItems: PantryItem[];
  uncheckedItems: PantryItem[];
  onToggleItem: (id: string) => void;
  onEditItem: (id: string) => void;
}

// Pre-compute badge content outside component
function getBadgeContent(amount: number, unit: string): string {
  const unitLower = (unit || "").toLowerCase();
  if (unitLower === "g" || unitLower === "gram" || unitLower === "grams") {
    return amount >= 1000
      ? `${(amount / 1000).toFixed(1)}kg`
      : `${Math.round(amount)}g`;
  }
  if (
    unitLower === "ml" ||
    unitLower === "milliliter" ||
    unitLower === "milliliters"
  ) {
    return amount >= 1000
      ? `${(amount / 1000).toFixed(1)}l`
      : `${Math.round(amount)}ml`;
  }
  if (unitLower === "l" || unitLower === "liter" || unitLower === "liters") {
    return `${amount.toFixed(1)}l`;
  }
  if (
    unitLower === "kg" ||
    unitLower === "kilogram" ||
    unitLower === "kilograms"
  ) {
    return `${amount.toFixed(1)}kg`;
  }
  return String(Math.round(amount));
}

// Group items by category
function groupByCategory(
  items: PantryItem[]
): { category: string; items: PantryItem[] }[] {
  const map = new Map<string, PantryItem[]>();
  for (const item of items) {
    const cat = item.category || "Other";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  const result: { category: string; items: PantryItem[] }[] = [];
  for (const cat of PANTRY_CATEGORIES) {
    const catItems = map.get(cat);
    if (catItems?.length) result.push({ category: cat, items: catItems });
  }
  map.forEach((items, cat) => {
    if (!PANTRY_CATEGORIES.includes(cat as any) && items.length) {
      result.push({ category: cat, items });
    }
  });
  return result;
}

// Theme colors type
type ThemeColorsType = ReturnType<typeof getThemeColors>;

// Simple item card - NO hooks inside, theme passed as props
const ItemCard = memo(
  function ItemCard({
    id,
    name,
    amount,
    unit,
    checked,
    image,
    recipeName,
    onToggle,
    onEdit,
    isDark,
    themeColors,
    accentColor,
  }: {
    id: string;
    name: string;
    amount: number;
    unit: string;
    checked: boolean;
    image: string;
    recipeName?: string;
    onToggle: (id: string) => void;
    onEdit: (id: string) => void;
    isDark: boolean;
    themeColors: ThemeColorsType;
    accentColor: string;
  }) {
    const badge = getBadgeContent(amount, unit);

    return (
      <View style={[
        styles.itemCard, 
        { backgroundColor: themeColors.background.surface },
        checked && styles.itemCardChecked
      ]}>
        <Pressable
          style={[
            styles.checkbox, 
            { 
              borderColor: isDark ? themeColors.border.light : Colors.lilac[300],
              backgroundColor: "transparent",
            },
            checked && { 
              backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : Colors.lilac[100],
              borderColor: accentColor,
            }
          ]}
          onPress={() => onToggle(id)}
          hitSlop={8}
        >
          {checked && (
            <Feather name="check" size={14} color={accentColor} />
          )}
        </Pressable>

        <Pressable style={styles.itemContent} onPress={() => onToggle(id)}>
          <View
            style={[
              styles.imageContainer,
              { 
                backgroundColor: isDark ? themeColors.background.tertiary : "#FFFFFF",
                borderColor: isDark ? themeColors.border.light : Colors.lilac[300],
              },
              checked && styles.imageContainerChecked,
            ]}
          >
            <Image
              source={{
                uri: `https://spoonacular.com/cdn/ingredients_100x100/${image}`,
              }}
              style={styles.itemImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            <View style={[
              styles.amountBadge,
              { 
                backgroundColor: accentColor,
                borderColor: themeColors.background.surface,
              }
            ]}>
              <Text style={styles.amountBadgeText}>{badge}</Text>
            </View>
          </View>

          <View style={styles.itemInfo}>
            <Text
              style={[
                styles.itemName, 
                { color: themeColors.text.primary },
                checked && styles.itemNameChecked
              ]}
              numberOfLines={2}
            >
              {name}
            </Text>
            {recipeName ? (
              <Text style={[styles.itemRecipe, { color: accentColor }]} numberOfLines={1}>
                {recipeName}
              </Text>
            ) : null}
          </View>
        </Pressable>

        <Pressable
          style={styles.editButton}
          onPress={() => onEdit(id)}
          hitSlop={12}
        >
          <Feather name="edit-2" size={16} color={themeColors.text.tertiary} />
        </Pressable>
      </View>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.checked === next.checked &&
    prev.name === next.name &&
    prev.amount === next.amount &&
    prev.isDark === next.isDark
);

// Section header
const SectionHeader = memo(function SectionHeader({
  title,
  count,
  accentColor,
  themeColors,
}: {
  title: string;
  count: number;
  accentColor: string;
  themeColors: ThemeColorsType;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: accentColor }]}>{title}</Text>
      <Text style={[styles.sectionCount, { color: themeColors.text.tertiary }]}>{count}</Text>
    </View>
  );
});

// Category header
const CategoryHeader = memo(function CategoryHeader({
  title,
  count,
  isDark,
  themeColors,
  accentColor,
}: {
  title: string;
  count: number;
  isDark: boolean;
  themeColors: ThemeColorsType;
  accentColor: string;
}) {
  return (
    <View style={styles.categoryHeader}>
      <Text style={[styles.categoryTitle, { color: themeColors.text.secondary }]}>{title}</Text>
      <View style={[
        styles.categoryBadge,
        { backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : Colors.lilac[100] }
      ]}>
        <Text style={[styles.categoryCount, { color: accentColor }]}>{count}</Text>
      </View>
    </View>
  );
});

type ListItem =
  | { type: "s"; t: string; c: number; k: string }
  | { type: "c"; t: string; c: number; k: string }
  | { type: "i"; d: PantryItem; k: string };

export function ShoppingListItemsList({
  checkedItems,
  uncheckedItems,
  onToggleItem,
  onEditItem,
}: ShoppingListItemsListProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  const listData = useMemo(() => {
    const data: ListItem[] = [];

    if (checkedItems.length > 0) {
      data.push({
        type: "s",
        t: "Purchased",
        c: checkedItems.length,
        k: "s-p",
      });
      for (const { category, items } of groupByCategory(checkedItems)) {
        data.push({
          type: "c",
          t: category,
          c: items.length,
          k: `cp-${category}`,
        });
        for (const item of items) {
          data.push({ type: "i", d: item, k: item.id });
        }
      }
    }

    if (uncheckedItems.length > 0) {
      data.push({ type: "s", t: "To Buy", c: uncheckedItems.length, k: "s-t" });
      for (const { category, items } of groupByCategory(uncheckedItems)) {
        data.push({
          type: "c",
          t: category,
          c: items.length,
          k: `ct-${category}`,
        });
        for (const item of items) {
          data.push({ type: "i", d: item, k: item.id });
        }
      }
    }

    return data;
  }, [checkedItems, uncheckedItems]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) => {
      switch (item.type) {
        case "s":
          return (
            <SectionHeader 
              title={item.t} 
              count={item.c} 
              accentColor={accentColor}
              themeColors={themeColors}
            />
          );
        case "c":
          return (
            <CategoryHeader 
              title={item.t} 
              count={item.c}
              isDark={isDark}
              themeColors={themeColors}
              accentColor={accentColor}
            />
          );
        case "i":
          return (
            <ItemCard
              id={item.d.id}
              name={item.d.name}
              amount={item.d.amount}
              unit={item.d.unit}
              checked={item.d.checked}
              image={item.d.spoonacular_image || ""}
              recipeName={item.d.recipe_name}
              onToggle={onToggleItem}
              onEdit={onEditItem}
              isDark={isDark}
              themeColors={themeColors}
              accentColor={accentColor}
            />
          );
      }
    },
    [onToggleItem, onEditItem, isDark, themeColors, accentColor]
  );

  const keyExtractor = useCallback((item: ListItem) => item.k, []);

  return (
     <FlatList
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      style={{ flex: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    marginVertical: 3,
  },
  itemCardChecked: {
    opacity: 0.65,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itemContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    borderWidth: 1,
  },
  imageContainerChecked: {
    opacity: 0.6,
  },
  itemImage: {
    width: "85%",
    objectFit: "contain",
    height: "85%",
  },
  amountBadge: {
    position: "absolute",
    bottom: -3,
    right: -3,
    minWidth: 22,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  amountBadgeText: {
    color: "#FFF",
    fontSize: 9,
    fontWeight: "bold",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  itemRecipe: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  editButton: {
    padding: 6,
  },
});

