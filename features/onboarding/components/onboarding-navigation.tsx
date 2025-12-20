import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingNavigationProps } from "../types/onboarding.types";

export function OnboardingNavigation({
  onBack,
  onNext,
  nextButtonText = "Next",
  isNextDisabled = false,
  showSkipButton = false,
  onSkip,
  skipButtonText = "I skip this dish",
  skipButtonStyle = "default",
  isSkipDisabled = false,
}: OnboardingNavigationProps) {
  // Determine skip button style
  const getSkipButtonStyle = () => {
    if (skipButtonStyle === "primary") {
      if (isSkipDisabled) {
        return styles.skipButtonDisabled;
      }
      return styles.skipButtonPrimary;
    }
    return styles.skipButton;
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.buttonContainer,
          { paddingBottom: 32 + insets.bottom },
        ]}
      >
        <CustomButton
          containerStyle={styles.backButton}
          accessibilityLabel="Go Back"
          onPress={onBack}
        >
          <Ionicons name="chevron-back" size={28} color="#2D3142" />
        </CustomButton>

        {showSkipButton && onSkip && (
          <CustomButton
            containerStyle={getSkipButtonStyle()}
            accessibilityLabel={skipButtonText}
            onPress={onSkip}
            disabled={isSkipDisabled}
          >
            <Text
              style={
                skipButtonStyle === "primary"
                  ? styles.skipTextPrimary
                  : styles.skipText
              }
            >
              {skipButtonText}
            </Text>
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
    width: "auto",
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
  skipButtonPrimary: {
    flex: 1,
    width: "auto",
    backgroundColor: "#22C55E", // Green
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
  },
  skipButtonDisabled: {
    flex: 1,
    width: "auto",
    backgroundColor: "#B8BCC4", // Disabled Gray
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.05,
    shadowRadius: 0,
    elevation: 0,
  },
  skipText: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 18,
    lineHeight: 24,
    color: "#2D3142",
    textAlign: "center",
  },
  skipTextPrimary: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
    color: "#FFFFFF",
    textAlign: "center",
  },
  nextButton: {
    flex: 1,
    width: "auto",
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
