import { StyleSheet, View } from "react-native";
import { ProgressBarProps } from "../types/onboarding.types";

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index);

  function getProgressColor(index: number): string {
    if (index >= currentStep) return "#E5E5E5"; // Inactive gray

    // Calculate percentage of completion for this step
    const percentComplete = ((index + 1) / totalSteps) * 100;

    // Green for early steps (0-35%)
    if (percentComplete <= 35) return "#6FCF97";
    // Yellow for mid-early steps (35-55%)
    if (percentComplete <= 55) return "#F2C94C";
    // Orange/peach for mid-late steps (55-75%)
    if (percentComplete <= 75) return "#F2994A";
    // Red/pink for final steps (75-100%)
    return "#EB5757";
  }

  return (
    <View style={styles.progressContainer}>
      {steps.map((index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            { backgroundColor: getProgressColor(index) },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 20,
    marginBottom: 24,
    height: 8,
  },
  progressBar: {
    flex: 1,
    borderRadius: 8,
  },
});
