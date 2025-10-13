import { Colors } from "@/constants/theme";
import { useCallback, useRef, useState } from "react";
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

const ITEM_HEIGHT = 60;
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
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];

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
    if (distance === 1) return 0.4;
    return 0.2;
  };

  function renderPickerColumn(
    items: string[],
    selectedValue: number | string,
    onScroll: (event: NativeSyntheticEvent<NativeScrollEvent>) => void,
    scrollRef: React.RefObject<ScrollView | null>
  ) {
    const selectedIndex =
      typeof selectedValue === "number"
        ? items.findIndex((item) => parseInt(item, 10) === selectedValue)
        : items.indexOf(selectedValue as string);

    return (
      <View style={styles.pickerColumn}>
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
      {/* Time Display */}
      <View style={styles.displayContainer}>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeText}>
            {selectedHour.toString().padStart(2, "0")}
          </Text>
          <Text style={styles.timeSeparator}>:</Text>
          <Text style={styles.timeText}>
            {selectedMinute.toString().padStart(2, "0")}
          </Text>
          <Text style={styles.periodText}>{selectedPeriod}</Text>
        </View>
      </View>

      {/* Picker Wheels */}
      <View style={styles.pickerContainer}>
        {/* Selection Indicator */}
        <View style={styles.selectionIndicator} />

        {/* Hour Picker */}
        {renderPickerColumn(
          hours,
          selectedHour,
          (e) => handleScroll(e, hours, setSelectedHour, "hour"),
          hourScrollRef
        )}

        <View style={styles.separator}>
          <Text style={styles.separatorText}>:</Text>
        </View>

        {/* Minute Picker */}
        {renderPickerColumn(
          minutes,
          selectedMinute,
          (e) => handleScroll(e, minutes, setSelectedMinute, "minute"),
          minuteScrollRef
        )}

        {/* Period Picker */}
        {renderPickerColumn(
          periods,
          selectedPeriod,
          (e) => handleScroll(e, periods, setSelectedPeriod, "period"),
          periodScrollRef
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: 20,
  },
  displayContainer: {
    marginBottom: 40,
  },
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 48,
    lineHeight: 58,
    color: "#FFFFFF",
  },
  timeSeparator: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 48,
    lineHeight: 58,
    color: "#FFFFFF",
  },
  periodText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 24,
    lineHeight: 29,
    color: "#FFFFFF",
    marginLeft: 8,
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
    backgroundColor: "rgba(158, 139, 139, 0.77)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.lilac[900],
    zIndex: -1,
  },
  pickerColumn: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    width: 70,
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
    fontWeight: "500",
    fontSize: 32,
    lineHeight: 38.73,
    color: "rgba(255, 255, 255, 0.4)",
  },
  pickerTextSelected: {
    fontWeight: "700",
    color: "#FFFFFF",
  },
  separator: {
    width: 20,
    height: ITEM_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  separatorText: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 32,
    lineHeight: 38.73,
    color: "#FFFFFF",
  },
});
