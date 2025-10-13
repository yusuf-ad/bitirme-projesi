import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
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

export function BodyWeight({
  title,
  description,
  onValueChange,
  initialValue = 70,
  initialUnit = "kg",
}: BodyWeightProps) {
  const [weight, setWeight] = useState<number>(initialValue);
  const [unit, setUnit] = useState<WeightUnit>(initialUnit);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());

  // Gesture handler for draggable drop icon
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const scale = useSharedValue(1);

  function updateWeight(newWeight: number) {
    const clampedWeight = Math.max(30, Math.min(300, newWeight));
    setWeight(clampedWeight);
    onValueChange?.(clampedWeight, unit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;

      // Calculate new weight based on drag distance
      const dragDistance = translateX.value;
      const weightChange = Math.round(dragDistance / 20); // 20px = 1kg (daha az hassas)
      const newWeight = weight + weightChange;

      if (weightChange !== 0) {
        runOnJS(updateWeight)(newWeight);
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      scale.value = withSpring(1);
      startX.value = 0;
    });

  const animatedDropStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
  }));

  function handleEdit() {
    setIsEditing(true);
    setInputValue(weight.toString());
  }

  function handleBlur() {
    const parsedWeight = parseInt(inputValue, 10);
    if (!isNaN(parsedWeight) && parsedWeight > 0) {
      setWeight(parsedWeight);
      onValueChange?.(parsedWeight, unit);
    } else {
      setInputValue(weight.toString());
    }
    setIsEditing(false);
  }

  function handleChangeText(text: string) {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    setInputValue(numericText);
  }

  function handleUnitChange(newUnit: WeightUnit) {
    setUnit(newUnit);
    // Convert weight value when switching units
    // This is a simplified conversion, you might want to add more precise logic
    onValueChange?.(weight, newUnit);
  }

  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={styles.inputContainer}>
        {/* Unit Toggle - Now on top */}
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

        {/* Display Box with yellow/orange background */}
        <View style={styles.displayWrapper}>
          {/* Main Display */}
          {isEditing ? (
            <View style={styles.displayInnerContainer}>
              <TextInput
                style={styles.input}
                value={inputValue}
                onChangeText={handleChangeText}
                onBlur={handleBlur}
                keyboardType="number-pad"
                autoFocus
                maxLength={3}
                selectTextOnFocus
              />
              <Pressable onPress={handleBlur} style={styles.editButton}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={24}
                  color="#2D3142"
                />
              </Pressable>
            </View>
          ) : (
            <View style={styles.displayInnerContainer}>
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>{weight}</Text>
              </View>
              <Pressable onPress={handleEdit} style={styles.editButton}>
                <MaterialCommunityIcons
                  name="pencil"
                  size={24}
                  color="#2D3142"
                />
              </Pressable>
            </View>
          )}

          {/* Ruler Scale */}
          <View style={styles.rulerContainer}>
            {/* Ruler marks */}
            <View style={styles.rulerMarks}>
              {Array.from({ length: 41 }, (_, i) => {
                const value = weight - 20 + i;
                const isMajorMark = i % 10 === 0;
                const isMidMark = i % 5 === 0 && !isMajorMark;
                const isCenter = i === 20;

                return (
                  <View key={i} style={styles.markContainer}>
                    <View
                      style={[
                        styles.mark,
                        isMidMark && styles.midMark,
                        isMajorMark && styles.majorMark,
                        isCenter && styles.currentMark,
                      ]}
                    />
                    {isMajorMark && (
                      <Text style={styles.markLabel}>{value}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Draggable Water drop icon */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.dropContainer, animatedDropStyle]}>
            <MaterialCommunityIcons
              name="water-outline"
              size={56}
              color="#2D3648"
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 27,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 40,
    color: "#2D3142",
    marginBottom: 16,
    maxWidth: 344,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#5D6270",
    maxWidth: 317,
  },
  inputContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
  },
  unitToggleContainer: {
    flexDirection: "row",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    maxWidth: 400,
    marginBottom: 32,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8E9EB",
  },
  unitButtonLeft: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  unitButtonRight: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  unitButtonActive: {
    backgroundColor: "#2D3648",
  },
  unitButtonText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 24,
    color: "#2D3142",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },
  displayWrapper: {
    backgroundColor: "#F2C94C",
    borderRadius: 24,
    padding: 32,
    width: "100%",
    maxWidth: 480,
    minHeight: 380,
    justifyContent: "space-between",
  },
  displayInnerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 40,
  },
  displayBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 48,
    minWidth: 160,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  displayText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 48,
    lineHeight: 56,
    color: "#2D3142",
  },
  editButton: {
    padding: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 48,
    minWidth: 160,
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 48,
    lineHeight: 56,
    color: "#2D3142",
    textAlign: "center",
  },
  rulerContainer: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 8,
  },
  rulerMarks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 100,
  },
  markContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 2,
  },
  mark: {
    width: 1.5,
    height: 16,
    backgroundColor: "#2D3142",
    opacity: 0.25,
  },
  midMark: {
    height: 24,
    width: 2,
    opacity: 0.4,
  },
  majorMark: {
    height: 36,
    width: 2.5,
    opacity: 0.7,
  },
  currentMark: {
    height: 48,
    width: 3.5,
    backgroundColor: "#2D3648",
    opacity: 1,
  },
  markLabel: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 16,
    color: "#2D3142",
    marginTop: 6,
    opacity: 0.8,
  },
  dropContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});
