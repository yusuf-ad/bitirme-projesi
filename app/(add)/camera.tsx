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
  const [mediaPermission, requestMediaPermission] =
    ImagePicker.useMediaLibraryPermissions();
  const [flash, setFlash] = useState<"off" | "on">("off");
  const [isActive] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);
  const insets = useSafeAreaInsets();
  const shutterScale = useRef(new Animated.Value(1)).current;
  const capturingRef = useRef(false);
  const lastShotAtRef = useRef(0);

  // Reset capture lock whenever this screen regains focus
  useFocusEffect(() => {
    setIsCapturing(false);
    capturingRef.current = false;
  });

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
      const now = Date.now();
      // Debounce rapid taps (within 1s) and prevent re-entrancy
      if (capturingRef.current || now - lastShotAtRef.current < 1000) return;
      lastShotAtRef.current = now;
      capturingRef.current = true;
      setIsCapturing(true);
      if (camera.current) {
        const photo = await camera.current.takePhoto({
          flash,
          enableShutterSound: true,
        });
        console.log("Photo taken:", photo.path);
        router.push({
          pathname: "/(add)/preview",
          params: { uri: photo.path },
        });
      }
    } catch (error) {
      console.error("Failed to take photo:", error);
      // Allow retry only if there was an error
      setIsCapturing(false);
      capturingRef.current = false;
    }
  }, [flash, router]);

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
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        router.push({
          pathname: "/(add)/preview",
          params: { uri: result.assets[0].uri },
        });
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
    }
  }, [ensureMediaLibraryPermission, router]);

  // Show loading while requesting permissions
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
          {device ? (
            <Camera
              ref={camera}
              style={styles.camera}
              device={device}
              isActive={isActive}
              photo={true}
              enableZoomGesture
            />
          ) : (
            <View style={styles.cameraLoadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.permissionText}>Loading camera...</Text>
              <Text style={styles.simulatorHint}>
                Camera not available in simulator.{"\n"}Use the gallery button
                below.
              </Text>
            </View>
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
            style={[
              styles.shutterButton,
              (isCapturing || !device) && styles.shutterDisabled,
            ]}
            accessibilityLabel="Take photo"
            onPress={takePhoto}
            onPressIn={onShutterPressIn}
            onPressOut={onShutterPressOut}
            disabled={isCapturing || !device}
          >
            <Animated.View
              style={[
                styles.shutterInner,
                { transform: [{ scale: shutterScale }] },
              ]}
            />
          </Pressable>

          <Pressable
            style={[styles.iconButton, !device && styles.iconButtonDisabled]}
            accessibilityLabel="Toggle flash"
            onPress={toggleFlash}
            disabled={!device}
          >
            <MaterialIcons
              name={flash === "on" ? "flash-on" : "flash-off"}
              size={26}
              color={device ? "#fff" : "rgba(255,255,255,0.3)"}
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
  cameraLoadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  simulatorHint: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    paddingHorizontal: 32,
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
  iconButtonDisabled: {
    opacity: 0.3,
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
