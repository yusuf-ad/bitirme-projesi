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
  showSkipButton = false,
  onSkip,
  skipButtonText = "I skip this dish",
}: OnboardingNavigationProps) {
  return (
    <View style={styles.container}>
      {showSkipButton && onSkip && (
        <View style={styles.skipContainer}>
          <CustomButton
            containerStyle={styles.skipButton}
            accessibilityLabel={skipButtonText}
            onPress={onSkip}
          >
            <Text style={styles.skipText}>{skipButtonText}</Text>
          </CustomButton>
        </View>
      )}

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
    gap: 8,
  },
  skipContainer: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    paddingHorizontal: 24,
    shadowColor: "transparent",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  skipText: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19.36,
    color: Colors.text.inverse,
    textDecorationLine: "underline",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingBottom: 40,
    paddingTop: 8,
  },
  backButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(161, 164, 170, 0.5)",
    borderRadius: 12,
    padding: 0,
    paddingVertical: 0,
    paddingHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    overflow: "hidden",
  },
  nextButton: {
    flex: 1,
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    paddingVertical: 19,
    paddingHorizontal: 24,
    shadowColor: Colors.lilac[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    backgroundColor: Colors.gray[300],
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  buttonText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    lineHeight: 19.36,
    color: Colors.text.inverse,
    textAlign: "center",
    letterSpacing: 0.3,
  },
});
