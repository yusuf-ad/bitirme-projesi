import { ImageSourcePropType } from "react-native";

export interface DietOption {
  id: string;
  label: string;
  subtitle: string;
  description: string;
  detailDescription: string;
  image: ImageSourcePropType;
  spoonacularDiet?: string;
  targetCalories: number;
  sourceUrl?: string;
  defaultMacros: {
    protein: number;
    fat: number;
    carbohydrates: number;
  };
}

export const DIET_OPTIONS: DietOption[] = [
  {
    id: "balanced",
    label: "Balanced",
    subtitle: "Thoughtful, flexible portions",
    description: "Balanced nutrition with flexibility",
    detailDescription:
      "Centers whole foods in moderate portions with a flexible macro split so you can mix proteins, carbs, and fats without strict rules. Ideal if you just want reliable structure without extremes.",
    image: require("@/assets/images/grilled-chicken.png"),
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=balanced&timeFrame=day",
    defaultMacros: {
      protein: 0.3,
      fat: 0.3,
      carbohydrates: 0.4,
    },
  },
  {
    id: "lowcarb",
    label: "Low carb",
    subtitle: "Improve blood, boost vitality",
    description: "Reduced carbohydrate intake",
    detailDescription:
      "Limits carbohydrate intake in favor of protein and fat sources, particularly recommending unprocessed foods to decrease sugar intake and increase fiber.",
    image: require("@/assets/images/italian-breakfast.png"),
    spoonacularDiet: "low-carb",
    targetCalories: 2450,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=low-carb&timeFrame=day",
    defaultMacros: {
      protein: 0.25,
      fat: 0.55,
      carbohydrates: 0.2,
    },
  },
  {
    id: "keto",
    label: "Keto",
    subtitle: "High-fat, minimal carb",
    description: "Ketogenic diet approach",
    detailDescription:
      "Focuses on high-fat, moderate-protein meals with net carbs kept very low to encourage ketosis. Meals emphasize oils, nuts, avocado, and leafy greens.",
    image: require("@/assets/images/spaghetti-carbonara.png"),
    spoonacularDiet: "ketogenic",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=ketogenic&timeFrame=day",
    defaultMacros: {
      protein: 0.2,
      fat: 0.75,
      carbohydrates: 0.05,
    },
  },
  {
    id: "vegetarian",
    label: "Vegetarian",
    subtitle: "Plant-based, complex carb",
    description: "No meat, focus on plants",
    detailDescription:
      "Relies on vegetables, legumes, grains, and dairy or eggs for complete nutrition while eliminating meat. Fiber-rich meals help with satiety and gut health.",
    image: require("@/assets/images/grilled-chicken.png"),
    spoonacularDiet: "vegetarian",
    targetCalories: 2350,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=vegetarian&timeFrame=day",
    defaultMacros: {
      protein: 0.25,
      fat: 0.3,
      carbohydrates: 0.45,
    },
  },
  {
    id: "vegan",
    label: "Vegan",
    subtitle: "Plant-based only, no animal",
    description: "100% plant-based nutrition",
    detailDescription:
      "Uses only plant foods by combining legumes, grains, nuts, seeds, fruits, and vegetables for complete macro coverage. Prioritizes minimally processed staples.",
    image: require("@/assets/images/italian-breakfast.png"),
    spoonacularDiet: "vegan",
    targetCalories: 2300,
    sourceUrl: "https://spoonacular.com/meal-planner?diet=vegan&timeFrame=day",
    defaultMacros: {
      protein: 0.25,
      fat: 0.3,
      carbohydrates: 0.45,
    },
  },
  {
    id: "paleo",
    label: "Paleo",
    subtitle: "Whole foods, ancestral eating",
    description: "Natural whole foods focus",
    detailDescription:
      "Eliminates grains, dairy, and processed foods to focus on meats, seafood, vegetables, fruit, nuts, and healthy fats—mirroring an ancestral template.",
    image: require("@/assets/images/spaghetti-carbonara.png"),
    spoonacularDiet: "paleo",
    targetCalories: 2400,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=paleo&timeFrame=day",
    defaultMacros: {
      protein: 0.3,
      fat: 0.45,
      carbohydrates: 0.25,
    },
  },
];

