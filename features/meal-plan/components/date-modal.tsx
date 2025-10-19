import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import WheelPicker from "@quidone/react-native-wheel-picker";
import { forwardRef, useCallback, useMemo, useState } from "react";
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
  baseDate?: Date,
  currentDate?: Date
): DateOption[] => {
  const options: DateOption[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Add empty placeholder as first item with currentDate as value
  if (currentDate) {
    const curDate = new Date(currentDate);
    curDate.setHours(0, 0, 0, 0);
    options.push({
      label: "",
      value: new Date(curDate),
    });
  }

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

    // Generate date options based on dateType
    const dateOptions = useMemo((): DateOption[] => {
      if (dateType === "start") {
        return generateDateOptions(true, undefined, currentDate);
      } else {
        // For end date, start from the next day after selectedStartDate or today
        const baseDate = selectedStartDate
          ? new Date(selectedStartDate)
          : new Date();
        baseDate.setDate(baseDate.getDate() + 1);
        return generateDateOptions(false, baseDate, currentDate);
      }
    }, [dateType, selectedStartDate, currentDate]);

    // Calculate initial selected index based on currentDate
    const initialIndex = useMemo(() => {
      // Boş label her zaman ilk item olacak (index 0)
      return 0;
    }, []);

    const [selectedIndex, setSelectedIndex] = useState(initialIndex);

    const handleSheetChanges = useCallback((index: number) => {
      console.log("handleSheetChanges", index);
    }, []);

    const handleDateChange = useCallback(
      ({ item }: { item: DateOption }) => {
        const index = dateOptions.findIndex((opt) => opt.label === item.label);
        setSelectedIndex(index);
        onDateSelect?.(item.value);
      },
      [dateOptions, onDateSelect]
    );

    // Callbacks
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

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.contentContainer}>
          <WheelPicker
            data={dateOptions}
            value={dateOptions[selectedIndex] as any}
            onValueChanged={handleDateChange}
            enableScrollByTapOnItem={true}
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
