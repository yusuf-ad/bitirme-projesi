import {
    convertMealTimesFromDB,
    getUserMealTimes,
} from "@/lib/supabase-onboarding";
import { useQuery } from "@tanstack/react-query";

export function useMealTimes(userId: string | undefined) {
  return useQuery({
    queryKey: ["meal-times", userId],
    queryFn: async () => {
      if (!userId) return null;
      const data = await getUserMealTimes(userId);
      return convertMealTimesFromDB(data);
    },
    enabled: !!userId,
  });
}
