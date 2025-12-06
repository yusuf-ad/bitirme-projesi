import { Colors } from "@/constants/theme";
import { useLanguage } from "@/hooks/useLanguage";
import { StyleSheet, Text, View } from "react-native";

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  const { t } = useLanguage();
  
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>{message || t("recipes.noRecipesFound")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
    fontWeight: "500",
  },
});
