import { Colors, getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MealActionModal } from "./meal-action-modal";

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
  isEaten?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  onToggleEaten?: (eaten: boolean) => void;
  onReplace?: () => void;
  isLoading?: boolean;
}

function MealCard({
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
  isEaten = false,
  onPress,
  onDelete,
  onToggleEaten,
  onReplace,
  isLoading,
}: MealCardProps) {
  const mealActionModalRef = useRef<BottomSheetModal>(null);
  const { impact, notification } = useHaptics();
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  const handleEditPress = async () => {
    impact();
    mealActionModalRef.current?.present();
  };

  const handleDelete = async () => {
    notification();
    onDelete?.();
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    return (
      <View style={styles.deleteAction}>
        <Pressable
          style={styles.deleteButton}
          onPress={isLoading ? undefined : handleDelete}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="delete-outline" size={24} color="#fff" />
              <Text style={styles.deleteText}>Delete</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <>
      <Swipeable
        renderRightActions={renderRightActions}
        overshootRight={false}
        friction={2}
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: themeColors.background.surface,
              borderColor: isDark
                ? themeColors.border.light
                : Colors.lilac[200],
            },
          ]}
        >
          {/* Meal Header */}
          <View
            style={[
              styles.header,
              {
                borderBottomColor: isDark
                  ? themeColors.border.light
                  : Colors.lilac[200],
              },
            ]}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <View
                style={[
                  styles.mealIconContainer,
                  {
                    borderColor: isDark
                      ? themeColors.border.light
                      : Colors.lilac[200],
                    backgroundColor: isDark
                      ? themeColors.background.tertiary
                      : "#F3F3F3",
                  },
                ]}
              >
                <Image source={mealIcon} style={styles.mealIcon} />
              </View>
              <View style={styles.mealInfo}>
                <View style={styles.mealTypeRow}>
                  <Text
                    style={[
                      styles.mealType,
                      { color: themeColors.text.primary },
                    ]}
                  >
                    {mealType}
                  </Text>
                  {isEaten && (
                    <View style={styles.eatenBadge}>
                      <Ionicons
                        name="checkmark-circle"
                        size={16}
                        color={Colors.semantic.success.main}
                      />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.mealTime,
                    { color: themeColors.text.tertiary },
                  ]}
                >
                  {mealTime}
                </Text>
              </View>
            </View>

            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <CustomButton
                containerStyle={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: isDark
                    ? themeColors.border.light
                    : Colors.lilac[200],
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  backgroundColor: "transparent",
                }}
                onPress={handleEditPress}
              >
                <Feather name="edit-3" size={20} color={accentColor} />
              </CustomButton>
            </View>
          </View>

          {/* Recipe Card */}
          <Pressable
            onPress={onPress}
            style={[
              styles.recipeCard,
              {
                backgroundColor: isDark
                  ? themeColors.background.tertiary
                  : Colors.gray[100],
              },
            ]}
          >
            <Image
              source={recipeImage}
              style={styles.recipeImage}
              cachePolicy="memory-disk"
              contentFit="cover"
            />
            <View style={styles.recipeInfo}>
              <View style={styles.recipeTextContainer}>
                <Text
                  style={[
                    styles.recipeName,
                    { color: themeColors.text.primary },
                  ]}
                >
                  {recipeName}
                </Text>

                <View style={styles.recipeMetaContainer}>
                  <View style={styles.metaItem}>
                    <Image
                      source={require("@/assets/icons/clock-icon.svg")}
                      style={styles.metaIcon}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      {prepTime}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.separator,
                      { color: themeColors.text.secondary },
                    ]}
                  >
                    |
                  </Text>
                  <View style={styles.metaItem}>
                    <Image
                      source={require("@/assets/icons/flame-icon.svg")}
                      style={styles.metaIcon}
                    />
                    <Text
                      style={[
                        styles.metaText,
                        { color: themeColors.text.secondary },
                      ]}
                    >
                      {calories}
                    </Text>
                  </View>
                </View>

                {/* Macronutrients */}
                {(carbs || protein || fat) && (
                  <View style={styles.macrosContainer}>
                    {carbs && (
                      <LinearGradient
                        colors={
                          isDark
                            ? [
                                "rgba(191, 90, 242, 0.3)",
                                "rgba(191, 90, 242, 0.15)",
                                "rgba(191, 90, 242, 0.08)",
                              ]
                            : [
                                "rgba(120, 73, 182, 0.25)",
                                "rgba(120, 73, 182, 0.15)",
                                "rgba(120, 73, 182, 0.08)",
                              ]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.macroGradientWrapper}
                      >
                        <View
                          style={[
                            styles.macroItem,
                            { backgroundColor: themeColors.background.surface },
                          ]}
                        >
                          <Text
                            style={[
                              styles.macroLabel,
                              { color: themeColors.text.secondary },
                            ]}
                          >
                            Carbs
                          </Text>
                          <Text
                            style={[styles.macroValue, { color: accentColor }]}
                          >
                            {carbs}
                          </Text>
                        </View>
                      </LinearGradient>
                    )}
                    {protein && (
                      <LinearGradient
                        colors={
                          isDark
                            ? [
                                "rgba(191, 90, 242, 0.3)",
                                "rgba(191, 90, 242, 0.15)",
                                "rgba(191, 90, 242, 0.08)",
                              ]
                            : [
                                "rgba(120, 73, 182, 0.25)",
                                "rgba(120, 73, 182, 0.15)",
                                "rgba(120, 73, 182, 0.08)",
                              ]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.macroGradientWrapper}
                      >
                        <View
                          style={[
                            styles.macroItem,
                            { backgroundColor: themeColors.background.surface },
                          ]}
                        >
                          <Text
                            style={[
                              styles.macroLabel,
                              { color: themeColors.text.secondary },
                            ]}
                          >
                            Protein
                          </Text>
                          <Text
                            style={[styles.macroValue, { color: accentColor }]}
                          >
                            {protein}
                          </Text>
                        </View>
                      </LinearGradient>
                    )}
                    {fat && (
                      <LinearGradient
                        colors={
                          isDark
                            ? [
                                "rgba(191, 90, 242, 0.3)",
                                "rgba(191, 90, 242, 0.15)",
                                "rgba(191, 90, 242, 0.08)",
                              ]
                            : [
                                "rgba(120, 73, 182, 0.25)",
                                "rgba(120, 73, 182, 0.15)",
                                "rgba(120, 73, 182, 0.08)",
                              ]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.macroGradientWrapper}
                      >
                        <View
                          style={[
                            styles.macroItem,
                            { backgroundColor: themeColors.background.surface },
                          ]}
                        >
                          <Text
                            style={[
                              styles.macroLabel,
                              { color: themeColors.text.secondary },
                            ]}
                          >
                            Fat
                          </Text>
                          <Text
                            style={[styles.macroValue, { color: accentColor }]}
                          >
                            {fat}
                          </Text>
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

      <MealActionModal
        ref={mealActionModalRef}
        mealType={mealType}
        recipeName={recipeName}
        isEaten={isEaten}
        onToggleEaten={onToggleEaten}
        onReplace={onReplace}
        onDelete={onDelete}
      />
    </>
  );
}

export default memo(MealCard);

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderWidth: 1,
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
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    borderWidth: 1,
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
  mealTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  mealType: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 21,
  },
  eatenBadge: {
    justifyContent: "center",
    alignItems: "center",
  },
  mealTime: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 21,
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
    gap: 8,
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
  },
  recipeDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 16,
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
  },
  separator: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 24,
    letterSpacing: -1,
  },
  macrosContainer: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  macroGradientWrapper: {
    borderRadius: 8,
    padding: 1,
    shadowColor: "#000",
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
    paddingHorizontal: 4,
    paddingVertical: 4,
    borderRadius: 7,
  },
  macroLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 11,
    lineHeight: 16,
  },
  macroValue: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 16,
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
