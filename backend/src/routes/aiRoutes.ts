import express from "express";
import multer from "multer";
import { recognizeFoodFromImage } from "../services/aiService";
import { protect } from "../types/express";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/recognize", protect, upload.single("image"), async (req, res) => {
  const result = await recognizeFoodFromImage(req.file!);
  res.json(result || { message: "Vision model not connected yet" });
});

export default router;
