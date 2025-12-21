import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { StickyFooter } from "@/shared/components/sticky-footer";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

import type { PreviewFooterProps } from "./types";

export function PreviewFooter({
  onSave,
  isSaving,
  isAddingToShoppingList,
}: PreviewFooterProps) {
  const isDisabled = isSaving || isAddingToShoppingList;
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[800];

  return (
    <StickyFooter
      text="Save Meal Plan"
      onPress={onSave}
      isLoading={isSaving}
      disabled={isAddingToShoppingList}
      accentColor={accentColor}
      rightIcon={<Ionicons name="checkmark-circle" size={20} color="#fff" />}
    />
  );
}

const styles = StyleSheet.create({});
