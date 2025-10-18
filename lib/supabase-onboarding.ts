import {
  UserBodyMetrics,
  UserGoals,
  UserMealTimes,
  UserOnboardingProfile,
  UserTastePreferences,
} from "@/features/onboarding/types/onboarding.types";
import { supabase } from "./supabase";

/**
 * Converts time object (hour, minute, period) to HH:MM format string
 */
function timeToString(
  hour: number,
  minute: number,
  period: "AM" | "PM"
): string {
  let h = hour;
  if (period === "PM" && h !== 12) {
    h += 12;
  } else if (period === "AM" && h === 12) {
    h = 0;
  }
  return `${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/**
 * Converts HH:MM string to {hour, minute, period} object
 */
function stringToTime(timeStr: string): {
  hour: number;
  minute: number;
  period: "AM" | "PM";
} {
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return { hour, minute: m, period };
}

// ==========================================
// Goals
// ==========================================

export async function updateUserGoals(
  userId: string,
  goalIds: string[]
): Promise<UserGoals | null> {
  const { data, error } = await supabase
    .from("user_goals")
    .upsert({
      user_id: userId,
      goal_ids: goalIds,
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating goals:", error);
    return null;
  }

  return data as UserGoals;
}

export async function getUserGoals(userId: string): Promise<UserGoals | null> {
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("Error fetching goals:", error);
  }

  return (data as UserGoals) || null;
}

// ==========================================
// Body Metrics
// ==========================================

export async function updateUserBodyMetrics(
  userId: string,
  metrics: Partial<
    Omit<UserBodyMetrics, "id" | "user_id" | "created_at" | "updated_at">
  >
): Promise<UserBodyMetrics | null> {
  const { data, error } = await supabase
    .from("user_body_metrics")
    .upsert({
      user_id: userId,
      ...metrics,
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating body metrics:", error);
    return null;
  }

  return data as UserBodyMetrics;
}

export async function getUserBodyMetrics(
  userId: string
): Promise<UserBodyMetrics | null> {
  const { data, error } = await supabase
    .from("user_body_metrics")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching body metrics:", error);
  }

  return (data as UserBodyMetrics) || null;
}

// ==========================================
// Meal Times
// ==========================================

export async function updateUserMealTimes(
  userId: string,
  mealTimes: {
    breakfast?: { hour: number; minute: number; period: "AM" | "PM" };
    lunch?: { hour: number; minute: number; period: "AM" | "PM" };
    dinner?: { hour: number; minute: number; period: "AM" | "PM" };
  }
): Promise<UserMealTimes | null> {
  const updates: Partial<UserMealTimes> = {
    user_id: userId,
  };

  if (mealTimes.breakfast) {
    updates.breakfast_time = timeToString(
      mealTimes.breakfast.hour,
      mealTimes.breakfast.minute,
      mealTimes.breakfast.period
    );
  }

  if (mealTimes.lunch) {
    updates.lunch_time = timeToString(
      mealTimes.lunch.hour,
      mealTimes.lunch.minute,
      mealTimes.lunch.period
    );
  }

  if (mealTimes.dinner) {
    updates.dinner_time = timeToString(
      mealTimes.dinner.hour,
      mealTimes.dinner.minute,
      mealTimes.dinner.period
    );
  }

  const { data, error } = await supabase
    .from("user_meal_times")
    .upsert(updates)
    .select()
    .single();

  if (error) {
    console.error("Error updating meal times:", error);
    return null;
  }

  return data as UserMealTimes;
}

export async function getUserMealTimes(
  userId: string
): Promise<UserMealTimes | null> {
  const { data, error } = await supabase
    .from("user_meal_times")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching meal times:", error);
  }

  return (data as UserMealTimes) || null;
}

// ==========================================
// Taste Preferences
// ==========================================

export async function updateUserTastePreferences(
  userId: string,
  preferences: Partial<
    Omit<UserTastePreferences, "id" | "user_id" | "created_at" | "updated_at">
  >
): Promise<UserTastePreferences | null> {
  const { data, error } = await supabase
    .from("user_taste_preferences")
    .upsert({
      user_id: userId,
      ...preferences,
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating taste preferences:", error);
    return null;
  }

  return data as UserTastePreferences;
}

export async function getUserTastePreferences(
  userId: string
): Promise<UserTastePreferences | null> {
  const { data, error } = await supabase
    .from("user_taste_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching taste preferences:", error);
  }

  return (data as UserTastePreferences) || null;
}

// ==========================================
// Complete User Onboarding Profile
// ==========================================

export async function getUserOnboardingProfile(
  userId: string
): Promise<UserOnboardingProfile> {
  const [goals, bodyMetrics, mealTimes, tastePreferences] = await Promise.all([
    getUserGoals(userId),
    getUserBodyMetrics(userId),
    getUserMealTimes(userId),
    getUserTastePreferences(userId),
  ]);

  return {
    goals,
    bodyMetrics,
    mealTimes,
    tastePreferences,
  };
}

/**
 * Creates initial user onboarding profile when user completes onboarding
 */
export async function createUserOnboardingProfile(
  userId: string,
  profileData: {
    goals: string[];
    gender?: string;
    age?: number;
    height?: number;
    weight?: number;
    breakfast?: { hour: number; minute: number; period: "AM" | "PM" };
    lunch?: { hour: number; minute: number; period: "AM" | "PM" };
    dinner?: { hour: number; minute: number; period: "AM" | "PM" };
    meals?: string[];
    cuisines?: string[];
    allergies?: string[];
    diets?: string[];
    cookingSkill?: string;
  }
): Promise<UserOnboardingProfile | null> {
  try {
    const [goals, bodyMetrics, mealTimes, tastePreferences] = await Promise.all(
      [
        updateUserGoals(userId, profileData.goals),
        updateUserBodyMetrics(userId, {
          gender: profileData.gender as any,
          age: profileData.age,
          height_cm: profileData.height,
          weight_kg: profileData.weight,
        }),
        updateUserMealTimes(userId, {
          breakfast: profileData.breakfast,
          lunch: profileData.lunch,
          dinner: profileData.dinner,
        }),
        updateUserTastePreferences(userId, {
          meal_types: profileData.meals || [],
          cuisines: profileData.cuisines || [],
          allergies_dislikes: profileData.allergies || [],
          diet_preferences: profileData.diets || [],
          cooking_skill_level: profileData.cookingSkill,
        }),
      ]
    );

    return {
      goals,
      bodyMetrics,
      mealTimes,
      tastePreferences,
    };
  } catch (error) {
    console.error("Error creating user onboarding profile:", error);
    return null;
  }
}

/**
 * Converts meal times from HH:MM format back to time object
 */
export function convertMealTimesFromDB(mealTimes: UserMealTimes | null): {
  breakfast: { hour: number; minute: number; period: "AM" | "PM" };
  lunch: { hour: number; minute: number; period: "AM" | "PM" };
  dinner: { hour: number; minute: number; period: "AM" | "PM" };
} | null {
  if (!mealTimes) return null;

  return {
    breakfast: mealTimes.breakfast_time
      ? stringToTime(mealTimes.breakfast_time)
      : { hour: 10, minute: 0, period: "AM" },
    lunch: mealTimes.lunch_time
      ? stringToTime(mealTimes.lunch_time)
      : { hour: 14, minute: 30, period: "PM" },
    dinner: mealTimes.dinner_time
      ? stringToTime(mealTimes.dinner_time)
      : { hour: 18, minute: 0, period: "PM" },
  };
}
