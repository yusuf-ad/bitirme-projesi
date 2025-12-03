import { Colors } from "@/constants/theme";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
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
  showDecorations?: boolean;
  decorationSpacing?: number;
  decorationColor?: string;
  filledColor?: string;
  emptyColor?: string;
}

export default function CalorieProgressBar({
  currentValue,
  goalValue,
  showDecorations = true,
  decorationSpacing = 20,
  decorationColor = "rgba(255,255,255,0.3)",
  filledColor = Colors.lilac[800],
  emptyColor = Colors.lilac[100],
}: CalorieProgressBarProps) {
  const rawPercentage = (currentValue / goalValue) * 100;
  const progressPercentage = Math.min(100, Math.max(0, rawPercentage));

  // 1. Fill Animation (0 -> current)
  const animatedProgress = useSharedValue(0);

  // 2. Continuous Pattern Animation
  const patternOffset = useSharedValue(0);

  useEffect(() => {
    // Animate fill width
    animatedProgress.value = withTiming(progressPercentage, { duration: 1000 });
  }, [progressPercentage]);

  useEffect(() => {
    // Start continuous pattern loop - runs once on mount (or if spacing changes)
    patternOffset.value = withRepeat(
      withTiming(decorationSpacing, { duration: 1000, easing: Easing.linear }),
      -1, // Infinite
      false // Do not reverse
    );
  }, [decorationSpacing]);

  const animatedWidthStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value}%`,
    };
  });

  // Dynamic Color Logic
  const animatedColorStyle = useAnimatedStyle(() => {
    // Interpolate color based on progress
    let color = filledColor;
    if (rawPercentage > 100) color = "#EF4444"; // Red if over
    else if (rawPercentage > 80) color = "#10B981"; // Green if close to goal
    else if (rawPercentage > 50) color = "#8B5CF6"; // Purple/Lilac
    else color = Colors.lilac[800]; // Default dark lilac

    return {
      backgroundColor: withTiming(color, { duration: 500 }),
    };
  });

  const animatedPatternStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: -patternOffset.value }],
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.remainingText}>
        <Text style={styles.remainingNumber}>{Math.round(currentValue)}</Text> /
        {goalValue} cal goal
      </Text>

      <View style={styles.progressBarContainer}>
        {/* Background (Empty) */}
        <View
          style={[
            styles.progressBarEmpty,
            { backgroundColor: emptyColor, position: "absolute", width: "100%" },
          ]}
        />

        {/* Foreground (Filled) with Animation */}
        <Animated.View
          style={[
            styles.progressBarFill,
            animatedWidthStyle,
            animatedColorStyle,
          ]}
        >
          {showDecorations && (
            <View
              style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}
            >
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: -decorationSpacing, // Extra space for sliding
                    flexDirection: "row",
                    gap: decorationSpacing,
                    paddingLeft: 0,
                  },
                  animatedPatternStyle,
                ]}
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      height: "150%",
                      width: 8,
                      backgroundColor: decorationColor,
                      transform: [{ rotate: "20deg" }, { translateY: -4 }],
                    }}
                  />
                ))}
              </Animated.View>
            </View>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  remainingText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: Colors.gray[400],
  },
  remainingNumber: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 24,
    color: Colors.text.primary,
  },
  progressBarContainer: {
    width: "100%",
    height: 12,
    borderRadius: 8,
    backgroundColor: Colors.lilac[100], // Default background
    overflow: "hidden", // Clip the animated fill
    position: "relative",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 8,
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
  },
  progressBarEmpty: {
    height: "100%",
    borderRadius: 8,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 12,
    color: Colors.gray[400],
  },
});
