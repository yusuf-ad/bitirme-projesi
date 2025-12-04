import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface ListEmptyComponentProps {
  isSearching: boolean;
  hasSearched: boolean;
  searchResultsCount: number;
}

export const ListEmptyComponent = ({
  isSearching,
  hasSearched,
  searchResultsCount,
}: ListEmptyComponentProps) => {
  if (isSearching) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.lilac[500]} />
          <Text style={styles.loadingText}>Searching ingredients...</Text>
        </View>
      </View>
    );
  }
  if (hasSearched && searchResultsCount === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconWrapper}>
          <Ionicons name="search-outline" size={48} color={Colors.gray[300]} />
        </View>
        <Text style={styles.emptyTitle}>No ingredients found</Text>
        <Text style={styles.emptyText}>Try a different search term</Text>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingContent: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.gray[400],
  },
});
