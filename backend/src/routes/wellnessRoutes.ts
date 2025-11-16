import express from "express";
import {
  setWellnessForDate,
  getWellnessByDate,
  getWellnessRange,
} from "../controllers/WellnessController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, setWellnessForDate);
router.get("/range", protect, getWellnessRange);
router.get("/:date", protect, getWellnessByDate);

export default router;
