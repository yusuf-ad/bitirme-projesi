import AntDesign from "@expo/vector-icons/build/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SecondaryActionButton } from "./secondary-action-button";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isExpanded = useSharedValue(false);

  const handleMainButtonPress = () => {
    isExpanded.value = !isExpanded.value;
  };

  const plusIconStyle = useAnimatedStyle(() => {
    const rotateValue = isExpanded.value ? "45deg" : "0deg";

    return {
      transform: [{ rotate: withTiming(rotateValue) }],
    };
  });

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

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          // Get icon name based on route
          let iconName: string = "circle";
          if (route.name === "index") iconName = "home";
          else if (route.name === "meal-plan") iconName = "calendar";
          else if (route.name === "groceries") iconName = "shopping-cart";
          else if (route.name === "(profile)") iconName = "user";

          return (
            <AnimatedPressable
              layout={LinearTransition.springify().mass(0.5)}
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive,
              ]}
            >
              <FontAwesome
                name={iconName as any}
                size={20}
                color={isFocused ? "#FFFFFF" : "#737780"}
              />
              {isFocused && (
                <Animated.Text
                  entering={FadeIn.duration(400)}
                  style={styles.tabLabel}
                >
                  {label}
                </Animated.Text>
              )}
            </AnimatedPressable>
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
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 120,
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
