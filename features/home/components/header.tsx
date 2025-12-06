import { Colors } from "@/constants/theme";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface HeaderProps {
  firstName: string;
  motivationText?: string;
  avatarUrl?: string | null;
}

export default function Header({
  firstName,
  motivationText,
  avatarUrl,
}: HeaderProps) {
  const router = useRouter();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handleProfilePress() {
    // Haptic feedback for touch interaction
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Navigate to profile tab
    router.push("/(profile)");
  }

  function handlePressIn() {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 300,
    });
  }

  function handlePressOut() {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  }

  return (
    <Animated.View style={styles.header} entering={FadeIn.duration(500)}>
      <View style={styles.headerLeft}>
        <View>
          <Text style={styles.greeting}>Hello, {firstName}!</Text>
          <Text style={styles.date}>{motivationText}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          onPress={handleProfilePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.profilePictureContainer}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={animatedStyle}>
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("@/assets/images/profile-picture.png")
              }
              style={styles.profilePicture}
            />
          </Animated.View>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    color: Colors.text.primary,
    marginBottom: -4,
  },
  date: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 12,
    lineHeight: 16,
    color: Colors.gray[300],
    marginTop: 10,
  },
  headerRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  profilePictureContainer: {
    width: 36,
    height: 36,
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 18,
    overflow: "hidden",
  },
  profilePicture: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
});
