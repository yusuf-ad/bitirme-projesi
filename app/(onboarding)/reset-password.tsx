import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
    Rect,
    Stop,
} from "react-native-svg";
import { z } from "zod";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

// Animated Lock Icon Component
function AnimatedLockIcon() {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const floatY = useSharedValue(0);
  const shakeX = useSharedValue(0);

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
        withTiming(3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { translateX: shakeX.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Svg width={120} height={120} viewBox="0 0 120 120">
        <Defs>
          <RadialGradient id="lockGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#A587D3" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#7849B6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="innerGlow" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#B49CDA" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        {/* Outer glow */}
        <Circle cx={60} cy={60} r={55} fill="url(#lockGlow)" />
        {/* Main circle */}
        <Circle cx={60} cy={60} r={40} fill="url(#innerGlow)" />
        {/* Lock icon */}
        <G transform="translate(38, 32)">
          {/* Lock body */}
          <Rect
            x={5}
            y={26}
            width={34}
            height={28}
            rx={4}
            fill="rgba(255,255,255,0.95)"
          />
          {/* Lock shackle */}
          <Path
            d="M12 26V18C12 12.4772 16.4772 8 22 8C27.5228 8 32 12.4772 32 18V26"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Keyhole */}
          <Circle cx={22} cy={38} r={4} fill="#7849B6" />
          <Path
            d="M22 42V48"
            stroke="#7849B6"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}

// Success Shield Animation
function SuccessShield() {
  const scale = useSharedValue(0);
  const checkProgress = useSharedValue(0);
  const ringScale = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 200 })
    );
    ringScale.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    checkProgress.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) });
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1500 }),
        withTiming(0.4, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: interpolate(ringScale.value, [0, 0.5, 1], [0, 0.8, 0.3]),
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.successIconWrapper}>
      <Animated.View style={[styles.successGlow, glowStyle]} />
      <Animated.View style={[styles.successRing, ringStyle]} />
      <Animated.View style={[styles.successCircle, circleStyle]}>
        <Svg width={90} height={90} viewBox="0 0 90 90">
          <Defs>
            <RadialGradient id="shieldGradient" cx="30%" cy="30%" r="70%">
              <Stop offset="0%" stopColor="#87B99D" />
              <Stop offset="100%" stopColor="#548A6A" />
            </RadialGradient>
          </Defs>
          {/* Shield shape */}
          <Path
            d="M45 8L15 20V42C15 60 30 76 45 82C60 76 75 60 75 42V20L45 8Z"
            fill="url(#shieldGradient)"
          />
          {/* Checkmark */}
          <Path
            d="M32 44 L40 52 L58 34"
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
function FloatingParticle({ delay, size, startX }: { delay: number; size: number; startX: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      opacity.value = withTiming(0.6, { duration: 500 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-200, { duration: 5000 + Math.random() * 3000, easing: Easing.linear }),
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

// Password strength indicator
function PasswordStrength({ password }: { password: string }) {
  const getStrength = () => {
    if (!password) return { level: 0, label: "", color: Colors.gray[300] };
    if (password.length < 6) return { level: 1, label: "Weak", color: "#EF4444" };
    if (password.length < 8) return { level: 2, label: "Fair", color: "#F59E0B" };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 4, label: "Strong", color: "#10B981" };
    }
    return { level: 3, label: "Good", color: "#84CC16" };
  };

  const strength = getStrength();

  if (!password) return null;

  return (
    <Animated.View style={styles.strengthContainer} entering={FadeIn.duration(300)}>
      <View style={styles.strengthBars}>
        {[1, 2, 3, 4].map((level) => (
          <View
            key={level}
            style={[
              styles.strengthBar,
              {
                backgroundColor: level <= strength.level ? strength.color : Colors.gray[200],
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color: strength.color }]}>
        {strength.label}
      </Text>
    </Animated.View>
  );
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = useMemo(() => {
    const v = (params as any)?.token;
    return Array.isArray(v) ? v[0] : v;
  }, [params]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [passwordValue, setPasswordValue] = useState("");

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.output<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
  });

  // Watch password for strength indicator
  const watchedPassword = watch("password", "");
  useEffect(() => {
    setPasswordValue(watchedPassword || "");
  }, [watchedPassword]);

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
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
      <FloatingParticle delay={0} size={6} startX={SCREEN_WIDTH * 0.15} />
      <FloatingParticle delay={600} size={8} startX={SCREEN_WIDTH * 0.35} />
      <FloatingParticle delay={1200} size={5} startX={SCREEN_WIDTH * 0.55} />
      <FloatingParticle delay={1800} size={7} startX={SCREEN_WIDTH * 0.75} />
      <FloatingParticle delay={2400} size={6} startX={SCREEN_WIDTH * 0.85} />

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
            <SuccessShield />
            
            <Animated.Text 
              style={styles.successTitle}
              entering={FadeInUp.delay(300).duration(500)}
            >
              Password Updated!
            </Animated.Text>
            
            <Animated.Text 
              style={styles.successSubtitle}
              entering={FadeInUp.delay(400).duration(500)}
            >
              Your password has been successfully changed. You can now sign in with your new password.
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
                  colors={[Colors.green[600], Colors.green[900]]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Continue to Sign In</Text>
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="#FFFFFF"
                    />
                  </View>
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
              <AnimatedLockIcon />
            </Animated.View>

            {/* Title Section */}
            <Animated.View 
              style={styles.titleSection}
              entering={FadeInUp.delay(200).duration(500)}
            >
              <Text style={styles.title}>Create New Password</Text>
              <Text style={styles.subtitle}>
                Your new password must be different from previously used passwords.
              </Text>
            </Animated.View>

            {/* Form Card */}
            <Animated.View 
              style={styles.formCard}
              entering={FadeInUp.delay(300).duration(500)}
            >
              {Platform.OS === "ios" ? (
                <BlurView intensity={60} tint="light" style={styles.formCardBlur}>
                  <FormContent
                    control={control}
                    errors={errors}
                    isSubmitting={isSubmitting}
                    handleSubmit={handleSubmit}
                    handleFormSubmit={handleFormSubmit}
                    passwordValue={passwordValue}
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
                    passwordValue={passwordValue}
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
  passwordValue,
}: {
  control: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
  handleFormSubmit: any;
  passwordValue: string;
}) {
  return (
    <View style={styles.formContent}>
      <View>
        <CustomTextInput
          control={control}
          name="password"
          label="New Password"
          labelStyle={styles.inputLabel}
          placeholder="Enter your new password"
          placeholderTextColor={Colors.gray[300]}
          secureTextEntry
          error={errors.password?.message}
          containerStyle={styles.inputContainer}
        />
        <PasswordStrength password={passwordValue} />
      </View>

      <CustomTextInput
        control={control}
        name="confirmPassword"
        label="Confirm Password"
        labelStyle={styles.inputLabel}
        placeholder="Confirm your new password"
        placeholderTextColor={Colors.gray[300]}
        secureTextEntry
        error={errors.confirmPassword?.message}
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
        accessibilityLabel="Reset password"
      >
        <LinearGradient
          colors={isSubmitting ? [Colors.gray[300], Colors.gray[400]] : [Colors.lilac[700], Colors.lilac[900]]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.submitButtonText}>Reset Password</Text>
              <MaterialCommunityIcons
                name="lock-reset"
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(120, 73, 182, 0.08)",
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(165, 135, 211, 0.1)",
    bottom: 80,
    left: -100,
  },
  decorCircle3: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(180, 156, 218, 0.12)",
    top: "45%",
    right: -60,
  },
  particle: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "rgba(120, 73, 182, 0.3)",
  },
  header: {
    marginBottom: 20,
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
    backgroundColor: Platform.OS === "android" ? "rgba(255, 255, 255, 0.9)" : "transparent",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(120, 73, 182, 0.15)",
  },
  iconSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
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
    paddingHorizontal: 12,
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
    gap: 18,
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
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    gap: 10,
  },
  strengthBars: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  tokenBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(84, 138, 106, 0.1)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  tokenText: {
    color: Colors.green[700],
    fontSize: 13,
    fontWeight: "600",
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
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  successGlow: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(84, 138, 106, 0.15)",
  },
  successRing: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: Colors.green[400],
  },
  successCircle: {
    width: 90,
    height: 90,
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
