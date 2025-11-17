import { Response } from "express";
import AIFoodEntry from "../models/AIFoodEntry";
import axios from "axios";
import { AuthRequest } from "../types/express";

export const analyzeFoodText = async (req: AuthRequest, res: Response) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Missing food text" });

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

    const prompt = `
      You are a professional nutrition assistant.
      Analyze the meal description below and output only valid JSON (no markdown, no explanations).

      Example:
      {
        "totalCalories": 700,
        "protein": 30,
        "carbs": 60,
        "fat": 25,
        "items": [
          { "name": "Burger from In-N-Out", "calories": 390, "protein": 16, "carbs": 41, "fat": 19 },
          { "name": "Fries", "calories": 310, "protein": 4, "carbs": 40, "fat": 15 }
        ]
      }

      Meal: "${text}"
    `;

    // ⚡ Using Gemini 1.5 Flash (free model)
    const geminiRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: apiKey }, // ✅ Correct param style for AI Studio keys
      }
    );

    // Extract AI output text
    const rawText =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    // Try to extract JSON from any extra formatting
    const match = rawText.match(/{[\s\S]*}/);
    const json = match ? JSON.parse(match[0]) : null;

    if (!json) {
      console.error("AI returned unparsable data:", rawText);
      return res.status(500).json({ message: "Invalid AI response" });
    }

    // Save entry to DB (optional)
    const entry = await AIFoodEntry.create({
      user: req.user?._id || null,
      text,
      ...json,
    });

    res.json(entry);
  } catch (err: any) {
    console.error("Gemini API error:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to analyze food text" });
  }
};

export const getTodaysEntries = async (req: AuthRequest, res: Response) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const entries = await AIFoodEntry.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
  }).sort({ date: -1 });

  res.json(entries);
};
