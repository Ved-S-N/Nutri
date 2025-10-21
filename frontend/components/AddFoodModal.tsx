import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { FoodLogEntry } from "../types";
import { apiFetch } from "../lib/api";
import { useUserStore } from "../store/useUserStore";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  onFoodAdded?: (food: FoodLogEntry) => void;
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

const AddFoodModal: React.FC<AddFoodModalProps> = ({
  isOpen,
  onClose,
  date,
  onFoodAdded,
}) => {
  const { addFoodLogEntry } = useUserStore();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(
    null
  );
  const [quantity, setQuantity] = useState<number>(100); // grams
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setResults(data.slice(0, 10)); // Limit to 10 results
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
    if (!scaledFood || !selectedFood) return; // Add a check for selectedFood
    console.log("Selected Food Object:", selectedFood);
    const newEntry: FoodLogEntry = {
      id: new Date().toISOString(), // This is fine for a temporary frontend key
      date,
      foodId: selectedFood.foodId, // 👈 ADD THIS (See note below)
      foodName: scaledFood.name, // 👈 RENAME THIS from 'name'
      quantity: quantity, // 👈 ADD THIS
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
        {/* Search Input */}
        <Input
          id="search"
          label="Search Food"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedFood(null);
          }}
          placeholder="e.g. Chicken Breast"
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
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddFoodModal;
