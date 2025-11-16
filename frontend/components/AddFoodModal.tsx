import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { FoodLogEntry, MealType } from "../types";
import { apiFetch } from "../lib/api";
import { useUserStore } from "../store/useUserStore";
import toast from "react-hot-toast";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onFoodAdded?: (food: FoodLogEntry) => void;
  mealType?: MealType;
}

interface FoodSearchResult {
  foodId?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
}

const mealOptions: { label: string; value: MealType; emoji: string }[] = [
  { label: "Breakfast", value: "breakfast", emoji: "🥣" },
  { label: "Lunch", value: "lunch", emoji: "🍛" },
  { label: "Dinner", value: "dinner", emoji: "🌮" },
  { label: "Snack", value: "snack", emoji: "🍎" },
];

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  date,
  onFoodAdded,
  mealType: preselectedMeal,
}) => {
  const { addFoodLogEntry } = useUserStore();

  const [tab, setTab] = useState<"search" | "ai" | "favorites">("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(
    null
  );
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [mealType, setMealType] = useState<MealType>(
    preselectedMeal || "lunch"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FoodSearchResult[]>([]);

  // 🔁 Reset when modal opens
  // 🧠 Always sync modal with preselectedMeal when it changes
  useEffect(() => {
    if (!isOpen) return;

    setQuery("");
    setResults([]);
    setSelectedFood(null);
    setQuantity(100);

    if (preselectedMeal) {
      setMealType(preselectedMeal);
    }
  }, [isOpen, preselectedMeal]);

  useEffect(() => {
    if (tab === "favorites") {
      apiFetch("/api/favorites")
        .then((data) => setFavorites(data))
        .catch((err) => console.error("Error loading favorites", err));
    }
  }, [tab]);

  // 🔍 Fetch foods manually from backend
  useEffect(() => {
    const fetchFoods = async () => {
      if (tab !== "search" || query.trim().length < 2) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const data = await apiFetch(
          `/api/food/search?q=${encodeURIComponent(query)}`
        );
        setResults(data.slice(0, 10));
        setError(null);
      } catch {
        setError("Error fetching food data");
      } finally {
        setLoading(false);
      }
    };
    const delayDebounce = setTimeout(fetchFoods, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, tab]);

  // 🤖 Analyze with Gemini AI
  const analyzeWithAI = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/api/ai-food/analyze", {
        method: "POST",
        body: JSON.stringify({ text: query }),
      });
      setAiResponse(res);
      setSelectedFood({
        name: query.trim(), // ✅ use typed query as the name
        calories: res.totalCalories,
        protein: res.protein,
        carbs: res.carbs,
        fat: res.fat,
      });
    } catch (err) {
      console.error("AI analyze error:", err);
      setError("AI failed to analyze meal");
    } finally {
      setLoading(false);
    }
  };

  // 💾 Save selected or AI food
  const handleSave = async () => {
    if (!selectedFood && !query.trim()) return;

    const foodName = selectedFood?.name || query.trim() || "Unnamed Food";

    const newEntry: FoodLogEntry = {
      id: new Date().toISOString(),
      date,
      mealType,
      foodId: selectedFood?.foodId || undefined,
      foodName,
      quantity,
      calories: selectedFood?.calories || 0,
      protein: selectedFood?.protein || 0,
      carbs: selectedFood?.carbs || 0,
      fat: selectedFood?.fat || 0,
    };

    try {
      await apiFetch("/api/food-log/add", {
        method: "POST",
        body: JSON.stringify({
          ...newEntry,
          name: foodName, // ✅ send name to backend
        }),
      });

      addFoodLogEntry(newEntry);
      onFoodAdded?.(newEntry);
      onClose();
    } catch (err) {
      console.error("Error saving food:", err);
      setError("Failed to save food log");
    }
  };

  const handleAddFavorite = async () => {
    if (!selectedFood) return;
    try {
      await apiFetch("/api/favorites/add", {
        method: "POST",
        body: JSON.stringify(selectedFood),
      });
      toast.success(`⭐ "${selectedFood.name}" added to Favorites`, {
        duration: 2500,
        icon: "💾",
        style: {
          background: "#1f1f1f",
          color: "#fff",
          borderRadius: "12px",
          fontWeight: "500",
        },
      });
    } catch (err) {
      console.error("Failed to add favorite:", err);
      toast.error("Failed to add favorite 😞", {
        duration: 3000,
        style: {
          background: "#2a2a2a",
          color: "#fff",
          borderRadius: "12px",
        },
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Food">
      {/* Tabs */}
      <div className="flex mb-4">
        <button
          onClick={() => setTab("search")}
          className={`flex-1 py-2 font-medium rounded-l-lg ${
            tab === "search"
              ? "bg-accent text-white"
              : "bg-white/10 text-neutral-400"
          }`}
        >
          Search Food
        </button>
        <button
          onClick={() => setTab("ai")}
          className={`flex-1 py-2 font-medium  ${
            tab === "ai"
              ? "bg-accent text-white"
              : "bg-white/10 text-neutral-400"
          }`}
        >
          Use AI
        </button>
        <button
          onClick={() => setTab("favorites")}
          className={`flex-1 py-2 font-medium rounded-r-lg ${
            tab === "favorites"
              ? "bg-accent text-white"
              : "bg-white/10 text-neutral-400"
          }`}
        >
          Favorites
        </button>
      </div>

      {/* Meal Type Selector */}
      {/* <div className="flex justify-between items-center gap-2 mb-3">
        <label className="text-sm font-medium text-neutral-400">
          Select Meal
        </label>
        <div className="flex flex-wrap gap-2">
          {mealOptions.map((meal) => (
            <button
              key={meal.value}
              onClick={() => setMealType(meal.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                mealType === meal.value
                  ? "bg-accent text-white shadow-md"
                  : "bg-white/10 hover:bg-white/20 text-neutral-300"
              }`}
            >
              <span className="mr-1">{meal.emoji}</span>
              {meal.label}
            </button>
          ))}
        </div>
      </div> */}

      {/* Input Field */}
      {tab !== "favorites" && (
        <>
          <Input
            id="foodInput"
            label={tab === "ai" ? "Describe your meal" : "Search Food"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === "ai"
                ? "e.g. 2 eggs and toast with butter"
                : "e.g. Chicken Curry"
            }
          />

          {/* AI Button */}
          {tab === "ai" && (
            <div className="mt-2">
              <Button onClick={analyzeWithAI} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze with AI"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* AI Results */}
      {aiResponse && (
        <div className="mt-4 bg-white/5 p-3 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">AI Analysis</h3>
          <p className="text-sm text-neutral-400 mb-2">{query}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <p className="font-semibold">
                {aiResponse.totalCalories.toFixed(0)}
              </p>
              <p className="text-neutral-400">kcal</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <p className="font-semibold">{aiResponse.protein.toFixed(1)}</p>
              <p className="text-neutral-400">Protein (g)</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <p className="font-semibold">{aiResponse.carbs.toFixed(1)}</p>
              <p className="text-neutral-400">Carbs (g)</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg text-center">
              <p className="font-semibold">{aiResponse.fat.toFixed(1)}</p>
              <p className="text-neutral-400">Fat (g)</p>
            </div>
          </div>
        </div>
      )}

      {/* Favorites list */}
      {tab === "favorites" && (
        <div className="mt-2 max-h-48 overflow-y-auto space-y-2">
          {favorites.length === 0 ? (
            <p className="text-neutral-400 text-sm text-center">
              No favorite foods yet.
            </p>
          ) : (
            favorites.map((food, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedFood(food)}
                className="w-full text-left p-3 bg-white/5 hover:bg-accent/20 rounded-lg transition"
              >
                <p className="font-medium">{food.name}</p>
                <p className="text-xs text-neutral-400">
                  {food.calories} kcal — {food.protein}g P / {food.carbs}g C /{" "}
                  {food.fat}g F
                </p>
              </button>
            ))
          )}
        </div>
      )}

      {/* Search Results */}
      {tab === "search" && !selectedFood && results.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-2 mt-2">
          {results.map((food, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedFood(food)}
              className="w-full text-left p-3 bg-white/5 hover:bg-accent/20 rounded-lg transition"
            >
              <p className="font-medium">{food.name}</p>
              <p className="text-xs text-neutral-400">
                {food.calories} kcal per {food.servingSize || "100g"}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Save Button */}
      {(selectedFood || aiResponse) && (
        <div className="mt-4 flex justify-end gap-2">
          {tab !== "favorites" && (
            <Button variant="secondary" onClick={handleAddFavorite}>
              ⭐ Add Favorite
            </Button>
          )}
          <Button onClick={handleSave}>Save to {mealType}</Button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </Modal>
  );
};

export default AddFoodModal;
