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

export interface ReadyTimeOption {
  id: string;
  label: string;
  description: string;
  minMinutes: number | null;
  maxMinutes: number | null;
}

export const READY_TIME_OPTIONS: ReadyTimeOption[] = [
  {
    id: "under-15",
    label: "< 15 min",
    description: "Ultra-fast snacks & breakfasts",
    minMinutes: null,
    maxMinutes: 15,
  },
  {
    id: "between-15-30",
    label: "15-30 min",
    description: "Quick lunches & dinners",
    minMinutes: 15,
    maxMinutes: 30,
  },
  {
    id: "between-30-45",
    label: "30-45 min",
    description: "Balanced weekday cooking",
    minMinutes: 30,
    maxMinutes: 45,
  },
  {
    id: "between-45-60",
    label: "45-60 min",
    description: "Full meals & gatherings",
    minMinutes: 45,
    maxMinutes: 60,
  },
  {
    id: "over-60",
    label: "60+ min",
    description: "Slow simmer comfort food",
    minMinutes: 60,
    maxMinutes: null,
  },
];

interface TimeFilterModalProps {
  selectedOptionId?: string | null;
  onSelect?: (option: ReadyTimeOption | null) => void;
}

export const TimeFilterModal = forwardRef(function TimeFilterModal(
  { onSelect, selectedOptionId }: TimeFilterModalProps,
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
    return READY_TIME_OPTIONS.find((option) => option.id === selectedOptionId);
  }, [selectedOptionId]);

  const handleSelect = useCallback(
    async (option: ReadyTimeOption | null) => {
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
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: Colors.text.primary }]}>
            Total time
          </Text>
          <Text style={[styles.subtitle, { color: Colors.gray[500] }]}>
            Based on Spoonacular ready-in-minutes filters
          </Text>
        </Animated.View>

        {/* Options with staggered animation */}
        <View style={styles.optionList}>
          {READY_TIME_OPTIONS.map((option, index) => {
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
