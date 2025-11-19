import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { CustomTabBar } from "../../shared/components/custom-tab-bar";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: "shift",
        // Smooth page transitions
        animationDuration: 300,
        ...(Platform.OS === "ios" && {
          animation: "shift",
        }),
        ...(Platform.OS === "android" && {
          animation: "shift",
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
        }}
      />
      <Tabs.Screen
        name="pantry"
        options={{
          title: "Pantry",
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
