import AntDesign from "@expo/vector-icons/build/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const OFFSET = 60;
const SPRING_CONFIG = {
  duration: 1200,
  overshootClamping: true,
  dampingRatio: 0.8,
};

interface FloatingActionButtonProps {
  isExpanded: SharedValue<boolean>;
  index: number;
  iconName: string;
  onPress?: () => void;
}

function SecondaryActionButton({
  isExpanded,
  index,
  iconName,
  onPress,
}: FloatingActionButtonProps) {
  const animatedStyles = useAnimatedStyle(() => {
    const moveValue = isExpanded.value ? OFFSET * index : 0;
    const translateValue = withSpring(-moveValue, SPRING_CONFIG);
    const delay = index * 100;

    const scaleValue = isExpanded.value ? 1 : 0;

    return {
      transform: [
        { translateY: translateValue },
        {
          scale: withDelay(delay, withTiming(scaleValue)),
        },
      ],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[animatedStyles, styles.secondaryButton]}
    >
      <FontAwesome name={iconName as any} size={20} color="#FFFFFF" />
    </AnimatedPressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isExpanded = useSharedValue(false);

  const handleMainButtonPress = () => {
    isExpanded.value = !isExpanded.value;
  };

  const plusIconStyle = useAnimatedStyle(() => {
    const moveValue = interpolate(Number(isExpanded.value), [0, 1], [0, 2]);
    const translateValue = withTiming(moveValue);
    const rotateValue = isExpanded.value ? "45deg" : "0deg";

    return {
      transform: [
        { translateX: translateValue },
        { rotate: withTiming(rotateValue) },
      ],
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
          else if (route.name === "profile") iconName = "user";

          return (
            <Pressable
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
              {isFocused && <Text style={styles.tabLabel}>{label}</Text>}
            </Pressable>
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

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="meal-plan"
        options={{
          title: "Meal Plan",
        }}
      />
      <Tabs.Screen
        name="groceries"
        options={{
          title: "Groceries",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
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
  secondaryButton: {
    position: "absolute",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#9B6DD6",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
