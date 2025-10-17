import React, { createContext, ReactNode, useContext, useState } from "react";

interface OnboardingContextType {
  // Goals
  selectedGoals: string[];
  setSelectedGoals: (goals: string[]) => void;

  // Body
  selectedGender: string | undefined;
  setSelectedGender: (gender: string | undefined) => void;
  age: number;
  setAge: (age: number) => void;
  height: number;
  setHeight: (height: number) => void;
  weight: number;
  setWeight: (weight: number) => void;

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

  // Reset all data
  resetOnboardingData: () => void;
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

  const value: OnboardingContextType = {
    selectedGoals,
    setSelectedGoals,
    selectedGender,
    setSelectedGender,
    age,
    setAge,
    height,
    setHeight,
    weight,
    setWeight,
    breakfastTime,
    setBreakfastTime,
    lunchTime,
    setLunchTime,
    dinnerTime,
    setDinnerTime,
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
    resetOnboardingData,
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
