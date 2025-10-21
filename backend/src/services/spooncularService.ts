// src/services/spoonacularService.ts
import axios from "axios";

export interface SpoonacularFood {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export const searchFoodSpoonacular = async (
  query: string
): Promise<SpoonacularFood[]> => {
  const apiKey = process.env.SPOONACULAR_API_KEY;
  const base = "https://api.spoonacular.com/food/ingredients/search";

  try {
    // Step 1: Search for ingredients matching the query
    const searchRes = await axios.get(base, {
      params: { query, number: 5, apiKey },
    });

    if (!searchRes.data.results?.length) return [];

    // Step 2: Fetch detailed nutrition info for each ingredient
    const ingredientIds = searchRes.data.results.map((r: any) => r.id);
    const detailPromises = ingredientIds.map((id: number) =>
      axios.get(
        `https://api.spoonacular.com/food/ingredients/${id}/information`,
        {
          params: { amount: 100, unit: "grams", apiKey },
        }
      )
    );

    const detailedResponses = await Promise.allSettled(detailPromises);

    const formatted = detailedResponses
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => {
        const d = r.value.data;
        const nutrients = d.nutrition?.nutrients || [];

        const getNutrient = (name: string) =>
          nutrients.find(
            (n: any) => n.name.toLowerCase() === name.toLowerCase()
          )?.amount || 0;

        return {
          name: d.name,
          calories: getNutrient("Calories"),
          protein: getNutrient("Protein"),
          carbs: getNutrient("Carbohydrates"),
          fat: getNutrient("Fat"),
        };
      });

    return formatted;
  } catch (err) {
    console.error("Spoonacular API error:", err);
    return [];
  }
};
