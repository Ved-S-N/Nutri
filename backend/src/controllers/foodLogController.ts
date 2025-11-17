// src/controllers/foodLogController.ts
import { Request, Response } from "express";
import Food from "../models/Food";
import FoodLog from "../models/FoodLog";
import { scaleMacros } from "../utils/macroCalculator";
import mongoose from "mongoose";
import { AuthRequest } from "../types/express";

/**
 * Add Food Log
 * Supports both database foods (with foodId) and AI foods (direct macros)
 */
export const addFoodLog = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const {
      foodId,
      quantity,
      date,
      mealType,
      calories,
      protein,
      carbs,
      fat,
      foodName,
    } = req.body;

    // 🧾 Validation — must have a meal type + either foodId or macros
    if (!mealType || (!foodId && !calories)) {
      return res.status(400).json({
        message:
          "mealType is required, and you must provide either a foodId or macros.",
      });
    }

    let macros;
    let foodRef: mongoose.Types.ObjectId | undefined = undefined;

    // ✅ Case 1 — Normal food from database
    if (foodId) {
      const food = await Food.findById(foodId);
      if (!food) {
        return res.status(404).json({ message: "Food not found" });
      }

      macros = scaleMacros(
        {
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        },
        quantity || 100
      );

      foodRef = food._id as any;
    } else {
      // ✅ Case 2 — AI or manual entry (macros passed directly)
      macros = {
        calories: Number(calories) || 0,
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fat: Number(fat) || 0,
      };
      foodRef = undefined;
    }

    const log = new FoodLog({
      user: user._id,
      food: foodRef, // optional
      quantity: quantity || 100,
      calories: macros.calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fat: macros.fat,
      date: date ? new Date(date) : new Date(),
      mealType,
      ...(foodName && { name: foodName }), // save display name if provided
    });

    await log.save();
    res.status(201).json(log);
  } catch (err: any) {
    console.error("Error adding food log:", err);
    res.status(500).json({ message: "Failed to add food log" });
  }
};

/**
 * Get all logs + totals for a given day
 */
export const getDailySummary = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const dateQuery = req.query.date
      ? new Date(req.query.date as string)
      : new Date();

    const start = new Date(dateQuery);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateQuery);
    end.setHours(23, 59, 59, 999);

    const logs = await FoodLog.find({
      user: user._id,
      date: { $gte: start, $lte: end },
    }).populate("food");

    const totals = logs.reduce(
      (acc: any, l: any) => {
        acc.calories += l.calories || 0;
        acc.protein += l.protein || 0;
        acc.carbs += l.carbs || 0;
        acc.fat += l.fat || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    res.json({ logs, totals });
  } catch (err: any) {
    console.error("Error fetching daily summary:", err);
    res.status(500).json({ message: "Failed to fetch daily summary" });
  }
};

/**
 * Delete a food log entry
 */
export const deleteFoodLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    await FoodLog.findByIdAndDelete(id);
    res.json({ message: "Deleted" });
  } catch (err: any) {
    console.error("Error deleting food log:", err);
    res.status(500).json({ message: "Failed to delete food log" });
  }
};

export const getFoodLogsRange = async (req: AuthRequest, res: Response) => {
  try {
    const { days = 7 } = req.query;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - Number(days));

    const logs = await FoodLog.find({
      user: req.user._id,
      date: { $gte: cutoff },
    }).sort({ date: 1 });

    res.json(logs);
  } catch (err: any) {
    console.error("Error fetching food logs:", err);
    res.status(500).json({ message: "Failed to fetch range data" });
  }
};
