import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { PantryItem } from "../types";

interface PantryItemRowProps {
  item: PantryItem;
  onToggle: (id: string) => void;
  onEdit?: (id: string) => void;
  showCheckbox?: boolean;
  showRecipe?: boolean;
}

export function PantryItemRow({
  item,
  onToggle,
  onEdit,
  showCheckbox = true,
  showRecipe = true,
}: PantryItemRowProps) {
  return (
    <Animated.View
      style={styles.itemRow}
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      layout={LinearTransition.duration(200)}
    >
      {showCheckbox && (
        <Pressable
          onPress={() => onToggle(item.id)}
          style={styles.checkboxContainer}
        >
          <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
            {item.checked && (
              <Feather name="check" size={18} color={Colors.lilac[900]} />
            )}
          </View>
        </Pressable>
      )}

      <View style={styles.itemContent}>
        <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
          {item.name}
        </Text>
        {item.amount ? (
          <Text style={styles.itemAmount}>{item.amount}</Text>
        ) : null}
        {showRecipe && item.recipe ? (
          <Text style={styles.itemRecipe}>{item.recipe}</Text>
        ) : null}
      </View>

      {onEdit && (
        <Pressable
          style={styles.editButton}
          onPress={() => onEdit(item.id)}
        >
          <Feather name="edit-2" size={18} color={Colors.gray[300]} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    gap: 8,
  },
  checkboxContainer: {
    padding: 2,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.lilac[300],
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.surface,
  },
  checkboxChecked: {
    backgroundColor: Colors.lilac[100],
    borderColor: Colors.lilac[600],
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    color: Colors.purple[800],
    fontWeight: "400",
    lineHeight: 20,
  },
  itemNameChecked: {
    color: Colors.gray[400],
    textDecorationLine: "line-through",
  },
  itemAmount: {
    fontSize: 12,
    color: Colors.lilac[600],
    fontWeight: "500",
  },
  itemRecipe: {
    fontSize: 11,
    color: Colors.lilac[700],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  editButton: {
    padding: 6,
  },
});

