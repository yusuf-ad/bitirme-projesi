import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import Entypo from "@expo/vector-icons/Entypo";
import { Image } from "expo-image";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PantryItem } from "../types";

interface PantryCategoryPreviewProps {
  title: string;
  items: PantryItem[];
  onPress?: () => void;
  onItemPress?: (item: PantryItem) => void;
}

export function PantryCategoryPreview({
  title,
  items,
  onPress,
  onItemPress,
}: PantryCategoryPreviewProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  if (items.length === 0) return null;

  const getBadgeContent = (item: PantryItem) => {
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
  };

  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];
  const imageBackground = isDark
    ? themeColors.background.tertiary
    : themeColors.background.surface;
  const borderColor = isDark ? themeColors.border.light : Colors.lilac[100];
  const badgeBackground = isDark ? themeColors.accent.lilac : Colors.lilac[700];

  return (
    <View>
      <TouchableOpacity
        style={styles.header}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: accentColor }]}>{title}</Text>
        <View style={styles.headerRight}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text style={[styles.count, { color: themeColors.text.tertiary }]}>
              {items.length} ITEMS
            </Text>

            <Entypo
              name="chevron-right"
              size={16}
              color={themeColors.text.primary}
            />
          </View>
        </View>
      </TouchableOpacity>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {items.map((item, index) => (
          <CustomButton
            key={`${item.spoonacular_id || item.id}-${index}`}
            containerStyle={[
              styles.itemContainer,
              { backgroundColor: imageBackground, borderColor },
            ]}
            onPress={() => onItemPress?.(item)}
          >
            <View
              style={[
                styles.imageWrapper,
                { backgroundColor: imageBackground, borderColor },
              ]}
            >
              <Image
                source={{
                  uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.spoonacular_image}`,
                }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: badgeBackground,
                    borderColor: imageBackground,
                  },
                ]}
              >
                <Text style={styles.badgeText}>{getBadgeContent(item)}</Text>
              </View>
            </View>
          </CustomButton>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  count: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  arrow: {
    width: 16,
    height: 16,
  },
  listContent: {
    gap: 12,
  },
  itemContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  image: {
    width: 50,
    height: 50,
  },
  badge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
