import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { StyleSheet, Text, View } from "react-native";

import type { PreviewFooterProps } from "./types";

export function PreviewFooter({
  onSave,
  isSaving,
  isAddingToShoppingList,
}: PreviewFooterProps) {
  return (
    <View style={styles.footer}>
      <CustomButton
        containerStyle={styles.saveButton}
        onPress={onSave}
        disabled={isSaving || isAddingToShoppingList}
      >
        <Text style={styles.saveButtonText}>
          {isSaving ? "Saving..." : "Save Meal Plan"}
        </Text>
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButton: {
    backgroundColor: Colors.lilac[900],
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 24,
    color: "#fff",
    textAlign: "center",
  },
});

