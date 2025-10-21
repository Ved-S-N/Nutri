import { Request, Response } from "express";
import Food from "../models/Food";
import { searchFoodUSDA } from "../services/aiService";
import { searchFoodSpoonacular } from "../services/spooncularService";

export const searchFoods = async (req: Request, res: Response) => {
  const q = (req.query.q as string) || "";
  if (!q) return res.status(400).json({ message: "Missing query" });

  try {
    const apiKey = process.env.AI_API_KEY || "";

    // 1️⃣ Try USDA first
    const usdaResults = await searchFoodUSDA(q, apiKey);

    let combinedResults: any[] = [];

    if (usdaResults && usdaResults.length > 0) {
      const foodPromises = usdaResults.map(async (usdaFood) => {
        const foodInDb = await Food.findOneAndUpdate(
          { fdcId: usdaFood.fdcId },
          {
            fdcId: usdaFood.fdcId,
            name: usdaFood.name,
            calories: usdaFood.calories,
            protein: usdaFood.protein,
            carbs: usdaFood.carbs,
            fat: usdaFood.fat,
          },
          { upsert: true, new: true }
        );
        return foodInDb;
      });

      const localFoods = await Promise.all(foodPromises);

      combinedResults = localFoods.map((food) => ({
        foodId: food._id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }));
    }

    // 2️⃣ If USDA fails or gives too few results → Fallback to Spoonacular
    if (combinedResults.length < 3) {
      console.log(
        `⚠️ USDA returned few results, trying Spoonacular for '${q}'`
      );
      const spoonacularResults = await searchFoodSpoonacular(q);

      // Add Spoonacular foods to DB (for caching)
      const spoonFoods = await Promise.all(
        spoonacularResults.map(async (item) => {
          const foodInDb = await Food.findOneAndUpdate(
            { name: new RegExp(`^${item.name}$`, "i") },
            {
              name: item.name,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fat: item.fat,
            },
            { upsert: true, new: true }
          );
          return foodInDb;
        })
      );

      combinedResults.push(
        ...spoonFoods.map((food) => ({
          foodId: food._id,
          name: food.name,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        }))
      );
    }

    // 3️⃣ If still empty → fallback to local DB search
    if (combinedResults.length === 0) {
      const mongoResults = await Food.find({
        name: { $regex: q, $options: "i" },
      }).limit(10);

      combinedResults = mongoResults.map((food) => ({
        foodId: food._id,
        name: food.name,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
      }));
    }

    if (combinedResults.length === 0) {
      return res.status(404).json({ message: "No food found" });
    }

    // 4️⃣ Return the unified response
    return res.json(combinedResults);
  } catch (err) {
    console.error("Food search failed", err);
    res.status(500).json({ message: "Food search failed" });
  }
};
