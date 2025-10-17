import CalendarDay from "@/features/home/components/calendar-day";
import { mockCalendarDays } from "@/features/home/data/mock-data";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";

export default function CalendarSection() {
  return (
    <View>
      <LinearGradient
        colors={["#f3f4f6", "#f3f4f650"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          left: -16,
          top: 0,
          width: 48,
          height: 64,
          zIndex: 10,
        }}
      />

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

      <LinearGradient
        colors={["#f3f4f650", "#f3f4f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          right: -16,
          top: 0,
          width: 48,
          height: 64,
          zIndex: 10,
        }}
      />
    </View>
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
