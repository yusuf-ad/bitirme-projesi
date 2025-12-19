import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface BodyAgeProps {
  title: string;
  description?: string;
  onValueChange?: (age: number) => void;
  initialValue?: number;
}

const MIN_AGE = 13;
const MAX_AGE = 100;

// Age categories for visual feedback
function getAgeCategory(age: number): { label: string; color: string; emoji: string } {
  if (age < 18) return { label: "Teen", color: "#10B981", emoji: "🌱" };
  if (age < 30) return { label: "Young Adult", color: "#3B82F6", emoji: "⚡" };
  if (age < 45) return { label: "Adult", color: "#8B5CF6", emoji: "💪" };
  if (age < 60) return { label: "Middle Age", color: "#F59E0B", emoji: "🌟" };
  return { label: "Senior", color: "#EC4899", emoji: "👑" };
}

export function BodyAge({
  title,
  description,
  onValueChange,
  initialValue = 30,
}: BodyAgeProps) {
  const { impact } = useHaptics();
  const [age, setAge] = useState<number>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.5);

  const category = getAgeCategory(age);

  function handleIncrement() {
    if (age < MAX_AGE) {
      impact(Haptics.ImpactFeedbackStyle.Light);
      const newAge = age + 1;
      setAge(newAge);
      setInputValue(newAge.toString());
      onValueChange?.(newAge);
      animateValue();
    }
  }

  function handleDecrement() {
    if (age > MIN_AGE) {
      impact(Haptics.ImpactFeedbackStyle.Light);
      const newAge = age - 1;
      setAge(newAge);
      setInputValue(newAge.toString());
      onValueChange?.(newAge);
      animateValue();
    }
  }

  function animateValue() {
    scale.value = withSequence(
      withSpring(1.15, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 12 })
    );
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 150 }),
      withTiming(0.5, { duration: 300 })
    );
  }

  function handlePressIn() {
    buttonScale.value = withSpring(0.92, { damping: 15 });
  }

  function handlePressOut() {
    buttonScale.value = withSpring(1, { damping: 10 });
  }

  function handleEdit() {
    setIsEditing(true);
    setInputValue(age.toString());
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleBlur() {
    const parsedAge = parseInt(inputValue, 10);
    if (!isNaN(parsedAge) && parsedAge >= MIN_AGE && parsedAge <= MAX_AGE) {
      setAge(parsedAge);
      onValueChange?.(parsedAge);
    } else {
      setInputValue(age.toString());
    }
    setIsEditing(false);
  }

  function handleChangeText(text: string) {
    // Allow only numbers
    const cleanedText = text.replace(/[^0-9]/g, "");
    setInputValue(cleanedText);
  }

  function dismissKeyboard() {
    Keyboard.dismiss();
    if (isEditing) {
      handleBlur();
    }
  }

  const animatedValueStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const decrementButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const incrementButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            {description && <Text style={styles.description}>{description}</Text>}
          </View>

          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Main Card */}
            <LinearGradient
              colors={["#FEF3C7", "#FDE68A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Decorative glow */}
              <Animated.View style={[styles.glowEffect, animatedGlowStyle]}>
                <LinearGradient
                  colors={["rgba(251, 191, 36, 0.3)", "rgba(251, 191, 36, 0)"]}
                  style={styles.glowGradient}
                />
              </Animated.View>

              {/* Birthday Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.iconEmoji}>🎂</Text>
              </View>

              {/* Selector */}
              <View style={styles.selectorContainer}>
                <Animated.View style={decrementButtonStyle}>
                  <Pressable
                    onPress={handleDecrement}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={age <= MIN_AGE}
                    style={({ pressed }) => [
                      styles.button,
                      age <= MIN_AGE && styles.buttonDisabled,
                    ]}
                  >
                    <Ionicons
                      name="remove"
                      size={32}
                      color={age <= MIN_AGE ? "#CBD5E1" : "#F59E0B"}
                    />
                  </Pressable>
                </Animated.View>

                <Pressable onPress={handleEdit}>
                  <Animated.View style={[styles.valueContainer, animatedValueStyle]}>
                    {isEditing ? (
                      <TextInput
                        ref={inputRef}
                        style={styles.valueInput}
                        value={inputValue}
                        onChangeText={handleChangeText}
                        onBlur={handleBlur}
                        keyboardType="number-pad"
                        maxLength={3}
                        selectTextOnFocus
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.valueText}>{age}</Text>
                    )}
                    <Text style={styles.labelText}>years old</Text>
                  </Animated.View>
                </Pressable>

                <Animated.View style={incrementButtonStyle}>
                  <Pressable
                    onPress={handleIncrement}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={age >= MAX_AGE}
                    style={({ pressed }) => [
                      styles.button,
                      age >= MAX_AGE && styles.buttonDisabled,
                    ]}
                  >
                    <Ionicons
                      name="add"
                      size={32}
                      color={age >= MAX_AGE ? "#CBD5E1" : "#F59E0B"}
                    />
                  </Pressable>
                </Animated.View>
              </View>

              {/* Age Category Badge */}
              <View style={[styles.categoryBadge, { backgroundColor: category.color }]}>
                <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                <Text style={styles.categoryText}>{category.label}</Text>
              </View>

              {/* Info Text */}
              <Text style={styles.infoText}>
                Tap the value to type directly
              </Text>
            </LinearGradient>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 36,
    color: "#1A1D26",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 15,
    lineHeight: 22,
    color: "#6B7280",
    maxWidth: 300,
  },
  cardGradient: {
    borderRadius: 28,
    padding: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  glowEffect: {
    position: "absolute",
    top: -50,
    left: "50%",
    marginLeft: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  glowGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconEmoji: {
    fontSize: 40,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 20,
    marginBottom: 24,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  valueContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 40,
    minWidth: 140,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  valueText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 52,
    lineHeight: 60,
    color: "#1A1D26",
    letterSpacing: -1,
  },
  valueInput: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 52,
    lineHeight: 60,
    color: "#1A1D26",
    letterSpacing: -1,
    textAlign: "center",
    minWidth: 80,
    padding: 0,
  },
  labelText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    textTransform: "lowercase",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#FFFFFF",
  },
  infoText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
    opacity: 0.8,
  },
});
