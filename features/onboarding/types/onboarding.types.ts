export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingNavigationProps {
  onBack: () => void;
  onNext: () => void;
  nextButtonText?: string;
  isNextDisabled?: boolean;
  showSkipButton?: boolean;
  onSkip?: () => void;
  skipButtonText?: string;
}

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
}

// Supabase Database Types
export interface UserGoals {
  id: string;
  user_id: string;
  goal_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface UserBodyMetrics {
  id: string;
  user_id: string;
  gender: "male" | "female" | "prefer-not-to-say" | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserMealTimes {
  id: string;
  user_id: string;
  breakfast_time: string | null; // HH:MM format
  lunch_time: string | null;
  dinner_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTastePreferences {
  id: string;
  user_id: string;
  meal_types: string[];
  cuisines: string[];
  allergies_dislikes: string[];
  diet_preferences: string[];
  cooking_skill_level: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserOnboardingProfile {
  goals: UserGoals | null;
  bodyMetrics: UserBodyMetrics | null;
  mealTimes: UserMealTimes | null;
  tastePreferences: UserTastePreferences | null;
}
