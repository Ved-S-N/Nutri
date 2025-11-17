import { Response } from "express";
import Hydration from "../models/Hydration";
// import { AuthRequest } from "../types/express"
import { AuthRequest } from "../types/express";

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
