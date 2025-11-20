import { Colors } from "@/constants/theme";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

export function PantrySkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const renderCategory = (key: number) => (
    <View key={key} style={styles.categoryContainer}>
      {/* Category Header */}
      <View style={styles.headerContainer}>
        <Animated.View
          style={[styles.skeletonTitle, { opacity: shimmerOpacity }]}
        />
      </View>

      {/* Horizontal Items List */}
      <View style={styles.itemsRow}>
        {[1, 2, 3, 4].map((itemKey) => (
          <View key={itemKey} style={styles.cardContainer}>
            <Animated.View
              style={[styles.skeletonImage, { opacity: shimmerOpacity }]}
            />
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Simulate a few categories */}
      {[1, 2, 3, 4].map((i) => renderCategory(i))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 24,
  },
  categoryContainer: {
    gap: 12,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
  },
  skeletonTitle: {
    height: 16,
    width: 100,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  skeletonCount: {
    height: 12,
    width: 60,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  itemsRow: {
    flexDirection: "row",
    gap: 12,
    // Ensure overflow is handled or just show what fits
    overflow: "hidden",
  },
  cardContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: Colors.background.surface,
    borderWidth: 1,
    borderColor: Colors.lilac[100],
    position: "relative",
    overflow: "hidden",
  },
  skeletonImage: {
    width: "100%",
    height: "100%",
    backgroundColor: Colors.gray[200],
  },
  badgeContainer: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.background.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  skeletonBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[300],
  },
});
