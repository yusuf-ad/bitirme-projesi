import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Pressable, PressableProps, StyleSheet, Text } from "react-native";

interface CalendarDayProps extends PressableProps {
  day: string;
  dayOfWeek: string;
  isSelected?: boolean;
  isToday?: boolean;
  isPast?: boolean;
  onPress?: () => void;
}

export default function CalendarDay({
  day,
  dayOfWeek,
  isSelected = false,
  isToday = false,
  isPast = false,
  onPress,
  ...props
}: CalendarDayProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  
  const isTodayButNotSelected = isToday && !isSelected;
  const isPastButNotSelected = isPast && !isSelected;

  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  // Dynamic container styles
  const getContainerStyle = () => {
    const baseStyle = {
      backgroundColor: isDark
        ? themeColors.card.backgroundElevated
        : themeColors.background.surface,
      opacity: isDark ? 1 : 0.5,
    };

    if (isSelected && isPast) {
      return {
        backgroundColor: isDark ? themeColors.gray[600] : Colors.gray[400],
        opacity: 1,
      };
    }

    if (isSelected) {
      return {
        backgroundColor: accentColor,
        opacity: 1,
      };
    }

    if (isPastButNotSelected) {
      return {
        backgroundColor: isDark ? themeColors.gray[800] : Colors.gray[100],
        opacity: isDark ? 0.5 : 0.6,
      };
    }

    if (isTodayButNotSelected) {
      return {
        backgroundColor: isDark ? "rgba(191, 90, 242, 0.2)" : Colors.lilac[100],
        opacity: 1,
        borderWidth: 1,
        borderColor: accentColor,
      };
    }

    return baseStyle;
  };

  // Dynamic text colors
  const getDayTextColor = () => {
    if (isSelected) return "#FFFFFF";
    if (isPastButNotSelected) return themeColors.text.tertiary;
    return themeColors.text.primary;
  };

  const getDayOfWeekTextColor = () => {
    if (isSelected) return "#FFFFFF";
    if (isPastButNotSelected) return themeColors.text.tertiary;
    return themeColors.text.secondary;
  };

  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, getContainerStyle()]}
      {...props}
    >
      <Text style={[styles.day, { color: getDayTextColor() }]}>{day}</Text>
      <Text style={[styles.dayOfWeek, { color: getDayOfWeekTextColor() }]}>
        {dayOfWeek}
      </Text>
    </Pressable>
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
  },
  dayOfWeek: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    lineHeight: 16,
  },
});

