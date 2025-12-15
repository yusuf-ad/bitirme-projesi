import { Colors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import {
    ImageSourcePropType,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import Animated, { FadeInDown } from "react-native-reanimated";

interface EmptyMealSlotProps {
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  mealSlot: "breakfast" | "lunch" | "dinner";
  selectedDate: Date;
  onMealAdded?: () => void;
}

export function EmptyMealSlot({
  mealType,
  mealTime,
  mealIcon,
  mealSlot,
  selectedDate,
  onMealAdded,
}: EmptyMealSlotProps) {
  const { impact } = useHaptics();

  // Check if date is in the past
  const isPastDate = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const normalizedSelectedDate = new Date(selectedDate);
    normalizedSelectedDate.setHours(0, 0, 0, 0);
    return normalizedSelectedDate < today;
  }, [selectedDate]);

  const handlePress = async () => {
    if (isPastDate) return;
    impact();
    router.push({
      pathname: "/(app)/recipes",
      params: { mealSlot },
    });
  };

  const handleOpenAiRecipe = async () => {
    if (isPastDate) return;
    impact();
    // Format date as YYYY-MM-DD without UTC conversion
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;

    router.push({
      pathname: "/ai-recipe",
      params: {
        mealSlot,
        selectedDate: formattedDate,
        mealType: mealSlot,
      },
    });
  };

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && !isPastDate && styles.containerPressed,
          isPastDate && styles.containerDisabled,
        ]}
        onPress={handlePress}
        disabled={isPastDate}
      >
        {/* Header */}
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

          {!isPastDate && (
            <Pressable style={styles.aiButton} onPress={handleOpenAiRecipe}>
              <MaterialIcons
                name="auto-awesome"
                size={18}
                color={Colors.lilac[900]}
              />
              <Text style={styles.aiButtonText}>AI</Text>
            </Pressable>
          )}
        </View>

        {/* Empty State Content - Static */}
        <View style={styles.emptyContentWrapper}>
          <View style={styles.emptyContent}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>🍽️</Text>
            </View>
            <Text style={styles.emptyTitle}>
              {isPastDate ? `No ${mealType.toLowerCase()} recorded` : `${mealType} not added yet`}
            </Text>
            <Text style={styles.emptyDescription}>
              {isPastDate 
                ? "You can only view past meals"
                : "Tap to add a meal from the recipes page"}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingHorizontal: 12,
    paddingBottom: 16,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    borderRadius: 12,
    borderStyle: "dashed",
  },
  containerPressed: {
    opacity: 0.7,
    borderColor: Colors.lilac[500],
  },
  containerDisabled: {
    opacity: 0.5,
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
  emptyContentWrapper: {
    minHeight: 160,
  },
  emptyContent: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 8,
  },
  emptyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: Colors.text.primary,
    textAlign: "center",
  },
  emptyDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: "center",
    maxWidth: 240,
  },
  aiButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
    backgroundColor: Colors.lilac[100],
  },
  aiButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
});
