import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface MealPlanFooterProps {
  onCreatePress: () => void;
  isGenerating: boolean;
}

export function MealPlanFooter({
  onCreatePress,
  isGenerating,
}: MealPlanFooterProps) {
  return (
    <View style={styles.footer}>
      <CustomButton
        containerStyle={styles.createButton}
        onPress={onCreatePress}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <ActivityIndicator color={Colors.background.primary} />
        ) : (
          <Text style={styles.createButtonText}>Create</Text>
        )}
      </CustomButton>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  createButton: {
    paddingVertical: 14,
    backgroundColor: Colors.lilac[900],
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.background.primary,
  },
});

