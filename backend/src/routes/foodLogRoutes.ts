// src/routes/foodLogRoutes.ts
import express from "express";
import {
  addFoodLog,
  getDailySummary,
  deleteFoodLog,
  getFoodLogsRange,
} from "../controllers/foodLogController";
import { protect } from "../types/express";

const router = express.Router();
router.post("/add", protect, addFoodLog);
router.get("/daily", protect, getDailySummary);
router.get("/range", protect, getFoodLogsRange);
router.delete("/:id", protect, deleteFoodLog);

export default router;
