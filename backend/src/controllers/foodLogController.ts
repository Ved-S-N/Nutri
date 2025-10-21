// src/controllers/foodLogController.ts
import { Request, Response } from "express";
import Food from "../models/Food";
import FoodLog from "../models/FoodLog";
import { scaleMacros } from "../utils/macroCalculator";
import mongoose from "mongoose";

export const addFoodLog = async (req: any, res: Response) => {
  const user = req.user;
  const { foodId, quantity, date } = req.body;
  if (!foodId || !quantity)
    return res.status(400).json({ message: "foodId and quantity required" });

  const food = await Food.findById(foodId);
  if (!food) return res.status(404).json({ message: "Food not found" });

  const macros = scaleMacros(
    {
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
    },
    quantity
  );

  const log = new FoodLog({
    user: user._id,
    food: food._id,
    quantity,
    calories: macros.calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fat: macros.fat,
    date: date ? new Date(date) : new Date(),
  });

  await log.save();
  res.status(201).json(log);
};

export const getDailySummary = async (req: any, res: Response) => {
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
      acc.calories += l.calories;
      acc.protein += l.protein;
      acc.carbs += l.carbs;
      acc.fat += l.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  res.json({ logs, totals });
};

export const deleteFoodLog = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid id" });
  await FoodLog.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};
