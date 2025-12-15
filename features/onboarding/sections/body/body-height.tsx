import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  withSpring,
} from "react-native-reanimated";

type HeightUnit = "cm" | "ft";

interface BodyHeightProps {
  title: string;
  description?: string;
  onValueChange?: (height: number, unit: HeightUnit) => void;
  initialValue?: number;
  initialUnit?: HeightUnit;
}

const MIN_HEIGHT_CM = 100;
const MAX_HEIGHT_CM = 250;
const MIN_HEIGHT_FT = 3.3; // ~100cm
const MAX_HEIGHT_FT = 8.2; // ~250cm

export function BodyHeight({
  title,
  description,
  onValueChange,
  initialValue = 170,
  initialUnit = "cm",
}: BodyHeightProps) {
  const { impact } = useHaptics();
  const [height, setHeight] = useState<number>(initialValue);
  const [unit, setUnit] = useState<HeightUnit>(initialUnit);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);

  const minHeight = unit === "cm" ? MIN_HEIGHT_CM : MIN_HEIGHT_FT;
  const maxHeight = unit === "cm" ? MAX_HEIGHT_CM : MAX_HEIGHT_FT;
  const stepSize = unit === "cm" ? 1 : 0.1;

  function handleIncrement() {
    if (height < maxHeight) {
      impact(Haptics.ImpactFeedbackStyle.Light);
      const newHeight = unit === "cm" 
        ? Math.min(maxHeight, height + 1)
        : Math.min(maxHeight, Math.round((height + 0.1) * 10) / 10);
      setHeight(newHeight);
      setInputValue(formatHeight(newHeight));
      onValueChange?.(newHeight, unit);
      animateValue();
    }
  }

  function handleDecrement() {
    if (height > minHeight) {
      impact(Haptics.ImpactFeedbackStyle.Light);
      const newHeight = unit === "cm"
        ? Math.max(minHeight, height - 1)
        : Math.max(minHeight, Math.round((height - 0.1) * 10) / 10);
      setHeight(newHeight);
      setInputValue(formatHeight(newHeight));
      onValueChange?.(newHeight, unit);
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

  function handleEdit() {
    setIsEditing(true);
    setInputValue(formatHeight(height));
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleBlur() {
    const parsedHeight = parseFloat(inputValue);
    if (!isNaN(parsedHeight) && parsedHeight >= minHeight && parsedHeight <= maxHeight) {
      const newHeight = unit === "cm" ? Math.round(parsedHeight) : Math.round(parsedHeight * 10) / 10;
      setHeight(newHeight);
      onValueChange?.(newHeight, unit);
    } else {
      setInputValue(formatHeight(height));
    }
    setIsEditing(false);
  }

  function handleChangeText(text: string) {
    // Allow numbers and decimal point for ft
    const regex = unit === "cm" ? /[^0-9]/g : /[^0-9.]/g;
    const cleanedText = text.replace(regex, "");
    setInputValue(cleanedText);
  }

  function handleUnitChange(newUnit: HeightUnit) {
    if (newUnit === unit) return;
    impact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Convert height value when switching units
    let convertedHeight: number;
    if (newUnit === "ft") {
      // cm to ft
      convertedHeight = Math.round((height / 30.48) * 10) / 10;
    } else {
      // ft to cm
      convertedHeight = Math.round(height * 30.48);
    }
    
    setUnit(newUnit);
    setHeight(convertedHeight);
    setInputValue(formatHeight(convertedHeight, newUnit));
    onValueChange?.(convertedHeight, newUnit);
  }

  function formatHeight(value: number, targetUnit?: HeightUnit): string {
    const u = targetUnit || unit;
    return u === "cm" ? Math.round(value).toString() : value.toFixed(1);
  }

  function dismissKeyboard() {
    Keyboard.dismiss();
    if (isEditing) {
      handleBlur();
    }
  }

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

            {/* Unit Toggle */}
            <View style={styles.unitToggleContainer}>
              <Pressable
                style={[
                  styles.unitButton,
                  styles.unitButtonLeft,
                  unit === "cm" && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange("cm")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unit === "cm" && styles.unitButtonTextActive,
                  ]}
                >
                  Cm
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.unitButton,
                  styles.unitButtonRight,
                  unit === "ft" && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange("ft")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unit === "ft" && styles.unitButtonTextActive,
                  ]}
                >
                  Ft
                </Text>
              </Pressable>
            </View>

            {/* Main Card */}
            <LinearGradient
              colors={["#E8F4FD", "#D4E8F8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Height Icon */}
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="human-male-height"
                  size={48}
                  color="#3B82F6"
                />
              </View>

              {/* Selector */}
              <View style={styles.selectorContainer}>
                <Pressable
                  onPress={handleDecrement}
                  disabled={height <= minHeight}
                  style={({ pressed }) => [
                    styles.button,
                    height <= minHeight && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="remove"
                    size={32}
                    color={height <= minHeight ? "#CBD5E1" : "#3B82F6"}
                  />
                </Pressable>

                <Pressable onPress={handleEdit}>
                  <Animated.View style={[styles.valueContainer, animatedStyle]}>
                    {isEditing ? (
                      <TextInput
                        ref={inputRef}
                        style={styles.valueInput}
                        value={inputValue}
                        onChangeText={handleChangeText}
                        onBlur={handleBlur}
                        keyboardType={unit === "cm" ? "number-pad" : "decimal-pad"}
                        maxLength={unit === "cm" ? 3 : 4}
                        selectTextOnFocus
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.valueText}>{formatHeight(height)}</Text>
                    )}
                    <Text style={styles.unitLabel}>{unit}</Text>
                  </Animated.View>
                </Pressable>

                <Pressable
                  onPress={handleIncrement}
                  disabled={height >= maxHeight}
                  style={({ pressed }) => [
                    styles.button,
                    height >= maxHeight && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={32}
                    color={height >= maxHeight ? "#CBD5E1" : "#3B82F6"}
                  />
                </Pressable>
              </View>

              {/* Info Text */}
              <Text style={styles.infoText}>
                Tap the value to type directly
              </Text>
            </LinearGradient>
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
  unitToggleContainer: {
    flexDirection: "row",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 32,
    backgroundColor: "#F1F5F9",
  },
  unitButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  unitButtonLeft: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  unitButtonRight: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  unitButtonActive: {
    backgroundColor: "#3B82F6",
  },
  unitButtonText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#64748B",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },
  cardGradient: {
    borderRadius: 28,
    padding: 32,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  buttonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    transform: [{ scale: 0.95 }],
  },
  buttonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  valueContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 40,
    minWidth: 160,
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
    minWidth: 100,
    padding: 0,
  },
  unitLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    color: "#64748B",
    marginTop: 4,
    textTransform: "uppercase",
  },
  infoText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
  },
});
