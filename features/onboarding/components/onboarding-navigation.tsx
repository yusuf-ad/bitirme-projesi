import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { OnboardingNavigationProps } from "../types/onboarding.types";

export function OnboardingNavigation({
  onBack,
  onNext,
  nextButtonText = "Next",
  isNextDisabled = false,
}: OnboardingNavigationProps) {
  return (
    <View style={styles.buttonContainer}>
      <CustomButton
        containerStyle={styles.backButton}
        accessibilityLabel="Go Back"
        onPress={onBack}
      >
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </CustomButton>

      <CustomButton
        containerStyle={[
          styles.nextButton,
          isNextDisabled && styles.nextButtonDisabled,
        ]}
        accessibilityLabel={nextButtonText}
        onPress={onNext}
        disabled={isNextDisabled}
      >
        <Text style={styles.buttonText}>{nextButtonText}</Text>
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 40,
  },
  backButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(161, 164, 170, 0.5)",
    borderRadius: 8,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.lilac[900],
    borderRadius: 8,
    paddingVertical: 19,
    paddingHorizontal: 115,
  },
  nextButtonDisabled: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19.36,
    color: Colors.text.inverse,
    textAlign: "center",
  },
});
