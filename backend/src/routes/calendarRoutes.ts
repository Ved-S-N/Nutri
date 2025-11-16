import express from "express";
import { getCalendarMonth } from "../controllers/calendarController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/month", protect, getCalendarMonth);

export default router;
