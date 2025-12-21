import { Colors, getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    FadeInDown,
    FadeInUp,
    ZoomIn,
} from "react-native-reanimated";

interface CelebrationModalProps {
  visible: boolean;
  type:
    | "account-created"
    | "meal-plan-created"
    | "profile-updated"
    | "meal-plan-saved";
  onClose: () => void;
  onAction?: () => void;
  onSecondaryAction?: () => void;
}

const MODAL_CONFIG = {
  "account-created": {
    icon: "party-popper",
    title: "Welcome Aboard!",
    description:
      "Your account has been successfully created. We're excited to help you achieve your nutrition goals.",
    buttonText: "Let's Get Started",
    secondaryButtonText: null,
  },
  "meal-plan-created": {
    icon: "silverware-variant",
    title: "Meal Plan Ready!",
    description:
      "Your personalized meal plan has been generated. Time to start cooking delicious and healthy meals.",
    buttonText: "View My Plan",
    secondaryButtonText: null,
  },
  "profile-updated": {
    icon: "account-check",
    title: "Profile Updated",
    description: "Your profile information has been successfully updated.",
    buttonText: "Looks Good",
    secondaryButtonText: null,
  },
  "meal-plan-saved": {
    icon: "content-save-check",
    title: "Meal Plan Saved!",
    description: "Your meal plan has been successfully saved to your calendar.",
    buttonText: "Shopping List",
    secondaryButtonText: "Go Home",
  },
} as const;

export function CelebrationModal({
  visible,
  type,
  onClose,
  onAction,
  onSecondaryAction,
}: CelebrationModalProps) {
  const config = MODAL_CONFIG[type];
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);
  const accentColor = isDark ? themeColors.accent.lilac : Colors.lilac[600];
  const primaryColor = isDark ? themeColors.accent.lilac : Colors.lilac[900];

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        {/* Backdrop */}
        <BlurView intensity={30} style={styles.absolute} tint="dark" />
        <View style={styles.backdropOverlay} />

        {/* Modal Content */}
        <Animated.View
          entering={ZoomIn.duration(400).springify()}
          style={[styles.modalCard, { backgroundColor: themeColors.background.surface }]}
        >
          <Animated.View
            entering={ZoomIn.delay(100).springify()}
            style={[styles.iconContainer, { backgroundColor: isDark ? "rgba(191, 90, 242, 0.15)" : Colors.lilac[100], borderColor: isDark ? themeColors.border.light : "#fff" }]}
          >
            <MaterialCommunityIcons
              name={config.icon as any}
              size={42}
              color={accentColor}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).springify()}
            style={[styles.title, { color: themeColors.text.primary }]}
          >
            {config.title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(300).springify()}
            style={[styles.description, { color: themeColors.text.secondary }]}
          >
            {config.description}
          </Animated.Text>

          <View style={styles.buttonContainer}>
            {/* Primary Button */}
            <Animated.View
              entering={FadeInUp.delay(500).springify()}
              style={{ width: "100%" }}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: primaryColor }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onAction?.() || onClose();
                }}
                activeOpacity={0.9}
              >
                <Text style={styles.buttonText}>{config.buttonText}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Secondary Button - Only if defined */}
            {config.secondaryButtonText && (
              <Animated.View
                entering={FadeInUp.delay(600).springify()}
                style={{ width: "100%", marginTop: 12 }}
              >
                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onSecondaryAction?.();
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.secondaryButtonText, { color: primaryColor }]}>
                    {config.secondaryButtonText}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  absolute: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 32,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 4,
    shadowColor: Colors.lilac[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  button: {
    paddingVertical: 18,
    width: "100%",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
    paddingVertical: 14,
    marginTop: 4,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

