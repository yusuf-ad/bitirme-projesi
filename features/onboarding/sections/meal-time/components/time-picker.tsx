import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface TimePickerProps {
  onTimeChange?: (hour: number, minute: number, period: "AM" | "PM") => void;
  initialHour?: number;
  initialMinute?: number;
  initialPeriod?: "AM" | "PM";
}

const ITEM_HEIGHT = 70;
const VISIBLE_ITEMS = 5;

export function TimePicker({
  onTimeChange,
  initialHour = 10,
  initialMinute = 0,
  initialPeriod = "AM",
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const [selectedPeriod, setSelectedPeriod] = useState<"AM" | "PM">(
    initialPeriod
  );

  const hourScrollRef = useRef<ScrollView | null>(null);
  const minuteScrollRef = useRef<ScrollView | null>(null);
  const periodScrollRef = useRef<ScrollView | null>(null);

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 12 }, (_, i) =>
    (i * 5).toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

  useEffect(() => {
    const hourIndex = hours.findIndex((h) => parseInt(h, 10) === initialHour);
    const minuteIndex = minutes.findIndex(
      (m) => parseInt(m, 10) === initialMinute
    );
    const periodIndex = periods.indexOf(initialPeriod);

    setTimeout(() => {
      hourScrollRef.current?.scrollTo({
        y: hourIndex * ITEM_HEIGHT,
        animated: false,
      });
      minuteScrollRef.current?.scrollTo({
        y: minuteIndex * ITEM_HEIGHT,
        animated: false,
      });
      periodScrollRef.current?.scrollTo({
        y: periodIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, []);

  const handleScroll = useCallback(
    (
      event: NativeSyntheticEvent<NativeScrollEvent>,
      items: string[],
      setter: (value: any) => void,
      type: "hour" | "minute" | "period"
    ) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      const value = items[clampedIndex];

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (type === "hour") {
        const hourNum = parseInt(value, 10);
        setSelectedHour(hourNum);
        setter(hourNum);
        onTimeChange?.(hourNum, selectedMinute, selectedPeriod);
      } else if (type === "minute") {
        const minuteNum = parseInt(value, 10);
        setSelectedMinute(minuteNum);
        setter(minuteNum);
        onTimeChange?.(selectedHour, minuteNum, selectedPeriod);
      } else {
        setSelectedPeriod(value as "AM" | "PM");
        setter(value);
        onTimeChange?.(selectedHour, selectedMinute, value as "AM" | "PM");
      }
    },
    [onTimeChange, selectedHour, selectedMinute, selectedPeriod]
  );

  const getOpacity = (index: number, selectedIndex: number): number => {
    const distance = Math.abs(index - selectedIndex);
    if (distance === 0) return 1;
    if (distance === 1) return 0.5;
    return 0.3;
  };

  function renderPickerColumn(
    items: string[],
    selectedValue: number | string,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    scrollRef: React.RefObject<ScrollView | null>,
    width: number = 80
  ) {
    const selectedIndex =
      typeof selectedValue === "number"
        ? items.findIndex((item) => parseInt(item, 10) === selectedValue)
        : items.indexOf(selectedValue as string);

    return (
      <View style={[styles.pickerColumn, { width }]}>
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={onScroll}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Top padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />

          {items.map((item, index) => {
            const opacity = getOpacity(index, selectedIndex);
            const isSelected = index === selectedIndex;

            return (
              <View
                key={`${item}-${index}`}
                style={[
                  styles.pickerItem,
                  isSelected && styles.pickerItemSelected,
                ]}
              >
                <Text
                  style={[
                    styles.pickerText,
                    { opacity },
                    isSelected && styles.pickerTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          })}

          {/* Bottom padding */}
          <View style={{ height: ITEM_HEIGHT * 2 }} />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Picker Wheels */}
      <View style={styles.pickerContainer}>
        {/* Selection Indicator - White rounded box */}
        <View style={styles.selectionIndicator} />

        {/* Hour Picker */}
        {renderPickerColumn(
          hours,
          selectedHour,
          (e) => handleScroll(e, hours, setSelectedHour, "hour"),
          hourScrollRef,
          100
        )}

        <View style={styles.separator}>
          <Text style={styles.separatorText}>:</Text>
        </View>

        {/* Minute Picker */}
        {renderPickerColumn(
          minutes,
          selectedMinute,
          (e) => handleScroll(e, minutes, setSelectedMinute, "minute"),
          minuteScrollRef,
          100
        )}

        {/* Period Picker */}
        {renderPickerColumn(
          periods,
          selectedPeriod,
          (e) => handleScroll(e, periods, setSelectedPeriod, "period"),
          periodScrollRef,
          80
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: "relative",
  },
  selectionIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: ITEM_HEIGHT * 2,
    height: ITEM_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    zIndex: -1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pickerColumn: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  scrollContent: {
    paddingVertical: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  pickerItemSelected: {
    // Selected item styling if needed
  },
  pickerText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 40,
    lineHeight: 48,
    color: "#2D3142",
  },
  pickerTextSelected: {
    fontWeight: "600",
    color: "#2D3142",
  },
  separator: {
    width: 8,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  separatorText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 40,
    lineHeight: 48,
    color: "#2D3142",
  },
});
