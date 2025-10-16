import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { Image } from "expo-image";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export function SignupTab() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    if (
      fullName.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      Alert.alert("Please fill in all fields");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName: fullName.trim(),
        },
      },
    });

    console.log(data);

    if (error) {
      Alert.alert("Error signing up", error.message);
      return;
    }

    Alert.alert("Sign up successful");
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
          label="Full name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          autoCorrect={false}
          value={fullName}
          onChangeText={setFullName}
        />
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
      </View>

      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyle={styles.signupButton}
          onPress={handleSignup}
        >
          <Text style={[styles.buttonText, styles.signupButtonText]}>
            Sign up
          </Text>
        </CustomButton>

        <View style={styles.divider} />
        <CustomButton containerStyle={styles.googleButton}>
          <Image
            source={require("@/assets/icons/google-icon.svg")}
            style={styles.googleIcon}
          />
          <Text style={[styles.buttonText, styles.googleButtonText]}>
            Sign up with Google
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
  signupButton: {
    backgroundColor: Colors.lilac[900],
  },
  signupButtonText: {
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
});
