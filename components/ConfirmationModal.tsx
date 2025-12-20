import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from "react-native-reanimated";

export interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: "default" | "destructive";
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmStyle = "default",
  icon = "alert-circle",
  iconColor,
}: ConfirmationModalProps) {
  useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, [visible]);

  if (!visible) return null;

  const isDestructive = confirmStyle === "destructive";
  const computedIconColor = iconColor || (isDestructive ? Colors.semantic.error.main : Colors.lilac[600]);
  const confirmBgColor = isDestructive ? Colors.semantic.error.main : Colors.lilac[900];

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.container}>
        {/* Backdrop */}
        <BlurView intensity={30} style={styles.absolute} tint="dark" />
        <TouchableOpacity 
          style={styles.backdropOverlay} 
          activeOpacity={1} 
          onPress={onClose}
        />

        {/* Modal Content */}
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          style={styles.modalCard}
        >
          <Animated.View
            entering={ZoomIn.delay(50).springify()}
            style={[
              styles.iconContainer,
              isDestructive && styles.iconContainerDestructive,
            ]}
          >
            <Ionicons
              name={icon}
              size={36}
              color={computedIconColor}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(100).springify()}
            style={styles.title}
          >
            {title}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(150).springify()}
            style={styles.description}
          >
            {description}
          </Animated.Text>

          <View style={styles.buttonContainer}>
            {/* Cancel Button */}
            <Animated.View
              entering={FadeInUp.delay(250).springify()}
              style={styles.buttonWrapper}
            >
              <CustomButton
                containerStyle={styles.cancelButton}
                onPress={() => {
                  Haptics.selectionAsync();
                  onClose();
                }}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </CustomButton>
            </Animated.View>

            {/* Confirm Button */}
            <Animated.View
              entering={FadeInUp.delay(300).springify()}
              style={styles.buttonWrapper}
            >
              <CustomButton
                containerStyle={[
                  styles.confirmButton,
                  { backgroundColor: confirmBgColor },
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  onConfirm();
                }}
              >
                <Text style={styles.confirmButtonText}>{confirmText}</Text>
              </CustomButton>
            </Animated.View>
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
    maxWidth: 320,
    backgroundColor: Colors.background?.surface || "#fff",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainerDestructive: {
    backgroundColor: Colors.semantic.error.light || "#FFEBEE",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 15,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: Colors.gray[100],
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
