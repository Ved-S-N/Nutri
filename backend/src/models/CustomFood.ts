import mongoose from "mongoose";

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  sourceFoodId: { type: mongoose.Schema.Types.ObjectId, ref: "Food" },
});

const customFoodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  ingredients: [ingredientSchema],
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("CustomFood", customFoodSchema);
