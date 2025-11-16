// src/models/Food.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IFood extends Document {
  name: string;
  fdcId?: number;
  calories: number; // per 100g by default
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  tags?: string[];
  mealType?: string;
  brand?: string;
  isCustom?: boolean;
  userId?: mongoose.Types.ObjectId;
}

const FoodSchema: Schema<IFood> = new Schema(
  {
    name: { type: String, required: true, index: true },
    fdcId: { type: Number, unique: true, sparse: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    servingSize: { type: String, default: "100g" },
    tags: [{ type: String }],
    mealType: { type: String },
    brand: { type: String },
    isCustom: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Food = mongoose.model<IFood>("Food", FoodSchema);
export default Food;
