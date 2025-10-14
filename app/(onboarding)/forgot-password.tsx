import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  function handleSubmit() {
    // TODO: integrate with API
    if (isSubmitting) return;
    setIsSubmitting(true);
    // Simulate API latency; replace with real request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 900);
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
                  pathname: "/(onboarding)",
                  params: { openAuth: "1" },
                })
              }
            >
              <Text style={styles.submitText}>Back to Sign In</Text>
            </CustomButton>
          </>
        ) : (
          <>
            <View style={styles.topSection}>
              <Text style={styles.title}>Forget Password</Text>
              <Text style={styles.subtitle}>
                Enter your registered email below
              </Text>

              <View style={styles.form}>
                <CustomTextInput
                  label="Email address"
                  labelStyle={styles.inputLabel}
                  placeholder="Eg namaemail@emailkamu.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <Text style={styles.rememberText}>
                Remember the password?{" "}
                <Link
                  href={{
                    pathname: "/(onboarding)",
                    params: { openAuth: "1" },
                  }}
                  style={styles.signInLink}
                >
                  Sign in
                </Link>
              </Text>
            </View>

            <CustomButton
              containerStyle={[
                styles.primaryButton,
                isSubmitting && styles.primaryButtonDisabled,
              ]}
              onPress={handleSubmit}
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
    backgroundColor: "#7E3AF2",
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
