import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateForDateProps {
  selectedDate: Date;
  onCreatePress: () => void;
  errorMessage?: string | null;
}

const formatDateLong = (date: Date) => {
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  const month = date.toLocaleDateString(undefined, { month: "long" });
  const day = date.getDate();
  return `${weekday}, ${month} ${day}`;
};

export function EmptyStateForDate({
  selectedDate,
  onCreatePress,
  errorMessage,
}: EmptyStateForDateProps) {
  const formattedDate = formatDateLong(selectedDate);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>No meals planned for {formattedDate}</Text>
      <Text style={styles.subtitle}>
        Generate a new plan to fill this day with delicious recipes tailored to
        your preferences.
      </Text>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <CustomButton containerStyle={styles.button} onPress={onCreatePress}>
        <Text style={styles.buttonText}>Create a meal plan</Text>
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: Colors.lilac[100],
    gap: 12,
    alignItems: "flex-start",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.gray[600],
  },
  error: {
    fontSize: 13,
    color: Colors.semantic.error.main,
  },
  button: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: Colors.lilac[900],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background.primary,
  },
});
