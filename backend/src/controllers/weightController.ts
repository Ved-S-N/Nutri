// src/controllers/weightController.ts
import { Request, Response } from "express";
import WeightLog from "../models/WeightLog";
import mongoose from "mongoose";
import { AuthRequest } from "../types/express";

/**
 * Add a weight entry.
 * Body: { weight: number, date?: string }
 */
export const addWeight = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const { weight, date } = req.body;
  if (!weight) return res.status(400).json({ message: "weight required" });

  const entry = new WeightLog({
    user: user._id,
    weight,
    date: date ? new Date(date) : new Date(),
  });
  await entry.save();

  // Optionally update currentWeight on user
  const User = require("../models/User").default;
  await User.findByIdAndUpdate(user._id, { currentWeight: weight });

  res.status(201).json(entry);
};

export const getWeightHistory = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  const from = req.query.from ? new Date(req.query.from as string) : undefined;
  const to = req.query.to ? new Date(req.query.to as string) : undefined;

  const filter: any = { user: user._id };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = from;
    if (to) filter.date.$lte = to;
  }

  const entries = await WeightLog.find(filter).sort({ date: 1 });
  res.json(entries);
};

export const deleteWeight = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id))
    return res.status(400).json({ message: "Invalid id" });
  await WeightLog.findByIdAndDelete(id);
  res.json({ message: "Deleted" });
};
