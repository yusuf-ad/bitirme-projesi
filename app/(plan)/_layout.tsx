import { Stack } from "expo-router";

export default function MealPlanLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="create"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="preview"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
