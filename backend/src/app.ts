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

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/food-log", foodLogRoutes);
app.use("/api/user", weightRoutes);
app.use("/api/user", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);

// health
app.get("/", (req, res) => res.send("NutriTrack API"));

app.use(notFound);
app.use(errorHandler);

export default app;
