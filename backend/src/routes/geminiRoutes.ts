import express from "express";
import { generateAISummary } from "../controllers/geminiController";
import { protect } from "../types/express";
const router = express.Router();

router.post("/summary", protect, generateAISummary);

export default router;
