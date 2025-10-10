import { ImageBackground, StyleSheet, View } from "react-native";
import { OnboardingLayoutProps } from "../types/onboarding.types";

export function OnboardingLayout({
  children,
  blurRadius = 48,
}: OnboardingLayoutProps) {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding-bg.png")}
        style={styles.backgroundImage}
        blurRadius={blurRadius}
      >
        {/* Overlay for better text readability */}
        <View style={styles.overlay} />

        {/* Content */}
        {children}
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});
