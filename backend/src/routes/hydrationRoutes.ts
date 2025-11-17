import express from "express";
import {
  setHydrationForDate,
  getHydrationByDate,
  getHydrationRange,
} from "../controllers/hydrationController";
import { protect } from "../types/express";

const router = express.Router();

router.post("/", protect, setHydrationForDate);
router.get("/range", protect, getHydrationRange);
router.get("/:date", protect, getHydrationByDate);

export default router;
