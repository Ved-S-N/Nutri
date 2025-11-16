import mongoose from "mongoose";

const AIFoodEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  totalCalories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  items: [
    {
      name: String,
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },
  ],
});

export default mongoose.model("AIFoodEntry", AIFoodEntrySchema);
