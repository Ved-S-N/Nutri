// src/models/FoodLog.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IFoodLog extends Document {
  user: mongoose.Types.ObjectId;
  food: mongoose.Types.ObjectId;
  quantity: number; // grams
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: Date;
  mealType: string; // breakfast, lunch, dinner, snack
}

const FoodLogSchema: Schema<IFoodLog> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    food: { type: Schema.Types.ObjectId, ref: "Food", required: true },
    quantity: { type: Number, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    date: { type: Date, required: true },
    mealType: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
  { timestamps: true }
);

const FoodLog = mongoose.model<IFoodLog>("FoodLog", FoodLogSchema);
export default FoodLog;
