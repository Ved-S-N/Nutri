// src/routes/foodRoutes.ts
import express from "express";
import { searchFoods } from "../controllers/foodController";
import { getFoodByBarcode } from "../controllers/barcodeController";
import { createCustomFood } from "../controllers/customFoodController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/search", searchFoods);
router.get("/barcode/:code", getFoodByBarcode);
router.post("/custom", protect, createCustomFood);

export default router;
