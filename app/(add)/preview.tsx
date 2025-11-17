import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  Image,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PhotoPreview() {
  const router = useRouter();
  const params = useLocalSearchParams<{ uri?: string }>();
  const insets = useSafeAreaInsets();

  const fileUri = useMemo(() => {
    const raw = Array.isArray(params.uri) ? params.uri[0] : params.uri;
    if (!raw) return undefined;
    return raw.startsWith("file://") ? raw : `file://${raw}`;
  }, [params.uri]);

  const onRetry = () => {
    router.replace("/(add)/camera");
  };

  const onScan = () => {
    // Placeholder for future scan workflow integration
    // You can navigate to another route or start processing here
    // For now, just give minimal feedback
    console.log("Scan requested for:", fileUri);
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
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

        <View style={styles.imageWrapper}>
          {fileUri ? (
            <Image
              source={{ uri: fileUri }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.missingText}>Image not available</Text>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={onRetry}
            style={[styles.button, styles.secondary]}
            accessibilityLabel="Retry"
          >
            <Text style={[styles.buttonText, styles.secondaryText]}>Retry</Text>
          </Pressable>
          <Pressable
            onPress={onScan}
            style={[styles.button, styles.primary]}
            accessibilityLabel="Scan"
          >
            <Text style={styles.buttonText}>Scan</Text>
          </Pressable>
        </View>
      </SafeAreaView>
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
  },
  image: {
    width: "100%",
    height: "100%",
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
