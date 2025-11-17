import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FRAME_SIZE = 260;

export default function CameraPantry() {
  const frameCorners = [
    styles.cornerTopLeft,
    styles.cornerTopRight,
    styles.cornerBottomLeft,
    styles.cornerBottomRight,
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <LinearGradient
        colors={["#050505", "#000000"]}
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Close scanner"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.frameShadow}>
            <View
              style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}
            >
              <View style={styles.cameraMock} />
              {frameCorners.map((cornerStyle, index) => (
                <View key={index} style={[styles.corner, cornerStyle]} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.bottomBar}>
          <Pressable
            style={styles.thumbnailButton}
            accessibilityLabel="Recent photo"
          >
            <Image
              source={require("../../assets/images/grilled-chicken.png")}
              style={styles.thumbnail}
            />
          </Pressable>

          <Pressable
            style={styles.shutterButton}
            accessibilityLabel="Take photo"
          >
            <View style={styles.shutterInner} />
          </Pressable>

          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Toggle flash"
          >
            <MaterialIcons name="flash-off" size={26} color="#fff" />
          </Pressable>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
  },
  infoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },

  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  frameShadow: {
    width: FRAME_SIZE + 40,
    height: FRAME_SIZE + 40,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    overflow: "hidden",
  },
  cameraMock: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 28,
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: "#fff",
    borderRadius: 8,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 36,
    paddingTop: 24,
  },
  thumbnailButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
});
