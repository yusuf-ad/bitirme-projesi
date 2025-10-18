import CalendarDay from "@/features/home/components/calendar-day";
import { mockCalendarDays } from "@/features/home/data/mock-data";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, View } from "react-native";

export default function CalendarSection() {
  return (
    <View>
      <LinearGradient
        colors={["#f3f4f6", "#f3f4f600"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          left: -16,
          top: 0,
          width: 48,
          height: 64,
          zIndex: 10,
          shadowColor: "#fff",
          shadowOffset: {
            width: 24,
            height: 24,
          },
          shadowOpacity: 1,
          shadowRadius: 50,
          elevation: 16,
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
        colors={["#f3f4f635", "#f3f4f6"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          right: -16,
          top: 0,
          width: 48,
          height: 64,
          zIndex: 10,
          shadowColor: "#fff",
          shadowOffset: {
            width: 24,
            height: 24,
          },
          shadowOpacity: 1,
          shadowRadius: 50,
          elevation: 16,
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
