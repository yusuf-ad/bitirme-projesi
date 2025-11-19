import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";

interface MealCardProps {
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  recipeName: string;
  recipeImage: ImageSourcePropType;
  prepTime: string;
  calories: string;
  carbs?: string;
  protein?: string;
  fat?: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export default function MealCard({
  mealType,
  mealTime,
  mealIcon,
  recipeName,
  recipeImage,
  prepTime,
  calories,
  carbs,
  protein,
  fat,
  onPress,
  onDelete,
}: MealCardProps) {
  const handleEditPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(app)/recipes");
  };

  const handleDelete = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onDelete?.();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0.8],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ scale }],
          },
        ]}
      >
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <MaterialIcons name="delete-outline" size={24} color="#fff" />
          <Text style={styles.deleteText}>Sil</Text>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <View style={styles.container}>
        {/* Meal Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={styles.mealIconContainer}>
              <Image source={mealIcon} style={styles.mealIcon} />
            </View>
            <View style={styles.mealInfo}>
              <Text style={styles.mealType}>{mealType}</Text>
              <Text style={styles.mealTime}>{mealTime}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <CustomButton
              containerStyle={{
                width: 36,
                height: 36,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 4,
                borderWidth: 1,
                borderColor: Colors.lilac[200],
                paddingHorizontal: 0,
                paddingVertical: 0,
              }}
              onPress={handleEditPress}
            >
              <Feather name="edit-3" size={20} color={Colors.lilac[900]} />
            </CustomButton>
          </View>
        </View>

        {/* Recipe Card */}
        <Pressable onPress={onPress} style={styles.recipeCard}>
          <Image source={recipeImage} style={styles.recipeImage} />
          <View style={styles.recipeInfo}>
            <View style={styles.recipeTextContainer}>
              <Text style={styles.recipeName}>{recipeName}</Text>

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

              {/* Macronutrients */}
              {(carbs || protein || fat) && (
                <View style={styles.macrosContainer}>
                  {carbs && (
                    <LinearGradient
                      colors={[
                        "rgba(120, 73, 182, 0.25)",
                        "rgba(120, 73, 182, 0.15)",
                        "rgba(120, 73, 182, 0.08)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.macroGradientWrapper}
                    >
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Carbs</Text>
                        <Text style={styles.macroValue}>{carbs}</Text>
                      </View>
                    </LinearGradient>
                  )}
                  {protein && (
                    <LinearGradient
                      colors={[
                        "rgba(120, 73, 182, 0.25)",
                        "rgba(120, 73, 182, 0.15)",
                        "rgba(120, 73, 182, 0.08)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.macroGradientWrapper}
                    >
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Protein</Text>
                        <Text style={styles.macroValue}>{protein}</Text>
                      </View>
                    </LinearGradient>
                  )}
                  {fat && (
                    <LinearGradient
                      colors={[
                        "rgba(120, 73, 182, 0.25)",
                        "rgba(120, 73, 182, 0.15)",
                        "rgba(120, 73, 182, 0.08)",
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={styles.macroGradientWrapper}
                    >
                      <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>Fat</Text>
                        <Text style={styles.macroValue}>{fat}</Text>
                      </View>
                    </LinearGradient>
                  )}
                </View>
              )}
            </View>
          </View>
        </Pressable>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,

    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[200],
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
    height: "100%",
    gap: 8,
  },
  recipeTextContainer: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
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
  macrosContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  macroGradientWrapper: {
    borderRadius: 8,
    padding: 1,
    shadowColor: Colors.lilac[900],
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  macroItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.background.surface,
    borderRadius: 7,
  },
  macroLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 16,
    color: Colors.gray[500],
  },
  macroValue: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 16,
    color: Colors.lilac[900],
  },
  deleteAction: {
    justifyContent: "center",
    alignItems: "flex-end",
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: Colors.semantic.error.main,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
    borderRadius: 12,
    gap: 4,
  },
  deleteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
});
