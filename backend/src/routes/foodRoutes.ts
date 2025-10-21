// src/routes/foodRoutes.ts
import express from "express";
import { searchFoods } from "../controllers/foodController";

const router = express.Router();
router.get("/search", searchFoods);

export default router;
