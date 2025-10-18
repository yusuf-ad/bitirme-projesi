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
import { StyleSheet, View } from "react-native";

export default function OnboardingFlowScreen() {
  const params = useLocalSearchParams<{ section?: string; step?: string }>();
  const onboarding = useOnboarding();

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
  const selectedAllergies = onboarding.selectedAllergies;
  const setSelectedAllergies = onboarding.setSelectedAllergies;
  const selectedDietPreferences = onboarding.selectedDietPreferences;
  const setSelectedDietPreferences = onboarding.setSelectedDietPreferences;
  const selectedCookingSkill = onboarding.selectedCookingSkill;
  const setSelectedCookingSkill = onboarding.setSelectedCookingSkill;

  function handleBack() {
    const previousPage = getPreviousPage(currentPage.section, currentPage.step);

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

  function handleNext() {
    const nextPage = getNextPage(currentPage.section, currentPage.step);

    if (nextPage) {
      router.push({
        pathname: "/(onboarding)/flow",
        params: {
          section: nextPage.section,
          step: nextPage.step.toString(),
        },
      });
    } else {
      // Onboarding complete - navigate to main app
      console.log("Onboarding complete!");
      // router.replace("/(tabs)");
      router.replace("/(onboarding)/login");
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

      // Placeholder for other sections
      case "body-cover":
        return (
          <View style={styles.placeholderContent}>
            <GoalsCover
              title={title || "Coming Soon"}
              description="Your age, weight and other details will help us create a more personalized plan"
            />
          </View>
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

  // Check if should show skip button (for meal-time pages)
  function shouldShowSkipButton(): boolean {
    return (
      currentPage.component === "meal-time-breakfast" ||
      currentPage.component === "meal-time-lunch" ||
      currentPage.component === "meal-time-dinner"
    );
  }

  // Check if current page is a cover page
  const isCoverPage = currentPage.component.includes("-cover");

  // Determine background color based on section
  function getBackgroundColor(): string {
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

  return (
    <OnboardingLayout backgroundColor={backgroundColor}>
      {/* Progress bar only for content pages */}
      {!isCoverPage && (
        <ProgressBar
          currentStep={currentIndex + 1}
          totalSteps={getTotalPages()}
        />
      )}

      {renderPageContent()}

      <OnboardingNavigation
        onBack={handleBack}
        onNext={handleNext}
        nextButtonText={getNextButtonText()}
        isNextDisabled={isNextDisabled()}
        showSkipButton={shouldShowSkipButton()}
        onSkip={handleNext}
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  placeholderContent: {
    flex: 1,
  },
});
