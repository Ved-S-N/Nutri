import { Request, Response } from "express";
import axios from "axios";

export const analyzeFoodPhoto = async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ message: "Missing API key" });

    const image = req.file;
    const context = req.body.context || "";

    if (!image) {
      return res.status(400).json({ message: "Missing image file" });
    }

    // Convert uploaded image to base64
    const imageBase64 = image.buffer.toString("base64");

    const prompt = `
You are a professional nutrition analyst. 
Analyze the food items in the image and use the optional context.

Return ONLY valid JSON. No text outside JSON.

JSON Format:
{
  "totalCalories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "items": [
    {
      "name": string,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number
    }
  ]
}

Context: "${context}"
`;

    const geminiRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: image.mimetype,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
        params: { key: apiKey },
      }
    );

    const rawText =
      geminiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const match = rawText.match(/{[\s\S]*}/);
    if (!match) {
      return res.status(500).json({
        message: "AI returned invalid format",
        raw: rawText,
      });
    }

    const json = JSON.parse(match[0]);

    res.json(json);
  } catch (error: any) {
    console.error("Photo Analysis Error:", error.response?.data || error);
    res.status(500).json({ message: "Failed to analyze photo" });
  }
};
