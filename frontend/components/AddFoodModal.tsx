import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { FoodLogEntry, MealType } from "../types";
import { apiFetch } from "../lib/api";
import { useUserStore } from "../store/useUserStore";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onFoodAdded?: (food: FoodLogEntry) => void;
  mealType?: MealType; // optional, can be preselected
}

interface FoodSearchResult {
  foodId: number;
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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(100); // grams
  const [mealType, setMealType] = useState<MealType>(
    preselectedMeal || "lunch"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔁 Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedFood(null);
      setQuantity(100);
      setMealType(preselectedMeal || "lunch");
    }
  }, [isOpen, preselectedMeal]);

  // 🔍 Fetch foods from backend as user types
  useEffect(() => {
    const fetchFoods = async () => {
      if (query.trim().length < 2) {
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
      } catch (err) {
        console.error(err);
        setError("Error fetching food data");
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchFoods, 500);
    return () => clearTimeout(delayDebounce);
  }, [query]);

  // 🧮 Compute scaled macros by quantity
  const scaledFood = selectedFood
    ? {
        ...selectedFood,
        calories: (selectedFood.calories * quantity) / 100,
        protein: (selectedFood.protein * quantity) / 100,
        carbs: (selectedFood.carbs * quantity) / 100,
        fat: (selectedFood.fat * quantity) / 100,
      }
    : null;

  // 💾 Save selected food to store + backend
  const handleSave = async () => {
    if (!scaledFood || !selectedFood) return;

    const newEntry: FoodLogEntry = {
      id: new Date().toISOString(),
      date,
      mealType,
      foodId: selectedFood.foodId,
      foodName: scaledFood.name,
      quantity,
      calories: scaledFood.calories,
      protein: scaledFood.protein,
      carbs: scaledFood.carbs,
      fat: scaledFood.fat,
    };

    try {
      await apiFetch("/api/food-log/add", {
        method: "POST",
        body: JSON.stringify(newEntry),
      });
      addFoodLogEntry(newEntry);
      onFoodAdded?.(newEntry);
      onClose();
    } catch (err) {
      console.error("Error saving food:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Food">
      <div className="space-y-4">
        {/* Meal Type Selector */}
        <div className="flex justify-between items-center gap-2">
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
        </div>

        {/* Search Input */}
        <Input
          id="search"
          label="Search Food"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedFood(null);
          }}
          placeholder="e.g. Chicken Curry, Poha, Paneer..."
        />

        {/* Search Results */}
        {loading && <p className="text-neutral-400 text-sm">Searching...</p>}
        {error && <p className="text-red-400 text-sm">{error}</p>}

        {!selectedFood && !loading && results.length > 0 && (
          <div className="max-h-48 overflow-y-auto space-y-2">
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

        {/* Selected Food Details */}
        {selectedFood && (
          <div className="space-y-4 mt-2">
            <h3 className="text-lg font-semibold">{selectedFood.name}</h3>

            <div className="flex items-center gap-2">
              <Input
                id="quantity"
                label="Quantity (g)"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value))}
              />
              <span className="text-neutral-400 text-sm">
                per 100g serving base
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <p className="font-semibold">
                  {scaledFood?.calories.toFixed(0)}
                </p>
                <p className="text-neutral-400">kcal</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <p className="font-semibold">
                  {scaledFood?.protein.toFixed(1)}
                </p>
                <p className="text-neutral-400">Protein (g)</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <p className="font-semibold">{scaledFood?.carbs.toFixed(1)}</p>
                <p className="text-neutral-400">Carbs (g)</p>
              </div>
              <div className="bg-white/5 p-3 rounded-lg text-center">
                <p className="font-semibold">{scaledFood?.fat.toFixed(1)}</p>
                <p className="text-neutral-400">Fat (g)</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button variant="secondary" onClick={() => setSelectedFood(null)}>
                Back
              </Button>
              <Button onClick={handleSave}>Save to {mealType}</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddFoodModal;
