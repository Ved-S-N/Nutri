import express from "express";
import { generateAISummary } from "../controllers/geminiController";
import { protect } from "../middleware/authMiddleware";
const router = express.Router();

router.post("/summary", protect, generateAISummary);

export default router;
