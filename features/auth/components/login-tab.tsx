import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export function LoginTab() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { dismissAll } = useBottomSheetModal();

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
  }

  function handleForgotPasswordPress() {
    // Close the bottom sheet with a short animation, then navigate
    dismissAll();
    setTimeout(() => {
      router.push("/(onboarding)/forgot-password");
    }, 220);
  }
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
          value={email}
          onChangeText={setEmail}
        />
        <CustomTextInput
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          value={password}
          onChangeText={setPassword}
        />

        <Pressable onPress={handleForgotPasswordPress}>
          <Text style={styles.forgotPasswordText}>Forget password?</Text>
        </Pressable>
      </View>

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
    backgroundColor: Colors.gray[200],
    width: "50%",
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
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[800],
    alignSelf: "flex-end",
  },
});
