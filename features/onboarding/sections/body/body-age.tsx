import { Colors } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface BodyAgeProps {
  title: string;
  description?: string;
  onValueChange?: (age: number) => void;
  initialValue?: number;
}

const MIN_AGE = 13;
const MAX_AGE = 100;

export function BodyAge({
  title,
  description,
  onValueChange,
  initialValue = 30,
}: BodyAgeProps) {
  const [age, setAge] = useState<number>(initialValue);
  const scale = useSharedValue(1);

  function handleIncrement() {
    if (age < MAX_AGE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newAge = age + 1;
      setAge(newAge);
      onValueChange?.(newAge);
      animateValue();
    }
  }

  function handleDecrement() {
    if (age > MIN_AGE) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newAge = age - 1;
      setAge(newAge);
      onValueChange?.(newAge);
      animateValue();
    }
  }

  function animateValue() {
    scale.value = withSpring(1.1, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.content}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}

      <View style={styles.selectorContainer}>
        <Pressable
          onPress={handleDecrement}
          disabled={age <= MIN_AGE}
          style={({ pressed }) => [
            styles.button,
            age <= MIN_AGE && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {({ pressed }) => (
            <MaterialCommunityIcons
              name="minus"
              size={32}
              color={
                age <= MIN_AGE
                  ? Colors.text.tertiary
                  : pressed
                  ? Colors.accent.lilac
                  : Colors.text.inverse
              }
            />
          )}
        </Pressable>

        <Animated.View style={[styles.valueContainer, animatedStyle]}>
          <Text style={styles.valueText}>{age}</Text>
          <Text style={styles.labelText}>age</Text>
        </Animated.View>

        <Pressable
          onPress={handleIncrement}
          disabled={age >= MAX_AGE}
          style={({ pressed }) => [
            styles.button,
            age >= MAX_AGE && styles.buttonDisabled,
            pressed && styles.buttonPressed,
          ]}
        >
          {({ pressed }) => (
            <MaterialCommunityIcons
              name="plus"
              size={32}
              color={
                age >= MAX_AGE
                  ? Colors.text.tertiary
                  : pressed
                  ? Colors.accent.lilac
                  : Colors.text.inverse
              }
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 11,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 40,
    color: "#2D3142",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#5D6270",
    marginBottom: 33,
    maxWidth: 371,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 80,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  valueContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 48,
    minWidth: 160,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  valueText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 56,
    lineHeight: 64,
    color: Colors.text.primary,
    letterSpacing: -1,
  },
  labelText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    lineHeight: 16,
    color: Colors.text.secondary,
    marginTop: 4,
    textTransform: "lowercase",
  },
});
