import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import {
    DIET_OPTIONS,
    DietOption,
} from "./diet-options";

interface TasteDietPreferencesProps {
  title: string;
  description?: string;
  onSelectionChange?: (selectedDiets: string[]) => void;
  initialSelection?: string[];
}

export function TasteDietPreferences({
  title,
  description,
  onSelectionChange,
  initialSelection = [],
}: TasteDietPreferencesProps) {
  const [selectedDiets, setSelectedDiets] =
    useState<string[]>(initialSelection);

  useEffect(() => {
    setSelectedDiets(initialSelection);
  }, [initialSelection]);

  const toggleDiet = (dietId: string) => {
    // Single selection mode:
    // If already selected, deselect it. If not, select ONLY this one.
    const updatedSelection = selectedDiets.includes(dietId) ? [] : [dietId];

    setSelectedDiets(updatedSelection);
    onSelectionChange?.(updatedSelection);
  };

  const handleViewDiet = async (diet: DietOption) => {
    await Haptics.selectionAsync();
    router.push({
      pathname: "/(onboarding)/diet/[dietId]",
      params: { dietId: diet.id },
    });
  };

  const renderDietCard = (diet: DietOption) => {
    const isSelected = selectedDiets.includes(diet.id);

    return (
      <Pressable
        key={diet.id}
        onPress={() => toggleDiet(diet.id)}
        style={[styles.dietCard, isSelected && styles.dietCardSelected]}
      >
        {/* Left Side - Text Content */}
        <View style={styles.cardTextContainer}>
          <Text style={styles.dietLabel}>{diet.label}</Text>
          <Text style={styles.dietSubtitle}>{diet.subtitle}</Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              handleViewDiet(diet);
            }}
            style={styles.viewDietButton}
          >
            <Text style={styles.viewDietText}>View diet</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={14}
              color="#9B9FB3"
              style={{ marginLeft: 4 }}
            />
          </Pressable>
        </View>

        {/* Right Side - Image */}
        <Image
          source={diet.image}
          style={styles.dietImage}
          resizeMode="cover"
        />

        {/* Selection Indicator */}
        {isSelected && (
          <View style={styles.selectionCheckmark}>
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
          </View>
        )}

        {/* Gradient Overlay on Right */}
        <View style={styles.imageGradient} />
      </Pressable>
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      {/* Diet Cards */}
      <View style={styles.cardsContainer}>
        {DIET_OPTIONS.map((diet) => renderDietCard(diet))}
      </View>

      {/* Selection Summary */}
      {selectedDiets.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color="#548A6A"
            />
            <Text style={styles.summaryTitle}>Diet preference selected</Text>
          </View>

          {/* Selected Diet Tags */}
          <View style={styles.selectedTagsContainer}>
            {selectedDiets.map((dietId) => {
              const diet = DIET_OPTIONS.find((d) => d.id === dietId);
              return (
                <View key={dietId} style={styles.selectedTag}>
                  <Text style={styles.selectedTagLabel}>{diet?.label}</Text>
                  <Pressable
                    onPress={() => toggleDiet(dietId)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={14}
                      color="#FFFFFF"
                    />
                  </Pressable>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 0,
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  title: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 28,
    lineHeight: 34,
    color: "#22252B",
    marginBottom: 12,
  },
  description: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "#444955",
  },
  cardsContainer: {
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 15,
  },
  dietCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E8E3ED",
    height: 140,
    position: "relative",
  },
  dietCardSelected: {
    borderColor: "#548A6A",
    backgroundColor: "#F9FBFA",
  },
  cardTextContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    justifyContent: "center",
  },
  dietLabel: {
    fontFamily: "Inter",
    fontWeight: "700",
    fontSize: 20,
    color: "#22252B",
    marginBottom: 4,
  },
  dietSubtitle: {
    fontFamily: "Inter",
    fontWeight: "400",
    fontSize: 14,
    color: "#737780",
    marginBottom: 12,
  },
  viewDietButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDietText: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 13,
    color: "#9B9FB3",
  },
  dietImage: {
    width: 140,
    height: 140,
    marginLeft: "auto",
  },
  imageGradient: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 40,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
  },
  selectionCheckmark: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#548A6A",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  summaryContainer: {
    marginHorizontal: 15,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F0F7F3",
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#548A6A",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  summaryTitle: {
    fontFamily: "Inter",
    fontWeight: "600",
    fontSize: 14,
    color: "#548A6A",
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#548A6A",
    gap: 6,
  },
  selectedTagLabel: {
    fontFamily: "Inter",
    fontWeight: "500",
    fontSize: 12,
    color: "#FFFFFF",
  },
  bottomPadding: {
    height: 20,
  },
});
