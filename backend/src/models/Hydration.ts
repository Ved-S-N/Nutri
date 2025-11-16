import mongoose, { Schema, Document } from "mongoose";

export interface HydrationLogEntry extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  glassesConsumed: number;
  goalGlasses: number;
  createdAt: Date;
}

const HydrationSchema = new Schema<HydrationLogEntry>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  glassesConsumed: { type: Number, required: true, default: 0 },
  goalGlasses: { type: Number, required: true, default: 8 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<HydrationLogEntry>("Hydration", HydrationSchema);
