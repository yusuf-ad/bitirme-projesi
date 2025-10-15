import SignOutButton from "@/features/auth/components/sign-out-button";
import { StyleSheet, Text, View } from "react-native";

export default function ProfileTab() {
  return (
    <View style={styles.container}>
      <Text>Profile Tab</Text>

      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
