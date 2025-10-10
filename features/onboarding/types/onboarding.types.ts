export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export interface OnboardingNavigationProps {
  onBack: () => void;
  onNext: () => void;
  nextButtonText?: string;
  isNextDisabled?: boolean;
}

export interface OnboardingLayoutProps {
  children: React.ReactNode;
  blurRadius?: number;
}
