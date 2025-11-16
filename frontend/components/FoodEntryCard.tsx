export default function FoodEntryCard({
  entry,
  onClick,
}: {
  entry: any;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex justify-between items-center py-2 border-b border-white/10 cursor-pointer"
    >
      <p>{entry.text}</p>
      <p className="text-neutral-400">{entry.totalCalories} cal</p>
    </div>
  );
}
