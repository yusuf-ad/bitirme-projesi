// Cuisines
export const CUISINES = {
  AMERICAN: "american",
  ASIAN: "asian",
  CHINESE: "chinese",
  FRENCH: "french",
  GREEK: "greek",
  INDIAN: "indian",
  ITALIAN: "italian",
  JAPANESE: "japanese",
  MEDITERRANEAN: "mediterranean",
  MEXICAN: "mexican",
  MIDDLE_EASTERN: "middleeastern",
  THAI: "thai",
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

export const POPULAR_INGREDIENTS: {
  spoonacularId?: number | null;
  name: string;
  image?: string;
}[] = [
  { spoonacularId: 5115, name: "Chicken", image: "whole-chicken.jpg" },
  { spoonacularId: 1123, name: "Egg", image: "egg.png" },
  { spoonacularId: 20420, name: "Pasta", image: "fusilli.jpg" },
  { spoonacularId: 20444, name: "Rice", image: "uncooked-white-rice.png" },
  {
    spoonacularId: 10023572,
    name: "Beef Mince",
    image: "fresh-ground-beef.jpg",
  },
  { spoonacularId: 11090, name: "Broccoli", image: "broccoli.jpg" },
  { spoonacularId: 16213, name: "Tofu", image: "tofu.png" },
  { spoonacularId: 15076, name: "Salmon", image: "salmon.png" },
  { spoonacularId: 10011457, name: "Spinach", image: "spinach.jpg" },
  { spoonacularId: 1011077, name: "Milk", image: "milk.png" },
  { spoonacularId: 20035, name: "Quinoa", image: "uncooked-quinoa.png" },
  {
    spoonacularId: 10011693,
    name: "Canned Tomato",
    image: "tomatoes-canned.png",
  },
  { spoonacularId: 23572, name: "Beef", image: "beef-cubes-raw.png" },
  { spoonacularId: 10017224, name: "Lamb", image: "lamb-shanks.jpg" },
  { spoonacularId: 11260, name: "Mushroom", image: "mushrooms-white.jpg" },
  { spoonacularId: 11352, name: "Potato", image: "potatoes-yukon-gold.jpg" },
  { spoonacularId: 11529, name: "Tomato", image: "tomato.png" },
  { spoonacularId: 20429, name: "Noodles", image: "egg-noodles.jpg" },
  {
    spoonacularId: 11052,
    name: "Green Beans",
    image: "green-beans-or-string-beans.jpg",
  },
  { spoonacularId: 98973, name: "Cheese", image: "cheddar-cheese.png" },
  { spoonacularId: 1011256, name: "Yogurt", image: "plain-yogurt.jpg" },
  { spoonacularId: 16057, name: "Chickpeas", image: "chickpeas.png" },
  { spoonacularId: 10316069, name: "Lentils", image: "lentils-brown.jpg" },
  { spoonacularId: 11282, name: "Onion", image: "brown-onion.png" },
  { spoonacularId: 11215, name: "Garlic", image: "garlic.png" },
  { spoonacularId: 11124, name: "Carrot", image: "sliced-carrot.png" },
  {
    spoonacularId: 10211821,
    name: "Bell Pepper",
    image: "bell-pepper-orange.png",
  },
];

export const POPULAR_CUISINES: {
  id: string;
  name: string;
  flag?: string;
}[] = [
  { id: "american", name: "American", flag: "🇺🇸" },
  { id: "asian", name: "Asian", flag: "🌏" },
  { id: "chinese", name: "Chinese", flag: "🇨🇳" },
  { id: "french", name: "French", flag: "🇫🇷" },
  { id: "greek", name: "Greek", flag: "🇬🇷" },
  { id: "indian", name: "Indian", flag: "🇮🇳" },
  { id: "italian", name: "Italian", flag: "🇮🇹" },
  { id: "japanese", name: "Japanese", flag: "🇯🇵" },
  { id: "mediterranean", name: "Mediterranean", flag: "🏛️" },
  { id: "mexican", name: "Mexican", flag: "🇲🇽" },
  { id: "middleeastern", name: "Middle Eastern", flag: "🇸🇦" },
  { id: "thai", name: "Thai", flag: "🇹🇭" },
];
