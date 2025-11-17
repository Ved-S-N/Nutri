import { Request, Response } from "express";
import CustomFood from "../models/CustomFood";
import { AuthRequest } from "../types/express";

export const createCustomFood = async (req: AuthRequest, res: Response) => {
  const { name, ingredients } = req.body;

  if (!name || !ingredients?.length)
    return res.status(400).json({ message: "Name and ingredients required" });

  const totals = ingredients.reduce(
    (acc, i) => {
      acc.calories += i.calories;
      acc.protein += i.protein;
      acc.carbs += i.carbs;
      acc.fat += i.fat;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const customFood = await CustomFood.create({
    user: req.user._id,
    name,
    ingredients,
    totalCalories: totals.calories,
    totalProtein: totals.protein,
    totalCarbs: totals.carbs,
    totalFat: totals.fat,
  });

  res.status(201).json(customFood);
};

export const getUserCustomFoods = async (req: AuthRequest, res: Response) => {
  const foods = await CustomFood.find({ user: req.user._id });
  res.json(foods);
};
