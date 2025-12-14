import { Colors } from "@/constants/theme";
import { PANTRY_CATEGORIES } from "@/lib/constants";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { memo, useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
    return amount >= 1000 ? `${(amount / 1000).toFixed(1)}kg` : `${Math.round(amount)}g`;
  }
  if (unitLower === "ml" || unitLower === "milliliter" || unitLower === "milliliters") {
    return amount >= 1000 ? `${(amount / 1000).toFixed(1)}l` : `${Math.round(amount)}ml`;
  }
  if (unitLower === "l" || unitLower === "liter" || unitLower === "liters") {
    return `${amount.toFixed(1)}l`;
  }
  if (unitLower === "kg" || unitLower === "kilogram" || unitLower === "kilograms") {
    return `${amount.toFixed(1)}kg`;
  }
  return String(Math.round(amount));
}

// Group items by category
function groupByCategory(items: PantryItem[]): Array<{ category: string; items: PantryItem[] }> {
  const map = new Map<string, PantryItem[]>();
  for (const item of items) {
    const cat = item.category || "Other";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  const result: Array<{ category: string; items: PantryItem[] }> = [];
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

// Simple item card - NO hooks inside, NO animations
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
  }) {
    const badge = getBadgeContent(amount, unit);

    return (
      <View style={[styles.itemCard, checked && styles.itemCardChecked]}>
        <Pressable
          style={[styles.checkbox, checked && styles.checkboxChecked]}
          onPress={() => onToggle(id)}
          hitSlop={8}
        >
          {checked && <Feather name="check" size={14} color={Colors.lilac[900]} />}
        </Pressable>

        <Pressable style={styles.itemContent} onPress={() => onToggle(id)}>
          <View style={[styles.imageContainer, checked && styles.imageContainerChecked]}>
            <Image
              source={{ uri: `https://spoonacular.com/cdn/ingredients_100x100/${image}` }}
              style={styles.itemImage}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
            <View style={styles.amountBadge}>
              <Text style={styles.amountBadgeText}>{badge}</Text>
            </View>
          </View>

          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, checked && styles.itemNameChecked]} numberOfLines={2}>
              {name}
            </Text>
            {recipeName ? (
              <Text style={styles.itemRecipe} numberOfLines={1}>{recipeName}</Text>
            ) : null}
          </View>
        </Pressable>

        <Pressable style={styles.editButton} onPress={() => onEdit(id)} hitSlop={12}>
          <Feather name="edit-2" size={16} color={Colors.gray[400]} />
        </Pressable>
      </View>
    );
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.checked === next.checked &&
    prev.name === next.name &&
    prev.amount === next.amount
);

// Section header
const SectionHeader = memo(function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
});

// Category header
const CategoryHeader = memo(function CategoryHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.categoryHeader}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryCount}>{count}</Text>
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
  const listData = useMemo(() => {
    const data: ListItem[] = [];

    if (checkedItems.length > 0) {
      data.push({ type: "s", t: "Purchased", c: checkedItems.length, k: "s-p" });
      for (const { category, items } of groupByCategory(checkedItems)) {
        data.push({ type: "c", t: category, c: items.length, k: `cp-${category}` });
        for (const item of items) {
          data.push({ type: "i", d: item, k: item.id });
        }
      }
    }

    if (uncheckedItems.length > 0) {
      data.push({ type: "s", t: "To Buy", c: uncheckedItems.length, k: "s-t" });
      for (const { category, items } of groupByCategory(uncheckedItems)) {
        data.push({ type: "c", t: category, c: items.length, k: `ct-${category}` });
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
          return <SectionHeader title={item.t} count={item.c} />;
        case "c":
          return <CategoryHeader title={item.t} count={item.c} />;
        case "i":
          return (
            <ItemCard
              id={item.d.id}
              name={item.d.name}
              amount={item.d.amount}
              unit={item.d.unit}
              checked={item.d.checked}
              image={item.d.spoonacular_image}
              recipeName={item.d.recipe_name}
              onToggle={onToggleItem}
              onEdit={onEditItem}
            />
          );
      }
    },
    [onToggleItem, onEditItem]
  );

  const keyExtractor = useCallback((item: ListItem) => item.k, []);
  const getItemType = useCallback((item: ListItem) => item.type, []);

  return (
    <FlashList
      data={listData}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      estimatedItemSize={72}
      overrideItemLayout={(layout, item) => {
        if (item.type === "s") layout.size = 40;
        else if (item.type === "c") layout.size = 32;
        else layout.size = 72;
      }}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
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
    color: Colors.lilac[900],
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.text.tertiary,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: Colors.text.secondary,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: Colors.lilac[100],
  },
  categoryCount: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.lilac[700],
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    backgroundColor: Colors.background.surface,
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
    borderColor: Colors.lilac[300],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[600],
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
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  imageContainerChecked: {
    opacity: 0.6,
  },
  itemImage: {
    width: 36,
    height: 36,
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
    borderColor: "#FFF",
    backgroundColor: Colors.lilac[700],
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
    color: Colors.text.primary,
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
    color: Colors.lilac[700],
  },
  editButton: {
    padding: 6,
  },
});
