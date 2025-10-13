import { Colors } from "@/constants/theme";
import { StyleSheet, View } from "react-native";

interface OnboardingProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingProgressBar({
  currentStep,
  totalSteps,
}: OnboardingProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 11,
    marginBottom: 19,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: Colors.gray[300],
    borderRadius: 12,
    overflow: "hidden",
    padding: 4,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Colors.green[900],
    borderRadius: 12,
  },
});
