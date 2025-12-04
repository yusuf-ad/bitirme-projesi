import { Colors } from "@/constants/theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

interface EmptyMealSlotProps {
  mealType: string;
  mealTime: string;
  mealIcon: ImageSourcePropType;
  mealSlot: "breakfast" | "lunch" | "dinner";
  selectedDate: Date;
  onMealAdded?: () => void;
  scrollY: SharedValue<number>;
}

export function EmptyMealSlot({
  mealType,
  mealTime,
  mealIcon,
  mealSlot,
  selectedDate,
  onMealAdded,
  scrollY,
}: EmptyMealSlotProps) {
  // Animated styles for collapsible content - optimized for UI thread
  // Using only GPU-accelerated properties (opacity, transform) for 60fps animations
  const contentAnimatedStyle = useAnimatedStyle(() => {
    "worklet";

    const progress = interpolate(
      scrollY.value,
      [0, 150],
      [0, 1],
      Extrapolation.CLAMP
    );

    // Smooth fade and slide animation
    const opacity = interpolate(progress, [0, 0.3, 1], [0, 0, 1]);
    const translateY = interpolate(progress, [0, 1], [-40, 0]);
    const scale = interpolate(progress, [0, 1], [0.95, 1]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  // Wrapper style for height animation using max-height approach
  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    "worklet";

    const progress = interpolate(
      scrollY.value,
      [0, 150],
      [0, 1],
      Extrapolation.CLAMP
    );

    // Animate max height for smooth expand/collapse
    const maxHeight = interpolate(progress, [0, 1], [0, 160]);

    return {
      maxHeight,
      overflow: "hidden" as const,
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    "worklet";

    const progress = interpolate(
      scrollY.value,
      [0, 150],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      marginBottom: interpolate(progress, [0, 1], [0, 16]),
    };
  });

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/(app)/recipes",
      params: { mealSlot },
    });
  };

  const handleOpenAiRecipe = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/ai-recipe",
      params: {
        mealSlot,
        selectedDate: selectedDate.toISOString().split("T")[0],
        mealType: mealSlot,
      },
    });
  };

  return (
    <Animated.View style={containerAnimatedStyle}>
      <Pressable
        style={({ pressed }) => [
          styles.container,
          pressed && styles.containerPressed,
        ]}
        onPress={handlePress}
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

          <Pressable style={styles.aiButton} onPress={handleOpenAiRecipe}>
            <MaterialIcons
              name="auto-awesome"
              size={18}
              color={Colors.lilac[900]}
            />
            <Text style={styles.aiButtonText}>AI</Text>
          </Pressable>
        </View>

        {/* Empty State Content - Animated */}
        <Animated.View style={wrapperAnimatedStyle}>
          <Animated.View
            style={[styles.emptyContentWrapper, contentAnimatedStyle]}
          >
            <View style={styles.emptyContent}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🍽️</Text>
              </View>
              <Text style={styles.emptyTitle}>{mealType} not added yet</Text>
              <Text style={styles.emptyDescription}>
                Tap to add a meal from the recipes page
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
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
