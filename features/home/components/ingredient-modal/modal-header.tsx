import { Colors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { DisplayAllergy } from "./types";

interface ModalHeaderProps {
  userAllergies: DisplayAllergy[];
  onShowAllergies: () => void;
  onClose: () => void;
}

export const ModalHeader = ({
  userAllergies,
  onShowAllergies,
  onClose,
}: ModalHeaderProps) => {
  const { impact } = useHaptics();
  
  return (
    <Animated.View
      entering={FadeInDown.delay(100).springify()}
      style={styles.header}
    >
      <View style={styles.titleContainer}>
        <View style={styles.titleIconWrapper}>
          <Ionicons name="restaurant" size={20} color={Colors.lilac[600]} />
        </View>
        <View>
          <Text style={styles.title}>Ingredient Search</Text>
          <Text style={styles.titleSubtext}>
            Find recipes with what you have
          </Text>
        </View>
      </View>

      <View style={styles.headerRightButtons}>
        {userAllergies.length > 0 && (
          <Pressable
            hitSlop={24}
            onPress={() => {
              impact(Haptics.ImpactFeedbackStyle.Medium);
              onShowAllergies();
            }}
            style={styles.allergyBadge}
          >
            <LinearGradient
              colors={["#FEF2F2", "#FEE2E2"]}
              style={styles.allergyBadgeGradient}
            >
              <View style={styles.allergyIconContainer}>
                <MaterialCommunityIcons
                  name="shield-alert-outline"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
              <Text style={styles.allergyCount}>{userAllergies.length}</Text>
              <Ionicons name="chevron-forward" size={12} color="#DC2626" />
            </LinearGradient>
          </Pressable>
        )}

        <Pressable
          hitSlop={24}
          onPress={() => {
            impact(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
          style={({ pressed }) => [
            styles.closeButton,
            pressed && styles.closeButtonPressed,
          ]}
        >
          <AntDesign name="close" size={18} color="#9CA3AF" />
        </Pressable>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  titleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    letterSpacing: -0.3,
  },
  titleSubtext: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  headerRightButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  allergyBadge: {
    borderRadius: 20,
    overflow: "hidden",
  },
  allergyBadgeGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  allergyIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
  },
  allergyCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DC2626",
    marginHorizontal: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  closeButtonPressed: {
    backgroundColor: "#E5E7EB",
    transform: [{ scale: 0.95 }],
  },
});
