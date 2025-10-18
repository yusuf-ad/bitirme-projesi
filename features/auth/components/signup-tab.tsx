import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export function SignupTab() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { saveAllOnboardingDataToSupabase } = useOnboarding();

  async function handleSignup() {
    if (
      fullName.trim() === "" ||
      email.trim() === "" ||
      password.trim() === ""
    ) {
      Alert.alert("Please fill in all fields");
      return;
    }

    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName: fullName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert("Error signing up", error.message);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        Alert.alert("Error", "No user data received");
        setIsLoading(false);
        return;
      }

      // Wait a bit for session to be fully established
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Save onboarding data from AsyncStorage to Supabase
      try {
        await saveAllOnboardingDataToSupabase(data.user.id);
      } catch (saveError: any) {
        console.error("Error saving onboarding data:", saveError);
        Alert.alert(
          "Warning",
          "Account created but some profile data could not be saved. You can update it later in settings."
        );
      }

      Alert.alert("Sign up successful", "Your profile has been created!");

      // Navigate to main app
      router.replace("/(app)");
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert(
        "Error",
        error?.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackPress() {
    router.back();
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
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <MaterialCommunityIcons
            name="keyboard-backspace"
            size={24}
            color={Colors.lilac[900]}
          />
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>Create your account</Text>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <CustomTextInput
          label="Full name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          autoCorrect={false}
          value={fullName}
          onChangeText={setFullName}
          containerStyle={styles.inputContainerStyle}
          labelStyle={styles.labelStyle}
        />
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
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyle={styles.signupButton}
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, styles.signupButtonText]}>
            {isLoading ? "Creating account..." : "Sign up"}
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
  },
  title: {
    fontSize: 28,
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
  buttonContainer: {
    gap: 16,
    alignItems: "center",
    marginBottom: 32,
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
  loginContainer: {
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.gray[300],
    paddingTop: 24,
  },
  loginText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    textDecorationLine: "underline",
  },
});
