export interface OnboardingPageConfig {
  section: "goals" | "body" | "meal-time";
  step: number;
  component: string;
  title?: string;
  description?: string;
}

// Total 21 pages across ... sections
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

  // Body Section (5 pages)
  {
    section: "body",
    step: 0,
    component: "body-cover",
    title: "A Bit About\nYour Body",
    description:
      "Your age, weight and other details will help us create a more personalized plan",
  },
  {
    section: "body",
    step: 1,
    component: "body-gender",
    title: "Gender",
    description:
      "Which term best describes you? Information to be used to calculate your calorie intake.",
  },
  {
    section: "body",
    step: 2,
    component: "body-age",
    title: "Age",
    description: "How old are you?",
  },
  {
    section: "body",
    step: 3,
    component: "body-height",
    title: "Height",
    description: "How tall are you?",
  },
  {
    section: "body",
    step: 4,
    component: "body-weight",
    title: "Weight",
    description: "What is your current weight?",
  },
  // Meal-time Section (4 pages)
  {
    section: "meal-time",
    step: 0,
    component: "meal-time-cover",
    title: "What's Your Meal Routine?",
    description:
      "Tell us your usual meal times so we can create a plan that fits perfectly into your life.",
  },
  {
    section: "meal-time",
    step: 1,
    component: "meal-time-breakfast",
    title: "Breakfast time",
    description: "When do you usually start your breakfast?",
  },
  {
    section: "meal-time",
    step: 2,
    component: "meal-time-lunch",
    title: "Lunch time",
    description: "What time do you typically have lunch?",
  },
  {
    section: "meal-time",
    step: 3,
    component: "meal-time-dinner",
    title: "Dinner time",
    description: "What's your usual time for dinner?",
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
