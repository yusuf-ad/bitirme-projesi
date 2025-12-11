import { useTheme } from "@/providers/theme-provider";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import React, { useCallback, useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
}

export const MenuItemComponent = React.memo(function MenuItemComponent({
  item,
}: MenuItemComponentProps) {
  const { isDark } = useTheme();

  const handlePress = useCallback(() => {
    Haptics.selectionAsync();
    item.onPress();
  }, [item]);

  // Memoize theme-dependent colors
  const colors = useMemo(
    () => ({
      background: isDark ? "#1F1F1F" : "#FFFFFF",
      iconBg: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.03)",
      iconColor: item.color || (isDark ? "#FFFFFF" : "#000000"),
      textColor: isDark ? "#FFFFFF" : "#000000",
      secondaryColor: isDark ? "#9CA3AF" : "#6B7280",
    }),
    [isDark, item.color]
  );

  return (
    <View style={styles.menuItemWrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.menuItem,
          { backgroundColor: colors.background },
          pressed && styles.menuItemPressed,
        ]}
        onPress={handlePress}
      >
        <View style={styles.menuItemLeft}>
          <View
            style={[
              styles.menuIconContainer,
              { backgroundColor: colors.iconBg },
            ]}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={20}
              color={colors.iconColor}
            />
          </View>
          <View style={styles.menuItemCopy}>
            <Text style={[styles.menuItemText, { color: colors.textColor }]}>
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={[
                  styles.menuItemDescription,
                  { color: colors.secondaryColor },
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
              style={[styles.menuItemMeta, { color: colors.secondaryColor }]}
              numberOfLines={1}
            >
              {item.meta}
            </Text>
          )}
          <MaterialCommunityIcons
            name="chevron-right"
            size={20}
            color={colors.secondaryColor}
          />
        </View>
      </Pressable>
    </View>
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
  menuItemPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
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
