import { Colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

interface CalorieProgressBarProps {
  currentValue: number;
  goalValue: number;
  filledColor?: string | string[]; // Can now accept array for gradient
  emptyColor?: string;
  height?: number;
}

export default function CalorieProgressBar({
  currentValue,
  goalValue,
  filledColor = [Colors.lilac[400], Colors.lilac[800]], // Default gradient
  emptyColor = "#F3F4F6",
  height = 12,
}: CalorieProgressBarProps) {
  const rawPercentage = (currentValue / goalValue) * 100;
  const progressPercentage = Math.min(100, Math.max(0, rawPercentage));

  // 1. Fill Animation (0 -> current)
  const animatedProgress = useSharedValue(0);

  // 2. Shimmer Animation
  const shimmerOffset = useSharedValue(-80);

  useEffect(() => {
    // Animate fill width
    animatedProgress.value = withTiming(progressPercentage, {
      duration: 1500,
      easing: Easing.out(Easing.exp),
    });
  }, [progressPercentage]);

  useEffect(() => {
    // Continuous shimmer loop
    shimmerOffset.value = withRepeat(
      withTiming(100, { duration: 1200, easing: Easing.linear }),
      -1, // Infinite
      false // Do not reverse
    );
  }, []);

  const animatedWidthStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      left: `${shimmerOffset.value}%`,
    };
  });

  return (
    <View
      style={[
        styles.progressBarContainer,
        { height, backgroundColor: emptyColor },
      ]}
    >
      {/* Foreground (Filled) with Animation */}
      <Animated.View
        style={[
          styles.progressBarFill,
          animatedWidthStyle,
          { overflow: "hidden" }, // Clip the shimmer
        ]}
      >
        {/* Gradient Fill */}
        <LinearGradient
          colors={
            (Array.isArray(filledColor)
              ? filledColor
              : [filledColor, filledColor]) as [string, string, ...string[]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Shimmer Effect */}
        <Animated.View style={[styles.shimmer, shimmerStyle]}>
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.4)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarContainer: {
    width: "100%",
    borderRadius: 999, // Pill shape
    overflow: "hidden",
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: "50%", // Width of the shimmer beam
    transform: [{ skewX: "-20deg" }],
  },
});
