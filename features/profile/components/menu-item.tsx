import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  color?: string;
}

interface MenuItemComponentProps {
  item: MenuItem;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const MenuItemComponent = React.memo(function MenuItemComponent({
  item,
  index,
}: MenuItemComponentProps) {
  const { isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = React.useCallback(() => {
    scale.value = withSpring(0.98);
  }, [scale]);

  const handlePressOut = React.useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  const handlePress = React.useCallback(() => {
    Haptics.selectionAsync();
    item.onPress();
  }, [item]);

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.menuItemWrapper}
    >
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.menuItem,
          { backgroundColor: isDark ? "#1F1F1F" : "#FFFFFF" },
          animatedStyle,
        ]}
        onPress={handlePress}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.menuIconContainer,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.03)",
              },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={item.color || (isDark ? "#FFFFFF" : "#000000")}
            />
          </View>
          <View style={styles.menuItemCopy}>
            <Text
              style={[
                styles.menuItemText,
                { color: isDark ? "#FFFFFF" : "#000000" },
              ]}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.menuItemDescription,
                  { color: isDark ? "#9CA3AF" : "#6B7280" },
                ]}
                numberOfLines={2}
              >
                {item.description}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.metaWrapper}>
          {item.meta && (
            <Text
              style={[
                styles.menuItemMeta,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}
              numberOfLines={1}
            >
              {item.meta}
            </Text>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  menuItemWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemCopy: {
    flex: 1,
    gap: 2,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemDescription: {
    fontSize: 13,
  },
  metaWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    maxWidth: "45%",
    justifyContent: "flex-end",
  },
  menuItemMeta: {
    fontSize: 14,
    fontWeight: "500",
  },
});
