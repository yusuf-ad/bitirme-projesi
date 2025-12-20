import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import type { PreviewFooterProps } from "./types";

export function PreviewFooter({
  onSave,
  isSaving,
  isAddingToShoppingList,
}: PreviewFooterProps) {
  const isDisabled = isSaving || isAddingToShoppingList;

  return (
    <View style={styles.footer}>
      <CustomButton
        containerStyle={[
          styles.saveButton,
          isDisabled && styles.saveButtonDisabled,
        ]}
        onPress={onSave}
        disabled={isDisabled}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.saveButtonText}>Save Meal Plan</Text>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </>
        )}
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.lilac[800],
    borderRadius: 14,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: -0.2,
  },
});
