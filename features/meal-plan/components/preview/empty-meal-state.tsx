import ReplaceIcon from "@/assets/icons/replace-icon";
import { Colors } from "@/constants/theme";
import CustomButton from "@/shared/components/custom-button";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { capitalizeFirst } from "./preview-utils";
import type { EmptyMealStateProps } from "./types";

export function EmptyMealState({
  mealType,
  onGenerateWithAI,
  onReplace,
}: EmptyMealStateProps) {
  const mealTypeLabel = capitalizeFirst(mealType);

  return (
    <View>
      <Text style={styles.mealTypeHeader}>{mealTypeLabel}</Text>
      <View style={styles.skeletonMealItem}>
        {/* Skeleton Image */}
        <View style={styles.skeletonImage}>
          <MaterialIcons name="image" size={28} color={Colors.gray[400]} />
        </View>
        {/* Skeleton Content */}
        <View style={styles.skeletonContent}>
          <View style={styles.skeletonTitleLine} />
          <View style={styles.skeletonDetailLine} />
          {/* AI Generate Button */}
          <Pressable
            style={styles.aiGenerateButton}
            onPress={() => onGenerateWithAI(mealType)}
          >
            <MaterialIcons name="auto-awesome" size={16} color="#fff" />
            <Text style={styles.aiGenerateButtonText}>Generate with AI</Text>
          </Pressable>
        </View>
        {/* Replace Button */}
        <CustomButton
          containerStyle={styles.replaceButton}
          onPress={() => onReplace(mealType)}
        >
          <ReplaceIcon />
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mealTypeHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141217",
    marginTop: 20,
  },
  skeletonMealItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingVertical: 12,
  },
  skeletonImage: {
    width: 73,
    height: 73,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderStyle: "dashed",
  },
  skeletonContent: {
    flex: 1,
    gap: 8,
  },
  skeletonTitleLine: {
    height: 16,
    width: "70%",
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  skeletonDetailLine: {
    height: 12,
    width: "40%",
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  aiGenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: Colors.lilac[900],
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  aiGenerateButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  replaceButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lilac[900],
    borderRadius: 8,
  },
});
