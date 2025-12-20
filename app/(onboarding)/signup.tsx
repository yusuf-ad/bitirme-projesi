import { SignupTab } from "@/features/auth/components/signup-tab";
import { StyleSheet, View } from "react-native";

export default function SignupScreen() {
  return (
    <View style={styles.container}>
      <SignupTab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
