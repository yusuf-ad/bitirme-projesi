import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="account" options={{ headerShown: false }} />
      <Stack.Screen name="allergies-diet" options={{ headerShown: false }} />
      <Stack.Screen name="cooking-skill" options={{ headerShown: false }} />
      <Stack.Screen name="goals-metrics" options={{ headerShown: false }} />
      <Stack.Screen name="meal-times" options={{ headerShown: false }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="preferences" options={{ headerShown: false }} />
      <Stack.Screen name="privacy" options={{ headerShown: false }} />
      <Stack.Screen name="support-feedback" options={{ headerShown: false }} />
      <Stack.Screen name="taste-preferences" options={{ headerShown: false }} />
    </Stack>
  );
}
