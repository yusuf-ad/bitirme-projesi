import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 25,
  stiffness: 400,
  mass: 0.5,
};

interface AttachMenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  index: number;
  progress: SharedValue<number>;
}

export function AttachMenuRow({
  icon,
  label,
  onPress,
  index,
  progress,
}: AttachMenuRowProps) {
  const delay = index * 30;

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [15, 0],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      progress.value,
      [0, 0.5, 1],
      [0, 0.5, 1],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.9, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity: withDelay(delay, withSpring(opacity, SPRING_CONFIG)),
      transform: [
        { translateY: withDelay(delay, withSpring(translateY, SPRING_CONFIG)) },
        { scale: withDelay(delay, withSpring(scale, SPRING_CONFIG)) },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.row, animatedStyle]}
      android_ripple={{ color: "rgba(255, 255, 255, 0.1)" }}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  label: {
    fontSize: 17,
    fontWeight: "500",
    color: "#FFFFFF",
    fontFamily: "Poppins",
  },
});
