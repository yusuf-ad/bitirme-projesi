import { Tabs } from "expo-router";
import { CustomTabBar } from "../../shared/components/custom-tab-bar";

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
          title: "Recipes",
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
        name="(profile)"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
