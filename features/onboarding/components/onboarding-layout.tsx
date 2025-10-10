import { ImageBackground, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingLayoutProps } from "../types/onboarding.types";

export function OnboardingLayout({
  children,
  blurRadius = 48,
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/onboarding-bg.png")}
        style={styles.backgroundImage}
        blurRadius={blurRadius}
      >
        {/* Overlay for better text readability */}
        <View style={styles.overlay} />

        {/* Safe area wrapper with top padding only */}
        <View
          style={[
            styles.safeAreaWrapper,
            {
              paddingTop: insets.top,
            },
          ]}
        >
          {/* Content container */}
          <View style={styles.contentContainer}>{children}</View>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeAreaWrapper: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
