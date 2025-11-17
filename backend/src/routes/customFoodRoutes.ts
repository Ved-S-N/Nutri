import express from "express";
import { protect } from "../types/express";
import { getFoodByBarcode } from "../controllers/barcodeController";
import {
  createCustomFood,
  getUserCustomFoods,
} from "../controllers/customFoodController";

const router = express.Router();

router.get("/barcode/:code", protect, getFoodByBarcode);
router.post("/custom", protect, createCustomFood);
router.get("/custom", protect, getUserCustomFoods);

export default router;
