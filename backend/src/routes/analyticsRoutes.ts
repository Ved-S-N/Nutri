// src/routes/analyticsRoutes.ts
import express from "express";
import { weightStats } from "../controllers/analyticsController";
import { protect } from "../types/express";

const router = express.Router();
router.get("/weight", protect, weightStats);

export default router;
