import { CelebrationModal } from "@/components/CelebrationModal";
import { Colors } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { useOnboarding } from "@/providers/onboarding-provider";
import CustomButton from "@/shared/components/custom-button";
import { CustomTextInput } from "@/shared/components/custom-text-input";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { zodResolver } from "@hookform/resolvers/zod";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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

const SignupFormSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Full name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
});

// Animated Create Account Icon Component
function AnimatedCreateIcon() {
  const floatY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

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

    rotation.value = withRepeat(
      withSequence(
        withTiming(3, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-3, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Svg width={100} height={100} viewBox="0 0 100 100">
        <Defs>
          <RadialGradient id="createGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#A587D3" stopOpacity="0.6" />
            <Stop offset="60%" stopColor="#7849B6" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="innerGlow" cx="30%" cy="30%" r="70%">
            <Stop offset="0%" stopColor="#B49CDA" stopOpacity="1" />
            <Stop offset="100%" stopColor="#7849B6" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Circle cx={50} cy={50} r={45} fill="url(#createGlow)" />
        <Circle cx={50} cy={50} r={32} fill="url(#innerGlow)" />
        {/* User with plus icon */}
        <G transform="translate(28, 26)">
          <Circle cx={18} cy={10} r={7} fill="rgba(255,255,255,0.95)" />
          <Path
            d="M4 36C4 27 10 22 18 22C26 22 32 27 32 36"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth={3.5}
            strokeLinecap="round"
            fill="none"
          />
          {/* Plus sign */}
          <Circle cx={34} cy={32} r={10} fill="rgba(255,255,255,0.95)" />
          <Path
            d="M34 27V37M29 32H39"
            stroke="#7849B6"
            strokeWidth={2.5}
            strokeLinecap="round"
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

export function SignupTab() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

      // Show celebration modal instead of immediate navigation
      setShowSuccessModal(true);
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

  const handleModalAction = () => {
    setShowSuccessModal(false);
    router.replace("/(app)");
  };

  return (
    <>
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
        <FloatingParticle delay={0} size={6} startX={SCREEN_WIDTH * 0.12} />
        <FloatingParticle delay={500} size={7} startX={SCREEN_WIDTH * 0.35} />
        <FloatingParticle delay={1000} size={5} startX={SCREEN_WIDTH * 0.58} />
        <FloatingParticle delay={1500} size={8} startX={SCREEN_WIDTH * 0.82} />

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
            <AnimatedCreateIcon />
          </Animated.View>

          {/* Title Section */}
          <Animated.View 
            style={styles.titleSection}
            entering={FadeInUp.delay(200).duration(500)}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join us and start your personalized journey
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
                  handleSignup={handleSignup}
                />
              </BlurView>
            ) : (
              <View style={styles.formCardAndroid}>
                <FormContent
                  control={control}
                  errors={errors}
                  isSubmitting={isSubmitting}
                  handleSubmit={handleSubmit}
                  handleSignup={handleSignup}
                />
              </View>
            )}
          </Animated.View>

          {/* Login Link */}
          <Animated.View 
            style={styles.loginContainer}
            entering={FadeInUp.delay(500).duration(500)}
          >
            <Text style={styles.haveAccountText}>Already have an account?</Text>
            <Pressable onPress={() => router.push("/(onboarding)/login")}>
              <Text style={styles.loginLink}>Sign in</Text>
            </Pressable>
          </Animated.View>
        </KeyboardAwareScrollView>
      </View>

      <CelebrationModal
        visible={showSuccessModal}
        type="account-created"
        onClose={() => setShowSuccessModal(false)}
        onAction={handleModalAction}
      />
    </>
  );
}

// Form content component
function FormContent({
  control,
  errors,
  isSubmitting,
  handleSubmit,
  handleSignup,
}: {
  control: any;
  errors: any;
  isSubmitting: boolean;
  handleSubmit: any;
  handleSignup: any;
}) {
  return (
    <View style={styles.formContent}>
      <CustomTextInput
        control={control}
        name="fullName"
        label="Full Name"
        labelStyle={styles.inputLabel}
        placeholder="Enter your full name"
        placeholderTextColor={Colors.gray[300]}
        autoCapitalize="words"
        autoCorrect={false}
        error={errors.fullName?.message}
        containerStyle={styles.inputContainer}
      />

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
        placeholder="Create a password"
        placeholderTextColor={Colors.gray[300]}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        error={errors.password?.message}
        containerStyle={styles.inputContainer}
      />

      <CustomButton
        containerStyle={[
          styles.submitButton,
          isSubmitting && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit(handleSignup)}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Sign up"
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
              <Text style={styles.submitButtonText}>Create Account</Text>
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
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(120, 73, 182, 0.08)",
    top: -70,
    right: -70,
  },
  decorCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(165, 135, 211, 0.1)",
    bottom: 100,
    left: -70,
  },
  decorCircle3: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(180, 156, 218, 0.12)",
    top: "40%",
    right: -45,
  },
  particle: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "rgba(120, 73, 182, 0.3)",
  },
  header: {
    marginBottom: 12,
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
    marginBottom: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    alignItems: "center",
    marginBottom: 20,
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
    gap: 14,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  haveAccountText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.gray[400],
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.lilac[900],
  },
});
