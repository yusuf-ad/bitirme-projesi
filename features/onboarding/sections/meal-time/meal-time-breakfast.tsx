import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { TimePicker } from "./components/time-picker";

interface MealTimeBreakfastProps {
  title: string;
  description?: string;
  onTimeChange?: (hour: number, minute: number, period: "AM" | "PM") => void;
  initialHour?: number;
  initialMinute?: number;
  initialPeriod?: "AM" | "PM";
}

export function MealTimeBreakfast({
  title,
  description,
  onTimeChange,
  initialHour = 10,
  initialMinute = 0,
  initialPeriod = "AM",
}: MealTimeBreakfastProps) {
  return (
    <View style={styles.content}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <View style={styles.pickerContainer}>
        <TimePicker
          onTimeChange={onTimeChange}
          initialHour={initialHour}
          initialMinute={initialMinute}
          initialPeriod={initialPeriod}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  textContainer: {
    paddingHorizontal: 27,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 48,
    lineHeight: 58,
    color: Colors.text.inverse,
    marginBottom: 42,
    maxWidth: 344,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 28,
    color: Colors.text.inverse,
    maxWidth: 317,
  },
  pickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
