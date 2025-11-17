// src/routes/favoriteFoodRoutes.ts
import express from "express";
import {
  addFavoriteFood,
  getFavoriteFoods,
  deleteFavoriteFood,
} from "../controllers/favoriteFoodController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.use(protect);

router.post("/add", addFavoriteFood);
router.get("/", getFavoriteFoods);
router.delete("/:id", deleteFavoriteFood);

export default router;
