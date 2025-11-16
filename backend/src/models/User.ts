// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

/* ----------------------------- 🧠 Interfaces ----------------------------- */
export interface IUserGoals {
  calories: number;
  protein: number;
  weight: number;
  weightGoalMode: "cutting" | "bulking" | "maintenance";
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  goalWeight?: number | null;
  goalMode: "cutting" | "bulking" | "maintenance";
  currentWeight?: number | null;
  goals?: IUserGoals; // ✅ nested goals object
  matchPassword(enteredPassword: string): Promise<boolean>;
}

/* ----------------------------- ⚙️ Schemas ----------------------------- */

// ✅ Define the nested "goals" schema first
const GoalsSchema = new Schema<IUserGoals>(
  {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 100 },
    weight: { type: Number, default: 70 },
    weightGoalMode: {
      type: String,
      enum: ["cutting", "bulking", "maintenance"],
      default: "maintenance",
    },
  },
  { _id: false } // prevent extra _id field for subdocument
);

// ✅ Then the main user schema
const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    goalWeight: { type: Number, default: null },
    goalMode: {
      type: String,
      enum: ["cutting", "bulking", "maintenance"],
      default: "maintenance",
    },
    currentWeight: { type: Number, default: null },
    goals: { type: GoalsSchema, default: {} }, // ✅ embedded subdocument
  },
  { timestamps: true }
);

/* ----------------------------- 🔐 Hooks & Methods ----------------------------- */
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  const salt = await bcrypt.genSalt(10);
  // @ts-ignore
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  next();
});

/* ----------------------------- 🚀 Export ----------------------------- */
const User = mongoose.model<IUser>("User", UserSchema);
export default User;
