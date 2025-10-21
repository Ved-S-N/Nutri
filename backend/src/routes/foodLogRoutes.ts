// src/routes/foodLogRoutes.ts
import express from "express";
import {
  addFoodLog,
  getDailySummary,
  deleteFoodLog,
} from "../controllers/foodLogController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.post("/add", protect, addFoodLog);
router.get("/daily", protect, getDailySummary);
router.delete("/:id", protect, deleteFoodLog);

export default router;
