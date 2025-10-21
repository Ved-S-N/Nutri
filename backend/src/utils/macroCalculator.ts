// src/utils/macroCalculator.ts
/**
 * Calculates macros for a given base-per-100g food and provided quantity (grams).
 * Returns calories, protein, carbs, fat rounded to 2 decimal places.
 */
export const scaleMacros = (
  basePer100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  },
  grams: number
) => {
  const factor = grams / 100;
  const round = (v: number) => Math.round(v * 100) / 100;
  return {
    calories: round(basePer100g.calories * factor),
    protein: round(basePer100g.protein * factor),
    carbs: round(basePer100g.carbs * factor),
    fat: round(basePer100g.fat * factor),
  };
};
