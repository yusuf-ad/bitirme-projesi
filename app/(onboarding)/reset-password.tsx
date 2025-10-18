import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { z } from "zod";

const ResetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = useMemo(() => {
    const v = (params as any)?.token;
    return Array.isArray(v) ? v[0] : v;
  }, [params]);

  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.output<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  async function handleFormSubmit(
    formData: z.output<typeof ResetPasswordFormSchema>
  ) {
    console.log(formData);
    // TODO: call API with token + new password
    // Simulate API latency; replace with real request
    setTimeout(() => {
      setIsSuccess(true);
    }, 900);
  }

  function handleBackPress() {
    router.back();
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
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
              <Text style={styles.successTitle}>Password changed</Text>
              <Text style={styles.successSubtitle}>
                Your password has been successfully updated.
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
              <Text style={styles.primaryText}>Back to Sign In</Text>
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
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Enter your new password and confirm it below.
              </Text>

              <View style={styles.form}>
                <CustomTextInput
                  control={control}
                  name="password"
                  label="New Password"
                  labelStyle={styles.inputLabel}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.gray[400]}
                  secureTextEntry
                  error={errors.password?.message}
                />
                <View style={{ height: 16 }} />
                <CustomTextInput
                  control={control}
                  name="confirmPassword"
                  label="Confirm Password"
                  labelStyle={styles.inputLabel}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.gray[400]}
                  secureTextEntry
                  error={errors.confirmPassword?.message}
                />
                {!!token && (
                  <Text
                    style={styles.tokenHint}
                    accessibilityHint="reset token"
                  >
                    Token detected
                  </Text>
                )}
              </View>

              <Text style={styles.rememberText}>
                Remember your password?{" "}
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
              containerStyle={styles.primaryButton}
              onPress={handleSubmit(handleFormSubmit)}
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Submit new password"
            >
              {isSubmitting ? (
                <ActivityIndicator color={Colors.text.inverse} />
              ) : (
                <Text style={styles.primaryText}>Submit</Text>
              )}
            </CustomButton>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
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
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray[400],
    marginTop: 4,
  },
  form: {
    marginTop: 56,
  },
  inputLabel: {
    color: Colors.text.primary,
    fontWeight: "600",
    lineHeight: 36,
  },
  primaryButton: {
    backgroundColor: Colors.lilac[900],
    alignSelf: "stretch",
    borderRadius: 16,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.inverse,
  },
  rememberText: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray[500],
  },
  signInLink: {
    color: Colors.lilac[900],
    fontWeight: "700",
  },
  errorText: {
    marginTop: 12,
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "600",
  },
  tokenHint: {
    marginTop: 8,
    color: Colors.gray[400],
    fontSize: 12,
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
    color: Colors.text.primary,
    textAlign: "center",
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.gray[500],
    textAlign: "center",
    marginBottom: 24,
  },
});
