import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    ActivityIndicator,
    Alert,
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
    FadeInDown,
    FadeInUp,
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

const LoginFormSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

// Animated User Icon Component
function AnimatedUserIcon() {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

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
    transform: [{ translateY: floatY.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="userGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#A587D3" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#7849B6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="innerGlow" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#B49CDA" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={45} fill="url(#userGlow)" />
        <Circle cx={50} cy={50} r={32} fill="url(#innerGlow)" />
        {/* User icon */}
        <G transform="translate(32, 28)">
          <Circle cx={18} cy={10} r={8} fill="rgba(255,255,255,0.95)" />
          <Path
            d="M4 38C4 28 10 22 18 22C26 22 32 28 32 38"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}

// Floating particle component
function FloatingParticle({ delay, size, startX }: { delay: number; size: number; startX: number }) {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const startAnimation = () => {
      opacity.value = withTiming(0.5, { duration: 500 });
      translateY.value = withRepeat(
        withSequence(
          withTiming(-180, { duration: 5000 + Math.random() * 2000, easing: Easing.linear }),
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

export function LoginTab() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.output<typeof LoginFormSchema>>({
    resolver: zodResolver(LoginFormSchema),
  });

  const router = useRouter();

  async function handleLogin(formData: z.output<typeof LoginFormSchema>) {
    console.log(formData);

    if (formData.email.trim() === "" || formData.password.trim() === "") {
      Alert.alert("Please fill in all fields");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      Alert.alert("Error logging in", error.message);
      return;
    }

    Alert.alert("Login successful");
    router.push("/(app)");
  }

  function handleForgotPasswordPress() {
    router.push("/(onboarding)/forgot-password");
  }

  function handleBackPress() {
    router.back();
  }

  function handleSignupPress() {
    router.push("/(onboarding)/flow");
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
      <FloatingParticle delay={0} size={6} startX={SCREEN_WIDTH * 0.1} />
      <FloatingParticle delay={400} size={7} startX={SCREEN_WIDTH * 0.3} />
      <FloatingParticle delay={800} size={5} startX={SCREEN_WIDTH * 0.6} />
      <FloatingParticle delay={1200} size={8} startX={SCREEN_WIDTH * 0.85} />

      <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={100}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          <AnimatedUserIcon />
        </Animated.View>

        {/* Title Section */}
        <Animated.View 
          style={styles.titleSection}
          entering={FadeInUp.delay(200).duration(500)}
        >
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>
            Sign in to continue your journey
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
                handleLogin={handleLogin}
                handleForgotPasswordPress={handleForgotPasswordPress}
              />
            </BlurView>
          ) : (
            <View style={styles.formCardAndroid}>
              <FormContent
                control={control}
                errors={errors}
                isSubmitting={isSubmitting}
                handleSubmit={handleSubmit}
                handleLogin={handleLogin}
                handleForgotPasswordPress={handleForgotPasswordPress}
              />
            </View>
          )}
        </Animated.View>

        {/* Signup Link */}
        <Animated.View 
          style={styles.signupContainer}
          entering={FadeInUp.delay(500).duration(500)}
        >
          <Text style={styles.noAccountText}>Don't have an account?</Text>
          <Pressable onPress={handleSignupPress}>
            <Text style={styles.signupLink}>Sign up</Text>
          </Pressable>
        </Animated.View>
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
  handleLogin,
  handleForgotPasswordPress,
}: {
  control: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
  handleLogin: any;
  handleForgotPasswordPress: () => void;
}) {
  return (
    <View style={styles.formContent}>
      <CustomTextInput
        control={control}
        name="email"
        label="Email Address"
        labelStyle={styles.inputLabel}
        placeholder="Enter your email"
        placeholderTextColor={Colors.gray[300]}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.email?.message}
        containerStyle={styles.inputContainer}
      />

      <CustomTextInput
        control={control}
        name="password"
        label="Password"
        labelStyle={styles.inputLabel}
        placeholder="Enter your password"
        placeholderTextColor={Colors.gray[300]}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.password?.message}
        containerStyle={styles.inputContainer}
      />

      <Pressable
        onPress={handleForgotPasswordPress}
        style={styles.forgotPasswordContainer}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </Pressable>

      <CustomButton
        containerStyle={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit(handleLogin)}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Login"
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
              <Text style={styles.submitButtonText}>Login</Text>
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
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(120, 73, 182, 0.08)",
    top: -80,
    right: -80,
  },
  decorCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(165, 135, 211, 0.1)",
    bottom: 120,
    left: -80,
  },
  decorCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(180, 156, 218, 0.12)",
    top: "35%",
    right: -50,
  },
  particle: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "rgba(120, 73, 182, 0.3)",
  },
  header: {
    marginBottom: 16,
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
    marginBottom: 16,
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[400],
    textAlign: "center",
  },
  formCard: {
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
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
    gap: 16,
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
  forgotPasswordContainer: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[900],
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
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  noAccountText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[400],
  },
  signupLink: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.lilac[900],
  },
});
