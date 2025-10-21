import CalendarDay from "@/features/home/components/calendar-day";
import { mockCalendarDays } from "@/features/home/data/mock-data";
import { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet } from "react-native";

const ITEM_WIDTH = 52 + 12; // width + gap

export default function CalendarSection() {
  const ref = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);

  const getItemLayout = (_: any, index: number) => ({
    length: ITEM_WIDTH,
    offset: ITEM_WIDTH * index,
    index,
  });

  useEffect(() => {
    // Find today's index and set it with animation
    const todayIndex = mockCalendarDays.findIndex((day) => day.isSelected);
    if (todayIndex !== -1) {
      setIndex(todayIndex);
    }
  }, []);

  useEffect(() => {
    // Scroll to the selected index with animation
    const timer = setTimeout(() => {
      ref.current?.scrollToIndex({
        index,
        animated: true,
        viewPosition: 0.5,
      });
    }, 100);

    return () => clearTimeout(timer);
  }, [index]);

  return (
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
      data={mockCalendarDays}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.calendarScrollView}
      contentContainerStyle={styles.calendarContent}
      keyExtractor={(item) => item.day.toString()}
      renderItem={({ item, index: itemIndex }) => (
        <CalendarDay
          day={item.day}
          dayOfWeek={item.dayOfWeek}
          isSelected={index === itemIndex}
          onPress={() => setIndex(itemIndex)}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  calendarScrollView: {
    marginHorizontal: -16,
    marginBottom: 24,
  },
  calendarContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
});
