// src/controllers/authController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please include name, email and password" });
  }
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const user = new User({
    name,
    email,
    passwordHash: password, // will be hashed in model pre-save
  });

  await user.save();
  const token = generateToken(user._id.toString());

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    token,
    goalWeight: user.goalWeight,
    goalMode: user.goalMode,
    currentWeight: user.currentWeight,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await user.matchPassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken(user._id.toString());

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    token,
    goalWeight: user.goalWeight,
    goalMode: user.goalMode,
    currentWeight: user.currentWeight,
  });
};

export const getProfile = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
};
