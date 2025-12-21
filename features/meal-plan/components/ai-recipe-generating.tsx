import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface AIRecipeGeneratingProps {
  title?: string;
  subtitle?: string;
}

const COOKING_TIPS = [
  "Selecting the perfect ingredients...",
  "Calculating nutritional values...",
  "Crafting cooking instructions...",
  "Balancing flavors and macros...",
  "Almost ready to serve...",
];

export function AIRecipeGenerating({
  title = "Creating Your Recipe",
  subtitle,
}: AIRecipeGeneratingProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;
  const tipOpacity = useRef(new Animated.Value(1)).current;

  // Current tip index state for display
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Spinning animation for icon
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Cycle through tips
    const tipInterval = setInterval(() => {
      // Fade out
      Animated.timing(tipOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Update tip
        setCurrentTipIndex((prev) => (prev + 1) % COOKING_TIPS.length);
        // Fade in
        Animated.timing(tipOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 2500);

    return () => clearInterval(tipInterval);
  }, [spinValue, pulseValue, tipOpacity]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background.primary }]}>
      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100],
              transform: [{ rotate: spin }, { scale: pulseValue }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="chef-hat"
            size={56}
            color={isDark ? themeColors.accent.lilac : Colors.lilac[600]}
          />
        </Animated.View>

        {/* Title */}
        <Text style={[styles.title, { color: themeColors.text.primary }]}>{title}</Text>

        {/* Animated Subtitle/Tip */}
        <Animated.Text style={[styles.subtitle, { color: themeColors.text.secondary, opacity: tipOpacity }]}>
          {subtitle || COOKING_TIPS[currentTipIndex]}
        </Animated.Text>

        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          {COOKING_TIPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index === currentTipIndex 
                    ? (isDark ? themeColors.accent.lilac : Colors.lilac[500]) 
                    : (isDark ? Colors.gray[700] : Colors.gray[300]) 
                },
                index === currentTipIndex && { transform: [{ scale: 1.2 }] },
              ]}
            />
          ))}
        </View>

        {/* Shimmer Line */}
        <ShimmerBar />
      </View>
    </View>
  );
}

function ShimmerBar() {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerValue]);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[styles.shimmerContainer, { backgroundColor: isDark ? Colors.gray[800] : Colors.gray[200] }]}>
      <Animated.View
        style={[
          styles.shimmerBar,
          {
            backgroundColor: isDark ? themeColors.accent.lilac : Colors.lilac[400],
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: Colors.lilac[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Inter",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    minHeight: 44,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shimmerContainer: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  shimmerBar: {
    width: 100,
    height: "100%",
    borderRadius: 2,
  },
});
