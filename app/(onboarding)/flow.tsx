import {
    OnboardingLayout,
    OnboardingNavigation,
    ProgressBar,
} from "@/features/onboarding";
import {
    getNextPage,
    getPageIndex,
    getPreviousPage,
    getTotalPages,
    ONBOARDING_PAGES,
} from "@/features/onboarding/config/pages-config";
import { BodyAge } from "@/features/onboarding/sections/body/body-age";
import { BodyCover } from "@/features/onboarding/sections/body/body-cover";
import { BodyGender } from "@/features/onboarding/sections/body/body-gender";
import { BodyHeight } from "@/features/onboarding/sections/body/body-height";
import { BodyWeight } from "@/features/onboarding/sections/body/body-weight";
import { GoalsContent } from "@/features/onboarding/sections/goals/goals-content";
import { GoalsCover } from "@/features/onboarding/sections/goals/goals-cover";
import {
    MealTimeBreakfast,
    MealTimeCover,
    MealTimeDinner,
    MealTimeLunch,
} from "@/features/onboarding/sections/meal-time";
import {
    TasteAllergies,
    TasteCookingSkills,
    TasteCover,
    TasteCuisines,
    TasteDietPreferences,
    TasteMeals,
} from "@/features/onboarding/sections/taste";
import { useOnboarding } from "@/providers/onboarding-provider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function OnboardingFlowScreen() {
  const params = useLocalSearchParams<{ section?: string; step?: string }>();
  const onboarding = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);

  // Default to first page if no params
  const section = params.section || "goals";
  const step = params.step ? parseInt(params.step, 10) : 0;

  // Find current page config
  const currentIndex = getPageIndex(section, step);
  const currentPage = ONBOARDING_PAGES[currentIndex] || ONBOARDING_PAGES[0];

  // Use context state instead of local state
  const selectedGoals = onboarding.selectedGoals;
  const setSelectedGoals = onboarding.setSelectedGoals;
  const selectedGender = onboarding.selectedGender;
  const setSelectedGender = onboarding.setSelectedGender;
  const age = onboarding.age;
  const setAge = onboarding.setAge;
  const height = onboarding.height;
  const setHeight = onboarding.setHeight;
  const weight = onboarding.weight;
  const setWeight = onboarding.setWeight;

  // Meal time state from context
  const breakfastTime = onboarding.breakfastTime;
  const setBreakfastTime = onboarding.setBreakfastTime;
  const lunchTime = onboarding.lunchTime;
  const setLunchTime = onboarding.setLunchTime;
  const dinnerTime = onboarding.dinnerTime;
  const setDinnerTime = onboarding.setDinnerTime;

  // Taste section state from context
  const selectedMeals = onboarding.selectedMeals;
  const setSelectedMeals = onboarding.setSelectedMeals;
  const selectedCuisines = onboarding.selectedCuisines;
  const setSelectedCuisines = onboarding.setSelectedCuisines;
  const dislikedCuisines = onboarding.dislikedCuisines;
  const setDislikedCuisines = onboarding.setDislikedCuisines;
  const selectedAllergies = onboarding.selectedAllergies;
  const setSelectedAllergies = onboarding.setSelectedAllergies;
  const selectedDietPreferences = onboarding.selectedDietPreferences;
  const setSelectedDietPreferences = onboarding.setSelectedDietPreferences;
  const dietNutritionTargets = onboarding.dietNutritionTargets;
  const selectedCookingSkill = onboarding.selectedCookingSkill;
  const setSelectedCookingSkill = onboarding.setSelectedCookingSkill;

  // Load data on mount
  useEffect(() => {
    onboarding.loadOnboardingData();
  }, []);

  // Helper function to get previous selected meal time page
  function getPreviousSelectedMealPage(currentMealComponent: string): { section: string; step: number } | null {
    const mealOrder = ["breakfast", "lunch", "dinner"];
    const mealSteps: Record<string, number> = { breakfast: 2, lunch: 3, dinner: 4 };
    
    const currentMealIndex = mealOrder.findIndex(m => currentMealComponent.includes(m));
    
    for (let i = currentMealIndex - 1; i >= 0; i--) {
      if (selectedMeals.includes(mealOrder[i])) {
        return {
          section: "meal-time",
          step: mealSteps[mealOrder[i]],
        };
      }
    }
    return null; // No previous selected meals
  }

  function handleBack() {
    const previousPage = getPreviousPage(currentPage.section, currentPage.step);

    // Handle meal-time page back navigation (skip unselected meals)
    const isMealTimePage = 
      currentPage.component === "meal-time-breakfast" ||
      currentPage.component === "meal-time-lunch" ||
      currentPage.component === "meal-time-dinner";

    if (isMealTimePage) {
      const prevMealPage = getPreviousSelectedMealPage(currentPage.component);
      if (prevMealPage) {
        router.push({
          pathname: "/(onboarding)/flow",
          params: {
            section: prevMealPage.section,
            step: prevMealPage.step.toString(),
          },
        });
        return;
      } else {
        // No previous selected meals, go back to taste-meals page
        router.push({
          pathname: "/(onboarding)/flow",
          params: { section: "meal-time", step: "1" },
        });
        return;
      }
    }

    // Handle going back from taste section to last selected meal time page
    if (currentPage.section === "taste" && currentPage.step === 0) {
      // Find last selected meal
      const mealOrder = ["dinner", "lunch", "breakfast"]; // reverse order
      const mealSteps: Record<string, number> = { breakfast: 2, lunch: 3, dinner: 4 };
      
      for (const meal of mealOrder) {
        if (selectedMeals.includes(meal)) {
          router.push({
            pathname: "/(onboarding)/flow",
            params: {
              section: "meal-time",
              step: mealSteps[meal].toString(),
            },
          });
          return;
        }
      }
      // No meals selected, go to taste-meals
      router.push({
        pathname: "/(onboarding)/flow",
        params: { section: "meal-time", step: "1" },
      });
      return;
    }

    if (previousPage) {
      router.push({
        pathname: "/(onboarding)/flow",
        params: {
          section: previousPage.section,
          step: previousPage.step.toString(),
        },
      });
    } else {
      // Go back to welcome screen (index)
      router.push("/(onboarding)");
    }
  }

  // Helper function to get next selected meal time page
  function getNextSelectedMealPage(currentMealComponent: string | null): { section: string; step: number } | null {
    const mealOrder = ["breakfast", "lunch", "dinner"];
    const mealSteps: Record<string, number> = { breakfast: 2, lunch: 3, dinner: 4 };
    
    const currentMealIndex = currentMealComponent 
      ? mealOrder.findIndex(m => currentMealComponent.includes(m))
      : -1;
    
    for (let i = currentMealIndex + 1; i < mealOrder.length; i++) {
      if (selectedMeals.includes(mealOrder[i])) {
        return {
          section: "meal-time",
          step: mealSteps[mealOrder[i]],
        };
      }
    }
    return null; // No more selected meals
  }

  async function handleNext() {
    const nextPage = getNextPage(currentPage.section, currentPage.step);

    if (currentPage.component === "taste-diet-preferences") {
      const missingDietId = selectedDietPreferences.find(
        (dietId) => !dietNutritionTargets[dietId]
      );

      if (missingDietId) {
        const params: Record<string, string> = { dietId: missingDietId };
        if (nextPage) {
          params.nextSection = nextPage.section;
          params.nextStep = nextPage.step.toString();
        }

        router.push({
          pathname: "/(onboarding)/diet/adjust",
          params,
        });
        return;
      }
    }

    // Handle dynamic meal time navigation
    if (currentPage.component === "taste-meals") {
      // Set default times for unselected meals
      if (!selectedMeals.includes("breakfast")) {
        setBreakfastTime({ hour: 10, minute: 0, period: "AM" });
      }
      if (!selectedMeals.includes("lunch")) {
        setLunchTime({ hour: 2, minute: 30, period: "PM" });
      }
      if (!selectedMeals.includes("dinner")) {
        setDinnerTime({ hour: 6, minute: 0, period: "PM" });
      }

      // Navigate to first selected meal time page
      const nextMealPage = getNextSelectedMealPage(null);
      if (nextMealPage) {
        router.push({
          pathname: "/(onboarding)/flow",
          params: {
            section: nextMealPage.section,
            step: nextMealPage.step.toString(),
          },
        });
        return;
      } else {
        // No meals selected (shouldn't happen due to validation), go to taste section
        router.push({
          pathname: "/(onboarding)/flow",
          params: { section: "taste", step: "0" },
        });
        return;
      }
    }

    // Handle meal-time page navigation (skip unselected meals)
    const isMealTimePage = 
      currentPage.component === "meal-time-breakfast" ||
      currentPage.component === "meal-time-lunch" ||
      currentPage.component === "meal-time-dinner";

    if (isMealTimePage) {
      const nextMealPage = getNextSelectedMealPage(currentPage.component);
      if (nextMealPage) {
        router.push({
          pathname: "/(onboarding)/flow",
          params: {
            section: nextMealPage.section,
            step: nextMealPage.step.toString(),
          },
        });
        return;
      } else {
        // No more selected meals, save and go to taste section
        try {
          setIsSaving(true);
          await onboarding.saveMealTimes();
          setIsSaving(false);
          router.push({
            pathname: "/(onboarding)/flow",
            params: { section: "taste", step: "0" },
          });
        } catch (error) {
          setIsSaving(false);
          console.error("Error saving meal times:", error);
          Alert.alert("❌ Hata", "Veriler kaydedilemedi. Lütfen tekrar deneyin.");
        }
        return;
      }
    }

    try {
      setIsSaving(true);

      // Save data based on current section when leaving it
      if (
        currentPage.section === "goals" &&
        !nextPage?.section?.includes("goals")
      ) {
        await onboarding.saveGoals(onboarding.selectedGoals);
      } else if (
        currentPage.section === "body" &&
        !nextPage?.section?.includes("body")
      ) {
        await onboarding.saveBodyMetrics();
      } else if (
        currentPage.section === "meal-time" &&
        !nextPage?.section?.includes("meal-time")
      ) {
        await onboarding.saveMealTimes();
      } else if (currentPage.section === "taste" && !nextPage) {
        // Last section - save all remaining data
        await onboarding.saveTastePreferences();
      }

      setIsSaving(false);

      if (nextPage) {
        router.push({
          pathname: "/(onboarding)/flow",
          params: {
            section: nextPage.section,
            step: nextPage.step.toString(),
          },
        });
      } else {
        // Onboarding complete - redirect to signup
        router.push("/(onboarding)/signup");
      }
    } catch (error) {
      setIsSaving(false);
      console.error("Error saving onboarding data:", error);
      Alert.alert("❌ Hata", "Veriler kaydedilemedi. Lütfen tekrar deneyin.");
    }
  }

  // Render appropriate component based on page config
  function renderPageContent() {
    const { component, title, description } = currentPage;

    switch (component) {
      case "goals-cover":
        return <GoalsCover title={title || ""} description={description} />;

      case "goals-content":
        return (
          <GoalsContent
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedGoals}
            initialSelection={selectedGoals}
          />
        );

      case "body-cover":
        return <BodyCover title={title || ""} description={description} />;

      case "body-gender":
        return (
          <BodyGender
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedGender}
            initialSelection={selectedGender}
          />
        );

      case "body-age":
        return (
          <BodyAge
            title={title || ""}
            description={description}
            onValueChange={setAge}
            initialValue={age}
          />
        );

      case "body-height":
        return (
          <BodyHeight
            title={title || ""}
            description={description}
            onValueChange={(value) => setHeight(value)}
            initialValue={height}
          />
        );

      case "body-weight":
        return (
          <BodyWeight
            title={title || ""}
            description={description}
            onValueChange={(value) => setWeight(value)}
            initialValue={weight}
          />
        );

      // Meal time section
      case "meal-time-cover":
        return <MealTimeCover title={title || ""} description={description} />;

      case "meal-time-breakfast":
        return (
          <MealTimeBreakfast
            title={title || ""}
            description={description}
            onTimeChange={(hour, minute, period) =>
              setBreakfastTime({ hour, minute, period })
            }
            initialHour={breakfastTime.hour}
            initialMinute={breakfastTime.minute}
            initialPeriod={breakfastTime.period}
          />
        );

      case "meal-time-lunch":
        return (
          <MealTimeLunch
            title={title || ""}
            description={description}
            onTimeChange={(hour, minute, period) =>
              setLunchTime({ hour, minute, period })
            }
            initialHour={lunchTime.hour}
            initialMinute={lunchTime.minute}
            initialPeriod={lunchTime.period}
          />
        );

      case "meal-time-dinner":
        return (
          <MealTimeDinner
            title={title || ""}
            description={description}
            onTimeChange={(hour, minute, period) =>
              setDinnerTime({ hour, minute, period })
            }
            initialHour={dinnerTime.hour}
            initialMinute={dinnerTime.minute}
            initialPeriod={dinnerTime.period}
          />
        );

      case "taste-cover":
        return <TasteCover title={title || ""} description={description} />;

      case "taste-meals":
        return (
          <TasteMeals
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedMeals}
            initialSelection={selectedMeals}
          />
        );

      case "taste-cuisines":
        return (
          <TasteCuisines
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedCuisines}
            initialSelection={selectedCuisines}
            onDislikeChange={setDislikedCuisines}
            initialDisliked={dislikedCuisines}
          />
        );

      case "taste-allergies":
        return (
          <TasteAllergies
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedAllergies}
            initialSelection={selectedAllergies}
          />
        );

      case "taste-diet-preferences":
        return (
          <TasteDietPreferences
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedDietPreferences}
            initialSelection={selectedDietPreferences}
          />
        );

      case "taste-cooking-skills":
        return (
          <TasteCookingSkills
            title={title || ""}
            description={description}
            onSelectionChange={setSelectedCookingSkill}
            initialSelection={selectedCookingSkill}
          />
        );

      default:
        return (
          <View style={styles.placeholderContent}>
            <GoalsCover
              title="Unknown Page"
              description="This page hasn't been configured yet"
            />
          </View>
        );
    }
  }

  // Determine if next button should be disabled
  function isNextDisabled(): boolean {
    // For goals-content, require at least one selection
    if (currentPage.component === "goals-content") {
      return selectedGoals.length === 0;
    }
    // For body-gender, require a selection
    if (currentPage.component === "body-gender") {
      return !selectedGender;
    }
    // For taste-meals, require at least one meal selection
    if (currentPage.component === "taste-meals") {
      return selectedMeals.length === 0;
    }
    // For taste-cuisines, require at least one cuisine selection
    if (currentPage.component === "taste-cuisines") {
      return selectedCuisines.length === 0;
    }
    // For taste-allergies, require at least one allergy selection
    if (currentPage.component === "taste-allergies") {
      return selectedAllergies.length === 0;
    }
    // For taste-diet-preferences, require at least one diet preference
    if (currentPage.component === "taste-diet-preferences") {
      return selectedDietPreferences.length === 0;
    }
    // For taste-cooking-skills, require a skill selection
    if (currentPage.component === "taste-cooking-skills") {
      return !selectedCookingSkill;
    }
    return false;
  }

  // Determine next button text
  function getNextButtonText(): string {
    const nextPage = getNextPage(currentPage.section, currentPage.step);

    if (!nextPage) {
      return "Complete";
    }

    // Special text for certain pages
    if (currentPage.component === "goals-cover") {
      return "Dive In!";
    }
    if (currentPage.component === "body-cover") {
      return "Let's Do This!";
    }
    if (currentPage.component === "meal-time-cover") {
      return "Set Your Schedule!";
    }
    if (currentPage.component === "taste-cover") {
      return "Jump in!";
    }
    if (
      currentPage.component === "meal-time-breakfast" ||
      currentPage.component === "meal-time-lunch" ||
      currentPage.component === "meal-time-dinner"
    ) {
      return "Save";
    }

    return "Next";
  }

  // Determine skip button text
  function getSkipButtonText(): string {
    if (currentPage.component === "taste-allergies") {
      return "No Allergies";
    }
    return "Skip";
  }

  // Handle skip action
  async function handleSkip() {
    if (currentPage.component === "taste-allergies") {
      // Clear allergies and proceed
      setSelectedAllergies([]);
      // We can directly call handleNext logic, but handleNext checks invalid layouts?
      // handleNext will check validity. If we clear allergies, `isNextDisabled` for allergies should handle empty?
      // Wait, isNextDisabled currently checks `selectedAllergies.length === 0`.
      // If I clear it, `isNextDisabled` becomes true, so I cannot "Next" from UI, but programmatically I can force next?
      // If "No Allergies" is clicked, it implies "I am done with this step with 0 items".
      // So I should just proceed to next page.
      // But `handleNext` might save data.
      // I should manually trigger navigation or data save.
      // Let's see `handleNext`. It saves `taste` section data at end.
      
      // I will implement logic to allow proceeding even if empty IF it is a skip/no-allergies action?
      // Or simply:
      const nextPage = getNextPage(currentPage.section, currentPage.step);
      // Save empty allergies?
      // The context update `setSelectedAllergies([])` is sync/fast.
      // But I need to bypass the `isNextDisabled` check if I use `handleNext`?
      // `handleNext` doesn't check `isNextDisabled` inside it (that's for the button disabled state).
      // So calling `handleNext()` directly works!
      // But I should ensure `selectedAllergies` is set to [] before calling it.
      await handleNext();
      return;
    }
    
    // Default skip (if any other pages support it)
    handleNext();
  }

  // Determine if skip button should be disabled
  function isSkipButtonDisabled(): boolean {
    if (currentPage.component === "taste-allergies") {
      return selectedAllergies.length > 0;
    }
    return false;
  }

  // Determine skip button style
  function getSkipButtonStyle(): "default" | "primary" {
    if (currentPage.component === "taste-allergies") {
      return "primary";
    }
    return "default";
  }

  // Check if should show skip button (for meal-time pages and allergies)
  function shouldShowSkipButton(): boolean {
    return (
      currentPage.component === "meal-time-breakfast" ||
      currentPage.component === "meal-time-lunch" ||
      currentPage.component === "meal-time-dinner" ||
      currentPage.component === "taste-allergies"
    );
  }

  // Check if current page is a cover page
  const isCoverPage = currentPage.component.includes("-cover");

  // Determine background color based on section
  function getBackgroundColor(): string {
    // Specific overrides
    if (currentPage.component === "taste-allergies") return "#F2EEF8"; // Colors.lilac[100]

    const section = currentPage.section;

    // Goals section - Light purple/lavender
    if (section === "goals") return "#E8D9F5";

    // Body section - Light peach/cream
    if (section === "body") return "#FCF0D6";

    // Meal-time section - Light pink/rose
    if (section === "meal-time") return "#F5D6D6";

    // Taste section - Light blue/periwinkle
    if (section === "taste") return "#B0BEEC";

    // Default fallback
    return "#FFFFFF";
  }

  const backgroundColor = getBackgroundColor();

  function handleStepPress(stepIndex: number) {
    const targetPage = ONBOARDING_PAGES[stepIndex];
    if (targetPage) {
      router.push({
        pathname: "/(onboarding)/flow",
        params: {
          section: targetPage.section,
          step: targetPage.step.toString(),
        },
      });
    }
  }

  return (
    <OnboardingLayout backgroundColor={backgroundColor}>
      {/* Progress bar only for content pages */}
      {!isCoverPage && (
        <ProgressBar
          currentStep={currentIndex + 1}
          totalSteps={getTotalPages()}
          onStepPress={handleStepPress}
        />
      )}

      {renderPageContent()}

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        nextButtonText={isSaving ? "Kaydediliyor..." : getNextButtonText()}
        isNextDisabled={isNextDisabled() || isSaving}
        showSkipButton={shouldShowSkipButton()}
        onSkip={handleSkip}
        skipButtonText={getSkipButtonText()}
        skipButtonStyle={getSkipButtonStyle()}
        isSkipDisabled={isSkipButtonDisabled()}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  placeholderContent: {
    flex: 1,
  },
});
