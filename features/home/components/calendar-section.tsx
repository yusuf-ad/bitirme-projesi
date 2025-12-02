import CalendarDay from "@/features/home/components/calendar-day";
import { mockCalendarDays } from "@/features/home/data/mock-data";
import { useEffect, useMemo, useRef } from "react";
import { FlatList, StyleSheet } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

const ITEM_WIDTH = 52 + 12; // width + gap

interface CalendarSectionProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const isSameDay = (a: Date, b: Date) => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export default function CalendarSection({
  selectedDate,
  onDateSelect,
}: CalendarSectionProps) {
  const ref = useRef<FlatList>(null);
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const calendarDays = useMemo(() => mockCalendarDays, []);

  const computedIndex = calendarDays.findIndex((day) =>
    isSameDay(day.date, selectedDate)
  );
  const selectedIndex = computedIndex >= 0 ? computedIndex : 0;

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  useEffect(() => {
    // Scroll to the selected index with animation
    const timer = setTimeout(() => {
      if (selectedIndex >= 0) {
        ref.current?.scrollToIndex({
          index: selectedIndex,
          animated: true,
          viewPosition: 0.5,
        });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedIndex]);

  return (
    <Animated.View entering={FadeInRight.duration(400).delay(100)}>
      <FlatList
        ref={ref}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={(info) => {
          const wait = new Promise((resolve) => setTimeout(resolve, 500));
          wait.then(() => {
            ref.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.5,
            });
          });
        }}
        data={calendarDays}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.calendarScrollView}
        contentContainerStyle={styles.calendarContent}
        keyExtractor={(item) => item.date.toISOString()}
        renderItem={({ item, index: itemIndex }) => (
          <CalendarDay
            day={item.day}
            dayOfWeek={item.dayOfWeek}
            isSelected={selectedIndex === itemIndex}
            isToday={isSameDay(item.date, today)}
            onPress={() => {
              const normalizedDate = new Date(item.date);
              normalizedDate.setHours(0, 0, 0, 0);
              onDateSelect(normalizedDate);
            }}
          />
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  calendarScrollView: {
    marginHorizontal: -16,
    marginBottom: 8,
  },
  calendarContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
});
