import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface FavoritesEmptyStateProps {
  onExplore: () => void;
}

export function FavoritesEmptyState({ onExplore }: FavoritesEmptyStateProps) {
  const handleExplorePress = async () => {
    await Haptics.selectionAsync();
    onExplore();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrapper}>
        <Ionicons name="heart-outline" size={32} color={Colors.lilac[900]} />
      </View>

      <Text style={styles.title}>No favorite recipes yet</Text>
      <Text style={styles.subtitle}>
        All recipes you like in the Discover section will be collected here. Start
        searching to choose your daily inspiration.
      </Text>

      <Pressable
        onPress={handleExplorePress}
        style={styles.ctaButton}
        android_ripple={{ color: Colors.lilac[700] }}
        accessibilityRole="button"
        accessibilityLabel="Return to Discover tab"
      >
        <Text style={styles.ctaText}>Return to Discover</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: Colors.background.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.lilac[200],
    shadowColor: Colors.background.dark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    gap: 12,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
  ctaButton: {
    marginTop: 8,
    backgroundColor: Colors.lilac[900],
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 999,
  },
  ctaText: {
    color: Colors.background.surface,
    fontWeight: "600",
    fontSize: 14,
  },
});

