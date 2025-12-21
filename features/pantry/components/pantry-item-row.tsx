import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
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
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

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
          <View
            style={[
              styles.checkbox, 
              { 
                borderColor: isDark ? themeColors.border.light : Colors.lilac[300],
                backgroundColor: themeColors.background.surface,
              },
              item.checked && { 
                backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : Colors.lilac[100],
                borderColor: accentColor,
              }
            ]}
          >
            {item.checked && (
              <Feather name="check" size={18} color={accentColor} />
            )}
          </View>
        </Pressable>
      )}

      <Pressable
        style={styles.itemContent}
        onPress={() => onToggle(item.id)}
        android_ripple={{ color: isDark ? "rgba(191, 90, 242, 0.1)" : Colors.lilac[100] }}
        hitSlop={4}
      >
        <Text style={[
          styles.itemName, 
          { color: themeColors.text.primary },
          item.checked && { color: themeColors.text.tertiary, textDecorationLine: "line-through" }
        ]}>
          {item.name}
        </Text>
        {item.amount ? (
          <Text style={[styles.itemAmount, { color: accentColor }]}>
            {item.amount} {item.unit}
          </Text>
        ) : null}
        {showRecipe && item.recipe_name ? (
          <Text style={[styles.itemRecipe, { color: accentColor }]}>{item.recipe_name}</Text>
        ) : null}
      </Pressable>

      {onEdit && (
        <Pressable style={styles.editButton} onPress={() => onEdit(item.id)}>
          <Feather name="edit-2" size={18} color={themeColors.text.tertiary} />
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
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    gap: 3,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "400",
    lineHeight: 20,
    textTransform: "capitalize",
  },
  itemAmount: {
    fontSize: 12,
    fontWeight: "500",
  },
  itemRecipe: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  editButton: {
    padding: 6,
  },
});

