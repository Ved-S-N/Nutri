// src/server.ts
import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";

dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

(async () => {
  await connectDB(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
})();
