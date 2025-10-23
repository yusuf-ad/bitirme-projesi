// Cuisines
export const CUISINES = {
  AFRICAN: "african",
  ASIAN: "asian",
  AMERICAN: "american",
  BRITISH: "british",
  CAJUN: "cajun",
  CARIBBEAN: "caribbean",
  CHINESE: "chinese",
  EASTERN_EUROPEAN: "easterneuropean",
  EUROPEAN: "european",
  FRENCH: "french",
  GERMAN: "german",
  GREEK: "greek",
  INDIAN: "indian",
  IRISH: "irish",
  ITALIAN: "italian",
  JAPANESE: "japanese",
  JEWISH: "jewish",
  KOREAN: "korean",
  LATIN_AMERICAN: "latinamerican",
  MEDITERRANEAN: "mediterranean",
  MEXICAN: "mexican",
  MIDDLE_EASTERN: "middleeastern",
  NORDIC: "nordic",
  SOUTHERN: "southern",
  SPANISH: "spanish",
  THAI: "thai",
  VIETNAMESE: "vietnamese",
} as const;

export const cuisines = Object.values(CUISINES);

// Diets
export const DIETS = {
  GLUTEN_FREE: "glutenfree",
  KETOGENIC: "ketogenic",
  VEGETARIAN: "vegetarian",
  LACTO_VEGETARIAN: "lactovegetarian",
  OVO_VEGETARIAN: "ovovegetarian",
  VEGAN: "vegan",
  PESCETARIAN: "pescetarian",
  PALEO: "paleo",
  PRIMAL: "primal",
  LOW_FODMAP: "lowfodmap",
  WHOLE30: "whole30",
} as const;

export const diets = Object.values(DIETS);

// Meal Types
export const MEAL_TYPES = {
  MAIN_COURSE: "maincourse",
  SIDE_DISH: "sidedish",
  DESSERT: "dessert",
  APPETIZER: "appetizer",
  SALAD: "salad",
  BREAD: "bread",
  BREAKFAST: "breakfast",
  SOUP: "soup",
  BEVERAGE: "beverage",
  SAUCE: "sauce",
  MARINADE: "marinade",
  FINGER_FOOD: "fingerfood",
  SNACK: "snack",
  DRINK: "drink",
} as const;

export const meal_types = Object.values(MEAL_TYPES);
