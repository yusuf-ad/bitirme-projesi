import { Colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";
import { ProgressBarProps } from "../types/onboarding.types";

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const steps = Array.from({ length: totalSteps }, (_, index) => index);

  return (
    <View style={styles.progressContainer}>
      {steps.map((index) => (
        <View
          key={index}
          style={[
            styles.progressBar,
            index < currentStep && styles.progressBarActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: "row",
    gap: 3,
    padding: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 12,
    marginBottom: 19,
    marginHorizontal: 11,
    height: 24,
  },
  progressBar: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    opacity: 0.5,
  },
  progressBarActive: {
    backgroundColor: Colors.gray[100],
    opacity: 1,
  },
});
