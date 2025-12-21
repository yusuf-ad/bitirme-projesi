import { getThemeColors } from "@/constants/theme";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "@/providers/theme-provider";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet } from "react-native";

interface DateModalProps {
  dateType: "start" | "end";
  selectedStartDate?: Date;
  currentDate?: Date;
  onDateSelect?: (date: Date) => void;
}

interface DateOption {
  label: string;
  value: Date;
}

const generateDateOptions = (
  startFromToday: boolean = true,
  baseDate?: Date
): DateOption[] => {
  const options: DateOption[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const fromDate = startFromToday
    ? today
    : baseDate
    ? new Date(baseDate)
    : today;
  const maxDays = 7;

  for (let i = 0; i < maxDays; i++) {
    const currentDateObj = new Date(fromDate);
    currentDateObj.setDate(currentDateObj.getDate() + i);

    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayName = daysOfWeek[currentDateObj.getDay()];
    const month = currentDateObj.toLocaleDateString("en-US", {
      month: "short",
    });
    const dateNum = currentDateObj.getDate();

    const label =
      i === 0
        ? `Today, ${month} ${dateNum}`
        : i === 1
        ? `Tomorrow, ${month} ${dateNum}`
        : `${dayName}, ${month} ${dateNum}`;

    options.push({
      label,
      value: new Date(currentDateObj),
    });
  }

  return options;
};

export const DateModal = forwardRef<BottomSheetModal, DateModalProps>(
  (props, ref) => {
    const {
      dateType = "start",
      selectedStartDate,
      currentDate,
      onDateSelect,
    } = props;
    const { selection } = useHaptics();
    const { isDark } = useTheme();
    const themeColors = getThemeColors(isDark, true);

    // Generate date options based on dateType
    const dateOptions = useMemo((): DateOption[] => {
      if (dateType === "start") {
      return generateDateOptions(true);
      } else {
        // For end date, start from the next day after selectedStartDate or today
        const baseDate = selectedStartDate
          ? new Date(selectedStartDate)
          : new Date();
        baseDate.setDate(baseDate.getDate() + 1);
      return generateDateOptions(false, baseDate);
      }
  }, [dateType, selectedStartDate]);

    // Calculate initial selected index based on currentDate
  const initialIndex = useMemo(() => {
    if (currentDate) {
      const normalizedCurrent = new Date(currentDate);
      normalizedCurrent.setHours(0, 0, 0, 0);

      const matchedIndex = dateOptions.findIndex((option) => {
        const optionDate = new Date(option.value);
        optionDate.setHours(0, 0, 0, 0);
        return optionDate.getTime() === normalizedCurrent.getTime();
      });

      if (matchedIndex >= 0) {
        return matchedIndex;
      }
    }

    // Fallback: her zaman "Today" ile başla
    return 0;
  }, [currentDate, dateOptions]);

  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  // Her modal açıldığında / currentDate değiştiğinde wheel'i güncel değere hizala
  useEffect(() => {
    setSelectedIndex(initialIndex);
  }, [initialIndex]);

    const handleSheetChanges = useCallback((index: number) => {
      console.log("handleSheetChanges", index);
    }, []);

    const handleDateChange = useCallback(
      async ({ item }: { item: DateOption }) => {
        const index = dateOptions.findIndex((opt) => opt.label === item.label);
        setSelectedIndex(index);
        onDateSelect?.(item.value);
        // Subtle haptic feedback on each step, similar to iOS picker "taps"
        selection();
      },
      [dateOptions, onDateSelect, selection]
    );

    // Callbacks
  const renderBackdrop = useCallback(
    (backdropProps: any) => (
      <BottomSheetBackdrop
        {...backdropProps}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        snapPoints={["40%"]}
        enablePanDownToClose
        enableContentPanningGesture={false}
        backgroundStyle={{ backgroundColor: themeColors.background.primary }}
        handleIndicatorStyle={{ backgroundColor: themeColors.text.tertiary }}
      >
        <BottomSheetView style={[styles.contentContainer, { backgroundColor: themeColors.background.primary }]}>
          <WheelPicker
            data={dateOptions}
            value={dateOptions[selectedIndex]?.value as any}
            onValueChanged={handleDateChange}
            enableScrollByTapOnItem={true}
            itemTextStyle={{ 
              color: themeColors.text.primary,
              fontSize: 18,
              fontWeight: "500",
            }}
          />
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

DateModal.displayName = "DateModal";

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
});

