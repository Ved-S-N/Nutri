// src/models/WeightLog.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IWeightLog extends Document {
  user: mongoose.Types.ObjectId;
  weight: number;
  date: Date;
}

const WeightLogSchema: Schema<IWeightLog> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    weight: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

const WeightLog = mongoose.model<IWeightLog>("WeightLog", WeightLogSchema);
export default WeightLog;
