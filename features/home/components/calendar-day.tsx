import { Colors } from "@/constants/theme";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

interface CalendarDayProps extends PressableProps {
  day: string;
  dayOfWeek: string;
  isSelected?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  onPress?: () => void;
}

export default function CalendarDay({
  day,
  dayOfWeek,
  isSelected = false,
  isToday = false,
  isPast = false,
  onPress,
  ...props
}: CalendarDayProps) {
  const isTodayButNotSelected = isToday && !isSelected;
  const isPastButNotSelected = isPast && !isSelected;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        isPastButNotSelected && styles.pastContainer,
        isSelected && styles.selectedContainer,
        isSelected && isPast && styles.selectedPastContainer,
        isTodayButNotSelected && styles.todayContainer,
      ]}
      {...props}
    >
      <Text style={[
        styles.day, 
        isSelected && styles.selectedText,
        isPastButNotSelected && styles.pastText,
      ]}>{day}</Text>
      <Text style={[
        styles.dayOfWeek, 
        isSelected && styles.selectedText,
        isPastButNotSelected && styles.pastText,
      ]}>
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
  selectedPastContainer: {
    backgroundColor: Colors.gray[400],
    opacity: 1,
  },
  pastContainer: {
    backgroundColor: Colors.gray[100],
    opacity: 0.6,
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
  pastText: {
    color: Colors.gray[400],
  },
});
