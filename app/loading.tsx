import { Colors } from "@/constants/theme";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const DOT_SIZE = 10;
const DOT_SPACING = 12;
const ANIMATION_DURATION = 300;
const TOTAL_DOTS = 3;

// Reusable animated loading dot component
function LoadingDot({ index }: { index: number }) {
  const isActive = useSharedValue(0);

  useEffect(() => {
    // Calculate delay based on dot index
    const delay = index * ANIMATION_DURATION;

    // Create sequential animation: activate -> deactivate for each dot
    // Total cycle = TOTAL_DOTS * ANIMATION_DURATION * 2 (on + off)
    const cycleDuration = TOTAL_DOTS * ANIMATION_DURATION;

    isActive.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          // Activate (fade in)
          withTiming(1, {
            duration: ANIMATION_DURATION,
            easing: Easing.out(Easing.ease),
          }),
          // Hold active
          withDelay(
            cycleDuration - ANIMATION_DURATION * 2,
            // Deactivate (fade out)
            withTiming(0, {
              duration: ANIMATION_DURATION,
              easing: Easing.in(Easing.ease),
            })
          )
        ),
        -1, // Infinite repeat
        false
      )
    );
  }, [index, isActive]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor:
      isActive.value > 0.5 ? Colors.lilac[900] : Colors.gray[300],
    transform: [{ scale: 0.8 + isActive.value * 0.2 }],
    opacity: 0.4 + isActive.value * 0.6,
  }));

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export default function LoadingScreen() {
  // Navigation is handled by Stack.Protected guards in _layout.tsx
  // This screen only shows while auth state is being determined

  return (
    <View style={styles.container}>
      {/* Splash Icon */}
      <Image
        source={require("@/assets/images/splash-icon.png")}
        style={styles.icon}
        resizeMode="contain"
      />

      {/* Loading Dots */}
      <View style={styles.dotsContainer}>
        {Array.from({ length: TOTAL_DOTS }).map((_, index) => (
          <LoadingDot key={index} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background.primary,
  },
  icon: {
    width: 120,
    height: 120,
    transform: [{ scale: 2 }],
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: DOT_SPACING,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
