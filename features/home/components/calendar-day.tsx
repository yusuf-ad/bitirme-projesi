import { Colors } from "@/constants/theme";
import { Pressable, StyleSheet, Text } from "react-native";

interface CalendarDayProps {
  day: string;
  dayOfWeek: string;
  isSelected?: boolean;
  onPress?: () => void;
}

export default function CalendarDay({
  day,
  dayOfWeek,
  isSelected = false,
  onPress,
}: CalendarDayProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, isSelected && styles.selectedContainer]}
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
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedContainer: {
    backgroundColor: Colors.lilac[900],
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
