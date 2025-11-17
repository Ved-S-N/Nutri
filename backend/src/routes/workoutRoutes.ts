import express from "express";
import {
  addWorkout,
  getWorkoutsByDate,
  deleteWorkout,
  getWorkoutsRange,
} from "../controllers/workoutController";
import { protect } from "../types/express";

const router = express.Router();

router.post("/", protect, addWorkout);
router.get("/range", protect, getWorkoutsRange);
router.get("/:date", protect, getWorkoutsByDate);

router.delete("/:id", protect, deleteWorkout);

export default router;
