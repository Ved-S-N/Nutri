
import React, { useState, useMemo } from 'react';
import { useUserStore } from '../store/useUserStore';
import { MOCK_FOOD_DATA } from '../constants';
import { Food } from '../types';
import Modal from './Modal';
import Button from './Button';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string; // YYYY-MM-DD
}

const AddFoodModal: React.FC<AddFoodModalProps> = ({ isOpen, onClose, date }) => {
  const { addFoodLogEntry } = useUserStore();
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [grams, setGrams] = useState(100);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFood = useMemo(() => {
    return MOCK_FOOD_DATA.filter(food =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleAddFood = () => {
    if (!selectedFood) return;
    const factor = grams / 100;
    const newEntry = {
      id: new Date().toISOString(),
      foodId: selectedFood.id,
      foodName: selectedFood.name,
      grams,
      calories: selectedFood.calories * factor,
      protein: selectedFood.protein * factor,
      carbs: selectedFood.carbs * factor,
      fat: selectedFood.fat * factor,
      date,
    };
    addFoodLogEntry(newEntry);
    onClose();
    resetState();
  };
  
  const resetState = () => {
    setSelectedFood(null);
    setGrams(100);
    setSearchTerm('');
  };

  const calculatedMacros = useMemo(() => {
    if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const factor = grams / 100;
    return {
      calories: selectedFood.calories * factor,
      protein: selectedFood.protein * factor,
      carbs: selectedFood.carbs * factor,
      fat: selectedFood.fat * factor,
    };
  }, [selectedFood, grams]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Food">
      <div className="space-y-6">
        <input
          type="text"
          placeholder="Search for food..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white/10 dark:bg-black/20 border border-white/20 dark:border-black/20 rounded-lg px-4 py-3 text-neutral-800 dark:text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {searchTerm && (
          <div className="max-h-32 overflow-y-auto bg-white/5 dark:bg-black/10 rounded-lg">
            {filteredFood.map(food => (
              <div
                key={food.id}
                onClick={() => {
                  setSelectedFood(food);
                  setSearchTerm('');
                }}
                className="p-2 cursor-pointer hover:bg-accent/20 rounded-md"
              >
                {food.name}
              </div>
            ))}
          </div>
        )}

        {selectedFood && (
          <>
            <h3 className="text-lg font-semibold">{selectedFood.name}</h3>
            <div>
              <label className="block text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                Quantity: {grams}g
              </label>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
                className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white/5 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-neutral-500">Calories</p>
                <p className="font-bold text-lg">{calculatedMacros.calories.toFixed(0)}</p>
              </div>
              <div className="bg-white/5 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-neutral-500">Protein</p>
                <p className="font-bold text-lg">{calculatedMacros.protein.toFixed(1)}g</p>
              </div>
              <div className="bg-white/5 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-neutral-500">Carbs</p>
                <p className="font-bold text-lg">{calculatedMacros.carbs.toFixed(1)}g</p>
              </div>
              <div className="bg-white/5 dark:bg-black/10 p-3 rounded-lg">
                <p className="text-sm text-neutral-500">Fat</p>
                <p className="font-bold text-lg">{calculatedMacros.fat.toFixed(1)}g</p>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAddFood} disabled={!selectedFood}>Add</Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddFoodModal;
