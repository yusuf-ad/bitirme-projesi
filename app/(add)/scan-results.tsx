import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanResults() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    items?: string;
    durationMs?: string;
    llmMs?: string;
  }>();
  const { top } = useSafeAreaInsets();

  const items = useMemo(() => {
    try {
      const parsed = params.items ? JSON.parse(params.items) : [];
      return Array.isArray(parsed)
        ? parsed.map((s) => String(s)).filter(Boolean)
        : [];
    } catch {
      return [];
    }
  }, [params.items]);

  const secondsText = useMemo(() => {
    const ms = Number(params.durationMs ?? params.llmMs ?? 0);
    if (!ms || Number.isNaN(ms)) return null;
    const secs = (ms / 1000).toFixed(1);
    return `${secs}s`;
  }, [params.durationMs, params.llmMs]);

  return (
    <View style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: top }]}>
        <View style={styles.header}>
          <Pressable
            style={styles.iconButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#111" />
          </Pressable>
          <Text style={styles.title}>Detected Ingredients</Text>
          <View style={{ width: 42 }} />
        </View>

        {secondsText && (
          <View style={styles.metaBar}>
            <Ionicons name="time-outline" size={16} color="#6b7280" />
            <Text style={styles.metaText}>Scan time: {secondsText}</Text>
          </View>
        )}

        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No ingredients found</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(it, idx) => `${it}-${idx}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <Ionicons name="leaf-outline" size={18} color="#16a34a" />
                <Text style={styles.rowText}>{item}</Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  title: {
    color: "#111",
    fontSize: 16,
    fontWeight: "600",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#6b7280",
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  metaBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  rowText: {
    fontSize: 16,
    color: "#111",
    textTransform: "capitalize",
  },
});
