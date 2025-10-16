import { CalendarDay, Meal, TodayProgress } from "../types/home.types";

export const mockCalendarDays: CalendarDay[] = [
  {
    day: "05",
    dayOfWeek: "Sun",
    date: new Date(2024, 9, 5),
    isSelected: false,
  },
  {
    day: "06",
    dayOfWeek: "Mon",
    date: new Date(2024, 9, 6),
    isSelected: false,
  },
  {
    day: "07",
    dayOfWeek: "Tue",
    date: new Date(2024, 9, 7),
    isSelected: false,
  },
  {
    day: "08",
    dayOfWeek: "Wed",
    date: new Date(2024, 9, 8),
    isSelected: true,
  },
  {
    day: "09",
    dayOfWeek: "Thu",
    date: new Date(2024, 9, 9),
    isSelected: false,
  },
  {
    day: "10",
    dayOfWeek: "Fri",
    date: new Date(2024, 9, 10),
    isSelected: false,
  },
  {
    day: "11",
    dayOfWeek: "Sat",
    date: new Date(2024, 9, 11),
    isSelected: false,
  },
];

export const mockTodayProgress: TodayProgress = {
  calories: 1284,
  macros: [
    { type: "fat", percentage: 29 },
    { type: "protein", percentage: 65 },
    { type: "carb", percentage: 85 },
  ],
};

export const mockMeals: Meal[] = [
  {
    id: "1",
    mealType: "Breakfast",
    mealTime: "07:25 - 08:05",
    mealIcon: require("@/assets/icons/breakfast-icon.svg"),
    recipeName: "Italian Breakfast",
    recipeDescription:
      "Fresh croissant, creamy cappuccino, and sweet seasonal berries...",
    recipeImage: require("@/assets/images/italian-breakfast.png"),
    prepTime: "10 min",
    calories: "320 kcal",
  },
  {
    id: "2",
    mealType: "Lunch",
    mealTime: "12:00 - 13:00",
    mealIcon: require("@/assets/icons/lunch-icon.svg"),
    recipeName: "Spaghetti alla Carbonara",
    recipeDescription:
      "Classic Roman pasta with eggs, cheese, and crispy guanciale...",
    recipeImage: require("@/assets/images/spaghetti-carbonara.png"),
    prepTime: "50 min",
    calories: "600 kcal",
  },
  {
    id: "3",
    mealType: "Dinner",
    mealTime: "07:25 - 08:05",
    mealIcon: require("@/assets/icons/dinner-icon.svg"),
    recipeName: "Grilled Mediterranean Chicken with Vegetables",
    recipeDescription:
      "Tender grilled chicken with roasted Mediterranean vegetables...",
    recipeImage: require("@/assets/images/grilled-chicken.png"),
    prepTime: "70 min",
    calories: "420 kcal",
  },
];
