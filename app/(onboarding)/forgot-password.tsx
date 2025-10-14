import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { Link, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();

  function handleSubmit() {
    // TODO: integrate with API
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.title}>Forget Password</Text>
          <Text style={styles.subtitle}>Enter your registered email below</Text>

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
            <Link href="/(onboarding)" style={styles.signInLink}>
              Sign in
            </Link>
          </Text>
        </View>

        <CustomButton
          containerStyle={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitText}>Submit</Text>
        </CustomButton>
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
});
