import { Octicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FabButton } from "./fab-button";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        { bottom: insets.bottom + (Platform.OS === "ios" ? 0 : 12) },
      ]}
    >
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
          else if (route.name === "recipes") iconName = "calendar";
          else if (route.name === "pantry") iconName = "fridge";
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
                  name={iconName as any}
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
          );
        })}
      </View>
      <FabButton currentRouteName={state.routes[state.index].name} />
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
    zIndex: 100,
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
});
