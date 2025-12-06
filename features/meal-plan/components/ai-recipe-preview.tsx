import { Colors } from "@/constants/theme";
import { Recipe } from "@/lib/spoonacular";
import CustomButton from "@/shared/components/custom-button";
import { findMacro, findNutrientValue } from "@/shared/utils/nutrition";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Placeholder image for AI-generated recipes
const AI_RECIPE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80";

interface AIRecipePreviewProps {
  recipe: Recipe & { isAiGenerated?: boolean };
  onConfirm: () => void;
  onRegenerate: () => void;
  onBack: () => void;
  mealSlot?: string;
  isRegenerating?: boolean;
  isSaving?: boolean;
}

interface MacroData {
  label: string;
  amountLabel: string;
  percentLabel: string;
  color: string;
  percentValue: number;
}

const MACRO_COLOR_MAP: Record<string, string> = {
  protein: "#41D5B7",
  fat: "#FCB205",
  carbs: "#CB8395",
};

export function AIRecipePreview({
  recipe,
  onConfirm,
  onRegenerate,
  onBack,
  mealSlot,
  isRegenerating = false,
  isSaving = false,
}: AIRecipePreviewProps) {
  const insets = useSafeAreaInsets();

  const nutrients = useMemo(
    () => recipe.nutrition?.nutrients ?? [],
    [recipe.nutrition?.nutrients]
  );

  const readyInMinutes = recipe.readyInMinutes
    ? `${recipe.readyInMinutes} min`
    : "N/A";

  const calories = findNutrientValue("Calories", nutrients);
  const caloriesAmount =
    typeof calories?.amount === "number" ? Math.round(calories.amount) : null;

  const macros = useMemo<MacroData[]>(() => {
    const protein = findMacro("Protein", nutrients);
    const fat = findMacro("Fat", nutrients);
    const carbs = findMacro("Carbohydrates", nutrients);
    const totalGrams = protein.amount + fat.amount + carbs.amount || 1;

    const macroList = [
      {
        label: "Protein",
        amount: protein.amount,
        unit: protein.unit,
        color: MACRO_COLOR_MAP.protein,
      },
      {
        label: "Fat",
        amount: fat.amount,
        unit: fat.unit,
        color: MACRO_COLOR_MAP.fat,
      },
      {
        label: "Carbs",
        amount: carbs.amount,
        unit: carbs.unit,
        color: MACRO_COLOR_MAP.carbs,
      },
    ];

    return macroList.map((macro) => {
      const percentValue = Math.round((macro.amount / totalGrams) * 100);
      const normalizedUnit = macro.unit
        ? macro.unit.toLowerCase() === "g"
          ? "g"
          : macro.unit
        : "g";
      return {
        label: macro.label,
        amountLabel: `${Math.round(macro.amount)}${normalizedUnit}`,
        percentLabel: `${percentValue}%`,
        percentValue,
        color: macro.color,
      };
    });
  }, [nutrients]);

  const instructions = useMemo(() => {
    if (recipe.analyzedInstructions?.length) {
      return recipe.analyzedInstructions.flatMap((section) =>
        section.steps.map((step) => ({
          number: step.number,
          text: step.step,
        }))
      );
    }
    return [];
  }, [recipe.analyzedInstructions]);

  const handleConfirm = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm();
  }, [onConfirm]);

  const handleRegenerate = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRegenerate();
  }, [onRegenerate]);

  const handleBack = useCallback(async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onBack();
  }, [onBack]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={Colors.text.primary}
          />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={styles.aiBadge}>
            <MaterialCommunityIcons
              name="robot-happy"
              size={14}
              color={Colors.lilac[700]}
            />
            <Text style={styles.aiBadgeText}>AI Generated</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: recipe.image || AI_RECIPE_PLACEHOLDER }}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay}>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={14} color="#fff" />
              <Text style={styles.badgeText}>{readyInMinutes}</Text>
            </View>
            {caloriesAmount && (
              <View style={styles.badge}>
                <Ionicons name="flame-outline" size={14} color="#fff" />
                <Text style={styles.badgeText}>{caloriesAmount} kcal</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title & Summary */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{recipe.title}</Text>
          {recipe.summary && (
            <Text style={styles.summary} numberOfLines={3}>
              {recipe.summary.replace(/<[^>]*>/g, "")}
            </Text>
          )}
          {recipe.servings && (
            <View style={styles.servingsRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={16}
                color={Colors.text.secondary}
              />
              <Text style={styles.servingsText}>
                {recipe.servings} servings
              </Text>
            </View>
          )}
        </View>

        {/* Macros Section */}
        <View style={styles.macrosSection}>
          <Text style={styles.sectionTitle}>Nutrition per serving</Text>
          <View style={styles.macrosGrid}>
            {macros.map((macro) => (
              <View key={macro.label} style={styles.macroItem}>
                <View
                  style={[styles.macroBar, { backgroundColor: macro.color }]}
                >
                  <View
                    style={[
                      styles.macroBarFill,
                      {
                        width: `${macro.percentValue}%`,
                        backgroundColor: macro.color,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.macroLabel}>{macro.label}</Text>
                <Text style={styles.macroAmount}>{macro.amountLabel}</Text>
                <Text style={[styles.macroPercent, { color: macro.color }]}>
                  {macro.percentLabel}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Ingredients Section */}
        {recipe.extendedIngredients &&
          recipe.extendedIngredients.length > 0 && (
            <View style={styles.ingredientsSection}>
              <Text style={styles.sectionTitle}>Ingredients</Text>
              <View style={styles.ingredientsList}>
                {recipe.extendedIngredients.map((ingredient, index) => (
                  <View
                    key={`${ingredient.name}-${index}`}
                    style={styles.ingredientItem}
                  >
                    <View style={styles.ingredientBullet} />
                    <Text style={styles.ingredientText}>
                      {ingredient.original ||
                        `${ingredient.amount} ${ingredient.unit} ${ingredient.name}`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

        {/* Instructions Section */}
        {instructions.length > 0 && (
          <View style={styles.instructionsSection}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {instructions.map((step) => (
                <View key={step.number} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{step.number}</Text>
                  </View>
                  <Text style={styles.instructionText}>{step.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom spacer for footer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer Actions */}
      <View
        style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}
      >
        <Pressable
          style={styles.regenerateButton}
          onPress={handleRegenerate}
          disabled={isRegenerating}
        >
          <MaterialIcons
            name="refresh"
            size={20}
            color={isRegenerating ? Colors.gray[400] : Colors.lilac[700]}
          />
          <Text
            style={[
              styles.regenerateButtonText,
              isRegenerating && styles.disabledText,
            ]}
          >
            Regenerate
          </Text>
        </Pressable>

        <CustomButton
          containerStyle={styles.confirmButton}
          onPress={handleConfirm}
          disabled={isSaving || isRegenerating}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialIcons name="check" size={20} color="#fff" />
              <Text style={styles.confirmButtonText}>Add to Meal Plan</Text>
            </>
          )}
        </CustomButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 32,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.lilac[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.lilac[700],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  heroContainer: {
    position: "relative",
    height: 240,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroOverlay: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text.primary,
    lineHeight: 30,
  },
  summary: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  servingsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  servingsText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  macrosSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
    marginBottom: 12,
  },
  macrosGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  macroItem: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.background.surface,
    borderRadius: 12,
    padding: 12,
  },
  macroBar: {
    width: "100%",
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: 2,
    marginBottom: 8,
    overflow: "hidden",
  },
  macroBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 2,
  },
  macroAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
  },
  macroPercent: {
    fontSize: 12,
    fontWeight: "600",
  },
  ingredientsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  ingredientsList: {
    gap: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.lilac[500],
    marginTop: 6,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  instructionsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: "row",
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lilac[100],
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.lilac[700],
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: Colors.lilac[300],
    backgroundColor: Colors.lilac[100],
  },
  regenerateButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.lilac[700],
  },
  disabledText: {
    color: Colors.gray[400],
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.lilac[900],
    borderRadius: 99,
    paddingVertical: 14,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
