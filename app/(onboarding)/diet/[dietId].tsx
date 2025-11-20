import { DietDetailScreen } from "@/features/onboarding/sections/taste/diet-detail-screen";
import { useLocalSearchParams } from "expo-router";

export default function DietDetailRoute() {
  const { dietId } = useLocalSearchParams<{ dietId?: string }>();
  return <DietDetailScreen dietId={dietId} />;
}

