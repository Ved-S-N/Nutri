// src/controllers/analyticsController.ts
import { Request, Response } from "express";
import WeightLog from "../models/WeightLog";

/**
 * Provides a simple weekly summary for weight:
 * ?start=YYYY-MM-DD&end=YYYY-MM-DD
 */
export const weightStats = async (req: Request, res: Response) => {
  const user = req.user;
  const start = req.query.start ? new Date(req.query.start as string) : null;
  const end = req.query.end ? new Date(req.query.end as string) : null;

  const match: any = { user: user._id };
  if (start || end) {
    match.date = {};
    if (start) match.date.$gte = start;
    if (end) match.date.$lte = end;
  }

  const entries = await WeightLog.find(match).sort({ date: 1 });
  // simple stats
  const weights = entries.map((e: any) => ({ date: e.date, weight: e.weight }));
  const average =
    weights.length > 0
      ? weights.reduce((s: number, w: any) => s + w.weight, 0) / weights.length
      : 0;
  res.json({ weights, average: Number(average.toFixed(2)) });
};
