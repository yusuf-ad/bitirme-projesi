import { Colors } from "@/constants/theme";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface CalendarDayProps extends PressableProps {
  day: string;
  dayOfWeek: string;
  isSelected?: boolean;
  isToday?: boolean;
  onPress?: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CalendarDay({
  day,
  dayOfWeek,
  isSelected = false,
  isToday = false,
  onPress,
  ...props
}: CalendarDayProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const isTodayButNotSelected = isToday && !isSelected;
    return {
      backgroundColor: withTiming(
        isSelected
          ? Colors.lilac[900]
          : isTodayButNotSelected
          ? Colors.lilac[100]
          : Colors.background.surface,
        { duration: 100 }
      ),
      opacity: withTiming(isSelected || isTodayButNotSelected ? 1 : 0.5, {
        duration: 300,
      }),
      borderWidth: isTodayButNotSelected ? 1 : 0,
      borderColor: isToday ? Colors.lilac[500] : "transparent",
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.container, animatedStyle]}
      {...props}
    >
      <Text style={[styles.day, isSelected && styles.selectedText]}>{day}</Text>
      <Text style={[styles.dayOfWeek, isSelected && styles.selectedText]}>
        {dayOfWeek}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 4,
    justifyContent: "center",
    alignItems: "center",
    width: 52,
    height: 64,
  },
  day: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[700],
  },
  dayOfWeek: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[400],
  },
  selectedText: {
    color: Colors.background.primary,
  },
});
