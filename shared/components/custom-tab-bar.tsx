import { useTabTransitionStore } from "@/lib/stores/tab-transition-store";
import { Octicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/build/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  LinearTransition,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SecondaryActionButton } from "./secondary-action-button";

const SWIPE_THRESHOLD = 70;
const DRAG_SENSITIVITY = 0.6;
const SWIPE_COOLDOWN_MS = 220;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// TabItem Component with Gesture Handler
interface TabItemProps {
  route: any;
  isFocused: boolean;
  label: string;
  options: any;
  onPress: () => void;
  onSwipeChange: (direction: number) => void; // Sadece direction - her zaman mevcut aktif tab'dan hesaplanır
}

function TabItem({
  route,
  isFocused,
  label,
  options,
  onPress,
  onSwipeChange,
}: TabItemProps) {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const isLongPressing = useSharedValue(false);
  const glowOpacity = useSharedValue(0);
  const checkpoint = useSharedValue(0); // Her geçişte referans noktası
  const setScrubbing = useTabTransitionStore((state) => state.setScrubbing);
  const isScrubbing = useTabTransitionStore((state) => state.isScrubbing);

  const handleScrubStart = useCallback(() => {
    setScrubbing(true);
  }, [setScrubbing]);

  const handleScrubEnd = useCallback(() => {
    setScrubbing(false);
  }, [setScrubbing]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    if (isScrubbing && !isLongPressing.value) {
      scale.value = withSpring(1.06, {
        damping: 15,
        stiffness: 250,
      });
      glowOpacity.value = withTiming(0.7, { duration: 100 });
      return;
    }

    if (!isScrubbing && !isLongPressing.value) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      glowOpacity.value = withTiming(0, { duration: 100 });
    }
  }, [glowOpacity, isFocused, isLongPressing, isScrubbing, scale]);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const triggerMediumHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const triggerSuccessHaptic = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Pan Gesture - Çok hızlı, düşük threshold ile sürekli geçiş
  const panGesture = Gesture.Pan()
    .activeOffsetX([-3, 3])
    .failOffsetY([-20, 20])
    .onBegin(() => {
      "worklet";
      if (!isFocused) {
        return;
      }
      isLongPressing.value = true;
      checkpoint.value = 0;
      scale.value = withSpring(1.06, {
        damping: 15,
        stiffness: 250,
      });
      glowOpacity.value = withTiming(0.7, { duration: 100 });
      runOnJS(handleScrubStart)();
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      "worklet";
      if (isLongPressing.value) {
        // Sürekli akıcı hareket - yüksek multiplier
        const relativeX = event.translationX - checkpoint.value;
        translateX.value = relativeX * DRAG_SENSITIVITY;

        // Çok düşük threshold - hızlı geçiş için
        if (relativeX > SWIPE_THRESHOLD) {
          // Sağa geçiş
          checkpoint.value = event.translationX;
          translateX.value = 0;
          runOnJS(onSwipeChange)(1);
          runOnJS(triggerHaptic)(); // Daha hafif feedback
        } else if (relativeX < -SWIPE_THRESHOLD) {
          // Sola geçiş
          checkpoint.value = event.translationX;
          translateX.value = 0;
          runOnJS(onSwipeChange)(-1);
          runOnJS(triggerHaptic)(); // Daha hafif feedback
        }
      }
    })
    .onEnd(() => {
      "worklet";
      if (isLongPressing.value) {
        checkpoint.value = 0;
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 300,
        });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 200,
        });
        glowOpacity.value = withTiming(0, { duration: 100 });
        isLongPressing.value = false;
        runOnJS(handleScrubEnd)();
      }
    })
    .onFinalize(() => {
      "worklet";
      if (isLongPressing.value) {
        checkpoint.value = 0;
        translateX.value = withSpring(0);
        scale.value = withSpring(1);
        glowOpacity.value = withTiming(0, { duration: 100 });
        isLongPressing.value = false;
        runOnJS(handleScrubEnd)();
      }
    });

  // Tap Gesture - Normal tap (kaydırma yoksa)
  const tapGesture = Gesture.Tap()
    .maxDuration(200)
    .onStart(() => {
      "worklet";
      scale.value = withTiming(0.95, { duration: 80 });
    })
    .onEnd(() => {
      "worklet";
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      runOnJS(onPress)();
      runOnJS(triggerHaptic)();
    });

  // Compose gestures - Pan veya Tap
  const composedGestures = Gesture.Exclusive(panGesture, tapGesture);

  const animatedStyle = useAnimatedStyle(() => {
    // Sadece aktif tab animasyon alsın, diğerleri sabit kalsın
    if (!isFocused) {
      return {
        transform: [{ scale: 1 }, { translateX: 0 }],
        opacity: 1,
      };
    }

    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, 80],
      [1, 0.6],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale: scale.value }, { translateX: translateX.value }],
      opacity: isLongPressing.value ? opacity : 1,
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      opacity: glowOpacity.value,
    };
  });

  return (
    <GestureDetector gesture={composedGestures}>
      <Animated.View style={[styles.tabItemContainer]}>
        {/* Glow Effect */}
        {isFocused && <Animated.View style={[styles.glowEffect, glowStyle]} />}
        <AnimatedPressable
          layout={LinearTransition.springify().mass(0.5)}
          key={route.key}
          accessibilityRole="button"
          accessibilityState={isFocused ? { selected: true } : {}}
          accessibilityLabel={options.tabBarAccessibilityLabel}
          style={[
            styles.tabItem,
            isFocused ? styles.tabItemActive : styles.tabItemInactive,
            animatedStyle,
          ]}
        >
          {route.name === "index" && (
            <Octicons
              name="home-fill"
              size={18}
              color={isFocused ? "#FFFFFF" : "#737780"}
            />
          )}
          {route.name === "recipes" && (
            <MaterialCommunityIcons
              name="chef-hat"
              size={20}
              color={isFocused ? "#FFFFFF" : "#737780"}
            />
          )}
          {route.name === "pantry" && (
            <MaterialCommunityIcons
              name="fridge"
              size={20}
              color={isFocused ? "#FFFFFF" : "#737780"}
            />
          )}
          {route.name === "(profile)" && (
            <FontAwesome
              name="user"
              size={20}
              color={isFocused ? "#FFFFFF" : "#737780"}
            />
          )}

          {isFocused && (
            <Animated.Text
              entering={FadeIn.duration(400)}
              style={styles.tabLabel}
            >
              {label}
            </Animated.Text>
          )}
        </AnimatedPressable>
      </Animated.View>
    </GestureDetector>
  );
}

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isExpanded = useSharedValue(false);
  const swipeCooldownRef = useRef(0);

  const handleMainButtonPress = () => {
    isExpanded.value = !isExpanded.value;
  };

  const plusIconStyle = useAnimatedStyle(() => {
    const rotateValue = isExpanded.value ? "45deg" : "0deg";

    return {
      transform: [{ rotate: withTiming(rotateValue) }],
    };
  });

  const handleSwipeChange = useCallback(
    (direction: number) => {
      const now = Date.now();
      if (now - swipeCooldownRef.current < SWIPE_COOLDOWN_MS) {
        return;
      }
      swipeCooldownRef.current = now;

      const navState = navigation.getState();
      const routes = navState?.routes ?? state.routes;
      const currentIndex =
        typeof navState?.index === "number" ? navState.index : state.index;
      const newIndex = currentIndex + direction;

      if (newIndex < 0 || newIndex >= routes.length) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        return;
      }

      const newRoute = routes[newIndex];
      navigation.navigate(newRoute.name);
    },
    [navigation, state.index, state.routes]
  );

  return (
    <View style={[styles.tabBar, { bottom: insets.bottom }]}>
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.title || route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              isFocused={isFocused}
              label={label}
              options={options}
              onPress={onPress}
              onSwipeChange={handleSwipeChange}
            />
          );
        })}
      </View>
      <View style={styles.fabContainer}>
        {/* Secondary Action Buttons */}
        <SecondaryActionButton
          isExpanded={isExpanded}
          index={3}
          iconName="camera"
          onPress={() => console.log("Camera pressed")}
        />
        <SecondaryActionButton
          isExpanded={isExpanded}
          index={2}
          iconName="cutlery"
          onPress={() => console.log("Recipe pressed")}
        />
        <SecondaryActionButton
          isExpanded={isExpanded}
          index={1}
          iconName="book"
          onPress={() => console.log("Plan pressed")}
        />
        {/* Main FAB Button */}
        <AnimatedPressable
          onPress={handleMainButtonPress}
          style={styles.mainButton}
        >
          <Animated.View style={plusIconStyle}>
            <AntDesign name="plus" size={24} color="#FFFFFF" />
          </Animated.View>
        </AnimatedPressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: "-50%" }],
  },
  tabBarInner: {
    borderWidth: 1,
    borderColor: "#7849B6",
    padding: 4,
    borderRadius: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "black",
    overflow: "visible",
  },
  tabItemContainer: {
    position: "relative",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 120,
    zIndex: 1,
  },
  tabItemActive: {
    backgroundColor: "#7849B6",
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  tabItemInactive: {
    paddingHorizontal: 25,
  },
  glowEffect: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 120,
    backgroundColor: "#7849B6",
    shadowColor: "#7849B6",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 0,
  },
  tabLabel: {
    color: "#FFFFFF",
    fontFamily: "Poppins",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  fabContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  mainButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#7849B6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
