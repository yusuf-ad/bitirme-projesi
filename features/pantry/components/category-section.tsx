import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { PantryItem } from "../types";
import { PantryItemRow } from "./pantry-item-row";

interface CategorySectionProps {
  title: string;
  items: PantryItem[];
  onToggleItem: (id: string) => void;
  onEditItem?: (id: string) => void;
  showCheckbox?: boolean;
  showRecipe?: boolean;
}

export function CategorySection({
  title,
  items,
  onToggleItem,
  onEditItem,
  showCheckbox = true,
  showRecipe = true,
}: CategorySectionProps) {
  if (items.length === 0) return null;

  return (
    <View style={styles.categorySection}>
      <Text style={styles.categoryTitle}>{title}</Text>
      {items.map((item) => (
        <PantryItemRow
          key={item.id}
          item={item}
          onToggle={onToggleItem}
          onEdit={onEditItem}
          showCheckbox={showCheckbox}
          showRecipe={showRecipe}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  categorySection: {
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.lilac[900],
    marginBottom: 2,
    marginTop: 4,
  },
});

