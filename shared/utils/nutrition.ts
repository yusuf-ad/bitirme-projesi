export interface NutrientLike {
  name?: string;
  amount?: number;
  unit?: string;
}

export interface MacroSummary {
  calories?: number | null;
  carbs?: number | null;
  protein?: number | null;
  fat?: number | null;
}

export function findNutrientValue(
  name: string,
  nutrients?: NutrientLike[]
): NutrientLike | null {
  if (!Array.isArray(nutrients)) {
    return null;
  }

  const normalizedTarget = name.trim().toLowerCase();

  return (
    nutrients.find((nutrient) => {
      if (!nutrient?.name) {
        return false;
      }
      return nutrient.name.trim().toLowerCase() === normalizedTarget;
    }) ?? null
  );
}

export function findMacro(name: string, nutrients?: NutrientLike[]) {
  const nutrient = findNutrientValue(name, nutrients);
  return {
    amount: nutrient?.amount ?? 0,
    unit: nutrient?.unit ?? "g",
  };
}

export function getMacroSummary(
  nutrients?: NutrientLike[]
): MacroSummary | null {
  if (!Array.isArray(nutrients)) {
    return null;
  }

  const calories = findNutrientValue("Calories", nutrients)?.amount ?? null;
  const carbs = findNutrientValue("Carbohydrates", nutrients)?.amount ?? null;
  const protein = findNutrientValue("Protein", nutrients)?.amount ?? null;
  const fat = findNutrientValue("Fat", nutrients)?.amount ?? null;

  return {
    calories,
    carbs,
    protein,
    fat,
  };
}

