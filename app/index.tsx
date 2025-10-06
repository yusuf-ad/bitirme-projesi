import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import { useRef } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AuthModal } from "../features/auth";

export default function WelcomeScreen() {
  const authModalRef = useRef<BottomSheetModal>(null);

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" />
      <Image
        source={require("../assets/images/image.png")}
        style={styles.image}
      />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          Kitchen management, smart recipes and waste-free planning in one
          place.
        </Text>

        <Pressable style={styles.getStartedButton}>
          <Text style={styles.getStartedText}>Get Started</Text>
        </Pressable>

        <Pressable
          style={styles.loginButton}
          onPress={() => authModalRef.current?.present()}
        >
          <Text style={styles.loginText}>Log in</Text>
        </Pressable>
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
    borderRadius: 8,
    paddingVertical: 19,
    paddingHorizontal: 115,
    marginBottom: 12,
    width: "100%",
    alignItems: "center",
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
    borderRadius: 8,
    paddingVertical: 19,
    paddingHorizontal: 115,
    width: "100%",
    alignItems: "center",
  },
  loginText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 19,
    color: "#000000",
  },
});
