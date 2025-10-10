// Components
export { OnboardingLayout } from "./components/onboarding-layout";
export { OnboardingNavigation } from "./components/onboarding-navigation";
export { ProgressBar } from "./components/progress-bar";

// Types
export type {
  OnboardingLayoutProps,
  OnboardingNavigationProps,
  ProgressBarProps,
} from "./types/onboarding.types";

// Config
export {
  calculateProgress,
  getNextPage,
  getPageByIndex,
  getPageIndex,
  getPreviousPage,
  getTotalPages,
  ONBOARDING_PAGES,
} from "./config/pages-config";

export type { OnboardingPageConfig } from "./config/pages-config";

// Goal Sections
export { GoalsContent } from "./sections/goals/goals-content";
export { GoalsCover } from "./sections/goals/goals-cover";
