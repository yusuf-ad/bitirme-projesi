import { supabase } from "@/lib/supabase";
import {
  convertMealTimesFromDB,
  getUserOnboardingProfile,
  updateUserBodyMetrics,
  updateUserGoals,
  updateUserMealTimes,
  updateUserTastePreferences,
} from "@/lib/supabase-onboarding";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useState } from "react";

interface OnboardingContextType {
  // Goals
  selectedGoals: string[];
  setSelectedGoals: (goals: string[]) => void;
  saveGoals: (goals: string[]) => Promise<void>;

  // Body
  selectedGender: string | undefined;
  setSelectedGender: (gender: string | undefined) => void;
  age: number;
  setAge: (age: number) => void;
  height: number;
  setHeight: (height: number) => void;
  weight: number;
  setWeight: (weight: number) => void;
  saveBodyMetrics: () => Promise<void>;

  // Meal Times
  breakfastTime: { hour: number; minute: number; period: "AM" | "PM" };
  setBreakfastTime: (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => void;
  lunchTime: { hour: number; minute: number; period: "AM" | "PM" };
  setLunchTime: (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => void;
  dinnerTime: { hour: number; minute: number; period: "AM" | "PM" };
  setDinnerTime: (time: {
    hour: number;
    minute: number;
    period: "AM" | "PM";
  }) => void;
  saveMealTimes: () => Promise<void>;

  // Taste
  selectedMeals: string[];
  setSelectedMeals: (meals: string[]) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[]) => void;
  selectedAllergies: string[];
  setSelectedAllergies: (allergies: string[]) => void;
  selectedDietPreferences: string[];
  setSelectedDietPreferences: (prefs: string[]) => void;
  selectedCookingSkill: string;
  setSelectedCookingSkill: (skill: string) => void;
  saveTastePreferences: () => Promise<void>;

  // Reset all data
  resetOnboardingData: () => void;
  loadOnboardingData: () => Promise<void>;
  isLoading: boolean;

  // Save all onboarding data from AsyncStorage to Supabase (after signup)
  saveAllOnboardingDataToSupabase: (userId: string) => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  // Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  // Body
  const [selectedGender, setSelectedGender] = useState<string | undefined>();
  const [age, setAge] = useState<number>(30);
  const [height, setHeight] = useState<number>(177);
  const [weight, setWeight] = useState<number>(75);

  // Meal Times
  const [breakfastTime, setBreakfastTime] = useState({
    hour: 10,
    minute: 0,
    period: "AM" as "AM" | "PM",
  });
  const [lunchTime, setLunchTime] = useState({
    hour: 2,
    minute: 30,
    period: "PM" as "AM" | "PM",
  });
  const [dinnerTime, setDinnerTime] = useState({
    hour: 6,
    minute: 0,
    period: "PM" as "AM" | "PM",
  });

  // Taste
  const [selectedMeals, setSelectedMeals] = useState<string[]>([]);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedDietPreferences, setSelectedDietPreferences] = useState<
    string[]
  >([]);
  const [selectedCookingSkill, setSelectedCookingSkill] = useState<string>("");

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const resetOnboardingData = () => {
    setSelectedGoals([]);
    setSelectedGender(undefined);
    setAge(30);
    setHeight(177);
    setWeight(75);
    setBreakfastTime({ hour: 10, minute: 0, period: "AM" });
    setLunchTime({ hour: 2, minute: 30, period: "PM" });
    setDinnerTime({ hour: 6, minute: 0, period: "PM" });
    setSelectedMeals([]);
    setSelectedCuisines([]);
    setSelectedAllergies([]);
    setSelectedDietPreferences([]);
    setSelectedCookingSkill("");
  };

  // Save functions - Save to AsyncStorage first (for onboarding without user)
  const saveGoals = async (goals: string[]) => {
    try {
      setSelectedGoals(goals);

      // Save to AsyncStorage for later use
      await AsyncStorage.setItem("onboarding_goals", JSON.stringify(goals));

      // If user exists, also save to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updateUserGoals(user.id, goals);
      }
    } catch (error) {
      console.error("Error saving goals:", error);
      throw error;
    }
  };

  const saveBodyMetrics = async () => {
    try {
      // Save to AsyncStorage for later use
      const bodyData = {
        gender: selectedGender,
        age,
        height_cm: height,
        weight_kg: weight,
      };
      await AsyncStorage.setItem("onboarding_body", JSON.stringify(bodyData));

      // If user exists, also save to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updateUserBodyMetrics(user.id, bodyData as any);
      }
    } catch (error) {
      console.error("Error saving body metrics:", error);
      throw error;
    }
  };

  const saveMealTimes = async () => {
    try {
      // Save to AsyncStorage for later use
      const mealData = {
        breakfast: breakfastTime,
        lunch: lunchTime,
        dinner: dinnerTime,
      };
      await AsyncStorage.setItem("onboarding_meals", JSON.stringify(mealData));

      // If user exists, also save to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updateUserMealTimes(user.id, mealData);
      }
    } catch (error) {
      console.error("Error saving meal times:", error);
      throw error;
    }
  };

  const saveTastePreferences = async () => {
    try {
      // Save to AsyncStorage for later use
      const tasteData = {
        meal_types: selectedMeals,
        cuisines: selectedCuisines,
        allergies_dislikes: selectedAllergies,
        diet_preferences: selectedDietPreferences,
        cooking_skill_level: selectedCookingSkill || null,
      };
      await AsyncStorage.setItem("onboarding_taste", JSON.stringify(tasteData));

      // If user exists, also save to Supabase
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await updateUserTastePreferences(user.id, tasteData);
      }
    } catch (error) {
      console.error("Error saving taste preferences:", error);
      throw error;
    }
  };

  // Load onboarding data from AsyncStorage or Supabase
  const loadOnboardingData = async () => {
    try {
      setIsLoading(true);

      // First try to load from AsyncStorage (for new users during onboarding)
      const goalsData = await AsyncStorage.getItem("onboarding_goals");
      const bodyData = await AsyncStorage.getItem("onboarding_body");
      const mealsData = await AsyncStorage.getItem("onboarding_meals");
      const tasteData = await AsyncStorage.getItem("onboarding_taste");

      if (goalsData) {
        setSelectedGoals(JSON.parse(goalsData));
      }
      if (bodyData) {
        const body = JSON.parse(bodyData);
        setSelectedGender(body.gender);
        setAge(body.age);
        setHeight(body.height_cm);
        setWeight(body.weight_kg);
      }
      if (mealsData) {
        const meals = JSON.parse(mealsData);
        setBreakfastTime(meals.breakfast);
        setLunchTime(meals.lunch);
        setDinnerTime(meals.dinner);
      }
      if (tasteData) {
        const taste = JSON.parse(tasteData);
        setSelectedMeals(taste.meal_types || []);
        setSelectedCuisines(taste.cuisines || []);
        setSelectedAllergies(taste.allergies_dislikes || []);
        setSelectedDietPreferences(taste.diet_preferences || []);
        setSelectedCookingSkill(taste.cooking_skill_level || "");
      }

      // Then try to load from Supabase (for existing users)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return;
      }

      const profile = await getUserOnboardingProfile(user.id);

      if (profile.goals?.goal_ids) {
        setSelectedGoals(profile.goals.goal_ids);
      }

      if (profile.bodyMetrics) {
        if (profile.bodyMetrics.gender) {
          setSelectedGender(profile.bodyMetrics.gender);
        }
        if (profile.bodyMetrics.age) {
          setAge(profile.bodyMetrics.age);
        }
        if (profile.bodyMetrics.height_cm) {
          setHeight(profile.bodyMetrics.height_cm);
        }
        if (profile.bodyMetrics.weight_kg) {
          setWeight(profile.bodyMetrics.weight_kg);
        }
      }

      if (profile.mealTimes) {
        const convertedTimes = convertMealTimesFromDB(profile.mealTimes);
        if (convertedTimes) {
          setBreakfastTime(convertedTimes.breakfast);
          setLunchTime(convertedTimes.lunch);
          setDinnerTime(convertedTimes.dinner);
        }
      }

      if (profile.tastePreferences) {
        if (profile.tastePreferences.meal_types) {
          setSelectedMeals(profile.tastePreferences.meal_types);
        }
        if (profile.tastePreferences.cuisines) {
          setSelectedCuisines(profile.tastePreferences.cuisines);
        }
        if (profile.tastePreferences.allergies_dislikes) {
          setSelectedAllergies(profile.tastePreferences.allergies_dislikes);
        }
        if (profile.tastePreferences.diet_preferences) {
          setSelectedDietPreferences(profile.tastePreferences.diet_preferences);
        }
        if (profile.tastePreferences.cooking_skill_level) {
          setSelectedCookingSkill(profile.tastePreferences.cooking_skill_level);
        }
      }
    } catch (error) {
      console.error("Error loading onboarding data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Save all onboarding data from AsyncStorage to Supabase (called after signup)
  const saveAllOnboardingDataToSupabase = async (userId: string) => {
    try {
      console.log("Starting to save onboarding data for user:", userId);

      // Load all data from AsyncStorage
      const goalsData = await AsyncStorage.getItem("onboarding_goals");
      const bodyData = await AsyncStorage.getItem("onboarding_body");
      const mealsData = await AsyncStorage.getItem("onboarding_meals");
      const tasteData = await AsyncStorage.getItem("onboarding_taste");

      console.log("Loaded from AsyncStorage:", {
        hasGoals: !!goalsData,
        hasBody: !!bodyData,
        hasMeals: !!mealsData,
        hasTaste: !!tasteData,
      });

      // Save goals
      if (goalsData) {
        const goals = JSON.parse(goalsData);
        console.log("Saving goals:", goals);
        const result = await updateUserGoals(userId, goals);
        if (!result) {
          throw new Error("Failed to save goals");
        }
      }

      // Save body metrics
      if (bodyData) {
        const body = JSON.parse(bodyData);
        console.log("Saving body metrics:", body);
        const result = await updateUserBodyMetrics(userId, body);
        if (!result) {
          throw new Error("Failed to save body metrics");
        }
      }

      // Save meal times
      if (mealsData) {
        const meals = JSON.parse(mealsData);
        console.log("Saving meal times");
        const result = await updateUserMealTimes(userId, meals);
        if (!result) {
          throw new Error("Failed to save meal times");
        }
      }

      // Save taste preferences
      if (tasteData) {
        const taste = JSON.parse(tasteData);
        console.log("Saving taste preferences:", taste);

        // Map cooking skill values to match database constraint
        const mappedTaste = {
          ...taste,
          cooking_skill_level:
            taste.cooking_skill_level === "novice"
              ? "beginner"
              : taste.cooking_skill_level === "basic"
              ? "intermediate"
              : taste.cooking_skill_level,
        };

        const result = await updateUserTastePreferences(userId, mappedTaste);
        if (!result) {
          throw new Error("Failed to save taste preferences");
        }
      }

      console.log("Successfully saved all onboarding data");

      // Clear AsyncStorage after successful save
      await AsyncStorage.multiRemove([
        "onboarding_goals",
        "onboarding_body",
        "onboarding_meals",
        "onboarding_taste",
      ]);

      console.log("Cleared AsyncStorage");
    } catch (error: any) {
      console.error("Error saving onboarding data to Supabase:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
      });
      throw error;
    }
  };

  const value: OnboardingContextType = {
    selectedGoals,
    setSelectedGoals,
    saveGoals,
    selectedGender,
    setSelectedGender,
    age,
    setAge,
    height,
    setHeight,
    weight,
    setWeight,
    saveBodyMetrics,
    breakfastTime,
    setBreakfastTime,
    lunchTime,
    setLunchTime,
    dinnerTime,
    setDinnerTime,
    saveMealTimes,
    selectedMeals,
    setSelectedMeals,
    selectedCuisines,
    setSelectedCuisines,
    selectedAllergies,
    setSelectedAllergies,
    selectedDietPreferences,
    setSelectedDietPreferences,
    selectedCookingSkill,
    setSelectedCookingSkill,
    saveTastePreferences,
    resetOnboardingData,
    loadOnboardingData,
    isLoading,
    saveAllOnboardingDataToSupabase,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
}
