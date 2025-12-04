import { POPULAR_CUISINES, POPULAR_INGREDIENTS } from "./constants";
import { supabaseServer } from "./supabase-server";

export interface UserContext {
  profile: { name?: string };
  goals?: string[];
  bodyMetrics?: {
    gender?: string;
    age?: number;
    height_cm?: number;
    weight_kg?: number;
  };
  tastePreferences?: {
    cuisines?: string[];
    dislikedCuisines?: string[];
    allergies?: string[];
    diets?: string[];
    cookingSkill?: string;
  };
  pantryItems?: { name: string }[];
  todaysMeals?: { mealType: string; recipeName: string; calories?: number }[];
  recentMeals?: { date: string; recipeName: string }[];
}

// Diet ID to Turkish name mapping
const DIET_MAP: Record<string, string> = {
  "gluten-free": "Glutensiz",
  "ketogenic": "Ketojenik",
  "vegetarian": "Vejetaryen",
  "lacto-vegetarian": "Lakto-Vejetaryen",
  "ovo-vegetarian": "Ovo-Vejetaryen",
  "vegan": "Vegan",
  "pescetarian": "Pesketaryen",
  "paleo": "Paleo",
  "primal": "Primal",
  "low-fodmap": "Düşük FODMAP",
  "whole30": "Whole30",
};

// Convert allergy IDs to readable names
function resolveAllergyNames(allergyIds: string[]): string[] {
  return allergyIds.map((id) => {
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      const ingredient = POPULAR_INGREDIENTS.find((ing) => ing.spoonacularId === numericId);
      return ingredient?.name || id;
    }
    if (id.startsWith("name-")) {
      return id.replace("name-", "").split("-").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
    }
    return id;
  });
}

// Convert cuisine IDs to readable names
function resolveCuisineNames(cuisineIds: string[]): string[] {
  return cuisineIds.map((id) => {
    const cuisine = POPULAR_CUISINES.find((c) => c.id === id);
    return cuisine?.name || id.charAt(0).toUpperCase() + id.slice(1);
  });
}

// Convert diet IDs to Turkish names
function resolveDietNames(dietIds: string[]): string[] {
  return dietIds.map((id) => DIET_MAP[id] || id);
}

export async function getUserContextForAI(userId: string): Promise<UserContext> {
  const context: UserContext = { profile: {} };

  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const [profileResult, goalsResult, bodyMetricsResult, tastePrefsResult, pantryResult, mealPlanResult] = 
      await Promise.all([
        supabaseServer.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
        supabaseServer.from("user_goals").select("goal_ids").eq("user_id", userId).maybeSingle(),
        supabaseServer.from("user_body_metrics").select("gender, age, height_cm, weight_kg").eq("user_id", userId).maybeSingle(),
        supabaseServer.from("user_taste_preferences").select("cuisines, cuisine_dislikes, allergies_dislikes, diet_preferences, cooking_skill_level").eq("user_id", userId).maybeSingle(),
        supabaseServer.from("pantry_items").select("name").eq("user_id", userId).eq("status", "pantry").limit(15),
        // Get meals from last 3 days including today
        supabaseServer
          .from("meal_plan_items")
          .select("meal_date, meal_type, recipe_name, calories_per_serving, meal_plan_id, meal_plans!inner(user_id)")
          .eq("meal_plans.user_id", userId)
          .gte("meal_date", threeDaysAgo)
          .lte("meal_date", today)
          .order("meal_date", { ascending: false })
          .limit(10),
      ]);

    if (profileResult.data?.full_name) {
      context.profile.name = profileResult.data.full_name;
    }

    if (goalsResult.data?.goal_ids) {
      context.goals = goalsResult.data.goal_ids;
    }

    if (bodyMetricsResult.data) {
      const bm = bodyMetricsResult.data;
      context.bodyMetrics = {
        gender: bm.gender || undefined,
        age: bm.age || undefined,
        height_cm: bm.height_cm || undefined,
        weight_kg: bm.weight_kg || undefined,
      };
    }

    if (tastePrefsResult.data) {
      const tp = tastePrefsResult.data;
      context.tastePreferences = {
        cuisines: tp.cuisines?.length ? resolveCuisineNames(tp.cuisines) : undefined,
        dislikedCuisines: tp.cuisine_dislikes?.length ? resolveCuisineNames(tp.cuisine_dislikes) : undefined,
        allergies: tp.allergies_dislikes?.length ? resolveAllergyNames(tp.allergies_dislikes) : undefined,
        diets: tp.diet_preferences?.length ? resolveDietNames(tp.diet_preferences) : undefined,
        cookingSkill: tp.cooking_skill_level || undefined,
      };
    }

    if (pantryResult.data?.length) {
      context.pantryItems = pantryResult.data.map((item) => ({ name: item.name }));
    }

    // Process meal plan items
    if (mealPlanResult.data?.length) {
      const todaysMeals = mealPlanResult.data
        .filter((m) => m.meal_date === today)
        .map((m) => ({
          mealType: m.meal_type,
          recipeName: m.recipe_name,
          calories: m.calories_per_serving || undefined,
        }));
      
      const recentMeals = mealPlanResult.data
        .filter((m) => m.meal_date !== today)
        .map((m) => ({
          date: m.meal_date,
          recipeName: m.recipe_name,
        }));

      if (todaysMeals.length) context.todaysMeals = todaysMeals;
      if (recentMeals.length) context.recentMeals = recentMeals;
    }
  } catch {
    // Return empty context on error
  }

  return context;
}

const GOAL_MAP: Record<string, string> = {
  lose_weight: "Kilo vermek",
  gain_muscle: "Kas kazanmak",
  eat_healthy: "Sağlıklı beslenmek",
  save_time: "Zamandan tasarruf",
  learn_cooking: "Yemek yapmayı öğrenmek",
  reduce_waste: "İsrafı azaltmak",
};

const SKILL_MAP: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

export function buildUserContextPrompt(context: UserContext): string {
  const parts: string[] = [];

  if (context.profile.name) {
    parts.push(`Ad: ${context.profile.name}`);
  }

  if (context.goals?.length) {
    parts.push(`Hedefler: ${context.goals.map((g) => GOAL_MAP[g] || g).join(", ")}`);
  }

  if (context.bodyMetrics) {
    const { gender, age, height_cm, weight_kg } = context.bodyMetrics;
    const metrics: string[] = [];
    if (gender) metrics.push(gender === "male" ? "Erkek" : gender === "female" ? "Kadın" : gender);
    if (age) metrics.push(`${age} yaş`);
    if (height_cm) metrics.push(`${height_cm} cm`);
    if (weight_kg) metrics.push(`${weight_kg} kg`);
    if (metrics.length) parts.push(`Fiziksel: ${metrics.join(", ")}`);
  }

  if (context.tastePreferences) {
    const { cuisines, dislikedCuisines, allergies, diets, cookingSkill } = context.tastePreferences;
    if (cuisines?.length) parts.push(`Sevilen mutfaklar: ${cuisines.join(", ")}`);
    if (dislikedCuisines?.length) parts.push(`Sevilmeyen mutfaklar: ${dislikedCuisines.join(", ")}`);
    if (allergies?.length) parts.push(`Alerjiler: ${allergies.join(", ")}`);
    if (diets?.length) parts.push(`Diyet: ${diets.join(", ")}`);
    if (cookingSkill) parts.push(`Seviye: ${SKILL_MAP[cookingSkill] || cookingSkill}`);
  }

  if (context.pantryItems?.length) {
    parts.push(`Mutfak: ${context.pantryItems.map((i) => i.name).join(", ")}`);
  }

  // Today's meals - raw values
  if (context.todaysMeals?.length) {
    const meals = context.todaysMeals.map((m) => {
      return m.calories ? `${m.mealType}: ${m.recipeName} (${m.calories} kcal)` : `${m.mealType}: ${m.recipeName}`;
    });
    parts.push(`Bugün yedikleri: ${meals.join(", ")}`);
  }

  // Recent meals (last few days)
  if (context.recentMeals?.length) {
    const recent = context.recentMeals.slice(0, 5).map((m) => m.recipeName);
    parts.push(`Son günlerde yedikleri: ${recent.join(", ")}`);
  }

  return parts.length ? `\n\n--- KULLANICI ---\n${parts.join("\n")}` : "";
}
