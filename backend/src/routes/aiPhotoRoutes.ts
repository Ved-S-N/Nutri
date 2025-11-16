import express from "express";
import multer from "multer";
import { analyzeFoodPhoto } from "../controllers/aiPhotoController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

// Use memory storage so image stays in RAM → we convert to base64
const upload = multer({ storage: multer.memoryStorage() });

router.post(
  "/photo",
  protect,
  upload.single("image"), // <── IMPORTANT
  analyzeFoodPhoto
);

export default router;
