import AntDesign from "@expo/vector-icons/build/AntDesign";
import { useEffect } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useAttachMenu, type AttachMenuRoute } from "./attach-menu";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FabButtonProps {
  currentRouteName: string;
}

export function FabButton({ currentRouteName }: FabButtonProps) {
  const { toggleMenu, isOpen, setCurrentRoute } = useAttachMenu();

  // Update current route when it changes
  useEffect(() => {
    setCurrentRoute(currentRouteName as AttachMenuRoute);
  }, [currentRouteName, setCurrentRoute]);

  const handleMainButtonPress = () => {
    // All tabs now use the attach menu
    toggleMenu();
  };

  const ANIMATION_DURATION = 300; // Animation duration in ms

  const plusIconStyle = useAnimatedStyle(() => {
    // Sync rotation with attach menu state for all tabs
    const rotateValue = isOpen ? "45deg" : "0deg";

    return {
      transform: [
        { rotate: withTiming(rotateValue, { duration: ANIMATION_DURATION }) },
      ],
    };
  });

  return (
    <Animated.View
      exiting={FadeOutDown}
      entering={FadeInDown}
      style={styles.fabContainer}
    >
      {/* Main FAB Button */}
      <AnimatedPressable
        onPress={handleMainButtonPress}
        style={styles.mainButton}
      >
        <Animated.View style={plusIconStyle}>
          <AntDesign name="plus" size={24} color="#FFFFFF" />
        </Animated.View>
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10, // Ensure FAB and its children are above other tab bar items
  },
  mainButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#7849B6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    zIndex: 20,
  },
});
