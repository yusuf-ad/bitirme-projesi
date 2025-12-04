import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface RulerPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (value: number) => void;
  title: string;
  initialValue: number;
  unit: string;
  min: number;
  max: number;
  step?: number;
  scale?: number;
}

export function RulerPickerModal({
  visible,
  onClose,
  onSave,
  title,
  initialValue,
  unit,
  min,
  max,
  step = 1,
  scale = 8, // Sensitivity factor
}: RulerPickerModalProps) {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);
  const [value, setValue] = useState(initialValue);
  const [rulerBase, setRulerBase] = useState(initialValue);
  const committedValue = useRef(initialValue);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Refs for continuous update loop
  const speedRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const isActiveRef = useRef(false);

  const handleInputBlur = () => {
    setIsEditing(false);
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      const clamped = Math.max(min, Math.min(max, Math.round(num)));
      setValue(clamped);
      setRulerBase(clamped);
      committedValue.current = clamped;
    } else {
      setInputValue(value.toString());
    }
  };
  
  useEffect(() => {
    if (visible) {
      setValue(initialValue);
      setRulerBase(initialValue);
      committedValue.current = initialValue;
    }
    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [visible, initialValue]);

  const translateX = useSharedValue(0);
  const iconScale = useSharedValue(1);

  const updateLoop = (timestamp: number) => {
    if (!isActiveRef.current) return;

    if (lastUpdateRef.current === 0) {
        lastUpdateRef.current = timestamp;
    }

    const deltaTime = timestamp - lastUpdateRef.current;
    
    // Update every ~16ms (60fps) or throttle if needed
    if (deltaTime > 16) {
        const speed = speedRef.current;
        
        // Deadzone check
        if (Math.abs(speed) > 10) {
            // Calculate change amount based on speed (distance from center)
            // Non-linear scaling for better control: sign * (abs(speed) / factor)^power
            const direction = Math.sign(speed);
            const magnitude = Math.abs(speed);
            
            // Adjust these factors to tune the feel
            // speed is in pixels (e.g., 0 to 150)
            // We want slow change near center, fast at edges
            const changeRate = (magnitude - 10) / 20; // e.g. at 30px -> 1 unit/frame? Too fast.
            
            // Let's try accumulating fractional changes
            // But we store integer value.
            // Better: update value every N frames based on speed?
            // Or just use a float accumulator.
            
            // Simple approach:
            // Thresholds:
            // > 10px: +/- 1 every 10 frames
            // > 50px: +/- 1 every 5 frames
            // > 100px: +/- 1 every frame
            
            // Let's use a float accumulator ref
            // But we need to update state.
            
            // Let's stick to the user's request: "solda tuttukça o hızda azaltsın"
            // So speed is proportional to distance.
            
            const delta = (magnitude - 10) * 0.05 * direction; // 0.05 factor
            
            const newValue = committedValue.current + delta;
            const clamped = Math.max(min, Math.min(max, newValue));
            
            if (Math.round(clamped) !== Math.round(committedValue.current)) {
                 Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            
            committedValue.current = clamped;
            setValue(Math.round(clamped));
            setRulerBase(Math.round(clamped));
        }
        lastUpdateRef.current = timestamp;
    }

    requestRef.current = requestAnimationFrame(updateLoop);
  };

  const startLoop = () => {
      isActiveRef.current = true;
      lastUpdateRef.current = 0;
      requestRef.current = requestAnimationFrame(updateLoop);
  };

  const stopLoop = () => {
      isActiveRef.current = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  const updateSpeed = (translationX: number) => {
      speedRef.current = translationX;
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      iconScale.value = withSpring(1.2);
      runOnJS(startLoop)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      runOnJS(updateSpeed)(event.translationX);
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      iconScale.value = withSpring(1);
      runOnJS(stopLoop)();
      runOnJS(updateSpeed)(0);
    });

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: iconScale.value }],
  }));

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.centeredView}>
            <Pressable style={styles.backdrop} onPress={onClose} />
            <View style={[styles.modalView, { backgroundColor: Colors.background.surface }]}>
            <Text style={[styles.modalTitle, { color: Colors.text.primary }]}>{title}</Text>
            
            <View style={styles.displayContainer}>
             {isEditing ? (
               <TextInput
                 style={[styles.valueInput, { color: Colors.text.primary }]}
                 value={inputValue}
                 onChangeText={setInputValue}
                 onBlur={handleInputBlur}
                 keyboardType="numeric"
                 autoFocus
                 maxLength={3}
                 selectTextOnFocus
               />
             ) : (
               <Pressable onPress={() => {
                 setInputValue(value.toString());
                 setIsEditing(true);
               }}>
                 <Text style={[styles.valueText, { color: Colors.text.primary }]}>{value}</Text>
               </Pressable>
             )}
             <Text style={[styles.unitText, { color: Colors.text.secondary }]}>{unit}</Text>
            </View>

            {/* Ruler Area */}
            <View style={styles.rulerWrapper}>
                <View style={styles.rulerContainer}>
                    <View style={styles.rulerMarks}>
                    {Array.from({ length: 41 }, (_, i) => {
                        const markValue = rulerBase - 20 + i;
                        const isMajorMark = i % 10 === 0;
                        const isMidMark = i % 5 === 0 && !isMajorMark;
                        const isCenter = i === 20;

                        return (
                        <View key={i} style={styles.markContainer}>
                            <View
                            style={[
                                styles.mark,
                                { backgroundColor: Colors.text.primary },
                                isMidMark && styles.midMark,
                                isMajorMark && styles.majorMark,
                                isCenter && [styles.currentMark, { backgroundColor: Colors.lilac[900] }],
                            ]}
                            />
                            {isMajorMark && (
                            <Text style={[styles.markLabel, { color: Colors.text.secondary }]}>{markValue}</Text>
                            )}
                        </View>
                        );
                    })}
                    </View>
                </View>

                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                    <MaterialCommunityIcons
                        name="water-outline"
                        size={40}
                        color={Colors.lilac[900]}
                    />
                    </Animated.View>
                </GestureDetector>
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.buttonCancel, { borderColor: Colors.border.light }]}
                  onPress={onClose}
                >
                  <Text style={[styles.textStyle, { color: Colors.text.primary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.buttonSave, { backgroundColor: Colors.lilac[900] }]}
                  onPress={() => {
                      Keyboard.dismiss();
                      onSave(value);
                  }}
                >
                  <Text style={styles.textStyle}>Save</Text>
                </TouchableOpacity>
            </View>
            </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 24,
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 32,
  },
  valueText: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1,
  },
  valueInput: {
    fontSize: 56,
    fontWeight: '700',
    letterSpacing: -1,
    minWidth: 100,
    textAlign: 'center',
  },
  unitText: {
    fontSize: 20,
    marginLeft: 8,
    fontWeight: '500',
    opacity: 0.6,
  },
  rulerWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  rulerContainer: {
    width: "100%",
    height: 80,
    justifyContent: 'center',
  },
  rulerMarks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: '100%',
    height: 60,
  },
  markContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  mark: {
    width: 1.5,
    height: 16,
    opacity: 0.2,
    borderRadius: 1,
  },
  midMark: {
    height: 24,
    opacity: 0.4,
  },
  majorMark: {
    height: 32,
    opacity: 0.6,
  },
  currentMark: {
    height: 40,
    width: 3,
    opacity: 1,
  },
  markLabel: {
    fontSize: 10,
    marginTop: 8,
    position: 'absolute',
    bottom: -24,
    fontWeight: '500',
  },
  iconContainer: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10, // Increase touch area
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 16,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonCancel: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  buttonSave: {
    // bg color set in component
  },
  textStyle: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    fontSize: 16,
  },
});
