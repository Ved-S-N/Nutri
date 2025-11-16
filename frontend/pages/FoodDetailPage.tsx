import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function FoodDetailPage() {
  const { id } = useParams();
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    apiFetch(`/api/ai-food/today`).then((data) => {
      setEntry(data.find((d: any) => d._id === id));
    });
  }, [id]);

  if (!entry) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">{entry.text}</h2>
      <p className="text-neutral-400">{entry.totalCalories} kcal total</p>
      <div className="grid grid-cols-4 gap-3 text-sm">
        <p>🔥 {entry.totalCalories}</p>
        <p>🥩 {entry.protein}g P</p>
        <p>🍞 {entry.carbs}g C</p>
        <p>🧈 {entry.fat}g F</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold mt-4">Items</h3>
        {entry.items.map((item: any, i: number) => (
          <div key={i} className="border-b border-white/10 py-2">
            <p>{item.name}</p>
            <p className="text-neutral-400 text-sm">
              {item.calories} kcal • {item.protein}P {item.carbs}C {item.fat}F
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
