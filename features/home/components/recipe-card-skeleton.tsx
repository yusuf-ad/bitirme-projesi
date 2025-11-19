import { Colors } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function RecipeCardSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={[
          "rgba(120, 73, 182, 0.15)",
          "rgba(120, 73, 182, 0.10)",
          "rgba(120, 73, 182, 0.08)",
          "rgba(120, 73, 182, 0.03)",
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradientBorder}
      >
        <View style={styles.card}>
          <Animated.View
            style={[styles.skeletonImage, { opacity: shimmerOpacity }]}
          />
          <View style={styles.contentContainer}>
            <Animated.View
              style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
            />
            <Animated.View
              style={[styles.skeletonTitleSecond, { opacity: shimmerOpacity }]}
            />
            <View style={styles.metaContainer}>
              <Animated.View
                style={[styles.skeletonMeta, { opacity: shimmerOpacity }]}
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
    height: 272,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background.surface,
    borderRadius: 15.5,
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: 10 / 9,
    backgroundColor: Colors.gray[200],
  },
  contentContainer: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  skeletonTitle: {
    height: 14,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  skeletonTitleSecond: {
    height: 14,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    width: "80%",
  },
  metaContainer: {
    marginTop: 4,
  },
  skeletonMeta: {
    height: 12,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    width: "60%",
  },
});
