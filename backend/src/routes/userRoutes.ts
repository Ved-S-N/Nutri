// src/routes/userRoutes.ts
import express from "express";
import { updateGoal } from "../controllers/userController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();
router.put("/update-goal", protect, updateGoal);

export default router;
