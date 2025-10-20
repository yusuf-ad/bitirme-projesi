import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Alert, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { z } from "zod";

const SignupFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

export function SignupTab() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.output<typeof SignupFormSchema>>({
    resolver: zodResolver(SignupFormSchema),
  });

  const router = useRouter();
  const { saveAllOnboardingDataToSupabase } = useOnboarding();

  async function handleSignup(formData: z.output<typeof SignupFormSchema>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            fullName: formData.fullName.trim(),
          },
        },
      });

      if (error) {
        Alert.alert("Error signing up", error.message);
        return;
      }

      if (!data.user) {
        Alert.alert("Error", "No user data received");
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
      <Text style={styles.title}>Create your account</Text>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <CustomTextInput
          control={control}
          name="fullName"
          label="Full name"
          placeholder="Enter your full name"
          autoCapitalize="words"
          autoCorrect={false}
          containerStyle={styles.inputContainerStyle}
          labelStyle={styles.labelStyle}
          error={errors.fullName?.message}
        />
        <CustomTextInput
          control={control}
          name="email"
          label="Email address"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.inputContainerStyle}
          labelStyle={styles.labelStyle}
          error={errors.email?.message}
        />
        <CustomTextInput
          control={control}
          name="password"
          label="Password"
          placeholder="Enter your password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          containerStyle={styles.inputContainerStyle}
          labelStyle={styles.labelStyle}
          error={errors.password?.message}
        />
      </View>

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        <CustomButton
          containerStyle={styles.signupButton}
          onPress={handleSubmit(handleSignup)}
          disabled={isSubmitting}
        >
          <Text style={[styles.buttonText, styles.signupButtonText]}>
            {isSubmitting ? "Creating account..." : "Sign up"}
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
    paddingVertical: 0,
    paddingHorizontal: 0,
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
