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

type HeightUnit = "cm" | "ft";

interface BodyHeightProps {
  title: string;
  description?: string;
  onValueChange?: (height: number, unit: HeightUnit) => void;
  initialValue?: number;
  initialUnit?: HeightUnit;
}

export function BodyHeight({
  title,
  description,
  onValueChange,
  initialValue = 170,
  initialUnit = "cm",
}: BodyHeightProps) {
  const [height, setHeight] = useState<number>(initialValue);
  const [unit, setUnit] = useState<HeightUnit>(initialUnit);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(initialValue.toString());

  // Gesture handler for draggable drop icon - HORIZONTAL like weight
  const translateX = useSharedValue(0);
  const startX = useSharedValue(0);
  const scale = useSharedValue(1);

  function updateHeight(newHeight: number) {
    const clampedHeight = Math.max(100, Math.min(250, newHeight));
    setHeight(clampedHeight);
    onValueChange?.(clampedHeight, unit);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      scale.value = withSpring(1.2);
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;

      // Calculate new height based on drag distance
      const dragDistance = translateX.value;
      const heightChange = Math.round(dragDistance / 20); // 20px = 1cm (daha az hassas)
      const newHeight = height + heightChange;

      if (heightChange !== 0) {
        runOnJS(updateHeight)(newHeight);
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
    setInputValue(height.toString());
  }

  function handleBlur() {
    const parsedHeight = parseInt(inputValue, 10);
    if (!isNaN(parsedHeight) && parsedHeight > 0) {
      setHeight(parsedHeight);
      onValueChange?.(parsedHeight, unit);
    } else {
      setInputValue(height.toString());
    }
    setIsEditing(false);
  }

  function handleChangeText(text: string) {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, "");
    setInputValue(numericText);
  }

  function handleUnitChange(newUnit: HeightUnit) {
    setUnit(newUnit);
    // Convert height value when switching units
    // This is a simplified conversion, you might want to add more precise logic
    onValueChange?.(height, newUnit);
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
              Ft/In
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
                <Text style={styles.displayText}>{height}</Text>
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

          {/* Ruler Scale - Vertical */}
          <View style={styles.rulerContainer}>
            {/* Ruler marks - vertical layout */}
            <View style={styles.rulerMarks}>
              {Array.from({ length: 21 }, (_, i) => {
                const value = height - 10 + i;
                const isMajorMark = i % 10 === 0;
                const isMidMark = i % 5 === 0 && !isMajorMark;
                const isCenter = i === 10;

                return (
                  <View key={i} style={styles.markContainer}>
                    {isMajorMark && (
                      <Text style={styles.markLabel}>{value}</Text>
                    )}
                    <View
                      style={[
                        styles.mark,
                        isMidMark && styles.midMark,
                        isMajorMark && styles.majorMark,
                        isCenter && styles.currentMark,
                      ]}
                    />
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
    paddingVertical: 8,
    alignItems: "center",
  },
  rulerMarks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 100,
  },
  markContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 6,
    opacity: 0.8,
  },
  dropContainer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
});
