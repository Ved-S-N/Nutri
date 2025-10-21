// src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  goalWeight?: number | null;
  goalMode: "cutting" | "bulking" | "maintenance";
  currentWeight?: number | null;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

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
  },
  { timestamps: true }
);

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

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
