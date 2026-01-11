import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import {
    ForwardedRef,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface CalorieOption {
  id: string;
  label: string;
  description: string;
  minCalories: number | null;
  maxCalories: number | null;
}

export const CALORIE_OPTIONS: CalorieOption[] = [
  {
    id: "under-200",
    label: "< 200 kcal",
    description: "Light snacks & sides",
    minCalories: null,
    maxCalories: 200,
  },
  {
    id: "200-400",
    label: "200-400 kcal",
    description: "Light meals",
    minCalories: 200,
    maxCalories: 400,
  },
  {
    id: "400-600",
    label: "400-600 kcal",
    description: "Standard meals",
    minCalories: 400,
    maxCalories: 600,
  },
  {
    id: "600-800",
    label: "600-800 kcal",
    description: "Hearty meals",
    minCalories: 600,
    maxCalories: 800,
  },
  {
    id: "over-800",
    label: "800+ kcal",
    description: "High energy meals",
    minCalories: 800,
    maxCalories: null,
  },
];

interface CalorieFilterModalProps {
  selectedOptionId?: string | null;
  onSelect?: (option: CalorieOption | null) => void;
}

export const CalorieFilterModal = forwardRef(function CalorieFilterModal(
  { onSelect, selectedOptionId }: CalorieFilterModalProps,
  ref: ForwardedRef<BottomSheetModal>
) {
  const { bottom } = useSafeAreaInsets();
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark, true);

  // Store latest onSelect in a ref to avoid stale closures in BottomSheetModal
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  const activeOption = useMemo(() => {
    if (!selectedOptionId) {
      return null;
    }
    return CALORIE_OPTIONS.find((option) => option.id === selectedOptionId);
  }, [selectedOptionId]);

  const handleSelect = useCallback(
    async (option: CalorieOption | null) => {
      await Haptics.selectionAsync();
      // Use ref to ensure we always call the latest onSelect callback
      onSelectRef.current?.(option);
      if (typeof ref !== "function") {
        ref?.current?.dismiss();
      }
    },
    [ref]
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={[
        styles.handleIndicator,
        { backgroundColor: Colors.lilac[200] },
      ]}
      backgroundStyle={{ backgroundColor: Colors.background.surface }}
    >
      <BottomSheetView
        style={[
          styles.content,
          {
            paddingBottom: Math.max(bottom, 16),
            backgroundColor: Colors.background.surface,
          },
        ]}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.header}>
          <Text style={[styles.title, { color: Colors.text.primary }]}>
            Calories
          </Text>
          <Text style={[styles.subtitle, { color: Colors.gray[500] }]}>
            Filter recipes by calorie content
          </Text>
        </Animated.View>

        {/* Options with staggered animation */}
        <View style={styles.optionList}>
          {CALORIE_OPTIONS.map((option, index) => {
            const isActive = option.id === activeOption?.id;
            return (
              <Animated.View
                key={option.id}
                entering={FadeInDown.delay(50 + index * 40).duration(250)}
              >
                <Pressable
                  onPress={() => handleSelect(option)}
                  style={({ pressed }) => [
                    styles.optionCard,
                    {
                      borderColor: isActive
                        ? Colors.lilac[700]
                        : Colors.border.light,
                      backgroundColor: isActive
                        ? isDark
                          ? "rgba(180, 156, 218, 0.25)"
                          : "rgba(180, 156, 218, 0.15)"
                        : Colors.background.surface,
                    },
                    pressed && styles.optionCardPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: isActive
                            ? Colors.lilac[isDark ? 400 : 900]
                            : Colors.text.primary,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.optionDescription,
                        {
                          color: isActive
                            ? Colors.lilac[isDark ? 300 : 800]
                            : Colors.gray[500],
                        },
                      ]}
                    >
                      {option.description}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {/* Clear button */}
        <Animated.View entering={FadeInDown.delay(280).duration(200)}>
          <CustomButton
            onPress={() => handleSelect(null)}
            containerStyle={[
              styles.clearButton,
              {
                backgroundColor: activeOption
                  ? Colors.lilac[900]
                  : Colors.lilac[100],
                borderColor: activeOption
                  ? Colors.lilac[900]
                  : Colors.lilac[200],
              },
            ]}
          >
            <Text
              style={[
                styles.clearText,
                {
                  color: activeOption ? "white" : Colors.lilac[800],
                },
              ]}
            >
              Clear selection
            </Text>
          </CustomButton>
        </Animated.View>
      </BottomSheetView>
    </BottomSheetModal>
  );
});

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 24,
  },
  handleStyle: {
    display: "none",
  },
  handleIndicator: {},
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  optionDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  clearButton: {
    paddingVertical: 16,
    width: "100%",
    borderWidth: 1,
  },
  clearText: {
    fontWeight: "600",
  },
});
