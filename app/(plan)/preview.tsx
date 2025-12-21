import { CelebrationModal } from "@/components/CelebrationModal";
import { getThemeColors } from "@/constants/theme";
import {
    EmptyMealState,
    LoadingOverlay,
    MealItem,
    PreviewFooter,
    PreviewHeader,
    useMealPlanPreview,
} from "@/features/meal-plan";
import type { MealSelectionModalHandle } from "@/features/meal-plan/components/meal-selection-modal";
import { MealSelectionModal } from "@/features/meal-plan/components/meal-selection-modal";
import { capitalizeFirst } from "@/features/meal-plan/components/preview";
import type { MealType } from "@/lib/utils";
import { useTheme } from "@/providers/theme-provider";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MealPlanPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mealSelectionRef = useRef<MealSelectionModalHandle>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isDark } = useTheme();
  const themeColors = getThemeColors(isDark, true);

  const {
    mealPlan,
    isSaving,
    isAddingToShoppingList,
    activeMealType,
    isLoadingMore,
    modalMeals,
    hasMorePages,
    modalTitle,
    handleMealSelect,
    handleModalDismiss,
    handleLoadMore,
    handleSaveMealPlan: originalSaveMealPlan,
    handleGenerateWithAI,
    handleReplaceMeal,
    handleMealPress,
    getMealForType,
  } = useMealPlanPreview({
    mealSelectionRef,
    onSaveSuccess: () => setShowSuccessModal(true),
  });

  // Wrapper to show success modal only after successful saving
  const handleSaveMealPlan = useCallback(async () => {
    const success = await originalSaveMealPlan();
    if (success) {
      setShowSuccessModal(true);
    }
  }, [originalSaveMealPlan]);

  // Navigate to shopping list
  const handleShoppingListAction = useCallback(() => {
    setShowSuccessModal(false);
    router.dismissTo("/shopping-list");
  }, [router]);

  // Navigate to home
  const handleHomeAction = useCallback(() => {
    setShowSuccessModal(false);
    router.dismissTo("/");
  }, [router]);

  const renderDayMeals = (mealType: MealType) => {
    // Check if this meal type exists in the plan
    // We use a more robust check since mealPlan might have string keys
    const planData = (mealPlan as any)?.[mealType];
    if (!planData) {
      return null;
    }

    const mealData = getMealForType(mealType);

    // Show empty state with "Generate with AI" button if no data
    if (!mealData) {
      return (
        <View key={mealType} style={[styles.mealCard, { backgroundColor: themeColors.background.surface }]}>
          <Text style={[styles.mealTypeHeader, { color: themeColors.text.primary }]}>{capitalizeFirst(mealType)}</Text>
          <EmptyMealState
            mealType={mealType}
            onGenerateWithAI={handleGenerateWithAI}
            onReplace={handleReplaceMeal}
          />
        </View>
      );
    }

    const { meal, isAiGenerated } = mealData;

    return (
      <View key={mealType} style={[styles.mealCard, { backgroundColor: themeColors.background.surface }]}>
        <Text style={[styles.mealTypeHeader, { color: themeColors.text.primary }]}>{capitalizeFirst(mealType)}</Text>
        <MealItem
          meal={meal}
          mealType={mealType}
          isAiGenerated={isAiGenerated}
          onReplace={() => handleReplaceMeal(mealType)}
          onPress={() => handleMealPress(meal, mealType)}
        />
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          backgroundColor: themeColors.background.primary,
        },
      ]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      {/* Header */}
      <PreviewHeader
        onBack={() => router.back()}
        onClose={() => router.dismissTo("/")}
      />

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.description, { color: themeColors.text.secondary }]}>
          Here are the recipes we&apos;ve chosen for your meal plan. Feel free
          to swap out any that you don&apos;t like!
        </Text>

        {/* Meal Types */}
        {renderDayMeals("breakfast")}
        {renderDayMeals("lunch")}
        {renderDayMeals("dinner")}
      </ScrollView>

      {/* Footer */}
      <PreviewFooter
        onSave={handleSaveMealPlan}
        isSaving={isSaving}
        isAddingToShoppingList={isAddingToShoppingList}
      />

      {/* Loading Overlay for Shopping List */}
      <LoadingOverlay visible={isAddingToShoppingList} />

      <MealSelectionModal
        ref={mealSelectionRef}
        meals={Array.isArray(modalMeals) ? modalMeals : []}
        selectedIndex={-1}
        title={modalTitle}
        onSelect={handleMealSelect}
        onDismiss={handleModalDismiss}
        onGenerateMore={
          activeMealType
            ? () => {
                mealSelectionRef.current?.dismiss();
                handleGenerateWithAI(activeMealType);
              }
            : undefined
        }
        onLoadMore={handleLoadMore}
        isLoadingMore={isLoadingMore}
        hasMorePages={hasMorePages}
      />

      <CelebrationModal
        visible={showSuccessModal}
        type="meal-plan-saved"
        onClose={() => setShowSuccessModal(false)}
        onAction={handleShoppingListAction}
        onSecondaryAction={handleHomeAction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  mealCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  mealTypeHeader: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
});

