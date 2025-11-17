import { Response } from "express";
import Workout from "../models/Workout";
// import { AuthRequest } from "../types/express"
import { AuthRequest } from "../types/express";

// ✅ Add a Workout
export const addWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { date, type, durationMinutes, intensity, caloriesBurned } = req.body;

    if (!date || !type || !durationMinutes) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newWorkout = new Workout({
      userId,
      date: new Date(date),
      type,
      durationMinutes,
      intensity,
      caloriesBurned,
    });

    await newWorkout.save();
    res.status(201).json(newWorkout);
  } catch (error) {
    console.error("Error adding workout:", error);
    res.status(500).json({ message: "Error adding workout", error });
  }
};

// ✅ Get all workouts for a specific date
export const getWorkoutsByDate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { date } = req.params; // 👈 FIXED HERE

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    // Convert to start/end of the day range
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const workouts = await Workout.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error) {
    console.error("Error fetching workouts:", error);
    res.status(500).json({ message: "Error fetching workouts", error });
  }
};

// ✅ Delete a workout
export const deleteWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const workout = await Workout.findOneAndDelete({ _id: id, userId });

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    res.json({ message: "Workout deleted", id });
  } catch (error) {
    console.error("Error deleting workout:", error);
    res.status(500).json({ message: "Error deleting workout", error });
  }
};

// GET /api/workouts/range?days=7
export const getWorkoutsRange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const days = Number(req.query.days) || 7;

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    const workouts = await Workout.find({
      userId: userId, // FIXED field name
      date: { $gte: cutoff },
    }).sort({ date: 1 });

    res.json(workouts);
  } catch (err) {
    console.error("❌ Workout range error:", err);
    return res.status(500).json({ message: "Error fetching workouts" });
  }
};
