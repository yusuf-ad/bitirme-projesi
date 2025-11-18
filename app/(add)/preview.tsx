import { searchIngredients } from "@/lib/spoonacular";
import { Ionicons } from "@expo/vector-icons";
import * as LegacyFS from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Image,
  NativeModules,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
export default function PhotoPreview() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri?: string }>();
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(0);
  const scanY = useSharedValue(-60);

  const fileUri = useMemo(() => {
    const raw = Array.isArray(params.uri) ? params.uri[0] : params.uri;
    if (!raw) return undefined;
    return raw.startsWith("file://") ? raw : `file://${raw}`;
  }, [params.uri]);

  const onRetry = () => {
    router.replace("/(add)/camera");
  };

  const getDevServerBaseUrl = () => {
    try {
      const scriptURL: string | undefined = (NativeModules as any)?.SourceCode
        ?.scriptURL;
      if (!scriptURL) return "";
      const u = new URL(scriptURL);
      return `${u.protocol}//${u.hostname}:${u.port}`;
    } catch {
      return "";
    }
  };

  const buildOptimizedDataUrl = useCallback(async () => {
    if (!fileUri) return undefined;

    try {
      const optimized = await ImageManipulator.manipulateAsync(
        fileUri,
        [{ resize: { width: 1280 } }],
        {
          compress: 0.65,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      const base64Payload =
        optimized.base64 ??
        (await (LegacyFS as any).readAsStringAsync(optimized.uri, {
          encoding: "base64",
        }));

      if (!base64Payload) return undefined;
      return `data:image/jpeg;base64,${base64Payload}`;
    } catch (error) {
      console.warn("Failed to optimize image", error);
      const fallback = await (LegacyFS as any).readAsStringAsync(fileUri, {
        encoding: "base64",
      });
      return `data:image/jpeg;base64,${fallback}`;
    }
  }, [fileUri]);

  const onScan = useCallback(async () => {
    if (!fileUri || isScanning) return;
    setIsScanning(true);
    try {
      const dataUrl = await buildOptimizedDataUrl();
      if (!dataUrl) throw new Error("Image payload unavailable");

      const base =
        (typeof process !== "undefined" &&
          (process as any).env?.EXPO_PUBLIC_API_URL) ||
        getDevServerBaseUrl();
      const url = `${base}/api/scan`;

      const t0 = Date.now();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      if (!res.ok) throw new Error(`Scan failed: ${res.status}`);

      const json = (await res.json()) as {
        ingredients?: { name: string; quantity: string }[];
        durationMs?: number;
      };
      const elapsedMs = Date.now() - t0;
      const items = Array.isArray(json.ingredients) ? json.ingredients : [];

      // Search for each ingredient in Spoonacular and get the first result
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const { ingredients } = await searchIngredients(item.name, 0, 1);
            if (ingredients.length > 0) {
              const spoonacularIngredient = ingredients[0];
              return {
                name: item.name,
                quantity: item.quantity,
                spoonacularId: spoonacularIngredient.id,
                spoonacularName: spoonacularIngredient.name,
                spoonacularImage: spoonacularIngredient.image,
              };
            }
          } catch (error) {
            console.error(`Error searching ingredient ${item.name}:`, error);
          }
          // If search fails or no results, return original item
          return {
            name: item.name,
            quantity: item.quantity,
          };
        })
      );

      router.push({
        pathname: "/(add)/scan-results",
        params: {
          items: JSON.stringify(enrichedItems),
          durationMs: String(elapsedMs),
          llmMs: json.durationMs ? String(json.durationMs) : undefined,
        },
      });
    } catch (error) {
      console.error("Scan error", error);
    } finally {
      setIsScanning(false);
    }
  }, [buildOptimizedDataUrl, fileUri, isScanning, router]);
  // Animate a green linear-gradient sweep while scanning (Reanimated)
  useEffect(() => {
    const startPos = -60;
    if (!isScanning || previewHeight <= 0) {
      cancelAnimation(scanY);
      scanY.value = startPos;
      return;
    }
    scanY.value = startPos;
    scanY.value = withRepeat(
      withSequence(
        withTiming(previewHeight, {
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
        }),
        withTiming(startPos, { duration: 0 })
      ),
      -1,
      false
    );
  }, [isScanning, previewHeight, scanY]);

  const scanAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanY.value }],
  }));

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <View style={[styles.safeArea]}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityLabel="Close preview"
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Preview</Text>
          <View style={{ width: 42 }} />
        </View>
        <View
          style={styles.imageWrapper}
          onLayout={(e) => setPreviewHeight(e.nativeEvent.layout.height)}
        >
          {fileUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: fileUri }}
                style={styles.image}
                resizeMode="contain"
              />
              {isScanning && previewHeight > 0 && (
                <Animated.View
                  pointerEvents="none"
                  style={[styles.scannerOverlay, scanAnimatedStyle]}
                >
                  <LinearGradient
                    colors={[
                      "rgba(0, 255, 128, 0)",
                      "rgba(0, 255, 128, 0.35)",
                      "rgba(0, 255, 128, 0)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.scannerGradient}
                  />
                </Animated.View>
              )}
            </View>
          ) : (
            <Text style={styles.missingText}>Image not available</Text>
          )}
        </View>

        {!isScanning && (
          <View style={styles.actions}>
            <Pressable
              onPress={onRetry}
              style={[styles.button, styles.secondary]}
              accessibilityLabel="Retry"
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>
                Retry
              </Text>
            </Pressable>
            <Pressable
              onPress={onScan}
              style={[styles.button, styles.primary]}
              accessibilityLabel="Scan"
            >
              <Text style={styles.buttonText}>Scan</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  imageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 120,
    top: 0,
    overflow: "hidden",
  },
  scannerGradient: {
    flex: 1,
  },
  missingText: {
    color: "#fff",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  button: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: "#fff",
  },
  disabledButton: {
    opacity: 0.65,
  },
  secondary: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  secondaryText: {
    color: "#fff",
  },
});
