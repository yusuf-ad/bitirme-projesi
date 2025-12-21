import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomActionsProps } from "./types";

export const BottomActions = ({
  selectedCount,
  onClearAll,
  onApply,
}: BottomActionsProps) => {
  const { bottom } = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInDown.delay(400).springify()}
      style={[
        styles.bottomContainer,
        {
          paddingBottom: bottom + 12,
        },
      ]}
    >
      <Pressable
        style={({ pressed }) => [
          styles.clearButton,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onClearAll();
        }}
      >
        <Ionicons name="trash-outline" size={18} color={Colors.gray[600]} />
        <Text style={styles.clearButtonText}>Clear All</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [
          styles.applyButton,
          pressed && styles.buttonPressed,
          selectedCount === 0 && styles.applyButtonDisabled,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onApply();
        }}
      >
        <LinearGradient
          colors={
            selectedCount > 0
              ? [Colors.lilac[700], Colors.lilac[900]]
              : [Colors.gray[300], Colors.gray[400]]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.applyButtonGradient}
        >
          <Ionicons name="checkmark-circle" size={18} color="white" />
          <Text style={styles.applyButtonText}>Select Ingredients</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 8 : 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    backgroundColor: "#FAFAFA",
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.gray[600],
  },
  applyButton: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  applyButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  applyButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    letterSpacing: 0.2,
  },
});
