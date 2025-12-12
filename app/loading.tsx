import { Colors } from "@/constants/theme";
import { ActivityIndicator, Text, View } from "react-native";

export default function LoadingScreen() {
  // Navigation is handled by Stack.Protected guards in _layout.tsx
  // This screen only shows while auth state is being determined

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors.background.primary,
      }}
    >
      <ActivityIndicator size="large" color={Colors.lilac[900]} />
      <Text style={{ marginTop: 16, color: Colors.text.secondary }}>
        Loading...
      </Text>
    </View>
  );
}
