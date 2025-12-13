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
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>🍳</Text>
          <Text style={styles.cardTitle}>Breakfast</Text>
          <Text style={styles.cardSubtitle}>
            {description || "Select your preferred time"}
          </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10, // Add space from top to avoid navigation
    paddingBottom: 80,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32, // More rounded
    width: "100%",
    overflow: "hidden",
    shadowColor: Colors.lilac[900], // Use theme color for shadow
    shadowOffset: { width: 0, height: 8 }, // Deeper shadow
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  cardHeader: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cardEmoji: {
    fontSize: 48, // Larger emoji
    marginBottom: 16,
    backgroundColor: Colors.lilac[100],
    width: 80,
    height: 80,
    textAlign: "center",
    textAlignVertical: "center", // Android center
    lineHeight: 80, // iOS center
    borderRadius: 40,
    overflow: "hidden", // Important for borderRadius on Text
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    minHeight: 48, // Ensure consistent height for 2 lines
  },
  pickerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});
