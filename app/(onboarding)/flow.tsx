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
import { GoalsContent } from "@/features/onboarding/sections/goals/goals-content";
import { GoalsCover } from "@/features/onboarding/sections/goals/goals-cover";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function OnboardingFlowScreen() {
  const params = useLocalSearchParams<{ section?: string; step?: string }>();

  // Default to first page if no params
  const section = params.section || "goals";
  const step = params.step ? parseInt(params.step, 10) : 0;

  // Find current page config
  const currentIndex = getPageIndex(section, step);
  const currentPage = ONBOARDING_PAGES[currentIndex] || ONBOARDING_PAGES[0];

  // State for goals selection (we'll expand this for other sections)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "healthy-eating",
  ]);

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

      // Placeholder for other sections
      case "body-cover":
      case "meal-time-cover":
        return (
          <View style={styles.placeholderContent}>
            <GoalsCover
              title={title || "Coming Soon"}
              description="This section will be implemented next"
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

    return "Next";
  }

  // Check if current page is a cover page
  const isCoverPage = currentPage.component.includes("-cover");

  return (
    <OnboardingLayout
      blurRadius={currentPage.component === "goals-cover" ? 24 : 48}
    >
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
      />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  placeholderContent: {
    flex: 1,
  },
});
