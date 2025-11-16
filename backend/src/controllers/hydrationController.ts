// import { Response } from "express";
// import Hydration from "../models/Hydration";
// import { AuthRequest } from "../middleware/authMiddleware"; // 1. Import AuthRequest

// export const setHydrationForDate = async (req: AuthRequest, res: Response) => {
//   try {
//     const userId = req.user?._id;
//     const { date, glassesConsumed, goalGlasses } = req.body;

//     if (!date) {
//       return res.status(400).json({ message: "Date is required" });
//     }

//     // This finds the document for the *start* of the given day
//     const startDate = new Date(date);
//     startDate.setHours(0, 0, 0, 0);

//     const updated = await Hydration.findOneAndUpdate(
//       { userId, date: startDate }, // Find based on the start of the day
//       { userId, date: startDate, glassesConsumed, goalGlasses }, // Ensure date is stored consistently
//       { new: true, upsert: true }
//     );

//     res.json(updated);
//   } catch (error) {
//     res.status(500).json({ message: "Error updating hydration", error });
//   }
// };

// export const getHydrationByDate = async (req: AuthRequest, res: Response) => {
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

//     const hydration = await Hydration.findOne({
//       userId,
//       date: { $gte: startDate, $lte: endDate },
//     });
//     res.json(hydration);
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching hydration", error });
//   }
// };

// export const getHydrationRange = async (req: any, res: Response) => {
//   try {
//     const userId = req.user._id;
//     const days = Number(req.query.days) || 7;

//     const cutoff = new Date();
//     cutoff.setHours(0, 0, 0, 0);
//     cutoff.setDate(cutoff.getDate() - days);

//     const hydration = await HydrationLog.find({
//       user: userId,
//       date: { $gte: cutoff },
//     }).sort({ date: 1 });

//     res.json(hydration);
//   } catch (err) {
//     console.error("❌ Hydration range error:", err);
//     return res.status(500).json({ message: "Error fetching hydration" });
//   }
// };

import { Response } from "express";
import Hydration from "../models/Hydration";
import { AuthRequest } from "../middleware/authMiddleware";

// --------------------------------------
// SET HYDRATION FOR A DATE
// --------------------------------------
export const setHydrationForDate = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const { date, glassesConsumed, goalGlasses } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const updated = await Hydration.findOneAndUpdate(
      { userId, date: startDate },
      { userId, date: startDate, glassesConsumed, goalGlasses },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (error) {
    console.error("❌ setHydrationForDate error:", error);
    res.status(500).json({ message: "Error updating hydration", error });
  }
};

// --------------------------------------
// GET HYDRATION FOR A DATE
// --------------------------------------
export const getHydrationByDate = async (req: AuthRequest, res: Response) => {
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

    const hydration = await Hydration.findOne({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    res.json(hydration);
  } catch (error) {
    console.error("❌ getHydrationByDate error:", error);
    res.status(500).json({ message: "Error fetching hydration", error });
  }
};

// --------------------------------------
// GET HYDRATION RANGE
// GET /api/hydration/range?days=7
// --------------------------------------
export const getHydrationRange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id;
    const days = Number(req.query.days) || 7;

    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - days);

    const hydration = await Hydration.find({
      userId,
      date: { $gte: cutoff },
    }).sort({ date: 1 });

    res.json(hydration);
  } catch (err) {
    console.error("❌ Hydration range error:", err);
    res.status(500).json({ message: "Error fetching hydration" });
  }
};
