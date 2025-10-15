import CalendarDay from "@/features/home/components/calendar-day";
import { mockCalendarDays } from "@/features/home/data/mock-data";
import { ScrollView, StyleSheet } from "react-native";

export default function CalendarSection() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.calendarScrollView}
      contentContainerStyle={styles.calendarContent}
    >
      {mockCalendarDays.map((day) => (
        <CalendarDay
          key={day.day}
          day={day.day}
          dayOfWeek={day.dayOfWeek}
          isSelected={day.isSelected}
        />
      ))}
    </ScrollView>
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
