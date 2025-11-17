import express from "express";
import { getCalendarMonth } from "../controllers/calendarController";
import { protect } from "../types/express";

const router = express.Router();

router.get("/month", protect, getCalendarMonth);

export default router;
