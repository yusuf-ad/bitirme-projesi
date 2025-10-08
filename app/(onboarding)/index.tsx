import { AuthModal } from "@/features/auth";
import CustomButton from "@/shared/components/custom-button";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import { useRef } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const authModalRef = useRef<BottomSheetModal>(null);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" />
      <Image
        source={require("@/assets/images/image.png")}
        style={styles.image}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Kitchen management, smart recipes and waste-free planning in one
          place.
        </Text>

        <CustomButton containerStyle={styles.getStartedButton}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </CustomButton>

        <CustomButton
          containerStyle={styles.loginButton}
          onPress={() => authModalRef.current?.present()}
        >
          <Text style={styles.loginText}>Log in</Text>
        </CustomButton>
      </View>

      <AuthModal ref={authModalRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    color: "#000000",
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  getStartedButton: {
    backgroundColor: "#7849B6",
    marginBottom: 12,
  },
  getStartedText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#FFFFFF",
  },
  loginButton: {
    backgroundColor: "#ECEDEE",
  },
  loginText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#000000",
  },
});
