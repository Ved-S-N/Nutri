import express from "express";
import {
  analyzeFoodText,
  getTodaysEntries,
} from "../controllers/aiFoodController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/analyze", protect, analyzeFoodText);
router.get("/today", protect, getTodaysEntries);

export default router;
