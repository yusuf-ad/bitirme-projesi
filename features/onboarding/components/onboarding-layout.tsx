import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { OnboardingLayoutProps } from "../types/onboarding.types";

export function OnboardingLayout({
  children,
  backgroundColor,
}: OnboardingLayoutProps) {
  const insets = useSafeAreaInsets();

  // Always use solid color background - no image background
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: backgroundColor || "#FFFFFF" },
      ]}
    >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeAreaWrapper: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
