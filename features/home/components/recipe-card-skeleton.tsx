import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function RecipeCardSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const gradientColors = isDark
    ? ([
        "rgba(191, 90, 242, 0.15)",
        "rgba(191, 90, 242, 0.10)",
        "rgba(191, 90, 242, 0.08)",
        "rgba(191, 90, 242, 0.03)",
      ] as const)
    : ([
        "rgba(120, 73, 182, 0.15)",
        "rgba(120, 73, 182, 0.10)",
        "rgba(120, 73, 182, 0.08)",
        "rgba(120, 73, 182, 0.03)",
      ] as const);

  const skeletonColor = isDark ? themeColors.gray[800] : Colors.gray[200];

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBorder}
      >
        <View
          style={[
            styles.card,
            { backgroundColor: themeColors.background.surface },
          ]}
        >
          <Animated.View
            style={[
              styles.skeletonImage,
              { opacity: shimmerOpacity, backgroundColor: skeletonColor },
            ]}
          />
          <View style={styles.contentContainer}>
            <Animated.View
              style={[
                styles.skeletonTitle,
                { opacity: shimmerOpacity, backgroundColor: skeletonColor },
              ]}
            />
            <Animated.View
              style={[
                styles.skeletonTitleSecond,
                { opacity: shimmerOpacity, backgroundColor: skeletonColor },
              ]}
            />
            <View style={styles.metaContainer}>
              <Animated.View
                style={[
                  styles.skeletonMeta,
                  { opacity: shimmerOpacity, backgroundColor: skeletonColor },
                ]}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    width: "48%",
  },
  gradientBorder: {
    borderRadius: 18,
    padding: 2.5,
    height: 252,
    shadowColor: Colors.lilac[900],
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    flex: 1,
    borderRadius: 15.5,
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: 10 / 9,
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  skeletonTitle: {
    height: 14,
    borderRadius: 4,
  },
  skeletonTitleSecond: {
    height: 14,
    borderRadius: 4,
    width: "80%",
  },
  metaContainer: {
    marginTop: 4,
  },
  skeletonMeta: {
    height: 12,
    borderRadius: 4,
    width: "60%",
  },
});
