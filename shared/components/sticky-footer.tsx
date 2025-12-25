import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import CustomButton from "@/shared/components/custom-button";
import { ReactNode } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface StickyFooterProps {
  text: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children?: ReactNode;
  containerStyle?: ViewStyle;
  buttonStyle?: ViewStyle;
  textStyle?: TextStyle;
  backgroundColor?: string;
  accentColor?: string;
}

export function StickyFooter({
  text,
  onPress,
  isLoading,
  disabled,
  leftIcon,
  rightIcon,
  children,
  containerStyle,
  buttonStyle,
  textStyle,
  backgroundColor,
  accentColor: customAccentColor,
}: StickyFooterProps) {
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const insets = useSafeAreaInsets();

  const finalAccentColor =
    customAccentColor ||
    (isDark ? themeColors.accent.lilac : Colors.lilac[800]);
  const isDisabled = disabled || isLoading;

  return (
    <View
      style={[
        styles.footer,
        {
          backgroundColor: backgroundColor || themeColors.background.primary,
          borderTopColor: themeColors.border.light,
          paddingBottom: Math.max(insets.bottom, 20),
        },
        containerStyle,
      ]}
    >
      {children}
      <CustomButton
        containerStyle={[
          styles.button,
          {
            backgroundColor: finalAccentColor,
            marginBottom: Platform.OS === "ios" ? 0 : 16,
          },
          buttonStyle,
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        disabled={isDisabled}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {leftIcon}
            <Text style={[styles.buttonText, textStyle]}>{text}</Text>
            {rightIcon}
          </>
        )}
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
});
