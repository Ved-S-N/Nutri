// src/controllers/geminicontroller.ts
import { Request, Response } from "express";
import axios from "axios";
import FoodLog from "../models/FoodLog";
import User, { IUser } from "../models/User";
// import { Request } from "../types/express"

export const generateAISummary = async (req: Request, res: Response) => {
  try {
    if (!req.user?._id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No user found in request" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY in .env");
      return res.status(500).json({ error: "Missing Gemini API key" });
    }

    const { days = 7 } = req.body;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    // ✅ Fetch user’s food logs
    const logs = await FoodLog.find({
      user: req.user._id,
      date: { $gte: cutoff },
    });

    if (logs.length === 0) {
      return res.json({
        summary: `It looks like you haven’t logged any meals in the past ${days} days.  
        Start small—try logging your next meal to get personalized feedback! 🌱`,
      });
    }

    // ✅ Calculate average nutrition data
    const avg = (key: keyof (typeof logs)[0]) =>
      logs.reduce((a, b) => a + (b[key] as number), 0) / logs.length;

    const avgCalories = avg("calories");
    const avgProtein = avg("protein");
    const avgCarbs = avg("carbs");
    const avgFat = avg("fat");

    const userData = (await User.findById(req.user._id)
      .select("goals")
      .lean()) as unknown as IUser | null;

    const goalMode = userData?.goals?.weightGoalMode ?? "maintenance";
    let goalFocus = "";

    if (goalMode === "cutting") {
      goalFocus =
        "Focus on maintaining a calorie deficit while keeping protein high.";
    } else if (goalMode === "bulking") {
      goalFocus =
        "You're aiming to gain — ensure a consistent calorie surplus and quality carbs.";
    } else {
      goalFocus =
        "You're maintaining — balance intake and stay consistent with your macros.";
    }

    // ✅ Construct the prompt
    const prompt = `
You are a world-class nutrition coach who gives high-performance feedback in a precise, no-fluff style.

Analyze this user’s nutrition data from the past ${days} days:

• Avg Calories: ${avgCalories.toFixed(0)} kcal/day
• Avg Protein: ${avgProtein.toFixed(1)} g/day
• Avg Carbs: ${avgCarbs.toFixed(1)} g/day
• Avg Fat: ${avgFat.toFixed(1)} g/day

Goals:
• Calories: ${userData?.goals?.calories ?? "N/A"} kcal/day
• Protein: ${userData?.goals?.protein ?? "N/A"} g/day
• Target Weight: ${userData?.goals?.weight ?? "N/A"} kg
• Mode: ${goalMode} (${goalFocus})

Return a short, **punchy breakdown** (max 100 words) using bullet points. 
Skip any generic praise — make it sound like a real check-in from a coach who knows their stuff.

Format the output like this:

 **Win:** [Highlight one clear success or positive trend]
 **Fix:** [Point out one key issue or weak spot that matters most]
 **Next:** [Give one concrete, actionable step the user can take right now]

Guidelines:
- Be direct and specific — not polite filler.
- Avoid restating the numbers above.
- Use natural, confident language (like a coach talking to an athlete).
- Tone: sharp, motivating, and data-driven — not emotional or robotic.
`;

    // ✅ Send prompt to Gemini API
    const geminiRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: apiKey },
      }
    );

    // ✅ Extract AI output text
    const summary =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Couldn’t generate feedback right now — but keep going, you’re doing great! 💪";

    // ✅ Send back clean summary
    res.json({ summary });
  } catch (err: any) {
    console.error("❌ Gemini API error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to generate AI summary. Please try again later.",
    });
  }
};
