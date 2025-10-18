import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const params = useLocalSearchParams();
  const openAuth = useMemo(() => {
    const value = (params as any)?.openAuth;
    return Array.isArray(value) ? value[0] : value;
  }, [params]);

  // Navigate to login if redirected with query ?openAuth=1
  useEffect(() => {
    if (openAuth === "1") {
      router.push("/(onboarding)/login");
    }
  }, [openAuth]);

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/images/image.png")}
        style={styles.image}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Kitchen management, smart recipes and waste-free planning in one
          place.
        </Text>

        <CustomButton
          onPress={() =>
            router.push({
              pathname: "/(onboarding)/flow",
              params: { section: "goals", step: "0" },
            })
          }
          containerStyle={styles.getStartedButton}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </CustomButton>

        <CustomButton
          containerStyle={styles.loginButton}
          onPress={() => router.push("/(onboarding)/login")}
        >
          <Text style={styles.loginText}>Login</Text>
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  image: {
    flex: 1,
    width: "100%",
    resizeMode: "cover",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 24,
    lineHeight: 29,
    color: Colors.text.primary,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: Colors.lilac[900],
    marginBottom: 12,
  },
  getStartedText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: Colors.text.inverse,
  },
  loginButton: {
    backgroundColor: Colors.gray[100],
  },
  loginText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: Colors.text.primary,
  },
});
