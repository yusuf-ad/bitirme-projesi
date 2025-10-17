import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export function LoginTab() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function handleLogin() {
    if (email.trim() === "" || password.trim() === "") {
      Alert.alert("Please fill in all fields");
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log(data);

    if (error) {
      Alert.alert("Error logging in", error.message);
      return;
    }

    Alert.alert("Login successful");
    router.push("/(app)");
  }

  function handleForgotPasswordPress() {
    router.push("/(onboarding)/forgot-password");
  }

  function handleBackPress() {
    router.back();
  }

  function handleSignupPress() {
    router.push("/(onboarding)/flow");
  }

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <View style={styles.headerContainer}>
        <CustomButton
          onPress={handleBackPress}
          containerStyle={styles.backButton}
        >
          <MaterialCommunityIcons
            name="keyboard-backspace"
            size={24}
            color={Colors.lilac[900]}
          />
        </CustomButton>
      </View>

      {/* Title */}
      <Text style={styles.title}>Login to your account</Text>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <CustomTextInput
          label="Email address"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.inputContainerStyle}
          labelStyle={styles.labelStyle}
        />
        <CustomTextInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
          containerStyle={styles.inputContainerStyle}
          labelStyle={styles.labelStyle}
        />

        <Pressable
          onPress={handleForgotPasswordPress}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forget password?</Text>
        </Pressable>
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <CustomButton containerStyle={styles.loginButton} onPress={handleLogin}>
          <Text style={[styles.buttonText, styles.loginButtonText]}>Login</Text>
        </CustomButton>

        <View style={styles.divider} />
        <CustomButton containerStyle={styles.googleButton}>
          <Image
            source={require("@/assets/icons/google-icon.svg")}
            style={styles.googleIcon}
          />
          <Text style={[styles.buttonText, styles.googleButtonText]}>
            Login with Google
          </Text>
        </CustomButton>
      </View>

      {/* Signup Link */}
      <View style={styles.signupContainer}>
        <Pressable onPress={handleSignupPress}>
          <Text style={styles.signupText}>I don&apos;t have an account</Text>
        </Pressable>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.lilac[100],
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.lilac[900],
    marginBottom: 32,
  },
  formContainer: {
    gap: 20,
    marginBottom: 32,
  },
  inputContainerStyle: {
    marginBottom: 0,
  },
  labelStyle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[400],
    paddingLeft: 0,
    marginBottom: 8,
    lineHeight: 14,
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[900],
  },
  buttonContainer: {
    gap: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  buttonText: {
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
  },
  loginButton: {
    backgroundColor: Colors.lilac[900],
  },
  loginButtonText: {
    color: Colors.text.inverse,
  },
  divider: {
    height: 0.5,
    backgroundColor: Colors.gray[200],
    width: "50%",
  },
  googleButton: {
    backgroundColor: Colors.gray[100],
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  googleButtonText: {
    color: Colors.text.primary,
  },
  googleIcon: {
    width: 24,
    height: 24,
  },
  signupContainer: {
    alignItems: "center",
    paddingTop: 24,
  },
  signupText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    textDecorationLine: "underline",
  },
});
