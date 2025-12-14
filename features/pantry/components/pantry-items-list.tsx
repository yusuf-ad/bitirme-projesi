import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { memo, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PantryItem } from "../types";

interface PantryItemsListProps {
  items: PantryItem[];
  onItemPress: (item: PantryItem) => void;
}

// Calculate days old from created_at
function getDaysOld(createdAt?: string): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Format amount for badge display (convert grams to kg, ml to l)
function getBadgeContent(item: PantryItem): string {
  const unitLower = (item.unit || "").toLowerCase();

  if (unitLower === "g" || unitLower === "gram" || unitLower === "grams") {
    if (item.amount >= 1000) {
      const inKg = item.amount / 1000;
      return `${parseFloat(inKg.toFixed(2))}kg`;
    }
    return `${Math.round(item.amount)}g`;
  }

  if (
    unitLower === "ml" ||
    unitLower === "milliliter" ||
    unitLower === "milliliters"
  ) {
    if (item.amount >= 1000) {
      const l = item.amount / 1000;
      return `${parseFloat(l.toFixed(2))}l`;
    }
    return `${Math.round(item.amount)}ml`;
  }

  if (unitLower === "l" || unitLower === "liter" || unitLower === "liters") {
    return `${parseFloat(item.amount.toFixed(2))}l`;
  }

  if (
    unitLower === "kg" ||
    unitLower === "kilogram" ||
    unitLower === "kilograms"
  ) {
    return `${parseFloat(item.amount.toFixed(2))}kg`;
  }

  return Math.round(item.amount).toString();
}

// Memoized item card for better FlashList performance
const PantryItemCard = memo(function PantryItemCard({
  item,
  onPress,
  Colors,
}: {
  item: PantryItem;
  onPress: () => void;
  Colors: ReturnType<typeof getThemeColors>;
}) {
  const daysOld = useMemo(() => getDaysOld(item.created_at), [item.created_at]);
  const badgeContent = useMemo(() => getBadgeContent(item), [item]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.itemCard,
        { backgroundColor: Colors.background.surface },
        pressed && styles.itemCardPressed,
      ]}
      onPress={onPress}
    >
      {/* Image with badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.spoonacular_image}`,
          }}
          style={styles.itemImage}
          contentFit="contain"
          transition={200}
        />
        <View
          style={[styles.amountBadge, { backgroundColor: Colors.lilac[700] }]}
        >
          <Text style={styles.amountBadgeText}>{badgeContent}</Text>
        </View>
      </View>

      {/* Item info */}
      <View style={styles.itemInfo}>
        <Text
          style={[styles.itemName, { color: Colors.text.primary }]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text style={[styles.itemCategory, { color: Colors.text.tertiary }]}>
          {item.category}
        </Text>
      </View>

      {/* Days old badge */}
      <View
        style={[
          styles.daysOldContainer,
          { backgroundColor: Colors.lilac[100] },
        ]}
      >
        <Text style={[styles.daysOldValue, { color: Colors.lilac[900] }]}>
          {daysOld}
        </Text>
        <Text style={[styles.daysOldLabel, { color: Colors.lilac[700] }]}>
          {daysOld === 1 ? "DAY" : "DAYS"}
        </Text>
      </View>
    </Pressable>
  );
});

// Separator component - memoized for FlashList
function ItemSeparatorComponent() {
  return <View style={styles.separator} />;
}
const ItemSeparator = memo(ItemSeparatorComponent);

export function PantryItemsList({ items, onItemPress }: PantryItemsListProps) {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true);

  const renderItem = ({ item }: { item: PantryItem }) => (
    <PantryItemCard
      item={item}
      onPress={() => onItemPress(item)}
      Colors={Colors}
    />
  );

  const keyExtractor = (item: PantryItem) => item.id;

  return (
    <FlashList
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={ItemSeparator}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  itemCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  imageContainer: {
    position: "relative",
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: 56,
    height: 56,
  },
  amountBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    minWidth: 28,
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  amountBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
    gap: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  itemCategory: {
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  daysOldContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 56,
  },
  daysOldValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  daysOldLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
