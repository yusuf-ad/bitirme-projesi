import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Lazy import camera to handle missing native module
let CameraView: any = null;
let useCameraPermissions: any = null;

try {
  const cameraModule = require("expo-camera");
  CameraView = cameraModule.CameraView;
  useCameraPermissions = cameraModule.useCameraPermissions;
} catch {
  // Camera module not available (Expo Go)
}

export default function CameraPantry() {
  const router = useRouter();
  const cameraRef = useRef<any>(null);
  const [permission, setPermission] = useState<{ granted: boolean } | null>(null);
  const [mediaPermission, requestMediaPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState(!!CameraView);
  const insets = useSafeAreaInsets();
  const shutterScale = useRef(new Animated.Value(1)).current;
  const capturingRef = useRef(false);
  const lastShotAtRef = useRef(0);

  // Use camera permissions hook if available
  const cameraPermissionHook = useCameraPermissions?.() ?? [null, () => Promise.resolve({ granted: false })];
  const [cameraPermission, requestCameraPermission] = cameraPermissionHook;


  // Reset capture lock whenever this screen regains focus
  useFocusEffect(
    useCallback(() => {
      setIsCapturing(false);
      capturingRef.current = false;
    }, [])
  );

  // Calculate camera dimensions with 4:3 aspect ratio
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const cameraHeight = (screenWidth * 4) / 3;

  useEffect(() => {
    if (cameraAvailable && cameraPermission) {
      setPermission(cameraPermission);
      if (!cameraPermission.granted) {
        requestCameraPermission();
      }
    }
  }, [cameraAvailable, cameraPermission, requestCameraPermission]);

  const takePhoto = useCallback(async () => {
    try {
      const now = Date.now();
      if (capturingRef.current || now - lastShotAtRef.current < 1000) return;
      lastShotAtRef.current = now;
      capturingRef.current = true;
      setIsCapturing(true);
      if (cameraRef.current) {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
        });
        if (photo?.uri) {
          console.log("Photo taken:", photo.uri);
          router.push({
            pathname: "/(add)/preview",
            params: { uri: photo.uri },
          });
        }
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
      setIsCapturing(false);
      capturingRef.current = false;
    }
  }, [router]);

  const onShutterPressIn = useCallback(() => {
    Animated.timing(shutterScale, {
      toValue: 0.9,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [shutterScale]);

  const onShutterPressOut = useCallback(() => {
    Animated.timing(shutterScale, {
      toValue: 1,
      duration: 120,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [shutterScale]);

  const toggleFlash = useCallback(() => {
    setFlash((current) => (current === "off" ? "on" : "off"));
  }, []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const ensureMediaLibraryPermission = useCallback(async () => {
    if (mediaPermission?.granted) return true;
    const response = await requestMediaPermission();
    return response?.granted ?? false;
  }, [mediaPermission?.granted, requestMediaPermission]);

  const pickImageFromLibrary = useCallback(async () => {
    try {
      const hasLibraryPermission = await ensureMediaLibraryPermission();
      if (!hasLibraryPermission) {
        Alert.alert(
          "Permission required",
          "Allow photo library access to attach an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        router.replace({
          pathname: "/(add)/preview",
          params: { uri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
    }
  }, [ensureMediaLibraryPermission, router]);


  // Camera not available - show fallback UI
  if (!cameraAvailable) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            accessibilityLabel="Close"
            onPress={handleClose}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Ionicons name="camera-outline" size={64} color="#666" />
          <Text style={styles.fallbackTitle}>Camera Not Available</Text>
          <Text style={styles.fallbackText}>
            Camera requires a development build.{"\n"}
            You can still pick images from your gallery.
          </Text>
          <Pressable
            style={styles.galleryButton}
            onPress={pickImageFromLibrary}
          >
            <Ionicons name="images" size={24} color="#fff" />
            <Text style={styles.galleryButtonText}>Pick from Gallery</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Show loading while requesting permissions
  if (!permission?.granted) {
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
          {CameraView && (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
              flash={flash}
            />
          )}
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

        <View
          style={styles.bottomBar}
          pointerEvents={isCapturing ? "none" : "auto"}
        >
          <Pressable
            style={styles.thumbnailButton}
            accessibilityLabel="Pick from gallery"
            onPress={pickImageFromLibrary}
          >
            <Ionicons name="images" size={28} color="#fff" />
          </Pressable>

          <Pressable
            style={[styles.shutterButton, isCapturing && styles.shutterDisabled]}
            accessibilityLabel="Take photo"
            onPress={takePhoto}
            onPressIn={onShutterPressIn}
            onPressOut={onShutterPressOut}
            disabled={isCapturing}
          >
            <Animated.View
              style={[
                styles.shutterInner,
                { transform: [{ scale: shutterScale }] },
              ]}
            />
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
    paddingHorizontal: 32,
    gap: 16,
  },
  permissionText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    textAlign: "center",
  },
  fallbackTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  fallbackText: {
    color: "#888",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
  },
  galleryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#333",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  galleryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
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
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
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
  shutterDisabled: {
    opacity: 0.5,
  },
});
