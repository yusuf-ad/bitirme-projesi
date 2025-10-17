import { CalendarDay, Meal, TodayProgress } from "../types/home.types";

export const mockCalendarDays: CalendarDay[] = (() => {
  const days: CalendarDay[] = [];
  const startDate = new Date(2025, 8, 27); // September 27, 2024
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for accurate comparison

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    days.push({
      day: String(date.getDate()).padStart(2, "0"),
      dayOfWeek: dayNames[date.getDay()],
      date: date,
      isSelected: date.toDateString() === today.toDateString(), // Select today's date
    });
  }

  return days;
})();

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
