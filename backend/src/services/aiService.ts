import axios from "axios";

/**
 * Search the USDA FoodData Central API by keyword and return cleaned results.
 */
export const searchFoodUSDA = async (query: string, apiKey: string) => {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search`;

  const { data } = await axios.get(url, {
    params: { api_key: apiKey, query, pageSize: 25 },
  });

  const results = (data.foods || [])
    .map((item: any) => {
      const n = item.foodNutrients || [];
      const get = (name: string) => {
        const found = n.find((f: any) =>
          f.nutrientName?.toLowerCase().includes(name)
        );
        return found ? Number(found.value) : 0;
      };

      const calories = get("energy");
      const protein = get("protein");
      const carbs = get("carbohydrate");
      const fat = get("fat");

      return {
        name: item.description,
        calories,
        protein,
        carbs,
        fat,
        servingSize: "100g",
      };
    })
    // 🧠 Filter out weird or incomplete entries
    .filter(
      (f: any) =>
        f.calories > 0 &&
        f.protein >= 0 &&
        f.name.toLowerCase().includes(query.toLowerCase())
    )
    // 🪄 Sort by relevance (more protein first, then fewer carbs)
    .sort((a: any, b: any) => b.protein - a.protein)
    // limit to top 5–10
    .slice(0, 10);

  return results;
};
