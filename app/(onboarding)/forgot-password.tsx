import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { z } from "zod";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ForgotPasswordFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

// Animated Email Icon Component
function AnimatedEmailIcon({ isSuccess }: { isSuccess: boolean }) {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);

  useEffect(() => {
    // Floating animation
    floatY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Subtle rotation
    rotation.value = withRepeat(
      withSequence(
        withTiming(5, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-5, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id="emailGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#A587D3" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#7849B6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="innerGlow" cx="50%" cy="30%" r="60%">
            <Stop offset="0%" stopColor="#B49CDA" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        {/* Outer glow */}
        <Circle cx={60} cy={60} r={55} fill="url(#emailGlow)" />
        {/* Main circle */}
        <Circle cx={60} cy={60} r={40} fill="url(#innerGlow)" />
        {/* Email envelope icon */}
        <G transform="translate(36, 40)">
          <Path
            d="M0 8C0 5.79086 1.79086 4 4 4H44C46.2091 4 48 5.79086 48 8V36C48 38.2091 46.2091 40 44 40H4C1.79086 40 0 38.2091 0 36V8Z"
            fill="rgba(255,255,255,0.95)"
          />
          <Path
            d="M4 8L24 24L44 8"
            stroke="#7849B6"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M4 36L18 22"
            stroke="#7849B6"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.5}
          />
          <Path
            d="M44 36L30 22"
            stroke="#7849B6"
            strokeWidth={2.5}
            strokeLinecap="round"
            opacity={0.5}
          />
        </G>
      </Svg>
    </Animated.View>
  );
}

// Success Checkmark Animation
function SuccessCheckmark() {
  const scale = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const ringScale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );
    ringScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.ease),
    });
    checkProgress.value = withTiming(1, {
      duration: 500,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: interpolate(ringScale.value, [0, 0.5, 1], [0, 0.8, 0.3]),
  }));

  return (
    <View style={styles.successIconWrapper}>
      <Animated.View style={[styles.successRing, ringStyle]} />
      <Animated.View style={[styles.successCircle, circleStyle]}>
        <Svg width={80} height={80} viewBox="0 0 80 80">
          <Defs>
            <RadialGradient id="successGradient" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="#B49CDA" />
              <Stop offset="100%" stopColor="#7849B6" />
            </RadialGradient>
          </Defs>
          <Circle cx={40} cy={40} r={38} fill="url(#successGradient)" />
          <Path
            d="M25 40 L35 50 L55 30"
            stroke="#FFFFFF"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

// Floating particle component
function FloatingParticle({
  delay,
  size,
  startX,
}: {
  delay: number;
  size: number;
  startX: number;
}) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      opacity.value = withTiming(0.6, { duration: 500 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-200, {
            duration: 5000 + Math.random() * 3000,
            easing: Easing.linear,
          }),
          withTiming(0, { duration: 0 })
        ),
        -1
      );
    };
    const timer = setTimeout(startAnimation, delay);
    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: startX,
          width: size,
          height: size,
          borderRadius: size / 2,
        },
        animatedStyle,
      ]}
    />
  );
}

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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Background Gradient */}
      <LinearGradient
        colors={["#F8F5FF", "#EDE7F6", "#E8E0F0"]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      {/* Floating particles */}
      <FloatingParticle delay={0} size={6} startX={SCREEN_WIDTH * 0.1} />
      <FloatingParticle delay={500} size={8} startX={SCREEN_WIDTH * 0.3} />
      <FloatingParticle delay={1000} size={5} startX={SCREEN_WIDTH * 0.5} />
      <FloatingParticle delay={1500} size={7} startX={SCREEN_WIDTH * 0.7} />
      <FloatingParticle delay={2000} size={6} startX={SCREEN_WIDTH * 0.9} />

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isSuccess ? (
          <Animated.View
            style={styles.successContainer}
            entering={FadeIn.duration(500)}
          >
            <SuccessCheckmark />

            <Animated.Text
              style={styles.successTitle}
              entering={FadeInUp.delay(300).duration(500)}
            >
              Check your email
            </Animated.Text>

            <Animated.Text
              style={styles.successSubtitle}
              entering={FadeInUp.delay(400).duration(500)}
            >
              We've sent a password reset link to your email address. Please
              check your inbox.
            </Animated.Text>

            <Animated.View
              style={styles.successButtonContainer}
              entering={FadeInUp.delay(500).duration(500)}
            >
              <CustomButton
                containerStyle={styles.primaryButton}
                onPress={() =>
                  router.replace({
                    pathname: "/(onboarding)/login",
                  })
                }
              >
                <LinearGradient
                  colors={[Colors.lilac[700], Colors.lilac[900]]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.primaryButtonText}>Back to Sign In</Text>
                </LinearGradient>
              </CustomButton>
            </Animated.View>
          </Animated.View>
        ) : (
          <>
            {/* Header with back button */}
            <Animated.View
              style={styles.header}
              entering={FadeInDown.duration(500)}
            >
              <Pressable onPress={handleBackPress} style={styles.backButton}>
                <BlurView intensity={80} style={styles.backButtonBlur}>
                  <MaterialCommunityIcons
                    name="keyboard-backspace"
                    size={24}
                    color={Colors.lilac[900]}
                  />
                </BlurView>
              </Pressable>
            </Animated.View>

            {/* Icon Section */}
            <Animated.View
              style={styles.iconSection}
              entering={FadeInDown.delay(100).duration(600)}
            >
              <AnimatedEmailIcon isSuccess={isSuccess} />
            </Animated.View>

            {/* Title Section */}
            <Animated.View
              style={styles.titleSection}
              entering={FadeInUp.delay(200).duration(500)}
            >
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email address and we'll send you a link
                to reset your password.
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View
              style={styles.formCard}
              entering={FadeInUp.delay(300).duration(500)}
            >
              {Platform.OS === "ios" ? (
                <BlurView
                  intensity={60}
                  tint="light"
                  style={styles.formCardBlur}
                >
                  <FormContent
                    control={control}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                    handleFormSubmit={handleFormSubmit}
                    router={router}
                  />
                </BlurView>
              ) : (
                <View style={styles.formCardAndroid}>
                  <FormContent
                    control={control}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                    handleFormSubmit={handleFormSubmit}
                    router={router}
                  />
                </View>
              )}
            </Animated.View>

            {/* Remember password link */}
            <Animated.View
              style={styles.rememberContainer}
              entering={FadeInUp.delay(400).duration(500)}
            >
              <Text style={styles.rememberText}>
                Remember your password?{" "}
                <Link
                  href={{
                    pathname: "/(onboarding)/login",
                  }}
                  style={styles.signInLink}
                >
                  Sign in
                </Link>
              </Text>
            </Animated.View>
          </>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

// Form content component
function FormContent({
  control,
  errors,
  isSubmitting,
  handleSubmit,
  handleFormSubmit,
  router,
}: {
  control: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
  handleFormSubmit: any;
  router: any;
}) {
  return (
    <View style={styles.formContent}>
      <CustomTextInput
        control={control}
        name="email"
        label="Email Address"
        labelStyle={styles.inputLabel}
        placeholder="Enter your email address"
        placeholderTextColor={Colors.gray[300]}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email?.message}
        containerStyle={styles.inputContainer}
      />

      <CustomButton
        containerStyle={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit(handleFormSubmit)}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Send reset link"
      >
        <LinearGradient
          colors={
            isSubmitting
              ? [Colors.gray[300], Colors.gray[400]]
              : [Colors.lilac[700], Colors.lilac[900]]
          }
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.submitButtonText}>Send Reset Link</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
              />
            </View>
          )}
        </LinearGradient>
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F5FF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 50,
    paddingBottom: 40,
  },
  decorCircle1: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(120, 73, 182, 0.08)",
    top: -100,
    right: -100,
  },
  decorCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(165, 135, 211, 0.1)",
    bottom: 100,
    left: -80,
  },
  decorCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(180, 156, 218, 0.12)",
    top: "40%",
    right: -50,
  },
  particle: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "rgba(120, 73, 182, 0.3)",
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  backButtonBlur: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      Platform.OS === "android" ? "rgba(255, 255, 255, 0.9)" : "transparent",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(120, 73, 182, 0.15)",
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[400],
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  formCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 24,
  },
  formCardBlur: {
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  formCardAndroid: {
    padding: 24,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(120, 73, 182, 0.1)",
    shadowColor: Colors.lilac[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  formContent: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 0,
  },
  inputLabel: {
    color: Colors.text.primary,
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 8,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 20,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  testButton: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  testButtonText: {
    color: Colors.gray[400],
    fontSize: 13,
    fontWeight: "500",
  },
  rememberContainer: {
    alignItems: "center",
  },
  rememberText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[500],
  },
  signInLink: {
    color: Colors.lilac[900],
    fontWeight: "700",
  },
  // Success styles
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 24,
  },
  successIconWrapper: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  successRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: Colors.lilac[400],
  },
  successCircle: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  successSubtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[400],
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  successButtonContainer: {
    width: "100%",
    marginTop: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
