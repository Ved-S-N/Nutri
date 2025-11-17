import axios from "axios";
import { Request, Response } from "express";

export const getFoodByBarcode = async (req: AuthRequest, res: Response) => {
  const { code } = req.params;
  if (!code) return res.status(400).json({ message: "Missing barcode" });

  console.log(`[BARCODE] Fetching product info for ${code}`);

  try {
    // 1️⃣ Try OpenFoodFacts
    const offUrl = `https://world.openfoodfacts.org/api/v0/product/${code}.json`;
    const offRes = await axios.get(offUrl);

    if (offRes.data?.status === 1 && offRes.data.product) {
      const p = offRes.data.product;
      console.log(`[BARCODE] ✅ Found in OpenFoodFacts: ${p.product_name}`);
      return res.json({
        name: p.product_name || "Unknown Product",
        brand: p.brands || "Unknown",
        calories:
          p.nutriments["energy-kcal_100g"] ||
          Math.round((p.nutriments["energy-kj_100g"] || 0) / 4.184) ||
          0,
        protein: p.nutriments["proteins_100g"] || 0,
        carbs: p.nutriments["carbohydrates_100g"] || 0,
        fat: p.nutriments["fat_100g"] || 0,
        servingSize: "100g",
        source: "OpenFoodFacts",
      });
    }

    // 2️⃣ Fallback: Spoonacular (only if API key is configured)
    const spoonKey = process.env.SPOON_API_KEY;
    if (spoonKey) {
      console.log(`[BARCODE] ❌ Not in OFF, trying Spoonacular...`);
      try {
        const spoonUrl = `https://api.spoonacular.com/food/products/upc/${code}?apiKey=${spoonKey}`;
        const spoonRes = await axios.get(spoonUrl);

        if (spoonRes.data?.title) {
          const prod = spoonRes.data;
          console.log(`[BARCODE] ✅ Found in Spoonacular: ${prod.title}`);

          return res.json({
            name: prod.title || "Unknown Product",
            brand: prod.brand || "Unknown",
            calories: prod.nutrition?.calories || 0,
            protein: prod.nutrition?.protein || 0,
            carbs: prod.nutrition?.carbs || 0,
            fat: prod.nutrition?.fat || 0,
            servingSize: "100g",
            source: "Spoonacular",
          });
        }
      } catch (spoonErr: any) {
        console.warn(
          `[BARCODE] Spoonacular lookup failed:`,
          spoonErr.response?.status || spoonErr.message
        );
      }
    }

    // 3️⃣ Nothing found
    console.warn(`[BARCODE] No product found for ${code}`);
    return res.status(404).json({ message: "Product not found" });
  } catch (err: any) {
    console.error("[BARCODE] Unexpected error:", err.message);
    return res
      .status(500)
      .json({ message: "Unexpected server error while fetching barcode" });
  }
};
