import mongoose, { Schema, Document } from "mongoose";

export interface WellnessLogEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  sleepHours: number;
  moodRating: number; // 1–5
  notes?: string;
  createdAt: Date;
}

const WellnessSchema = new Schema<WellnessLogEntry>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  sleepHours: { type: Number, required: true },
  moodRating: { type: Number, min: 1, max: 5, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<WellnessLogEntry>("Wellness", WellnessSchema);
