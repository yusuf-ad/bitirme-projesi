import { Colors } from "@/constants/theme";
import { Image } from "expo-image";
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MealCardProps {
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  recipeName: string;
  recipeDescription: string;
  recipeImage: ImageSourcePropType;
  prepTime: string;
  calories: string;
  onPress?: () => void;
}

export default function MealCard({
  mealType,
  mealTime,
  mealIcon,
  recipeName,
  recipeDescription,
  recipeImage,
  prepTime,
  calories,
  onPress,
}: MealCardProps) {
  return (
    <View style={styles.container}>
      {/* Meal Header */}
      <View style={styles.header}>
        <View style={styles.mealIconContainer}>
          <Image source={mealIcon} style={styles.mealIcon} />
        </View>
        <View style={styles.mealInfo}>
          <Text style={styles.mealType}>{mealType}</Text>
          <Text style={styles.mealTime}>{mealTime}</Text>
        </View>
        <Pressable onPress={onPress} style={styles.arrowButton}>
          <Image
            source={require("@/assets/icons/arrow-right.svg")}
            style={styles.arrowIcon}
          />
        </Pressable>
      </View>

      {/* Recipe Card */}
      <Pressable onPress={onPress} style={styles.recipeCard}>
        <Image source={recipeImage} style={styles.recipeImage} />
        <View style={styles.recipeInfo}>
          <View style={styles.recipeTextContainer}>
            <Text style={styles.recipeName}>{recipeName}</Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>
              {recipeDescription}
            </Text>
            <View style={styles.recipeMetaContainer}>
              <View style={styles.metaItem}>
                <Image
                  source={require("@/assets/icons/clock-icon.svg")}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>{prepTime}</Text>
              </View>
              <Text style={styles.separator}>|</Text>
              <View style={styles.metaItem}>
                <Image
                  source={require("@/assets/icons/flame-icon.svg")}
                  style={styles.metaIcon}
                />
                <Text style={styles.metaText}>{calories}</Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
    borderStyle: "dashed",
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    justifyContent: "center",
    alignItems: "center",
  },
  mealIcon: {
    width: 40,
    height: 40,
  },
  mealInfo: {
    flex: 1,
    justifyContent: "center",
  },
  mealType: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
    color: Colors.text.primary,
  },
  mealTime: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 21,
    color: Colors.gray[400],
  },
  arrowButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36,
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  recipeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
  },
  recipeImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  recipeInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipeTextContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
    padding: 4,
  },
  recipeName: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  recipeDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.text.primary,
  },
  recipeMetaContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaIcon: {
    width: 16,
    height: 16,
  },
  metaText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    color: Colors.gray[600],
  },
  separator: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    letterSpacing: -1,
    color: Colors.gray[600],
  },
});
