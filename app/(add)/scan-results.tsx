import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScannedIngredient {
  name: string;
  quantity: string;
  spoonacularId?: number;
  spoonacularName?: string;
  spoonacularImage?: string;
}

export default function ScanResults() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    items?: string;
    durationMs?: string;
    llmMs?: string;
  }>();
  const { top } = useSafeAreaInsets();

  const INGREDIENT_IMAGE_BASE_URL =
    "https://spoonacular.com/cdn/ingredients_100x100";

  const items = useMemo(() => {
    try {
      const parsed = params.items ? JSON.parse(params.items) : [];
      return Array.isArray(parsed) ? parsed : [];
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
            keyExtractor={(it, idx) => `${it.name}-${idx}`}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }: { item: ScannedIngredient }) => (
              <View style={styles.row}>
                {item.spoonacularImage ? (
                  <Image
                    source={{
                      uri: `${INGREDIENT_IMAGE_BASE_URL}/${item.spoonacularImage}`,
                    }}
                    style={styles.ingredientImage}
                  />
                ) : (
                  <View style={styles.ingredientImagePlaceholder}>
                    <Ionicons name="leaf-outline" size={20} color="#16a34a" />
                  </View>
                )}
                <View style={styles.rowContent}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.rowText}>
                      {item.spoonacularName || item.name}
                    </Text>
                    {item.spoonacularId && (
                      <Text style={styles.idText}>ID: {item.spoonacularId}</Text>
                    )}
                  </View>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                </View>
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
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  ingredientImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  ingredientImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  nameContainer: {
    flex: 1,
    gap: 2,
  },
  rowText: {
    fontSize: 16,
    color: "#111",
    textTransform: "capitalize",
    fontWeight: "600",
  },
  idText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "400",
  },
  quantityText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
});
