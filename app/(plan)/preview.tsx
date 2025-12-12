import { CelebrationModal } from "@/components/CelebrationModal";
import { Colors } from "@/constants/theme";
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
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MealPlanPreview() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mealSelectionRef = useRef<MealSelectionModalHandle>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleShoppingListAction = () => {
    setShowSuccessModal(false);
    router.replace("/shopping-list");
  };

  const handleHomeAction = () => {
    setShowSuccessModal(false);
    router.dismissTo("/");
  };

  const {
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
    handleSaveMealPlan,
    handleGenerateWithAI,
    handleReplaceMeal,
    handleMealPress,
    getMealForType,
  } = useMealPlanPreview({
    mealSelectionRef,
    onSaveSuccess: () => setShowSuccessModal(true),
  });

  const renderDayMeals = (mealType: MealType) => {
    const mealData = getMealForType(mealType);

    // Show empty state with "Generate with AI" button if no data
    if (!mealData) {
      return (
        <EmptyMealState
          key={mealType}
          mealType={mealType}
          onGenerateWithAI={handleGenerateWithAI}
          onReplace={handleReplaceMeal}
        />
      );
    }

    const { meal, isAiGenerated } = mealData;

    return (
      <View key={mealType}>
        <Text style={styles.mealTypeHeader}>{capitalizeFirst(mealType)}</Text>
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
        },
      ]}
    >
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
        <Text style={styles.description}>
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
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.text.primary,
    marginVertical: 12,
  },
  mealTypeHeader: {
    fontSize: 22,
    fontWeight: "700",
    color: "#141217",
    marginTop: 20,
  },
});
