import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import * as Haptics from "expo-haptics";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useMemo,
} from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
        <View style={styles.header}>
          <Text style={styles.title}>Total time</Text>
          <Text style={styles.subtitle}>
            Based on Spoonacular ready-in-minutes filters
          </Text>
        </View>

        <View style={styles.optionList}>
          {READY_TIME_OPTIONS.map((option) => {
            const isActive = option.id === activeOption?.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option)}
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
            );
          })}
        </View>

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
    borderColor: Colors.lilac[100],
    borderRadius: 16,
    padding: 16,
    backgroundColor: "white",
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
    backgroundColor: Colors.gray[100],
    paddingVertical: 16,
    width: "100%",
  },
  clearButtonActive: {
    backgroundColor: Colors.lilac[900],
  },
  clearText: {
    color: Colors.text.primary,
    fontWeight: "600",
  },
  clearTextActive: {
    color: "white",
  },
});

