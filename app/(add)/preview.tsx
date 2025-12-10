import { parseIngredients } from "@/lib/spoonacular";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
  const params = useLocalSearchParams<{ uri?: string; destination?: string }>();
  const destination = params.destination || "pantry";
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(0);
  const [isCropMode, setIsCropMode] = useState(false);
  const [imageLayout, setImageLayout] = useState({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });
  const [croppedUri, setCroppedUri] = useState<string | null>(null);
  const scanY = useSharedValue(-60);

  // Crop frame position and size
  const cropX = useSharedValue(50);
  const cropY = useSharedValue(50);
  const cropWidth = useSharedValue(200);
  const cropHeight = useSharedValue(200);

  const fileUri = useMemo(() => {
    const raw = Array.isArray(params.uri) ? params.uri[0] : params.uri;
    if (!raw) return undefined;
    return raw.startsWith("file://") ? raw : `file://${raw}`;
  }, [params.uri]);

  const displayUri = croppedUri || fileUri;

  const onRetry = () => {
    router.replace("/(add)/camera");
  };

  // Initialize crop frame when entering crop mode - cover entire image
  useEffect(() => {
    if (isCropMode && imageLayout.width > 0 && imageLayout.height > 0) {
      cropWidth.value = imageLayout.width;
      cropHeight.value = imageLayout.height;
      cropX.value = 0;
      cropY.value = 0;
    }
  }, [isCropMode, imageLayout, cropWidth, cropHeight, cropX, cropY]);

  const onEnterCropMode = () => {
    setIsCropMode(true);
  };

  const onCancelCrop = () => {
    setIsCropMode(false);
  };

  const onApplyCrop = async () => {
    if (!fileUri) return;

    try {
      const sourceUri = croppedUri || fileUri;

      // Get image dimensions
      const img = await ImageManipulator.manipulateAsync(sourceUri, [], {});

      // Calculate scale factor between displayed image and actual image
      const scaleX = img.width / imageLayout.width;
      const scaleY = img.height / imageLayout.height;

      // Convert crop coordinates to actual image coordinates
      const cropData = {
        originX: Math.round(cropX.value * scaleX),
        originY: Math.round(cropY.value * scaleY),
        width: Math.round(cropWidth.value * scaleX),
        height: Math.round(cropHeight.value * scaleY),
      };

      const cropped = await ImageManipulator.manipulateAsync(
        sourceUri,
        [{ crop: cropData }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setCroppedUri(cropped.uri);
      setIsCropMode(false);
    } catch (error) {
      console.error("Crop error:", error);
    }
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
    const sourceUri = croppedUri || fileUri;
    if (!sourceUri) return undefined;

    try {
      const optimized = await ImageManipulator.manipulateAsync(
        sourceUri,
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
      const fallback = await (LegacyFS as any).readAsStringAsync(sourceUri, {
        encoding: "base64",
      });
      return `data:image/jpeg;base64,${fallback}`;
    }
  }, [fileUri, croppedUri]);

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

      // Search for ingredients using batch parsing to avoid rate limits
      interface EnrichedItem {
        name: string;
        quantity: string;
        spoonacularId?: number;
        spoonacularName?: string;
        spoonacularImage?: string;
      }
      const enrichedItems: EnrichedItem[] = [];
      try {
        // Create a list of ingredient strings for batch parsing (e.g. "1 cup sugar")
        // We use the quantity provided by LLM + the name
        const ingredientStrings = items.map(
          (item) => `${item.quantity} ${item.name}`
        );

        // Use parseIngredients for batch processing (1 request instead of N)
        const parsedResults = await parseIngredients(ingredientStrings);

        // Map results back to items
        items.forEach((item, index) => {
          const parsed = parsedResults[index];
          // Check if parsed result exists and has an ID (valid match)
          if (parsed && parsed.id) {
            enrichedItems.push({
              name: item.name,
              quantity: item.quantity,
              spoonacularId: parsed.id,
              spoonacularName: parsed.name,
              spoonacularImage: parsed.image,
            });
          } else {
            // No match found, use original item
            enrichedItems.push({
              name: item.name,
              quantity: item.quantity,
            });
          }
        });
      } catch (error) {
        console.error("Batch ingredient search failed:", error);
        // Fallback: Use original items without enrichment if API fails
        items.forEach((item) => {
          enrichedItems.push({
            name: item.name,
            quantity: item.quantity,
          });
        });
      }

      router.push({
        pathname: "/(add)/scan-results",
        params: {
          items: JSON.stringify(enrichedItems),
          durationMs: String(elapsedMs),
          llmMs: json.durationMs ? String(json.durationMs) : undefined,
          destination,
        },
      });
    } catch (error) {
      console.error("Scan error", error);
    } finally {
      setIsScanning(false);
    }
  }, [buildOptimizedDataUrl, fileUri, isScanning, router, destination]);
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

  // Gesture handlers for crop frame
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const startWidth = useSharedValue(0);
  const startHeight = useSharedValue(0);

  // Main pan gesture for moving the crop frame
  const panGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startX.value = cropX.value;
      startY.value = cropY.value;
    })
    .onUpdate((event) => {
      "worklet";
      const newX = startX.value + event.translationX;
      const newY = startY.value + event.translationY;

      // Constrain within image bounds
      cropX.value = Math.max(
        0,
        Math.min(newX, imageLayout.width - cropWidth.value)
      );
      cropY.value = Math.max(
        0,
        Math.min(newY, imageLayout.height - cropHeight.value)
      );
    });

  // Bottom-right corner resize gesture
  const resizeBottomRightGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newWidth = Math.max(
        minSize,
        Math.min(
          startWidth.value + event.translationX,
          imageLayout.width - cropX.value
        )
      );
      const newHeight = Math.max(
        minSize,
        Math.min(
          startHeight.value + event.translationY,
          imageLayout.height - cropY.value
        )
      );
      cropWidth.value = newWidth;
      cropHeight.value = newHeight;
    });

  // Top-left corner resize gesture
  const resizeTopLeftGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startX.value = cropX.value;
      startY.value = cropY.value;
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const deltaX = event.translationX;
      const deltaY = event.translationY;

      const newX = Math.max(
        0,
        Math.min(
          startX.value + deltaX,
          startX.value + startWidth.value - minSize
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          startY.value + deltaY,
          startY.value + startHeight.value - minSize
        )
      );

      cropWidth.value = startWidth.value - (newX - startX.value);
      cropHeight.value = startHeight.value - (newY - startY.value);
      cropX.value = newX;
      cropY.value = newY;
    });

  // Top-right corner resize gesture
  const resizeTopRightGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startY.value = cropY.value;
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newWidth = Math.max(
        minSize,
        Math.min(
          startWidth.value + event.translationX,
          imageLayout.width - cropX.value
        )
      );
      const newY = Math.max(
        0,
        Math.min(
          startY.value + event.translationY,
          startY.value + startHeight.value - minSize
        )
      );

      cropWidth.value = newWidth;
      cropHeight.value = startHeight.value - (newY - startY.value);
      cropY.value = newY;
    });

  // Bottom-left corner resize gesture
  const resizeBottomLeftGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startX.value = cropX.value;
      startWidth.value = cropWidth.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newX = Math.max(
        0,
        Math.min(
          startX.value + event.translationX,
          startX.value + startWidth.value - minSize
        )
      );
      const newHeight = Math.max(
        minSize,
        Math.min(
          startHeight.value + event.translationY,
          imageLayout.height - cropY.value
        )
      );

      cropWidth.value = startWidth.value - (newX - startX.value);
      cropHeight.value = newHeight;
      cropX.value = newX;
    });

  // Edge resize gestures
  const resizeTopGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startY.value = cropY.value;
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newY = Math.max(
        0,
        Math.min(
          startY.value + event.translationY,
          startY.value + startHeight.value - minSize
        )
      );
      cropHeight.value = startHeight.value - (newY - startY.value);
      cropY.value = newY;
    });

  const resizeBottomGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startHeight.value = cropHeight.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newHeight = Math.max(
        minSize,
        Math.min(
          startHeight.value + event.translationY,
          imageLayout.height - cropY.value
        )
      );
      cropHeight.value = newHeight;
    });

  const resizeLeftGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startX.value = cropX.value;
      startWidth.value = cropWidth.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newX = Math.max(
        0,
        Math.min(
          startX.value + event.translationX,
          startX.value + startWidth.value - minSize
        )
      );
      cropWidth.value = startWidth.value - (newX - startX.value);
      cropX.value = newX;
    });

  const resizeRightGesture = Gesture.Pan()
    .onStart(() => {
      "worklet";
      startWidth.value = cropWidth.value;
    })
    .onUpdate((event) => {
      "worklet";
      const minSize = 50;
      const newWidth = Math.max(
        minSize,
        Math.min(
          startWidth.value + event.translationX,
          imageLayout.width - cropX.value
        )
      );
      cropWidth.value = newWidth;
    });

  const cropFrameStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: cropX.value,
    top: cropY.value,
    width: cropWidth.value,
    height: cropHeight.value,
  }));

  const cropMaskStyle = useAnimatedStyle(() => ({
    position: "absolute",
    left: cropX.value,
    top: cropY.value,
    width: cropWidth.value,
    height: cropHeight.value,
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
          <Text style={styles.title}>{isCropMode ? "Crop" : "Preview"}</Text>
          {!isCropMode && !isScanning && (
            <Pressable
              style={styles.iconButton}
              onPress={onEnterCropMode}
              accessibilityLabel="Crop image"
            >
              <Ionicons name="crop" size={22} color="#fff" />
            </Pressable>
          )}
          {isCropMode && <View style={{ width: 42 }} />}
          {isScanning && <View style={{ width: 42 }} />}
        </View>
        <View
          style={styles.imageWrapper}
          onLayout={(e) => setPreviewHeight(e.nativeEvent.layout.height)}
        >
          {fileUri ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: displayUri }}
                style={styles.image}
                resizeMode="contain"
                onLayout={(e) => {
                  if (
                    e.nativeEvent.layout.width > 0 &&
                    e.nativeEvent.layout.height > 0
                  ) {
                    setImageLayout({
                      width: e.nativeEvent.layout.width,
                      height: e.nativeEvent.layout.height,
                      x: e.nativeEvent.layout.x,
                      y: e.nativeEvent.layout.y,
                    });
                  }
                }}
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
              {isCropMode && imageLayout.width > 0 && (
                <>
                  {/* Dark overlay for non-cropped areas */}
                  <View style={styles.cropOverlay} pointerEvents="none">
                    <Animated.View
                      style={[styles.cropClearArea, cropMaskStyle]}
                    />
                  </View>
                  {/* Crop frame with gesture */}
                  <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.cropFrame, cropFrameStyle]}>
                      <View style={styles.cropBorder} />

                      {/* Corner handles */}
                      <GestureDetector gesture={resizeTopLeftGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.cornerHandle,
                            styles.topLeft,
                          ]}
                        />
                      </GestureDetector>

                      <GestureDetector gesture={resizeTopRightGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.cornerHandle,
                            styles.topRight,
                          ]}
                        />
                      </GestureDetector>

                      <GestureDetector gesture={resizeBottomLeftGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.cornerHandle,
                            styles.bottomLeft,
                          ]}
                        />
                      </GestureDetector>

                      <GestureDetector gesture={resizeBottomRightGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.cornerHandle,
                            styles.bottomRight,
                          ]}
                        />
                      </GestureDetector>

                      {/* Edge handles */}
                      <GestureDetector gesture={resizeTopGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.edgeHandle,
                            styles.topEdge,
                          ]}
                        />
                      </GestureDetector>

                      <GestureDetector gesture={resizeBottomGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.edgeHandle,
                            styles.bottomEdge,
                          ]}
                        />
                      </GestureDetector>

                      <GestureDetector gesture={resizeLeftGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.edgeHandle,
                            styles.leftEdge,
                          ]}
                        />
                      </GestureDetector>

                      <GestureDetector gesture={resizeRightGesture}>
                        <Animated.View
                          style={[
                            styles.resizeHandle,
                            styles.edgeHandle,
                            styles.rightEdge,
                          ]}
                        />
                      </GestureDetector>

                      <Text style={styles.cropHint}>
                        Drag to move • Corners/Edges to resize
                      </Text>
                    </Animated.View>
                  </GestureDetector>
                </>
              )}
            </View>
          ) : (
            <Text style={styles.missingText}>Image not available</Text>
          )}
        </View>

        {!isScanning && !isCropMode && (
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
        {isCropMode && (
          <View style={styles.actions}>
            <Pressable
              onPress={onCancelCrop}
              style={[styles.button, styles.secondary]}
              accessibilityLabel="Cancel crop"
            >
              <Text style={[styles.buttonText, styles.secondaryText]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onApplyCrop}
              style={[styles.button, styles.primary]}
              accessibilityLabel="Apply crop"
            >
              <Text style={styles.buttonText}>Apply</Text>
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
  cropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  cropClearArea: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  cropFrame: {
    justifyContent: "center",
    alignItems: "center",
  },
  cropBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: "#fff",
    borderStyle: "solid",
  },
  cropHint: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resizeHandle: {
    position: "absolute",
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#000",
  },
  cornerHandle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  edgeHandle: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  topLeft: {
    top: -10,
    left: -10,
  },
  topRight: {
    top: -10,
    right: -10,
  },
  bottomLeft: {
    bottom: -10,
    left: -10,
  },
  bottomRight: {
    bottom: -10,
    right: -10,
  },
  topEdge: {
    top: -3,
    left: "35%",
    width: "30%",
    height: 6,
    borderRadius: 3,
  },
  bottomEdge: {
    bottom: -3,
    left: "35%",
    width: "30%",
    height: 6,
    borderRadius: 3,
  },
  leftEdge: {
    left: -3,
    top: "35%",
    width: 6,
    height: "30%",
    borderRadius: 3,
  },
  rightEdge: {
    right: -3,
    top: "35%",
    width: 6,
    height: "30%",
    borderRadius: 3,
  },
});
