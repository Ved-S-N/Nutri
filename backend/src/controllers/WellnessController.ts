// import { Response } from "express";
// import Wellness from "../models/Wellness";
// import { AuthRequest } from "../middleware/authMiddleware"; // 1. Import AuthRequest

// export const setWellnessForDate = async (req: AuthRequest, res: Response) => {
//   try {
//     const userId = req.user?._id;
//     const { date, sleepHours, moodRating, notes } = req.body;

//     if (!date) {
//       return res.status(400).json({ message: "Date is required" });
//     }

//     // This finds the document for the *start* of the given day
//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);

//     const updated = await Wellness.findOneAndUpdate(
//       { userId, date: startDate }, // Find based on the start of the day
//       { userId, date: startDate, sleepHours, moodRating, notes }, // Ensure date is stored consistently
//       { new: true, upsert: true }
//     );

//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating wellness", error });
//   }
// };

// export const getWellnessByDate = async (req: AuthRequest, res: Response) => {
//   try {
//     const userId = req.user?._id;
//     const { date } = req.params;

//     if (!date) {
//       return res.status(400).json({ message: "Date parameter is required" });
//     }

//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);
//     const endDate = new Date(date);
//     endDate.setHours(23, 59, 59, 999);

//     const wellness = await Wellness.findOne({
//       userId,
//       date: { $gte: startDate, $lte: endDate },
//     });
//     res.json(wellness);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching wellness", error });
//   }
// };

// export const getWellnessRange = async (req: any, res: Response) => {
//   try {
//     const userId = req.user._id;
//     const days = Number(req.query.days) || 7;

//     const cutoff = new Date();
//     cutoff.setHours(0, 0, 0, 0);
//     cutoff.setDate(cutoff.getDate() - days);

//     const wellness = await Wellness.find({
//       user: userId,
//       date: { $gte: cutoff },
//     }).sort({ date: 1 });

//     res.json(wellness);
//   } catch (err) {
//     console.error("❌ Wellness range error:", err);
//     return res.status(500).json({ message: "Error fetching wellness" });
//   }
// };

// src/controllers/wellnessController.ts
import { Response } from "express";
import Wellness from "../models/Wellness";
import { AuthRequest } from "../middleware/authMiddleware";

// ✅ Set wellness for a day
export const setWellnessForDate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { date, sleepHours, moodRating, notes } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const updated = await Wellness.findOneAndUpdate(
      { userId, date: startDate },
      { userId, date: startDate, sleepHours, moodRating, notes },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error updating wellness", error });
  }
};

// ✅ Get wellness for a specific date
export const getWellnessByDate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const wellness = await Wellness.findOne({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    res.json(wellness);
  } catch (error) {
    res.status(500).json({ message: "Error fetching wellness", error });
  }
};

// ✅ FIXED VERSION — wellness range for Insights Dashboard
export const getWellnessRange = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const days = Number(req.query.days) || 7;

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    // 👇 FIXED (was `user`, now correct `userId`)
    const wellnessLogs = await Wellness.find({
      userId,
      date: { $gte: cutoff },
    }).sort({ date: 1 });

    res.json(wellnessLogs);
  } catch (err) {
    console.error("❌ Wellness range error:", err);
    return res.status(500).json({ message: "Error fetching wellness" });
  }
};
