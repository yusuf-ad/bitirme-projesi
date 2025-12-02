import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAttachMenu } from "./attach-menu-context";
import { AttachMenuRow } from "./attach-menu-row";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ANIMATION_DURATION = 200;

interface MenuItem {
  icon: React.ComponentProps<typeof AttachMenuRow>["icon"];
  label: string;
  onPress: () => void;
}

interface MenuConfig {
  title: string;
  items: MenuItem[];
}

export function AttachMenuOverlay() {
  const { isOpen, closeMenu, currentRoute } = useAttachMenu();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const progress = useSharedValue(0);
  const pointerEvents = useSharedValue<"auto" | "none">("none");

  useEffect(() => {
    if (isOpen) {
      pointerEvents.value = "auto";
      progress.value = withTiming(1, { duration: ANIMATION_DURATION });
    } else {
      progress.value = withTiming(0, { duration: ANIMATION_DURATION });
      // Delay pointer events change to allow close animation
      setTimeout(() => {
        pointerEvents.value = "none";
      }, ANIMATION_DURATION);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleCameraPress = () => {
    closeMenu();
    setTimeout(() => {
      router.push("/(add)/camera");
    }, ANIMATION_DURATION);
  };

  const handleCreateMealPlan = () => {
    closeMenu();
    setTimeout(() => {
      router.push("/(plan)/create");
    }, ANIMATION_DURATION);
  };

  const handleAIPlan = () => {
    closeMenu();
    setTimeout(() => {
      router.push("/(plan)/ai-plan");
    }, ANIMATION_DURATION);
  };

  const handleAddRecipe = () => {
    closeMenu();
    // TODO: Navigate to add recipe screen when available
    console.log("Add recipe");
  };

  const handleSearchRecipe = () => {
    closeMenu();
    setTimeout(() => {
      router.push("/(app)/recipes");
    }, ANIMATION_DURATION);
  };

  const getMenuConfig = (): MenuConfig => {
    switch (currentRoute) {
      case "index":
        return {
          title: "Add to Plan",
          items: [
            {
              icon: "calendar-outline",
              label: "Create Meal Plan",
              onPress: handleCreateMealPlan,
            },
            {
              icon: "sparkles-outline",
              label: "AI Meal Plan",
              onPress: handleAIPlan,
            },
          ],
        };
      case "recipes":
        return {
          title: "Add Recipe",
          items: [
            {
              icon: "add-circle-outline",
              label: "Add New Recipe",
              onPress: handleAddRecipe,
            },
            {
              icon: "search-outline",
              label: "Search Recipes",
              onPress: handleSearchRecipe,
            },
          ],
        };
      case "pantry":
        return {
          title: "Add to Pantry",
          items: [
            {
              icon: "camera-outline",
              label: "Camera",
              onPress: handleCameraPress,
            },
          ],
        };
      case "(profile)":
        return {
          title: "Settings",
          items: [
            {
              icon: "settings-outline",
              label: "Settings",
              onPress: () => {
                closeMenu();
                console.log("Settings");
              },
            },
          ],
        };
      default:
        return {
          title: "Actions",
          items: [],
        };
    }
  };

  const menuConfig = useMemo(() => getMenuConfig(), [currentRoute]);

  // Overlay background animation
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      pointerEvents: pointerEvents.value,
    };
  });

  // Header micro-interaction
  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      progress.value,
      [0, 1],
      [0, 1],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      progress.value,
      [0, 1],
      [10, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  // Menu container animation - slides up from bottom
  const menuContainerStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      progress.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP
    );

    const scale = interpolate(
      progress.value,
      [0, 1],
      [0.98, 1],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  if (!isOpen && progress.value === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, overlayStyle]}>
      {Platform.OS === "ios" ? (
        <AnimatedBlurView
          intensity={75}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.androidOverlay]} />
      )}

      {/* Pressable overlay to close menu */}
      <AnimatedPressable style={StyleSheet.absoluteFill} onPress={closeMenu} />

      {/* Menu Items at bottom */}
      <Animated.View
        style={[
          styles.menuContainer,
          { paddingBottom: insets.bottom + 100 },
          menuContainerStyle,
        ]}
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <Animated.Text style={styles.headerTitle}>
            {menuConfig.title}
          </Animated.Text>
        </Animated.View>

        {menuConfig.items.map((item, index) => (
          <AttachMenuRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            onPress={item.onPress}
            index={index}
            progress={progress}
          />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    justifyContent: "flex-end",
  },
  androidOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.85)",
  },
  header: {
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
    fontFamily: "Poppins",
    letterSpacing: 0.5,
  },
  menuContainer: {
    paddingHorizontal: 4,
  },
});
