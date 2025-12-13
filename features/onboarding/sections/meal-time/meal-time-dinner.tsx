import { Colors } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";
import { TimePicker } from "./components/time-picker";

interface MealTimeDinnerProps {
  title: string;
  description?: string;
  onTimeChange?: (hour: number, minute: number, period: "AM" | "PM") => void;
  initialHour?: number;
  initialMinute?: number;
  initialPeriod?: "AM" | "PM";
}

export function MealTimeDinner({
  title,
  description,
  onTimeChange,
  initialHour = 6,
  initialMinute = 0,
  initialPeriod = "PM",
}: MealTimeDinnerProps) {
  return (
    <View style={styles.content}>
      <View style={styles.cardContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardEmoji}>🍽️</Text>
          <Text style={styles.cardTitle}>Dinner</Text>
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
    paddingTop: 10,
    paddingBottom: 80,
  },
  cardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    width: "100%",
    overflow: "hidden",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 8 },
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
    fontSize: 48,
    marginBottom: 16,
    backgroundColor: Colors.lilac[100],
    width: 80,
    height: 80,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 80,
    borderRadius: 40,
    overflow: "hidden",
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
