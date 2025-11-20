import { DietAdjustTargetsScreen } from "@/features/onboarding/sections/taste/diet-adjust-targets";
import { useLocalSearchParams } from "expo-router";

export default function DietAdjustRoute() {
  const { dietId, nextSection, nextStep } = useLocalSearchParams<{
    dietId?: string;
    nextSection?: string;
    nextStep?: string;
  }>();

  return (
    <DietAdjustTargetsScreen
      dietId={dietId}
      nextSection={nextSection}
      nextStep={nextStep}
    />
  );
}

