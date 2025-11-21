import { Colors } from "@/constants/theme";
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
  if (items.length === 0) return null;

  const getBadgeContent = (item: PantryItem) => {
    if (item.unit === "g" || item.unit === "gram" || item.unit === "grams") {
      const inKg = item.amount / 1000;
      return `${parseFloat(inKg.toFixed(2))}kg`;
    }
    return Math.round(item.amount).toString();
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.header}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title}</Text>
        <View style={styles.headerRight}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Text style={styles.count}>{items.length} ITEMS</Text>

            <Entypo name="chevron-right" size={16} color="black" />
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
            containerStyle={styles.itemContainer}
            onPress={() => onItemPress?.(item)}
          >
            <View style={styles.imageWrapper}>
              <Image
                source={{
                  uri: `https://spoonacular.com/cdn/ingredients_100x100/${item.spoonacular_image}`,
                }}
                style={styles.image}
                contentFit="contain"
                transition={200}
              />
              <View style={styles.badge}>
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
    color: Colors.lilac[900],
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  count: {
    fontSize: 12,
    color: Colors.gray[500],
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  arrow: {
    width: 16,
    height: 16,
    tintColor: Colors.gray[400],
  },
  listContent: {
    gap: 12,
  },
  itemContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    // backgroundColor: "#F8F9FA", // Light gray background
    backgroundColor: Colors.background.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[100],
  },
  imageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    // backgroundColor: "#F8F9FA", // Light gray background
    backgroundColor: Colors.background.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[100],
  },
  image: {
    width: 50,
    height: 50,
  },
  badge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: Colors.lilac[700], // Green color
    minWidth: 24,
    height: 24,
    paddingHorizontal: 4,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.background.surface,
  },
  badgeText: {
    color: Colors.background.surface,
    fontSize: 12,
    fontWeight: "bold",
  },
});
