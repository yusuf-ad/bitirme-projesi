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
