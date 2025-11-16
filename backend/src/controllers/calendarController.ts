import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import FoodLog from "../models/FoodLog";
import Workout from "../models/Workout";
import Hydration from "../models/Hydration";

// Normalize date (timezone safe)
function normalize(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date) {
  return normalize(a).getTime() === normalize(b).getTime();
}

export const getCalendarMonth = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const month = req.query.month as string;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const [year, monthIndex] = month.split("-").map(Number);

    const start = new Date(year, monthIndex - 1, 1, 0, 0, 0, 0);
    const end = new Date(year, monthIndex, 0, 23, 59, 59, 999);
    const daysInMonth = end.getDate();

    // Load month logs
    const foods = await FoodLog.find({
      user: userId,
      date: { $gte: start, $lte: end },
    });

    const workouts = await Workout.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    const hydration = await Hydration.find({
      userId,
      date: { $gte: start, $lte: end },
    });

    const result: any[] = [];
    const dayTotals: number[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dayStart = normalize(new Date(year, monthIndex - 1, d));
      const iso = dayStart.toISOString();

      const foodsForDay = foods.filter((f) => sameDay(f.date, dayStart));

      const calories = foodsForDay.reduce(
        (sum, f) => sum + (f.calories || 0),
        0
      );
      const protein = foodsForDay.reduce((sum, f) => sum + (f.protein || 0), 0);

      // NEW: Carbs + Fat totals
      const carbs = foodsForDay.reduce((sum, f) => sum + (f.carbs || 0), 0);
      const fat = foodsForDay.reduce((sum, f) => sum + (f.fat || 0), 0);

      const workoutCount = workouts.filter((w) =>
        sameDay(w.date, dayStart)
      ).length;

      const waterEntry = hydration.find((h) => sameDay(h.date, dayStart));

      const hydrationPercent = waterEntry
        ? Math.min(
            (waterEntry.glassesConsumed / (waterEntry.goalGlasses || 8)) * 100,
            100
          )
        : 0;

      dayTotals.push(calories);

      result.push({
        date: iso,
        calories,
        protein,
        carbs, // ✅ added
        fat, // ✅ added
        workouts: workoutCount,
        hydrationGlasses: waterEntry?.glassesConsumed || 0,
        hydrationPercent,

        calorieIntensity:
          calories < 1500 ? "low" : calories < 2300 ? "ok" : "high",

        proteinQuality: protein < 60 ? "low" : protein < 120 ? "ok" : "high",

        workoutIntensity:
          workoutCount === 0 ? "none" : workoutCount === 1 ? "light" : "hard",

        score: Math.round(
          Math.min(calories / 2000, 1) * 40 +
            Math.min(protein / 120, 1) * 30 +
            (hydrationPercent / 100) * 20 +
            (workoutCount > 0 ? 10 : 0)
        ),
      });
    }

    // best / worst day markers
    const max = Math.max(...dayTotals);
    const min = Math.min(...dayTotals);

    result.forEach((d, i) => {
      d.isBestDay = dayTotals[i] === max;
      d.isWorstDay = dayTotals[i] === min;
    });

    return res.json({ month, days: result });
  } catch (err) {
    console.error("❌ Calendar month error:", err);
    return res.status(500).json({ message: "Error generating calendar view" });
  }
};
