import React, { useState, useMemo, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { apiFetch } from "../lib/api";
import Card from "./Card";
import Input from "./Input";
import Button from "./Button";

const getTodayDateString = () => new Date().toISOString().split("T")[0];

const moodOptions = [
  { rating: 1, emoji: "😞" },
  { rating: 2, emoji: "😐" },
  { rating: 3, emoji: "🙂" },
  { rating: 4, emoji: "😊" },
  { rating: 5, emoji: "😄" },
];

const WellbeingTracker: React.FC = () => {
  const { wellnessLog, setWellnessForDate } = useUserStore();
  const today = getTodayDateString();

  const todaysLog = useMemo(
    () =>
      wellnessLog.find((w) => w.date === today) || {
        date: today,
        sleepHours: 0,
        moodRating: 3,
        notes: "",
      },
    [wellnessLog, today]
  );

  const [sleepHours, setSleepHours] = useState<string>(
    todaysLog.sleepHours > 0 ? todaysLog.sleepHours.toString() : ""
  );
  const [mood, setMood] = useState(todaysLog.moodRating);
  const [notes, setNotes] = useState(todaysLog.notes || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const fetchWellness = async () => {
      try {
        const data = await apiFetch(`/api/wellness/${today}`);
        if (data) {
          setWellnessForDate(data);
        }
        console.log(data);
      } catch (err) {
        console.error("Failed to fetch wellness:", err);
      }
    };
    fetchWellness();
  }, [today, setWellnessForDate]);

  const handleSave = async () => {
    const sleep = parseFloat(sleepHours);
    if (isNaN(sleep) || sleep < 0) return;

    const payload = {
      date: today,
      sleepHours: sleep,
      moodRating: mood,
      notes,
    };

    try {
      const saved = await apiFetch("/api/wellness", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setWellnessForDate(saved);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save wellness:", err);
    }
  };

  return (
    <div className="space-y-6 ">
      {" "}
      {/* padding for bottom nav */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Log Well-being</h2>

        <div className="space-y-6">
          {/* Sleep Input */}
          <Input
            label="Sleep (hours)"
            type="number"
            step="0.5"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            placeholder="e.g., 7.5"
          />

          {/* Mood Picker */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              How are you feeling?
            </label>

            {/* NEW mobile-friendly mood row */}
            <div
              className="flex items-center gap-4 overflow-x-auto px-1 py-2
                          scrollbar-none bg-white/10 dark:bg-black/20 rounded-lg"
            >
              {moodOptions.map(({ rating, emoji }) => (
                <button
                  key={rating}
                  onClick={() => setMood(rating)}
                  className={`flex-shrink-0 p-2 rounded-full text-3xl 
                            transition-transform duration-200
                            ${
                              mood === rating
                                ? "bg-accent/30 scale-125"
                                : "scale-100 hover:bg-white/10"
                            }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Notes section */}
          <div>
            <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any thoughts for today?"
              className="w-full bg-white/10 dark:bg-black/20 border border-white/20 
                       dark:border-black/20 rounded-lg px-4 py-3
                       text-neutral-800 dark:text-neutral-200 
                       placeholder-neutral-500 focus:outline-none 
                       focus:ring-2 focus:ring-accent"
            />
          </div>

          {/* Save button */}
          <Button onClick={handleSave} className="w-full">
            {isSaved ? "Saved!" : "Save Entry"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WellbeingTracker;
