import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { FloatingChip } from "./floating-chip";
import { FloatingSelectedBarProps, IngredientItem } from "./types";

interface FloatingSelectedBarComponentProps extends FloatingSelectedBarProps {
  isScrolledDown: boolean;
}

export const FloatingSelectedBar = ({
  selectedItems,
  isScrolledDown,
  getIngredientKey,
  toggleIngredient,
}: FloatingSelectedBarComponentProps) => {
  const floatingSelectedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isScrolledDown ? 1 : 0, { duration: 200 }),
  }));

  if (selectedItems.length === 0 || !isScrolledDown) {
    return null;
  }

  return (
    <Animated.View style={[styles.floatingSelectedBar, floatingSelectedStyle]}>
      <LinearGradient
        colors={["#FFFFFF", "#FAFAFA"]}
        style={styles.floatingSelectedGradient}
      >
        <View style={styles.floatingSelectedHeader}>
          <View style={styles.floatingSelectedTitleRow}>
            <View style={styles.floatingSelectedIcon}>
              <Ionicons
                name="checkmark-circle"
                size={14}
                color={Colors.lilac[600]}
              />
            </View>
            <Text style={styles.floatingSelectedTitle}>Selected</Text>
            <View style={styles.floatingSelectedBadge}>
              <Text style={styles.floatingSelectedBadgeText}>
                {selectedItems.length}
              </Text>
            </View>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.floatingChipsContainer}
        >
          {selectedItems.map((item: IngredientItem) => (
            <FloatingChip
              key={`floating-${getIngredientKey(item)}`}
              item={item}
              onPress={() => toggleIngredient(item)}
            />
          ))}
        </ScrollView>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingSelectedBar: {
    position: "absolute",
    top: 0,
    left: -20,
    right: -20,
    zIndex: 100,
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingSelectedGradient: {
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: Colors.lilac[200],
    backgroundColor: "#FFFFFF",
  },
  floatingSelectedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  floatingSelectedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  floatingSelectedIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  floatingSelectedTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  floatingSelectedBadge: {
    backgroundColor: Colors.lilac[600],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  floatingSelectedBadgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "700",
  },
  floatingChipsContainer: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: "row",
  },
});
