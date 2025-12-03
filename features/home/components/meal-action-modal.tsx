import { Colors } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

interface MealActionModalProps {
  mealType: string;
  recipeName: string;
  isEaten?: boolean;
  onToggleEaten?: (eaten: boolean) => void;
  onReplace?: () => void;
  onDelete?: () => void;
}

export const MealActionModal = forwardRef<
  BottomSheetModal,
  MealActionModalProps
>(
  (
    {
      mealType,
      recipeName,
      isEaten = false,
      onToggleEaten,
      onReplace,
      onDelete,
    },
    ref
  ) => {
    const [eaten, setEaten] = useState(isEaten);

    // Sync internal state with prop when it changes
    useEffect(() => {
      setEaten(isEaten);
    }, [isEaten]);

    const handleSheetChanges = useCallback((index: number) => {
      console.log("MealActionModal index:", index);
    }, []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
        />
      ),
      []
    );

    const handleToggleEaten = async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const newValue = !eaten;
      setEaten(newValue);
      onToggleEaten?.(newValue);
    };

    const handleReplace = async () => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
      onReplace?.();
      router.push("/(app)/recipes");
    };

    const handleDelete = async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
      onDelete?.();
    };

    const dismiss = () => {
      if (typeof ref !== "function" && ref?.current?.dismiss) {
        ref.current.dismiss();
      }
    };

    return (
      <BottomSheetModal
        ref={ref}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enableOverDrag={false}
        enableDynamicSizing
        handleIndicatorStyle={styles.handleIndicator}
        backgroundStyle={styles.modalBackground}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={styles.header}
          >
            <View style={styles.titleContainer}>
              <View style={styles.titleIconWrapper}>
                <Ionicons
                  name="restaurant"
                  size={20}
                  color={Colors.lilac[600]}
                />
              </View>
              <View style={styles.titleTextContainer}>
                <Text style={styles.title}>{mealType}</Text>
                <Text style={styles.subtitle} numberOfLines={1}>
                  {recipeName}
                </Text>
              </View>
            </View>
            <Pressable
              hitSlop={24}
              onPress={dismiss}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
            >
              <Ionicons name="close" size={20} color={Colors.gray[400]} />
            </Pressable>
          </Animated.View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {/* Toggle Eaten */}
            <Animated.View entering={FadeInUp.delay(150).springify()}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionItem,
                  eaten && styles.actionItemActive,
                  pressed && styles.actionItemPressed,
                ]}
                onPress={handleToggleEaten}
              >
                <View
                  style={[
                    styles.actionIconWrapper,
                    eaten && styles.actionIconWrapperActive,
                  ]}
                >
                  {eaten ? (
                    <LinearGradient
                      colors={[
                        Colors.semantic.success.main,
                        Colors.semantic.success.dark,
                      ]}
                      style={styles.actionIconGradient}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color="white"
                      />
                    </LinearGradient>
                  ) : (
                    <MaterialCommunityIcons
                      name="checkbox-blank-circle-outline"
                      size={24}
                      color={Colors.gray[400]}
                    />
                  )}
                </View>
                <View style={styles.actionTextContainer}>
                  <Text
                    style={[
                      styles.actionTitle,
                      eaten && styles.actionTitleActive,
                    ]}
                  >
                    {eaten ? "Eaten" : "Not eaten"}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {eaten
                      ? "You marked this meal as eaten"
                      : "Mark this meal as eaten"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.toggleSwitch,
                    eaten && styles.toggleSwitchActive,
                  ]}
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      eaten && styles.toggleThumbActive,
                    ]}
                  />
                </View>
              </Pressable>
            </Animated.View>

            {/* Replace */}
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionItem,
                  pressed && styles.actionItemPressed,
                ]}
                onPress={handleReplace}
              >
                <View style={styles.actionIconWrapper}>
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={24}
                    color={Colors.lilac[600]}
                  />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={styles.actionTitle}>Replace</Text>
                  <Text style={styles.actionDescription}>
                    Choose another recipe
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.gray[400]}
                />
              </Pressable>
            </Animated.View>

            {/* Delete */}
            <Animated.View entering={FadeInUp.delay(250).springify()}>
              <Pressable
                style={({ pressed }) => [
                  styles.actionItem,
                  styles.actionItemDanger,
                  pressed && styles.actionItemPressed,
                ]}
                onPress={handleDelete}
              >
                <View
                  style={[
                    styles.actionIconWrapper,
                    styles.actionIconWrapperDanger,
                  ]}
                >
                  <Ionicons
                    name="trash-outline"
                    size={24}
                    color={Colors.semantic.error.main}
                  />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={[styles.actionTitle, styles.actionTitleDanger]}>
                    Delete
                  </Text>
                  <Text style={styles.actionDescription}>
                    Remove this meal from your plan
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

MealActionModal.displayName = "MealActionModal";

const styles = StyleSheet.create({
  handleIndicator: {
    backgroundColor: Colors.gray[300],
    width: 40,
  },
  modalBackground: {
    backgroundColor: Colors.background.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lilac[100],
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  titleIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 18,
    color: Colors.text.primary,
  },
  subtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: Colors.gray[500],
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonPressed: {
    backgroundColor: Colors.gray[200],
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 12,
  },
  actionItemActive: {
    backgroundColor: "rgba(34, 197, 94, 0.08)",
    borderColor: Colors.semantic.success.light,
  },
  actionItemDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.04)",
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  actionItemPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  actionIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconWrapperActive: {
    backgroundColor: "transparent",
  },
  actionIconWrapperDanger: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionIconGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 16,
    color: Colors.text.primary,
  },
  actionTitleActive: {
    color: Colors.semantic.success.dark,
  },
  actionTitleDanger: {
    color: Colors.semantic.error.main,
  },
  actionDescription: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 2,
  },
  toggleSwitch: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray[300],
    padding: 2,
    justifyContent: "center",
  },
  toggleSwitchActive: {
    backgroundColor: Colors.semantic.success.main,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: "flex-end",
  },
});

export default MealActionModal;
