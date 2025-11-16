import React, { useMemo, useState, useEffect, useRef } from "react";
import { useUserStore } from "../store/useUserStore";
import { apiFetch } from "../lib/api";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Card from "../components/Card";
import AreaChart from "../components/AreaChart";
import BarChart from "../components/BarChart";
import LineChart from "../components/LineChart";
import AISummaryCard from "../components/AISummaryCard";
import { WeightGoalMode } from "../types";
import {
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import FloatingActionMenu from "../components/FloatingActionMenu";

type Tab = "calories" | "macros" | "weight";
type TimeRange = "7" | "30";

/* -------------------------------------- */
/*  Stat Card (restyled)                  */
/* -------------------------------------- */
interface StatCardProps {
  title: string;
  value: string;
  target: string;
  trend: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, target, trend }) => {
  const isPositive = trend >= 0;
  const trendText =
    trend === 0
      ? "On target"
      : `${isPositive ? "+" : ""}${trend.toFixed(0)} vs goal`;

  return (
    <Card
      className="
        flex-1 rounded-3xl 
        bg-white/5 dark:bg-black/10 
        backdrop-blur-xl 
        border border-white/10 
        shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)]
        p-5
      "
    >
      <h3 className="text-sm font-semibold text-neutral-300">{title}</h3>

      <div className="mt-2 flex items-baseline space-x-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-neutral-500">/ {target}</p>
      </div>

      <div
        className={`mt-1 flex items-center space-x-1 text-xs font-medium ${
          trend === 0
            ? "text-emerald-400"
            : isPositive
            ? "text-rose-400"
            : "text-emerald-400"
        }`}
      >
        {trend === 0 ? (
          <CheckCircle2 size={14} />
        ) : isPositive ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}
        <span>{trendText}</span>
      </div>
    </Card>
  );
};

/* -------------------------------------- */
/* Weight Mode Badge                      */
/* -------------------------------------- */
const getModeStyles = (mode: WeightGoalMode) => {
  switch (mode) {
    case "cutting":
      return {
        color: "#ef4444",
        text: "Cutting",
        badge: "bg-rose-500/20 text-rose-500",
      };
    case "bulking":
      return {
        color: "#38bdf8",
        text: "Bulking",
        badge: "bg-sky-500/20 text-sky-500",
      };
    default:
      return {
        color: "#16a34a",
        text: "Maintenance",
        badge: "bg-emerald-500/20 text-emerald-500",
      };
  }
};

/* -------------------------------------- */
/* Tab titles & theme (Wellness-like)     */
/* -------------------------------------- */
const TAB_TITLES: Record<Tab, string> = {
  calories: "Calories",
  macros: "Macros",
  weight: "Weight",
};

const TAB_THEME: Record<Tab, string> = {
  calories: "from-amber-400/20 via-orange-400/10 to-transparent",
  macros: "from-sky-400/20 via-cyan-400/10 to-transparent",
  weight: "from-emerald-400/20 via-green-400/10 to-transparent",
};

/* -------------------------------------- */
/* Main Component                         */
/* -------------------------------------- */
const AnalyticsPage: React.FC = () => {
  const { foodLog, weightLog, goals, user } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>("calories");
  const [timeRange, setTimeRange] = useState<TimeRange>("7");
  const [aiSummary, setAiSummary] = useState(
    "Generating your personalized summary..."
  );
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [rangeData, setRangeData] = useState<any[]>([]);
  const [weeklyAverages, setWeeklyAverages] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0,
  });
  const [loadingRange, setLoadingRange] = useState(false);

  const days = timeRange === "30" ? 30 : 7;

  /* -------------------------------------------------- */
  /* Header parallax (Wellness-like)                    */
  /* -------------------------------------------------- */
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 120], [1, 0.7]);
  const headerY = useTransform(scrollY, [0, 120], [0, -12]);

  /* -------------------------------------- */
  /* Fetch Range Data (logic kept same)     */
  /* -------------------------------------- */
  useEffect(() => {
    const fetchRangeData = async () => {
      try {
        setLoadingRange(true);
        const res = await apiFetch(`/api/food-log/range?days=${timeRange}`);

        const grouped = res.reduce((acc: any, log: any) => {
          // Use actual date string as key so different days are not merged by weekday
          const dayKey = new Date(log.date).toISOString().split("T")[0];

          if (!acc[dayKey]) {
            acc[dayKey] = {
              day: dayKey,
              calories: 0,
              protein: 0,
              carbs: 0,
              fat: 0,
              count: 0,
            };
          }

          acc[dayKey].calories += log.calories;
          acc[dayKey].protein += log.protein;
          acc[dayKey].carbs += log.carbs;
          acc[dayKey].fat += log.fat;
          acc[dayKey].count++;

          return acc;
        }, {});

        const daily = Object.values(grouped).map((d: any) => ({
          ...d,
          // human friendly short day label for charts
          label: new Date(d.day).toLocaleDateString("en-US", {
            weekday: "short",
          }),
        }));

        // only count valid days (>= 800 cal and not huge outlier above 125% of goal)
        const validDays = daily.filter(
          (d: any) => d.calories >= 800 && d.calories <= goals.calories * 1.25
        );

        const safeAvg = (arr: any[], k: string) =>
          arr.length
            ? arr.reduce((a: number, b: any) => a + b[k], 0) / arr.length
            : 0;

        setWeeklyAverages({
          avgCalories: safeAvg(validDays, "calories"),
          avgProtein: safeAvg(validDays, "protein"),
          avgCarbs: safeAvg(validDays, "carbs"),
          avgFat: safeAvg(validDays, "fat"),
        });

        setRangeData(daily);
      } catch (err) {
        console.error("Failed range load", err);
      } finally {
        setLoadingRange(false);
      }
    };

    fetchRangeData();
  }, [timeRange, goals.calories]);

  useEffect(() => {
    const fetchWeightLog = async () => {
      try {
        const res = await apiFetch("/api/user/weight-log");
        useUserStore.setState({ weightLog: res });
      } catch (err) {
        console.error("❌ Failed to fetch weight data:", err);
      }
    };

    fetchWeightLog();
  }, []);

  /* -------------------------------------- */
  /* Generate AI Summary (kept same)       */
  /* -------------------------------------- */
  const handleGenerateSummary = async () => {
    if (!user?.token) return toast.error("Please log in");

    toast.loading("Generating your summary...");
    setLoadingSummary(true);

    try {
      const res = await apiFetch("/api/gemini/summary", {
        method: "POST",
        body: JSON.stringify({ days }),
      });

      setAiSummary(res.summary ?? "No summary available yet.");
      toast.dismiss();
      toast.success("Summary generated!");
    } catch {
      toast.dismiss();
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  /* -------------------------------------- */
  /* Weight Trend Data (kept same)         */
  /* -------------------------------------- */
  const weightTrendData = useMemo(() => {
    if (!weightLog || weightLog.length === 0) return [];
    const sorted = [...weightLog].sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );

    return sorted.map((entry, i, arr) => {
      const slice = arr.slice(Math.max(0, i - 6), i + 1);
      const avg = slice.reduce((a, v) => a + v.weight, 0) / slice.length;

      return {
        date: new Date(entry.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        weight: entry.weight,
        movingAverage: +avg.toFixed(1),
      };
    });
  }, [weightLog]);

  const latestWeight =
    weightLog.length > 0 ? weightLog[weightLog.length - 1].weight : null;
  const modeStyles = getModeStyles(goals.weightGoalMode);

  const progressText =
    latestWeight == null
      ? "Log your weight to see progress."
      : goals.weightGoalMode === "cutting"
      ? `${(latestWeight - goals.weight).toFixed(1)} kg to lose`
      : goals.weightGoalMode === "bulking"
      ? `${(goals.weight - latestWeight).toFixed(1)} kg to gain`
      : `${Math.abs(latestWeight - goals.weight).toFixed(1)} kg from target`;

  /* -------------------------------------- */
  /* UI                                     */
  /* -------------------------------------- */
  const variants = {
    hidden: { opacity: 0, y: 18 },
    enter: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.36, ease: [0.16, 1, 0.3, 1] },
    },
    exit: { opacity: 0, y: -12, transition: { duration: 0.25 } },
  };

  return (
    <div className="pb-8 pt-6">
      {/* Sticky header with parallax, showing the active tab title */}
      <motion.div
        style={{ opacity: headerOpacity, y: headerY }}
        className="
          sticky top-0 z-30 px-4 pt-4 pb-3
          backdrop-blur-2xl bg-black/40
          border-b border-white/10
          shadow-[0_6px_24px_-12px_rgba(0,0,0,0.6)]
        "
      >
        <motion.h1
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="text-3xl font-extrabold tracking-tight"
        >
          {TAB_TITLES[activeTab]}
        </motion.h1>
        <p className="text-neutral-400 text-sm mt-1">
          {activeTab === "calories" && "Your calorie intake and consistency."}
          {activeTab === "macros" && "Protein, carbs and fats overview."}
          {activeTab === "weight" && "Weight trend and goal progress."}
        </p>
      </motion.div>

      {/* Background glow per tab */}
      <motion.div
        key={activeTab + "-bg"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute inset-0 -z-10 bg-gradient-to-b ${TAB_THEME[activeTab]} blur-xl`}
      />

      {/* page content container */}
      <div ref={containerRef} className="px-4 pt-4 space-y-6">
        {/* Range buttons (restyled) */}
        <div className="flex gap-3">
          {(["7", "30"] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`
                flex-1 px-4 py-2 rounded-2xl 
                font-semibold text-sm tracking-tight
                transition-all duration-250
                ${
                  timeRange === r
                    ? "bg-accent text-white shadow-md"
                    : "bg-white/5 text-neutral-400 hover:bg-white/10"
                }
              `}
            >
              Last {r} Days
            </button>
          ))}
        </div>

        {/* AI summary + action (compact on mobile) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">AI Nutrition Summary</h2>
            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className={`px-3 py-2 rounded-2xl text-sm font-semibold ${
                loadingSummary
                  ? "bg-neutral-700 text-neutral-400"
                  : "bg-accent text-white shadow-md"
              }`}
            >
              {loadingSummary ? "Generating..." : "Generate"}
            </button>
          </div>

          <div
            className="
            rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl 
            border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-4
          "
          >
            <AISummaryCard
              summary={
                loadingSummary
                  ? "⏳ Generating your personalized report..."
                  : aiSummary
              }
            />
          </div>
        </div>

        {/* Animated tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={variants}
            initial="hidden"
            animate="enter"
            exit="exit"
            className="space-y-5"
          >
            {/* --- CALORIES --- */}
            {activeTab === "calories" && (
              <div id="calories-section" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StatCard
                    title={`${timeRange}-Day Avg. Calories`}
                    value={`${weeklyAverages.avgCalories.toFixed(0)} kcal`}
                    target={`${goals.calories} kcal`}
                    trend={weeklyAverages.avgCalories - goals.calories}
                  />

                  <Card className="rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-5">
                    <h3 className="text-sm font-semibold text-neutral-300">
                      Weekly Consistency
                    </h3>
                    <p className="text-2xl font-bold mt-2 text-white">
                      {rangeData.filter((d) => d.calories >= 800).length} /{" "}
                      {days}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Tracked days (excluding incomplete logs)
                    </p>
                  </Card>
                </div>

                {loadingRange ? (
                  <p className="text-center text-neutral-500 py-6">
                    Loading {timeRange}-day data...
                  </p>
                ) : (
                  <Card className="rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-5">
                    <h2 className="text-xl font-bold tracking-tight mb-3">
                      {timeRange}-Day Calorie Intake
                    </h2>
                    <AreaChart
                      data={rangeData.map((d) => ({ ...d, day: d.label }))}
                      dataKey="calories"
                      xAxisKey="day"
                      unit="Kcal"
                      goalValue={goals.calories}
                      goalLabel="Calorie Goal"
                    />
                  </Card>
                )}
              </div>
            )}

            {/* --- MACROS --- */}
            {activeTab === "macros" && (
              <div id="macros-section" className="space-y-6">
                <Card className="rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-5">
                  <h2 className="text-xl font-bold tracking-tight mb-3">
                    {timeRange}-Day Protein Intake
                  </h2>
                  <p className="text-sm text-neutral-500 -mt-2 mb-3">
                    Avg:{" "}
                    <span className="font-bold text-white">
                      {weeklyAverages.avgProtein.toFixed(1)} g
                    </span>{" "}
                    / {goals.protein} g
                  </p>
                  <AreaChart
                    data={rangeData.map((d) => ({ ...d, day: d.label }))}
                    dataKey="protein"
                    xAxisKey="day"
                    unit="g"
                    goalValue={goals.protein}
                  />
                </Card>

                <Card className="rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-5">
                  <h2 className="text-xl font-bold tracking-tight mb-3">
                    {timeRange}-Day Macro Distribution
                  </h2>
                  <BarChart
                    data={rangeData.map((d) => ({ ...d, day: d.label }))}
                    xAxisKey="day"
                    bars={[
                      { dataKey: "protein", fill: "#16a34a" },
                      { dataKey: "carbs", fill: "#3b82f6" },
                      { dataKey: "fat", fill: "#f97316" },
                    ]}
                  />
                </Card>
              </div>
            )}

            {/* --- WEIGHT --- */}
            {activeTab === "weight" && (
              <div id="weight-section" className="space-y-6">
                <Card className="rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold tracking-tight">
                      Weight Trend
                    </h2>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${modeStyles.badge}`}
                    >
                      {modeStyles.text}
                    </span>
                  </div>

                  {weightLog.length === 0 ? (
                    <p className="text-center text-neutral-500 py-10 flex items-center justify-center gap-2">
                      <Info size={16} /> No weight entries yet.
                    </p>
                  ) : (
                    <LineChart
                      data={weightTrendData}
                      dataKey="weight"
                      xAxisKey="date"
                      unit="Kg"
                      strokeColor={modeStyles.color}
                      /* goalValue prop kept if your LineChart supports it; remove if not */
                      goalValue={goals.weight}
                    />
                  )}
                </Card>

                <Card className="rounded-3xl bg-white/5 dark:bg-black/10 backdrop-blur-xl border border-white/10 shadow-[0_6px_25px_-10px_rgba(0,0,0,0.5)] p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-xl font-bold tracking-tight">
                      Goal Progress
                    </h2>
                    <Target size={18} className="text-neutral-500" />
                  </div>

                  {latestWeight ? (
                    <div className="text-center">
                      <div className="flex justify-center gap-8">
                        <p className="text-neutral-500">
                          Current
                          <span className="block text-2xl font-bold text-white">
                            {latestWeight.toFixed(1)} kg
                          </span>
                        </p>
                        <p className="text-neutral-500">
                          Goal
                          <span className="block text-2xl font-bold text-white">
                            {goals.weight.toFixed(1)} kg
                          </span>
                        </p>
                      </div>

                      <p
                        className="mt-4 text-lg font-semibold"
                        style={{ color: modeStyles.color }}
                      >
                        {progressText}
                      </p>
                    </div>
                  ) : (
                    <p className="text-center text-neutral-500 py-8">
                      No weight data yet.
                    </p>
                  )}
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Floating action menu (unchanged) */}
      <FloatingActionMenu
        onSelect={(section) => {
          setActiveTab(section as any);

          setTimeout(() => {
            const el = document.getElementById(`${section}-section`);
            if (!el) return;

            const top = el.getBoundingClientRect().top + window.scrollY;

            window.scrollTo({
              top: top - 120, // <<< adjust offset so the section sits EXACTLY where you want
              behavior: "smooth",
            });

            el.classList.add("section-highlight", "section-highlight-active");
            setTimeout(() => {
              el.classList.remove("section-highlight-active");
            }, 1800);
          }, 450);
        }}
      />
    </div>
  );
};

export default AnalyticsPage;
