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
    id: "normal",
    label: "Normal",
    subtitle: "No restrictions",
    description: "A balanced diet",
    detailDescription:
      "A standard balanced diet including all food groups without specific restrictions.",
    image: { uri: "https://spoonacular.com/recipeImages/659109-312x231.jpg" }, // Salmon with roasted vegetables
    spoonacularDiet: "",
    targetCalories: 2300,
    sourceUrl: "https://spoonacular.com/meal-planner?timeFrame=day",
    defaultMacros: {
      protein: 0.25,
      fat: 0.3,
      carbohydrates: 0.45,
    },
  },
  {
    id: "gluten-free",
    label: "Gluten Free",
    subtitle: "No gluten",
    description: "Eliminates gluten-containing grains",
    detailDescription:
      "Eliminates gluten, a protein found in wheat, barley, and rye. Essential for those with celiac disease or gluten sensitivity.",
    image: { uri: "https://spoonacular.com/recipeImages/644387-312x231.jpg" }, // Garlic Roasted Potatoes
    spoonacularDiet: "gluten-free",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=gluten-free&timeFrame=day",
    defaultMacros: {
      protein: 0.25,
      fat: 0.35,
      carbohydrates: 0.4,
    },
  },
  {
    id: "ketogenic",
    label: "Ketogenic",
    subtitle: "High fat, low carb",
    description: "Metabolic state of ketosis",
    detailDescription:
      "A high-fat, adequate-protein, low-carbohydrate diet that forces the body to burn fats rather than carbohydrates.",
    image: { uri: "https://spoonacular.com/recipeImages/636230-312x231.jpg" }, // Broccoli with cheese soup
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
    subtitle: "No meat",
    description: "Plant-based diet",
    detailDescription:
      "No ingredients may contain meat or meat by-products, such as bones or gelatin.",
    image: { uri: "https://spoonacular.com/recipeImages/633508-312x231.jpg" }, // Baked Cheese Manicotti
    spoonacularDiet: "vegetarian",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=vegetarian&timeFrame=day",
    defaultMacros: {
      protein: 0.2,
      fat: 0.3,
      carbohydrates: 0.5,
    },
  },
  {
    id: "lacto-vegetarian",
    label: "Lacto-Vegetarian",
    subtitle: "No meat or eggs",
    description: "Vegetarian plus dairy",
    detailDescription:
      "All ingredients must be vegetarian and none of the ingredients can be or contain egg.",
    image: { uri: "https://spoonacular.com/recipeImages/638257-312x231.jpg" }, // Grilled Cheese
    spoonacularDiet: "lacto-vegetarian",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=lacto-vegetarian&timeFrame=day",
    defaultMacros: {
      protein: 0.2,
      fat: 0.3,
      carbohydrates: 0.5,
    },
  },
  {
    id: "ovo-vegetarian",
    label: "Ovo-Vegetarian",
    subtitle: "No meat or dairy",
    description: "Vegetarian plus eggs",
    detailDescription:
      "All ingredients must be vegetarian and none of the ingredients can be or contain dairy.",
    image: { uri: "https://spoonacular.com/recipeImages/656329-312x231.jpg" }, // Poached Eggs
    spoonacularDiet: "ovo-vegetarian",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=ovo-vegetarian&timeFrame=day",
    defaultMacros: {
      protein: 0.2,
      fat: 0.3,
      carbohydrates: 0.5,
    },
  },
  {
    id: "vegan",
    label: "Vegan",
    subtitle: "No animal products",
    description: "Strictly plant-based",
    detailDescription:
      "No ingredients may contain meat or meat by-products, such as bones or gelatin, nor may they contain eggs, dairy, or honey.",
    image: { uri: "https://spoonacular.com/recipeImages/633221-312x231.jpg" }, // Baby Beet Salad
    spoonacularDiet: "vegan",
    targetCalories: 2200,
    sourceUrl: "https://spoonacular.com/meal-planner?diet=vegan&timeFrame=day",
    defaultMacros: {
      protein: 0.2,
      fat: 0.3,
      carbohydrates: 0.5,
    },
  },
  {
    id: "pescetarian",
    label: "Pescetarian",
    subtitle: "Vegetarian + Seafood",
    description: "Fish allowed, no meat",
    detailDescription:
      "Everything is allowed except meat and meat by-products - some pescetarians eat eggs and dairy, some do not.",
    image: { uri: "https://spoonacular.com/recipeImages/642605-312x231.jpg" }, // Faroe Island Salmon
    spoonacularDiet: "pescetarian",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=pescetarian&timeFrame=day",
    defaultMacros: {
      protein: 0.3,
      fat: 0.3,
      carbohydrates: 0.4,
    },
  },
  {
    id: "paleo",
    label: "Paleo",
    subtitle: "Ancestral eating",
    description: "Caveman diet",
    detailDescription:
      "Allowed ingredients include meat (grass fed), fish, eggs, vegetables, some oils (e.g. coconut and olive oil), and in smaller quantities, fruit, nuts, and sweet potatoes.",
    image: { uri: "https://spoonacular.com/recipeImages/659109-312x231.jpg" }, // Salmon with roasted vegetables
    spoonacularDiet: "paleo",
    targetCalories: 2300,
    sourceUrl: "https://spoonacular.com/meal-planner?diet=paleo&timeFrame=day",
    defaultMacros: {
      protein: 0.35,
      fat: 0.45,
      carbohydrates: 0.2,
    },
  },
  {
    id: "primal",
    label: "Primal",
    subtitle: "Like Paleo + Dairy",
    description: "Ancestral with dairy",
    detailDescription:
      "Very similar to Paleo, except dairy is allowed - think raw and fermented dairy. Legumes, grains, processed sugar, soy, and other processed foods are excluded.",
    image: { uri: "https://spoonacular.com/recipeImages/636602-312x231.jpg" }, // Butternut Squash Soup
    spoonacularDiet: "primal",
    targetCalories: 2300,
    sourceUrl: "https://spoonacular.com/meal-planner?diet=primal&timeFrame=day",
    defaultMacros: {
      protein: 0.35,
      fat: 0.45,
      carbohydrates: 0.2,
    },
  },
  {
    id: "low-fodmap",
    label: "Low FODMAP",
    subtitle: "Gut friendly",
    description: "For IBS management",
    detailDescription:
      "FODMAP stands for Fermentable Oligo-, Di-, Mono-saccharides And Polyols. Our diet includes low FODMAP foods and excludes high FODMAP foods.",
    image: { uri: "https://spoonacular.com/recipeImages/644387-312x231.jpg" }, // Garlic Roasted Potatoes
    spoonacularDiet: "low-fodmap",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=low-fodmap&timeFrame=day",
    defaultMacros: {
      protein: 0.25,
      fat: 0.3,
      carbohydrates: 0.45,
    },
  },
  {
    id: "whole30",
    label: "Whole30",
    subtitle: "30 day reset",
    description: "Strict elimination",
    detailDescription:
      "Allowed ingredients include meat, fish/seafood, eggs, vegetables, fresh fruit, coconut oil, olive oil, small amounts of dried fruit and nuts/seeds.",
    image: { uri: "https://spoonacular.com/recipeImages/655575-312x231.jpg" }, // Avocado Salad
    spoonacularDiet: "whole30",
    targetCalories: 2300,
    sourceUrl:
      "https://spoonacular.com/meal-planner?diet=whole30&timeFrame=day",
    defaultMacros: {
      protein: 0.3,
      fat: 0.4,
      carbohydrates: 0.3,
    },
  },
];
