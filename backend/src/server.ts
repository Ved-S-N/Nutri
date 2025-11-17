// // src/server.ts
// import app from "./app";
// import connectDB from "./config/db";
// import dotenv from "dotenv";

// dotenv.config();
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || "";

// (async () => {
//   await connectDB(MONGO_URI);
//   app.listen(PORT, () => {
//     console.log(`Server listening on port ${PORT}`);
//   });
// })();
// src/server.ts
// src/server.ts
import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

// Serverless handler for Vercel
export const handler = async (req: any, res: any) => {
  await connectDB(MONGO_URI);
  const expressHandler = serverless(app);
  return expressHandler(req, res);
};

// Local development mode
if (process.env.NODE_ENV !== "production") {
  (async () => {
    await connectDB(MONGO_URI);
    app.listen(PORT, () => {
      console.log(`🚀 NutriTrack API running → http://localhost:${PORT}`);
    });
  })();
}
