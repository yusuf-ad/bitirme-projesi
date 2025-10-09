import CustomButton from "@/shared/components/custom-button";
import { ImageBackground, StyleSheet, Text, View } from "react-native";

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding-bg.png")}
        style={styles.backgroundImage}
        blurRadius={24}
      >
        {/* Overlay */}
        <View style={styles.overlay} />

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Define Your Goal</Text>
            <Text style={styles.description}>
              Let&apos;s get started! Choose your main goal to reach results
              faster and stay motivated
            </Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <CustomButton
              containerStyle={styles.skipButton}
              accessibilityLabel="Skip"
            >
              <View style={styles.skipButtonContent} />
            </CustomButton>

            <CustomButton
              containerStyle={styles.diveInButton}
              accessibilityLabel="Dive In"
            >
              <Text style={styles.buttonText}>Dive In!</Text>
            </CustomButton>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 267,
    paddingBottom: 88,
  },
  textContainer: {
    paddingHorizontal: 27,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 40,
    lineHeight: 48.4,
    color: "#FFFFFF",
    marginBottom: 62,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 28,
    color: "#FFFFFF",
    paddingHorizontal: 4,
    maxWidth: 300,
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
  },
  skipButton: {
    width: 56,
    height: 56,
    backgroundColor: "rgba(161, 164, 170, 0.5)",
    borderRadius: 8,
    padding: 0,
  },
  skipButtonContent: {
    width: 24,
    height: 24,
  },
  diveInButton: {
    flex: 1,
    backgroundColor: "#7849B6",
    borderRadius: 8,
    paddingVertical: 19,
    paddingHorizontal: 115,
  },
  buttonText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19.36,
    color: "#FFFFFF",
    textAlign: "center",
  },
});
