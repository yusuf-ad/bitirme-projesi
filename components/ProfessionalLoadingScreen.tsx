import { Colors } from "@/constants/theme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export interface ProfessionalLoadingScreenProps {
  title?: string;
  subtitle?: string;
}

/**
 * Professional Loading Screen Component with smooth animations
 * Reusable across all profile screens
 */
export function ProfessionalLoadingScreen({
  title = "Loading Your Preferences",
  subtitle = "Fetching your dietary information...",
}: ProfessionalLoadingScreenProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [spinValue, pulseValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.professionalLoadingContainer}>
      <View style={styles.loadingContent}>
        <Animated.View
          style={[
            styles.loadingIconContainer,
            {
              transform: [{ rotate: spin }, { scale: pulseValue }],
            },
          ]}
        >
          <MaterialCommunityIcons
            name="food-apple"
            size={48}
            color={Colors.lilac[500]}
          />
        </Animated.View>
        <Text style={styles.loadingTitle}>{title}</Text>
        <Text style={styles.loadingSubtitle}>{subtitle}</Text>
        <View style={styles.loadingDotsContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseValue,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 0.3],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  professionalLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.secondary,
  },
  loadingContent: {
    alignItems: "center",
    padding: 32,
  },
  loadingIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text.primary,
    fontFamily: "Inter",
    marginBottom: 8,
    textAlign: "center",
  },
  loadingSubtitle: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontFamily: "Inter",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  loadingDotsContainer: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lilac[500],
  },
});
