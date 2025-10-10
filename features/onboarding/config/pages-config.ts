export interface OnboardingPageConfig {
  section: "goals" | "body" | "meal-time";
  step: number;
  component: string;
  title?: string;
  description?: string;
}

// Total 21 pages across 3 sections
export const ONBOARDING_PAGES: OnboardingPageConfig[] = [
  // Goals Section (2 pages)
  {
    section: "goals",
    step: 0,
    component: "goals-cover",
    title: "Define\nYour goals",
    description:
      "Let's get started! Choose your main goal to reach results faster and stay motivated",
  },
  {
    section: "goals",
    step: 1,
    component: "goals-content",
    title: "Goals",
    description:
      "We'll help you achieve your goals with personalized recommendations",
  },

  // Body Section (placeholder - to be implemented)
  {
    section: "body",
    step: 0,
    component: "body-cover",
    title: "Body Information",
  },
  // Meal-time Section (placeholder - to be implemented)
  {
    section: "meal-time",
    step: 0,
    component: "meal-time-cover",
    title: "Meal Time Preferences",
  },
];

// Helper functions
export function getTotalPages(): number {
  return ONBOARDING_PAGES.length;
}

export function getPageIndex(section: string, step: number): number {
  return ONBOARDING_PAGES.findIndex(
    (page) => page.section === section && page.step === step
  );
}

export function getPageByIndex(index: number): OnboardingPageConfig | null {
  return ONBOARDING_PAGES[index] || null;
}

export function getNextPage(
  currentSection: string,
  currentStep: number
): OnboardingPageConfig | null {
  const currentIndex = getPageIndex(currentSection, currentStep);
  if (currentIndex === -1 || currentIndex >= ONBOARDING_PAGES.length - 1) {
    return null;
  }
  return ONBOARDING_PAGES[currentIndex + 1];
}

export function getPreviousPage(
  currentSection: string,
  currentStep: number
): OnboardingPageConfig | null {
  const currentIndex = getPageIndex(currentSection, currentStep);
  if (currentIndex <= 0) {
    return null;
  }
  return ONBOARDING_PAGES[currentIndex - 1];
}

export function calculateProgress(section: string, step: number): number {
  const currentIndex = getPageIndex(section, step);
  if (currentIndex === -1) return 0;
  return Math.round(((currentIndex + 1) / ONBOARDING_PAGES.length) * 100);
}
