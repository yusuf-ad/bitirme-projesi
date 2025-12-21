import { getThemeColors } from "@/constants/theme";
import { useTheme } from "@/providers/theme-provider";
import { Tabs } from "expo-router";
import { CustomTabBar } from "../../shared/components/custom-tab-bar";

export default function TabLayout() {
  const { isDark } = useTheme();
  const Colors = getThemeColors(isDark);

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
