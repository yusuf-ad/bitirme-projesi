import { StyleSheet, Text, View } from "react-native";
import { TimePicker } from "./components/time-picker";

interface MealTimeLunchProps {
  title: string;
  description?: string;
  onTimeChange?: (hour: number, minute: number, period: "AM" | "PM") => void;
  initialHour?: number;
  initialMinute?: number;
  initialPeriod?: "AM" | "PM";
}

export function MealTimeLunch({
  title,
  description,
  onTimeChange,
  initialHour = 2,
  initialMinute = 30,
  initialPeriod = "PM",
}: MealTimeLunchProps) {
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
    paddingHorizontal: 24,
  },
  textContainer: {
    marginBottom: 60,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 32,
    lineHeight: 40,
    color: "#2D3142",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 24,
    color: "#5D6270",
  },
  pickerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
});
