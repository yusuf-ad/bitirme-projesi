import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from "react-native-vision-camera";

export default function CameraPantry() {
  const router = useRouter();
  const camera = useRef<Camera>(null);
  const device = useCameraDevice("back");
  const { hasPermission, requestPermission } = useCameraPermission();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isActive] = useState(true);
  const insets = useSafeAreaInsets();

  // Calculate camera dimensions with 4:3 aspect ratio
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const cameraHeight = (screenWidth * 4) / 3;

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
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.permissionText}>
            Requesting camera permission...
          </Text>
        </View>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.permissionText}>Loading camera...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraWrapper}>
        <View
          style={[
            styles.cameraContainer,
            {
              width: screenWidth,
              height: cameraHeight,
              top: (screenHeight - cameraHeight) / 2,
            },
          ]}
        >
          <Camera
            ref={camera}
            style={styles.camera}
            device={device}
            isActive={isActive}
            photo={true}
            enableZoomGesture
          />
        </View>
      </View>

      <View
        style={[
          styles.overlay,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    position: "absolute",
    overflow: "hidden",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
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
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
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
