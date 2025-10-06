import CustomButton from "@/shared/components/custom-button";
import AntDesign from "@expo/vector-icons/AntDesign";
import { StyleSheet, Text, View } from "react-native";

export function LoginTab() {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <CustomButton containerStyle={styles.loginButton}>
          <Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
        </CustomButton>

        <View style={styles.divider} />
        <CustomButton containerStyle={styles.googleButton}>
          <AntDesign name="google" size={24} color="black" />
          <Text style={[styles.buttonText, styles.googleButtonText]}>
            Login with Google
          </Text>
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#D2D4D8",
    width: "50%",
  },
  buttonText: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
  },
  loginButton: {
    backgroundColor: "#7849B6",
  },
  loginButtonText: {
    color: "#FFFFFF",
  },
  googleButton: {
    backgroundColor: "#ECEDEE",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  googleButtonText: {
    color: "#000000",
  },
});
