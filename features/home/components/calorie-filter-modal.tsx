import { Colors } from "@/constants/theme";
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
    memo,
    useCallback,
    useMemo,
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

// Memoized option card
const OptionCard = memo(({
  option,
  isActive,
  onSelect,
  index,
}: {
  option: CalorieOption;
  isActive: boolean;
  onSelect: (option: CalorieOption) => void;
  index: number;
}) => (
  <Animated.View entering={FadeInDown.delay(50 + index * 40).duration(250)}>
    <Pressable
      onPress={() => onSelect(option)}
      style={({ pressed }) => [
        styles.optionCard,
        isActive && styles.optionCardActive,
        pressed && styles.optionCardPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <View>
        <Text
          style={[
            styles.optionLabel,
            isActive && styles.optionLabelActive,
          ]}
        >
          {option.label}
        </Text>
        <Text
          style={[
            styles.optionDescription,
            isActive && styles.optionDescriptionActive,
          ]}
        >
          {option.description}
        </Text>
      </View>
    </Pressable>
  </Animated.View>
));

OptionCard.displayName = "OptionCard";

interface CalorieFilterModalProps {
  selectedOptionId?: string | null;
  onSelect?: (option: CalorieOption | null) => void;
}

export const CalorieFilterModal = forwardRef(function CalorieFilterModal(
  { onSelect, selectedOptionId }: CalorieFilterModalProps,
  ref: ForwardedRef<BottomSheetModal>
) {
  const { bottom } = useSafeAreaInsets();

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
      onSelect?.(option);
      if (typeof ref !== "function") {
        ref?.current?.dismiss();
      }
    },
    [onSelect, ref]
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableOverDrag={false}
      backdropComponent={renderBackdrop}
      handleStyle={styles.handleStyle}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView
        style={[
          styles.content,
          {
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(200)} style={styles.header}>
          <Text style={styles.title}>Calories</Text>
          <Text style={styles.subtitle}>
            Filter recipes by calorie content
          </Text>
        </Animated.View>

        {/* Options with staggered animation */}
        <View style={styles.optionList}>
          {CALORIE_OPTIONS.map((option, index) => (
            <OptionCard
              key={option.id}
              option={option}
              isActive={option.id === activeOption?.id}
              onSelect={handleSelect}
              index={index}
            />
          ))}
        </View>

        {/* Clear button */}
        <Animated.View entering={FadeInDown.delay(280).duration(200)}>
          <CustomButton
            onPress={() => handleSelect(null)}
            containerStyle={[
              styles.clearButton,
              activeOption && styles.clearButtonActive,
            ]}
          >
            <Text
              style={[
                styles.clearText,
                activeOption && styles.clearTextActive,
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
  handleIndicator: {
    backgroundColor: Colors.lilac[200],
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: Colors.border.light,
    borderRadius: 16,
    padding: 16,
    backgroundColor: Colors.background.surface,
  },
  optionCardActive: {
    borderColor: Colors.lilac[700],
    backgroundColor: "rgba(180, 156, 218, 0.15)",
  },
  optionCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  optionLabelActive: {
    color: Colors.lilac[900],
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 4,
  },
  optionDescriptionActive: {
    color: Colors.lilac[800],
  },
  clearButton: {
    backgroundColor: Colors.lilac[100],
    paddingVertical: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.lilac[200],
  },
  clearButtonActive: {
    backgroundColor: Colors.lilac[900],
    borderColor: Colors.lilac[900],
  },
  clearText: {
    color: Colors.lilac[800],
    fontWeight: "600",
  },
  clearTextActive: {
    color: "white",
  },
});
