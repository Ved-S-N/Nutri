// src/pages/DashboardInsightsPage.tsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../store/useUserStore";
import { apiFetch } from "../lib/api";

import HeatmapConsistency from "../components/HeatmapConsistency";
import EnergyBalanceChart from "../components/EnergyBalanceChart";
import MealImpactBar from "../components/MealImpactBar";
import SleepCorrelationCard from "../components/SleepCorrelationCard";
import ConsistencyScoreCard from "../components/ConsistencyScoreCard";
import FloatingCalendarButton from "../components/FloatingCalendarButton";

/**
 * DashboardInsightsPage — Option A (Apple Fitness / Premium)
 * - Mobile-first, roomy layout
 * - Big hero card, subtle glass + gradient, spacious cards
 * - Uses existing components (pass props) so it wires to your backend
 */

const DashboardInsightsPage: React.FC = () => {
  const { user, goals } = useUserStore();
  const [loading, setLoading] = useState(true);

  // Backend data
  const [foodData, setFoodData] = useState<any[]>([]);
  const [workoutData, setWorkoutData] = useState<any[]>([]);
  const [hydrationData, setHydrationData] = useState<any[]>([]);
  const [sleepData, setSleepData] = useState<any[]>([]);

  // Derived visual data
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [energyData, setEnergyData] = useState<any[]>([]);
  const [mealImpactData, setMealImpactData] = useState<any[]>([]);
  const [consistency, setConsistency] = useState<number>(0);
  const [scoreDetails, setScoreDetails] = useState<any>({});

  /* ------------------ Fetch backend in parallel ------------------ */
  useEffect(() => {
    const fetchAll = async () => {
      if (!user?.token) return;
      try {
        setLoading(true);
        const [food, workouts, hydration, wellness] = await Promise.all([
          apiFetch("/api/food-log/range?days=7"),
          apiFetch("/api/workouts/range?days=7"),
          apiFetch("/api/hydration/range?days=7"),
          apiFetch("/api/wellness/range?days=7"),
        ]);
        console.log(
          "Hydration FIRST ITEM (FULL):",
          JSON.stringify(hydration[0], null, 2)
        );

        setFoodData(Array.isArray(food) ? food : []);
        setWorkoutData(Array.isArray(workouts) ? workouts : []);
        setHydrationData(Array.isArray(hydration) ? hydration : []);
        setSleepData(Array.isArray(wellness) ? wellness : []);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user?.token]);

  /* ------------------ Transformations ------------------ */
  useEffect(() => {
    if (!foodData?.length) return;

    // Group food logs by weekday (short label)
    const grouped = foodData.reduce((acc: any, item: any) => {
      const d = new Date(item.date);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      if (!acc[dayLabel]) {
        acc[dayLabel] = { dayLabel, protein: 0, carbs: 0, fat: 0, calories: 0 };
      }
      acc[dayLabel].protein += item.protein || 0;
      acc[dayLabel].carbs += item.carbs || 0;
      acc[dayLabel].fat += item.fat || 0;
      acc[dayLabel].calories += item.calories || 0;
      return acc;
    }, {});

    const values = Object.values(grouped);

    // Heatmap data (percent of goal)
    setHeatmapData(
      values.map((v: any) => ({
        dayLabel: v.dayLabel,
        proteinPct: v.protein / Math.max(1, goals?.protein || 1),
        carbsPct: v.carbs / Math.max(1, goals?.carbs || 1),
        fatPct: v.fat / Math.max(1, goals?.fat || 1),
      }))
    );

    // Energy data (calories in vs burned)
    const workoutMap = workoutData.reduce((acc: any, w: any) => {
      const d = new Date(w.date);
      const day = d.toLocaleDateString("en-US", { weekday: "short" });
      acc[day] = (acc[day] || 0) + (w.caloriesBurned || 0);
      return acc;
    }, {});

    setEnergyData(
      values.map((v: any) => ({
        dateLabel: v.dayLabel,
        caloriesIn: v.calories,
        caloriesBurned: workoutMap[v.dayLabel] || 0,
      }))
    );

    // Meal impact (estimated split)
    setMealImpactData(
      values.map((v: any) => ({
        dateLabel: v.dayLabel,
        breakfast: v.breakfastCalories || v.calories * 0.25,
        lunch: v.lunchCalories || v.calories * 0.35,
        dinner: v.dinnerCalories || v.calories * 0.3,
        snack: v.snackCalories || v.calories * 0.1,
      }))
    );

    // Consistency score (macros + hydration + workouts)
    const macroConsistency =
      (1 -
        values.reduce(
          (sum: number, v: any) =>
            sum + Math.abs(v.calories - (goals?.calories || 2000)),
          0
        ) /
          (values.length * (goals?.calories || 2000))) *
      100;

    const hydrationConsistency =
      hydrationData.length > 0
        ? (() => {
            const percs = hydrationData
              .map((h: any) => {
                const consumed = h.glassesConsumed ?? null;
                const goal = h.goalGlasses ?? null;
                if (consumed == null || goal == null || goal === 0) return null;
                return (consumed / goal) * 100; // percent for that day
              })
              .filter((v) => v != null);

            if (percs.length === 0) return 0;
            const avg = percs.reduce((a, b) => a + b, 0) / percs.length;
            return avg;
          })()
        : 72;

    const workoutConsistency =
      workoutData.length > 0
        ? (() => {
            // Set of days (yyy-mm-dd) where user worked out >= 30 min
            const daysWithGoodSession = new Set<string>();

            workoutData.forEach((w: any) => {
              const duration =
                w.duration ?? w.durationMinutes ?? w.durationMinutesLegacy ?? 0;

              if (duration >= 30 && w.date) {
                const day = new Date(w.date).toISOString().slice(0, 10);
                daysWithGoodSession.add(day);
              }
            });

            // Percent of active days out of 7-day window
            const percent = (daysWithGoodSession.size / 7) * 100;

            return Math.round(Math.max(0, Math.min(100, percent)));
          })()
        : 60;

    const avgScore =
      (macroConsistency + hydrationConsistency + workoutConsistency) / 3;

    setConsistency(Math.max(0, Math.min(100, Math.round(avgScore))));
    setScoreDetails({
      macros: Math.round(Math.max(0, Math.min(100, macroConsistency))),
      hydration: Math.round(Math.max(0, Math.min(100, hydrationConsistency))),
      workouts: Math.round(Math.max(0, Math.min(100, workoutConsistency))),
    });
  }, [foodData, workoutData, hydrationData, goals]);

  /* ------------------ Sleep / Wellness correlation dataset (improved craving derivation) ------------------ */
  /* Uses wellness (sleepData) rows and matches them to next-day food rows.
   Derives a craving-like score from:
     - moodRating (1..5) inverse
     - notes (keyword heuristics)
     - calorie deficit (goal vs actual)
     - short sleep relative to avg (shortfall)
   Combines these into a 0..10 score.
*/
  const sleepCorrelationData = useMemo(() => {
    if (!sleepData?.length || !foodData?.length) return [];

    const toDayKey = (d: string | Date | undefined | null) => {
      if (!d) return null;
      const dt = typeof d === "string" ? new Date(d) : d;
      if (Number.isNaN(dt.getTime())) {
        const alt = new Date(String(d).replace(" ", "T"));
        if (!Number.isNaN(alt.getTime())) return alt.toISOString().slice(0, 10);
        return null;
      }
      return dt.toISOString().slice(0, 10);
    };

    const getCaloriesFromFood = (f: any) => {
      if (!f) return null;
      const candidates = [
        f.calories,
        f.totalCalories,
        f.kcal,
        f.energy,
        f.cal,
        f.calorie,
        f.nutrients?.calories,
      ];
      for (const c of candidates) {
        if (c == null) continue;
        if (typeof c === "number" && !Number.isNaN(c)) return c;
        if (
          typeof c === "string" &&
          c.trim() !== "" &&
          !Number.isNaN(Number(c))
        )
          return Number(c);
      }
      return null;
    };

    // quick keyword-based notes sentiment -> cravings signal (higher -> more cravings)
    const notesCravingScore = (notes: string | null | undefined) => {
      if (!notes || typeof notes !== "string") return 0;
      const s = notes.toLowerCase();
      let score = 0;
      // strong craving keywords
      if (
        /\b(crave|craving|want to eat|hungry|urge|junk|snack|sugar)\b/.test(s)
      )
        score += 0.9;
      // tired/stress increases cravings a bit
      if (/\b(tired|exhausted|stress|anxious|stressed|overwhelmed)\b/.test(s))
        score += 0.6;
      // good mood words reduce cravings
      if (/\b(good|great|calm|well|energized|rested)\b/.test(s)) score -= 0.6;
      // clamp 0..1
      return Math.max(0, Math.min(1, score));
    };

    // Build lookup maps
    const foodByDay: Record<string, any[]> = foodData.reduce(
      (acc: Record<string, any[]>, f: any) => {
        const k = toDayKey(f?.date);
        if (k) {
          acc[k] = acc[k] || [];
          acc[k].push(f);
        }
        return acc;
      },
      {}
    );

    const foodByWeekday: Record<string, any[]> = foodData.reduce(
      (acc: Record<string, any[]>, f: any) => {
        const dt = f?.date ? new Date(f.date) : null;
        if (!dt || Number.isNaN(dt.getTime())) return acc;
        const wk = dt.toLocaleDateString("en-US", { weekday: "short" });
        acc[wk] = acc[wk] || [];
        acc[wk].push(f);
        return acc;
      },
      {}
    );

    // compute mean sleep across wellness rows (used for sleep deficit)
    const numericSleeps = sleepData
      .map((w: any) => (typeof w.sleepHours === "number" ? w.sleepHours : null))
      .filter(Boolean) as number[];
    const meanSleep = numericSleeps.length
      ? numericSleeps.reduce((a, b) => a + b, 0) / numericSleeps.length
      : 7;

    // safety: goals.calories fallback
    const goalCalories =
      goals?.calories && Number.isFinite(goals.calories)
        ? goals.calories
        : null;

    const rows = sleepData.map((w: any) => {
      // next-day matching
      const day = new Date(w.date);
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      const nextKey = toDayKey(nextDay);
      const nextWeekday = nextDay.toLocaleDateString("en-US", {
        weekday: "short",
      });

      let matchedFood: any = undefined;
      if (
        nextKey &&
        Array.isArray(foodByDay[nextKey]) &&
        foodByDay[nextKey].length > 0
      ) {
        matchedFood = foodByDay[nextKey][0];
      } else {
        const bucket = foodByWeekday[nextWeekday];
        if (bucket && bucket.length > 0) matchedFood = bucket[0];
      }

      const calories = getCaloriesFromFood(matchedFood); // may be null

      // derive signals
      const mood =
        typeof w.moodRating === "number" && !Number.isNaN(w.moodRating)
          ? w.moodRating
          : null; // 1..5
      // mood -> inverse craving fraction: mood 5 -> 0, mood 1 -> 1
      const moodFrac =
        mood != null ? Math.max(0, Math.min(1, (5 - mood) / 4)) : null;

      const notesScore = notesCravingScore(w?.notes ?? w?.note ?? null); // 0..1

      // calorie deficit (only meaningful if goals present)
      const calorieDeficitFrac =
        calories != null && goalCalories != null
          ? Math.max(0, (goalCalories - calories) / Math.max(1, goalCalories))
          : 0;

      // sleep shortfall relative to meanSleep (0..1)
      const sleepHours = typeof w.sleepHours === "number" ? w.sleepHours : null;
      const sleepDeficitFrac =
        sleepHours != null
          ? Math.max(0, (meanSleep - sleepHours) / Math.max(0.1, meanSleep))
          : 0;

      // weights: mood strongest, then notes, then calories, then sleep
      const wMood = 0.5;
      const wNotes = 0.2;
      const wCal = 0.2;
      const wSleep = 0.1;

      const components = [
        (moodFrac ?? 0) * wMood,
        notesScore * wNotes,
        calorieDeficitFrac * wCal,
        sleepDeficitFrac * wSleep,
      ];
      const combined = components.reduce((a, b) => a + b, 0); // roughly 0..1 (but may be slightly <1)
      // final 0..10 score
      const cravingScore = Math.max(
        0,
        Math.min(10, Math.round(combined * 10 * 10) / 10)
      ); // one decimal (e.g., 4.3)

      return {
        dateLabel: nextDay.toLocaleDateString("en-US", { weekday: "short" }),
        sleepHours,
        nextDayCalories: calories ?? null,
        nextDayCravingScore: cravingScore,
        // flags for UI
        _cravingDerivedFromMood:
          mood != null ||
          notesScore > 0 ||
          calorieDeficitFrac > 0 ||
          sleepDeficitFrac > 0,
        _wellnessRaw: w,
        _matchedFoodRaw: matchedFood ?? null,
      };
    });

    console.log(
      "sleepCorrelation (derived) summary — rows:",
      rows.length,
      "validCalories:",
      rows.filter((r) => r.nextDayCalories != null).length,
      "validCravings(derived):",
      rows.filter((r) => r.nextDayCravingScore != null).length
    );

    return rows;
  }, [sleepData, foodData, goals]);

  /* ------------------ Calendar action (placeholder) ------------------ */
  const onCalendarOpen = () => {
    // In Option A we open the calendar bottom sheet / modal — placeholder scroll for now
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      {/* Page container — center with constrained width */}
      <div className="mx-auto max-w-4xl px-0 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header / Hero */}
        <header className="flex flex-col gap-3 px-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl px-2 font-extrabold tracking-tight text-white">
              Insights
            </h1>
            <p className="mt-1 text-sm px-2 text-slate-300 max-w-xl">
              Actionable analytics about your week — consistency, energy, and
              where to focus.
            </p>
          </div>

          <div className="flex items-center px-2 gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs text-slate-400">This week</span>
              <span className="text-lg font-semibold text-white">
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <button
              onClick={onCalendarOpen}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 px-4 py-2 shadow-lg hover:brightness-105 transition"
            >
              <span className="text-sm font-medium text-white">
                Open Calendar
              </span>
            </button>
          </div>
        </header>

        {/* Hero / Summary Card */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0f172a]/60 to-[#071126]/60 border border-white/6 shadow-2xl p-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">
                Weekly Snapshot
              </h2>
              <p className="mt-1 text-sm text-slate-300 max-w-2xl">
                At-a-glance view — consistency score, average intake, and
                activity. Tap any card below for details.
              </p>

              <div className="mt-4 flex gap-3 flex-wrap">
                <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-300">Consistency</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {consistency ?? "--"}
                    <span className="text-sm text-slate-400 ml-2">/100</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Macros · Hydration · Workouts
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-300">Avg Calories</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {Math.round(
                      (foodData.reduce((s, f) => s + (f.calories || 0), 0) ||
                        0) / Math.max(1, 7)
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">per day</div>
                </div>

                <div className="rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 p-4 flex-1 min-w-[120px]">
                  <div className="text-xs text-slate-300">Active Days</div>
                  <div className="mt-1 text-2xl font-bold text-white">
                    {
                      Array.from(
                        new Set(
                          workoutData.map((w: any) =>
                            new Date(w.date).toDateString()
                          )
                        )
                      ).length
                    }
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    sessions this week
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-80">
              <ConsistencyScoreCard
                score={consistency}
                details={scoreDetails}
                compact
              />
            </div>
          </div>
        </motion.section>

        {/* Section: Energy (large card) */}
        <section>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            Energy Balance
          </h3>
          <div className="rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-900/40 border border-white/6 p-4 shadow-lg">
            <EnergyBalanceChart data={energyData} />
          </div>
        </section>

        {/* Section: Heatmap + Meal Impact */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900/60 border border-white/6 p-4 shadow-lg">
            <h4 className="text-sm font-medium text-slate-200 mb-3">
              Macro Consistency
            </h4>
            <HeatmapConsistency days={[]} values={heatmapData} />
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-white/6 p-4 shadow-lg">
            <h4 className="text-sm font-medium text-slate-200 mb-3">
              Meal Impact
            </h4>
            <MealImpactBar
              data={mealImpactData}
              goal={goals?.calories || 2400}
            />
          </div>
        </section>

        {/* Section: Sleep correlation + Highlights */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900/60 border border-white/6 p-4 shadow-lg">
            <h4 className="text-sm font-medium text-slate-200 mb-3">
              Sleep → Next Day
            </h4>
            <SleepCorrelationCard data={sleepCorrelationData} />
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#071126]/50 to-[#0b1220]/30 border border-white/6 p-4 shadow-lg">
            <h4 className="text-sm font-medium text-slate-200 mb-3">
              Weekly Highlights
            </h4>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>
                •{" "}
                {consistency > 75
                  ? "Excellent consistency — maintain momentum."
                  : consistency > 50
                  ? "Good week — focus on protein distribution."
                  : "Low consistency — pick two small habits to lock in."}
              </li>
              <li>
                •{" "}
                {hydrationData.length > 0
                  ? "Hydration logs present — aim for daily targets."
                  : "No hydration logs — logging gives big wins."}
              </li>
              <li>
                • Look for largest meal contributors in Meal Impact and try
                simple swaps (smaller portions, lean protein).
              </li>
            </ul>
          </div>
        </section>

        {/* Footer spacing */}
        <div className="h-6" />
      </div>

      {/* Floating button (calendar) */}
      <FloatingCalendarButton onOpen={onCalendarOpen} />
    </div>
  );
};

export default DashboardInsightsPage;
