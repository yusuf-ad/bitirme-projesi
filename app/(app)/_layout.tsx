import AntDesign from "@expo/vector-icons/build/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { bottom: insets.bottom }]}>
      <StatusBar style="dark" />
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
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 120,
          backgroundColor: "#7849B6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AntDesign name="plus" size={24} color="#FFFFFF" />
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
    gap: 8,
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
