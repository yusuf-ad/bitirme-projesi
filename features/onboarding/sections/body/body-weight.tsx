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

type WeightUnit = "kg" | "lbs";

interface BodyWeightProps {
  title: string;
  description?: string;
  onValueChange?: (weight: number, unit: WeightUnit) => void;
  initialValue?: number;
  initialUnit?: WeightUnit;
}

const MIN_WEIGHT_KG = 30;
const MAX_WEIGHT_KG = 300;
const MIN_WEIGHT_LBS = 66; // ~30kg
const MAX_WEIGHT_LBS = 661; // ~300kg

export function BodyWeight({
  title,
  description,
  onValueChange,
  initialValue = 70,
  initialUnit = "kg",
}: BodyWeightProps) {
  const { impact } = useHaptics();
  const [weight, setWeight] = useState<number>(initialValue);
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());
  const inputRef = useRef<TextInput>(null);
  const scale = useSharedValue(1);

  const minWeight = unit === "kg" ? MIN_WEIGHT_KG : MIN_WEIGHT_LBS;
  const maxWeight = unit === "kg" ? MAX_WEIGHT_KG : MAX_WEIGHT_LBS;

  function handleIncrement() {
    if (weight < maxWeight) {
      impact(Haptics.ImpactFeedbackStyle.Light);
      const newWeight = Math.min(maxWeight, weight + 1);
      setWeight(newWeight);
      setInputValue(newWeight.toString());
      onValueChange?.(newWeight, unit);
      animateValue();
    }
  }

  function handleDecrement() {
    if (weight > minWeight) {
      impact(Haptics.ImpactFeedbackStyle.Light);
      const newWeight = Math.max(minWeight, weight - 1);
      setWeight(newWeight);
      setInputValue(newWeight.toString());
      onValueChange?.(newWeight, unit);
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
    setInputValue(Math.round(weight).toString());
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleBlur() {
    const parsedWeight = parseInt(inputValue, 10);
    if (!isNaN(parsedWeight) && parsedWeight >= minWeight && parsedWeight <= maxWeight) {
      setWeight(parsedWeight);
      onValueChange?.(parsedWeight, unit);
    } else {
      setInputValue(Math.round(weight).toString());
    }
    setIsEditing(false);
  }

  function handleChangeText(text: string) {
    const numericText = text.replace(/[^0-9]/g, "");
    setInputValue(numericText);
  }

  function handleUnitChange(newUnit: WeightUnit) {
    if (newUnit === unit) return;
    impact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Convert weight value when switching units
    let convertedWeight: number;
    if (newUnit === "lbs") {
      // kg to lbs
      convertedWeight = Math.round(weight * 2.20462);
    } else {
      // lbs to kg
      convertedWeight = Math.round(weight / 2.20462);
    }
    
    setUnit(newUnit);
    setWeight(convertedWeight);
    setInputValue(convertedWeight.toString());
    onValueChange?.(convertedWeight, newUnit);
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
                  unit === "kg" && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange("kg")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unit === "kg" && styles.unitButtonTextActive,
                  ]}
                >
                  Kg
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.unitButton,
                  styles.unitButtonRight,
                  unit === "lbs" && styles.unitButtonActive,
                ]}
                onPress={() => handleUnitChange("lbs")}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unit === "lbs" && styles.unitButtonTextActive,
                  ]}
                >
                  Lbs
                </Text>
              </Pressable>
            </View>

            {/* Main Card */}
            <LinearGradient
              colors={["#FEF3C7", "#FDE68A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Weight Icon */}
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="scale-bathroom"
                  size={48}
                  color="#F59E0B"
                />
              </View>

              {/* Selector */}
              <View style={styles.selectorContainer}>
                <Pressable
                  onPress={handleDecrement}
                  disabled={weight <= minWeight}
                  style={({ pressed }) => [
                    styles.button,
                    weight <= minWeight && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="remove"
                    size={32}
                    color={weight <= minWeight ? "#CBD5E1" : "#F59E0B"}
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
                        keyboardType="number-pad"
                        maxLength={3}
                        selectTextOnFocus
                        autoFocus
                      />
                    ) : (
                      <Text style={styles.valueText}>{Math.round(weight)}</Text>
                    )}
                    <Text style={styles.unitLabel}>{unit}</Text>
                  </Animated.View>
                </Pressable>

                <Pressable
                  onPress={handleIncrement}
                  disabled={weight >= maxWeight}
                  style={({ pressed }) => [
                    styles.button,
                    weight >= maxWeight && styles.buttonDisabled,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <Ionicons
                    name="add"
                    size={32}
                    color={weight >= maxWeight ? "#CBD5E1" : "#F59E0B"}
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
    backgroundColor: "#FEF3C7",
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
    backgroundColor: "#F59E0B",
  },
  unitButtonText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: "#92400E",
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
    shadowColor: "#F59E0B",
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
    color: "#92400E",
    marginTop: 4,
    textTransform: "uppercase",
  },
  infoText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
  },
});
