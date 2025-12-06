import { Colors } from "@/constants/theme";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

interface CalendarDayProps extends PressableProps {
  day: string;
  dayOfWeek: string;
  isSelected?: boolean;
  isToday?: boolean;
  onPress?: () => void;
}

export default function CalendarDay({
  day,
  dayOfWeek,
  isSelected = false,
  isToday = false,
  onPress,
  ...props
}: CalendarDayProps) {
  const isTodayButNotSelected = isToday && !isSelected;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isSelected && styles.selectedContainer,
        isTodayButNotSelected && styles.todayContainer,
      ]}
      {...props}
    >
      <Text style={[styles.day, isSelected && styles.selectedText]}>{day}</Text>
      <Text style={[styles.dayOfWeek, isSelected && styles.selectedText]}>
        {dayOfWeek}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    width: 52,
    height: 64,
    backgroundColor: Colors.background.surface,
    opacity: 0.5,
  },
  selectedContainer: {
    backgroundColor: Colors.lilac[900],
    opacity: 1,
  },
  todayContainer: {
    backgroundColor: Colors.lilac[100],
    opacity: 1,
    borderWidth: 1,
    borderColor: Colors.lilac[500],
  },
  day: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[700],
  },
  dayOfWeek: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[400],
  },
  selectedText: {
    color: Colors.background.primary,
  },
});
