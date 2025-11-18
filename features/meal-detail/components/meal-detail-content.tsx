import { Colors } from "@/constants/theme";
import { Recipe } from "@/lib/spoonacular";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MealDetailContentProps {
  meal: Recipe;
  refreshing: boolean;
  onRefresh: () => void | Promise<void>;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  onBack?: () => void;
}

type Nutrient = {
  name?: string;
  amount?: number;
  unit?: string;
};

const TAB_ITEMS = [
  { key: "ingredients", label: "Ingredients" },
  { key: "instructions", label: "Instructions" },
] as const;

type TabKey = (typeof TAB_ITEMS)[number]["key"];

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

export function MealDetailContent({
  meal,
  refreshing,
  onRefresh,
  isFavorited = false,
  onToggleFavorite,
  onBack,
}: MealDetailContentProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("ingredients");

  const nutrients: Nutrient[] = meal.nutrition?.nutrients ?? [];
  const readyInMinutes = meal.readyInMinutes
    ? `${meal.readyInMinutes} min`
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
    if (meal.analyzedInstructions?.length) {
      return meal.analyzedInstructions[0].steps
        .map((step) => ({
          number: step.number,
          text: sanitizeText(step.step),
        }))
        .filter((step) => Boolean(step.text));
    }

    if (meal.instructions) {
      return sanitizeText(meal.instructions)
        .split(/\r?\n|\.\s+/)
        .map((text, index) => ({
          number: index + 1,
          text: text.trim(),
        }))
        .filter((item) => Boolean(item.text));
    }

    return [];
  }, [meal.analyzedInstructions, meal.instructions]);

  const handleTabPress = useCallback(
    async (tabKey: TabKey) => {
      if (tabKey === activeTab) {
        return;
      }
      await Haptics.selectionAsync();
      setActiveTab(tabKey);
    },
    [activeTab]
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.lilac[800]}
          colors={[Colors.lilac[800]]}
        />
      }
    >
      <View style={styles.heroWrapper}>
        <Image
          source={
            meal.image
              ? { uri: meal.image }
              : require("@/assets/images/meal-plan-hero.png")
          }
          style={styles.heroImage}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`${meal.title} hero image`}
        />

        {/* Back button overlay */}
        {onBack && (
          <Pressable
            onPress={onBack}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <View style={styles.iconButton}>
              <Ionicons name="chevron-back" size={24} color="#312A35" />
            </View>
          </Pressable>
        )}

        {/* Favorite button overlay */}
        {onToggleFavorite && (
          <Pressable
            onPress={onToggleFavorite}
            style={styles.favoriteButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel={
              isFavorited ? "Remove from favorites" : "Add to favorites"
            }
            accessibilityRole="button"
          >
            <Ionicons
              name={isFavorited ? "heart" : "heart-outline"}
              size={24}
              color="#F03E3E"
              style={styles.heartIcon}
            />
          </Pressable>
        )}
      </View>

      <View style={styles.sheet}>
        <Text style={styles.title} accessibilityRole="header">
          {meal.title}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Image
              source={require("@/assets/icons/clock-icon.svg")}
              style={styles.metaIcon}
              contentFit="contain"
            />
            <Text style={styles.metaText}>{readyInMinutes}</Text>
          </View>
          <Text style={styles.metaSeparator}>|</Text>
          <View style={styles.metaItem}>
            <Image
              source={require("@/assets/icons/flame-icon.svg")}
              style={styles.metaIcon}
              contentFit="contain"
            />
            <Text style={styles.metaText}>
              {caloriesAmount !== null ? `${caloriesAmount} kcal` : "—"}
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutritions</Text>
        </View>

        <View style={styles.macrosWrapper}>
          {macros.map((macro) => (
            <View key={macro.label} style={styles.macroColumn}>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      height: `${Math.min(macro.percentValue, 100)}%`,
                      backgroundColor: macro.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.macroInfo}>
                <Text style={styles.macroPercent}>{macro.percentLabel}</Text>
                <View style={styles.macroLabelContainer}>
                  <Text
                    style={[styles.macroAmount, { color: macro.color }]}
                    accessibilityLabel={`${macro.label} amount`}
                  >
                    {macro.amountLabel}
                  </Text>
                  <Text style={styles.macroLabel}>{macro.label}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.tabsContainer} accessibilityRole="tablist">
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => handleTabPress(tab.key)}
                style={[
                  styles.tabButton,
                  isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
              >
                <Text
                  style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeTab === "ingredients" ? (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {(meal.extendedIngredients ?? []).map((ingredient, index) => (
                <View
                  key={`${ingredient.id}-${ingredient.original}-${index}`}
                  style={styles.ingredientRow}
                >
                  <View style={styles.bulletPoint} />
                  <Text style={styles.ingredientText}>
                    {ingredient.original}
                  </Text>
                </View>
              ))}
              {(!meal.extendedIngredients ||
                meal.extendedIngredients.length === 0) && (
                <Text style={styles.emptyText}>
                  No ingredients were provided for this recipe.
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {instructions.length > 0 ? (
                instructions.map((step) => (
                  <View key={step.number} style={styles.stepRow}>
                    <View style={styles.stepBadge}>
                      <Text style={styles.stepBadgeText}>{step.number}</Text>
                    </View>
                    <Text style={styles.stepText}>{step.text}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>
                  No instructions were provided for this recipe.
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function sanitizeText(value: string | undefined) {
  if (!value) {
    return "";
  }
  return value.replace(/<\/?[^>]+(>|$)/g, "").trim();
}

function findNutrientValue(name: string, nutrients: Nutrient[]) {
  if (!Array.isArray(nutrients)) {
    return null;
  }
  return (
    nutrients.find(
      (nutrient) => nutrient.name?.toLowerCase() === name.toLowerCase()
    ) ?? null
  );
}

function findMacro(name: string, nutrients: Nutrient[]) {
  const nutrient = findNutrientValue(name, nutrients);
  return {
    amount: nutrient?.amount ?? 0,
    unit: nutrient?.unit ?? "g",
  };
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  heroWrapper: {
    width: "100%",
    height: 313,
    backgroundColor: Colors.gray[100],
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 10,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(242, 240, 244, 0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: 50,
    right: 10,
  },
  heartIcon: {
    opacity: 0.85,
  },
  sheet: {
    marginTop: -21,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: Colors.background.surface,
    gap: 16,
  },
  title: {
    fontFamily: "Inter",
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaIcon: {
    width: 18,
    height: 18,
  },
  metaText: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[600],
  },
  metaSeparator: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[400],
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text.primary,
    lineHeight: 16,
  },
  macrosWrapper: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 0,
    height: 81,
  },
  macroColumn: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "stretch",
    gap: 10,
    paddingHorizontal: 10,
  },
  progressTrack: {
    width: 8,
    alignSelf: "stretch",
    borderRadius: 4,
    backgroundColor: "#F5F2F5",
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  progressFill: {
    width: "100%",
    borderRadius: 4,
  },
  macroInfo: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    gap: 10,
  },
  macroPercent: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text.primary,
    lineHeight: 16,
  },
  macroLabelContainer: {
    height: 34,
  },
  macroAmount: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  macroLabel: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "500",
    color: Colors.text.primary,
    lineHeight: 16,
  },
  tabsContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    overflow: "hidden",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
  },
  tabButtonActive: {
    borderBottomColor: Colors.lilac[800],
  },
  tabButtonInactive: {
    borderBottomColor: Colors.gray[100],
  },
  tabLabel: {
    fontFamily: "Poppins",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[500],
  },
  tabLabelActive: {
    color: Colors.lilac[800],
  },
  contentSection: {
    gap: 16,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minHeight: 24,
    paddingVertical: 2,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.lilac[700],
    marginTop: 6,
  },
  ingredientText: {
    flex: 1,
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[700],
    lineHeight: 16,
  },
  emptyText: {
    fontFamily: "Inter",
    fontSize: 14,
    color: Colors.gray[500],
  },
  instructionsList: {
    gap: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lilac[800],
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepBadgeText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "500",
    color: Colors.background.surface,
    lineHeight: 16,
  },
  stepText: {
    flex: 1,
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "500",
    color: Colors.gray[700],
    lineHeight: 16,
  },
});
