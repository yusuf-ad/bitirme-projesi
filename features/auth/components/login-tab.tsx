import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export function LoginTab() {
  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <CustomTextInput
          label="Email address"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <CustomTextInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Pressable>
          <Text style={styles.forgotPasswordText}>Forget password?</Text>
        </Pressable>
      </View>

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
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    height: 540,
    maxHeight: 540,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    gap: 12,
    marginTop: 32,
    marginBottom: 52,
  },
  buttonContainer: {
    gap: 16,
    alignItems: "center",
  },
  divider: {
    height: 0.5,
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
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#875EC5",
    alignSelf: "flex-end",
  },
});
