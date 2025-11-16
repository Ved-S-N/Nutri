// src/app.ts
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import foodRoutes from "./routes/foodRoutes";
import foodLogRoutes from "./routes/foodLogRoutes";
import weightRoutes from "./routes/weightRoutes";
import userRoutes from "./routes/userRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";
import aiRoutes from "./routes/aiRoutes";
import workoutRoutes from "./routes/workoutRoutes";
import hydrationRoutes from "./routes/hydrationRoutes";
import wellnessRoutes from "./routes/wellnessRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import customFoodRoutes from "./routes/customFoodRoutes";
import aiFoodRoutes from "./routes/aiFoodRoutes";
import FavoriteFoodRoutes from "./routes/favoriteFoodRoutes";
import geminiRoutes from "./routes/geminiRoutes";
import calendarRoutes from "./routes/calendarRoutes";
import aiPhotoRoutes from "./routes/aiPhotoRoutes";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "https://nutri-frontend-pi.vercel.app"], // your frontend URL
    credentials: true, // allow cookies and auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-log", foodLogRoutes);
app.use("/api/user", weightRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("/api/hydration", hydrationRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/food", customFoodRoutes);
app.use("/api/ai-food", aiFoodRoutes);
app.use("/api/favorites", FavoriteFoodRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/ai", aiPhotoRoutes);

// health
app.get("/", (req, res) => res.send("NutriTrack API"));

app.use(notFound);
app.use(errorHandler);

export default app;
