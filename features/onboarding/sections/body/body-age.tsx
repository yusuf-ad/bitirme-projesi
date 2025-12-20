import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
  const { impact } = useHaptics();
  const [age, setAge] = useState<number>(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);

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
    scale.value = withSpring(1.03, { damping: 15 }, () => {
      scale.value = withSpring(1);
    });
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

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{title}</Text>
              {description && <Text style={styles.description}>{description}</Text>}
            </View>

            {/* Main Card */}
            <View style={styles.card}>
              {/* Age Icon */}
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="calendar-account"
                  size={40}
                  color="#F59E0B"
                />
              </View>

              {/* Selector */}
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
                  <Ionicons
                    name="remove"
                    size={28}
                    color={age <= MIN_AGE ? "#CBD5E1" : "#F59E0B"}
                  />
                </Pressable>

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

                <Pressable
                  onPress={handleIncrement}
                  disabled={age >= MAX_AGE}
                  style={({ pressed }) => [
                    styles.button,
                    age >= MAX_AGE && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={28}
                    color={age >= MAX_AGE ? "#CBD5E1" : "#F59E0B"}
                  />
                </Pressable>
              </View>

              {/* Info Text */}
              <Text style={styles.infoText}>
                Tap the value to type directly
              </Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  textContainer: {
    marginBottom: 24,
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
  card: {
    borderRadius: 24,
    padding: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF9EE",
    borderWidth: 1,
    borderColor: "#F3E8D5",
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 16,
    marginBottom: 20,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonPressed: {
    backgroundColor: "#F5F5F5",
    transform: [{ scale: 0.96 }],
  },
  buttonDisabled: {
    backgroundColor: "#F5F5F5",
    opacity: 0.5,
  },
  valueContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    minWidth: 130,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  valueText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 44,
    lineHeight: 52,
    color: "#1A1D26",
    letterSpacing: -1,
  },
  valueInput: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 44,
    lineHeight: 52,
    color: "#1A1D26",
    letterSpacing: -1,
    textAlign: "center",
    minWidth: 70,
    padding: 0,
  },
  labelText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
    textTransform: "lowercase",
  },
  infoText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: "#9CA3AF",
    textAlign: "center",
  },
});
