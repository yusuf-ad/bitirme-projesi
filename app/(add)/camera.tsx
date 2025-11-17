import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

const FRAME_SIZE = 260;

export default function CameraPantry() {
  const router = useRouter();
  const camera = useRef<Camera>(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isActive] = useState(true);

  const frameCorners = [
    styles.cornerTopLeft,
    styles.cornerTopRight,
    styles.cornerBottomLeft,
    styles.cornerBottomRight,
  ];

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash,
          enableShutterSound: true,
        });
        console.log("Photo taken:", photo.path);
        // TODO: Handle the captured photo - you can navigate to a preview screen or process it
        // Example: router.push({ pathname: '/(add)/photo-preview', params: { uri: photo.path } });
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
    }
  }, [flash]);

  const toggleFlash = useCallback(() => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  // Show loading while requesting permissions or loading device
  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.permissionText}>
            Requesting camera permission...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!device) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            onPress={handleClose}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.previewContainer}>
          <View style={styles.frameShadow}>
            <View
              style={[styles.frame, { width: FRAME_SIZE, height: FRAME_SIZE }]}
            >
              <Camera
                ref={camera}
                style={styles.camera}
                device={device}
                isActive={isActive}
                photo={true}
                enableZoomGesture
              />
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
            onPress={takePhoto}
          >
            <View style={styles.shutterInner} />
          </Pressable>

          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Toggle flash"
            onPress={toggleFlash}
          >
            <MaterialIcons
              name={flash === "on" ? "flash-on" : "flash-off"}
              size={26}
              color="#fff"
            />
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
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
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
  camera: {
    position: "absolute",
    width: "100%",
    height: "100%",
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
