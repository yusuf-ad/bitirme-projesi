import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OFFSET = 60;
const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

interface SecondaryActionButtonProps {
  isExpanded: SharedValue<boolean>;
  index: number;
  iconName: string;
  onPress?: () => void;
}

export function SecondaryActionButton({
  isExpanded,
  index,
  iconName,
  onPress,
}: SecondaryActionButtonProps) {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;

    const scaleValue = isExpanded.value ? 1 : 0;

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(delay, withTiming(scaleValue)),
        },
      ],
      // Ensure it doesn't capture touches when collapsed
      zIndex: isExpanded.value ? 10 : -1,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      hitSlop={{ top: 30, bottom: 30, left: 30, right: 30 }}
      style={[styles.secondaryButton, animatedStyles]}
    >
      <FontAwesome name={iconName as any} size={20} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  secondaryButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#9B6DD6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
