import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { OnboardingNavigationProps } from "../types/onboarding.types";

export function OnboardingNavigation({
  onBack,
  onNext,
  nextButtonText = "Next",
  isNextDisabled = false,
  showSkipButton = false,
  onSkip,
  skipButtonText = "I skip this dish",
}: OnboardingNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyle={styles.backButton}
          accessibilityLabel="Go Back"
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={28} color="#2D3142" />
        </CustomButton>

        {showSkipButton && onSkip && (
          <CustomButton
            containerStyle={styles.skipButton}
            accessibilityLabel={skipButtonText}
            onPress={onSkip}
          >
            <Text style={styles.skipText}>{skipButtonText}</Text>
          </CustomButton>
        )}

        <CustomButton
          containerStyle={[
            styles.nextButton,
            isNextDisabled && styles.nextButtonDisabled,
          ]}
          accessibilityLabel={nextButtonText}
          onPress={onNext}
          disabled={isNextDisabled}
        >
          <Text style={styles.buttonText} numberOfLines={1}>
            {nextButtonText}
          </Text>
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 8,
  },
  backButton: {
    width: 64,
    height: 64,
    backgroundColor: "#E8E9EB",
    borderRadius: 16,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  skipButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skipText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 24,
    color: "#2D3142",
    textAlign: "center",
  },
  nextButton: {
    flex: 1,
    backgroundColor: "#2D3648",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    backgroundColor: "#B8BCC4",
    opacity: 0.5,
    shadowOpacity: 0.05,
  },
  buttonText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 24,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
