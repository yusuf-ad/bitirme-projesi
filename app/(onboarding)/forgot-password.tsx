import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { z } from "zod";

const ForgotPasswordFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.output<typeof ForgotPasswordFormSchema>>({
    resolver: zodResolver(ForgotPasswordFormSchema),
  });

  async function handleFormSubmit(
    formData: z.output<typeof ForgotPasswordFormSchema>
  ) {
    console.log(formData);
    // TODO: integrate with API
    // Simulate API latency; replace with real request
    setTimeout(() => {
      setIsSuccess(true);
    }, 900);
  }

  function handleBackPress() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {isSuccess ? (
          <>
            <View style={styles.successWrapper}>
              <View style={styles.successIllustration}>
                <Svg width={200} height={200} viewBox="0 0 200 200">
                  <Defs>
                    <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                      <Stop offset="0%" stopColor="#7849B6" stopOpacity="0.7" />
                      <Stop
                        offset="60%"
                        stopColor="#7849B6"
                        stopOpacity="0.3"
                      />
                      <Stop offset="100%" stopColor="#7849B6" stopOpacity="0" />
                    </RadialGradient>
                  </Defs>
                  <Circle cx={100} cy={100} r={90} fill="url(#glow)" />
                  <Circle cx={100} cy={100} r={60} fill="#7E3AF2" />
                  <Path
                    d="M78 102 L95 119 L125 87"
                    stroke="#FFFFFF"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              </View>
              <Text style={styles.successTitle}>Check your email</Text>
              <Text style={styles.successSubtitle}>
                We’ve sent a password reset link to your email address.
              </Text>
            </View>
            <CustomButton
              containerStyle={styles.primaryButton}
              onPress={() =>
                router.replace({
                  pathname: "/(onboarding)/login",
                })
              }
            >
              <Text style={styles.submitText}>Back to Sign In</Text>
            </CustomButton>
          </>
        ) : (
          <>
            <View style={styles.topSection}>
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
              <Text style={styles.title}>Forget Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered email below
              </Text>

              <View style={styles.form}>
                <CustomTextInput
                  control={control}
                  name="email"
                  label="Email address"
                  labelStyle={styles.inputLabel}
                  placeholder="Eg namaemail@emailkamu.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  error={errors.email?.message}
                />
              </View>

              <Text style={styles.rememberText}>
                Remember the password?{" "}
                <Link
                  href={{
                    pathname: "/(onboarding)/login",
                  }}
                  style={styles.signInLink}
                >
                  Sign in
                </Link>
              </Text>

              {/* TEMP: test navigation to reset-password screen */}
              <CustomButton
                containerStyle={styles.testButton}
                onPress={() =>
                  router.push({
                    pathname: "/(onboarding)/reset-password",
                    params: { token: "demo" },
                  })
                }
                accessibilityLabel="Go to reset password test"
              >
                <Text style={styles.testButtonText}>Test Reset Page</Text>
              </CustomButton>
            </View>

            <CustomButton
              containerStyle={[
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Submit forgot password form"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitText}>Submit</Text>
              )}
            </CustomButton>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 117,
    paddingBottom: 32,
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    gap: 24,
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
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#9CA3AF",
    marginTop: 4,
  },
  form: {
    marginTop: 56,
  },
  inputLabel: {
    color: "#111827",
    fontWeight: "600",
    lineHeight: 36,
  },
  submitButton: {
    backgroundColor: "#7E3AF2",
    alignSelf: "stretch",
    borderRadius: 16,
  },
  primaryButton: {
    backgroundColor: Colors.lilac[900],
    alignSelf: "stretch",
    borderRadius: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  rememberText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
  },
  signInLink: {
    color: "#7E3AF2",
    fontWeight: "700",
  },
  testButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginTop: 12,
  },
  testButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  successWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 24,
  },
  successIllustration: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 24,
  },
});
