import mongoose, { Schema, Document } from "mongoose";

export interface WorkoutLogEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  type: string;
  durationMinutes: number;
  intensity: "low" | "medium" | "high";
  caloriesBurned: number;
  createdAt: Date;
}

const WorkoutSchema = new Schema<WorkoutLogEntry>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true },
  durationMinutes: { type: Number, required: true },
  intensity: { type: String, enum: ["low", "medium", "high"], required: true },
  caloriesBurned: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<WorkoutLogEntry>("Workout", WorkoutSchema);
