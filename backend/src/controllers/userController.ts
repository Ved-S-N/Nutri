// src/controllers/userController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../types/express";

export const updateGoal = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { goalWeight, goalMode } = req.body;
  if (goalWeight !== undefined) user.goalWeight = goalWeight;
  if (goalMode) user.goalMode = goalMode;
  await user.save();
  res.json({ message: "Updated", user });
};
