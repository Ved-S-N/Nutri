// src/routes/weightRoutes.ts
import express from "express";
import {
  addWeight,
  getWeightHistory,
  deleteWeight,
} from "../controllers/weightController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.post("/weight-log", protect, addWeight);
router.get("/weight-log", protect, getWeightHistory);
router.delete("/:id", protect, deleteWeight);

export default router;
