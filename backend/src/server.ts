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
// src/server.ts
import app from "./app";
import dotenv from "dotenv";
import serverless from "serverless-http";
import connectDB from "./config/db";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || "";
const PORT = process.env.PORT || 5000;

let isConnected = false;

// Connect only once (serverless safe)
const connect = async () => {
  if (!isConnected) {
    await connectDB(MONGO_URI);
    isConnected = true;
  }
};

// Vercel serverless export
export const handler = async (req: any, res: any) => {
  await connect();
  const expressHandler = serverless(app);
  return expressHandler(req, res);
};

// Local environment
if (process.env.NODE_ENV !== "production") {
  (async () => {
    await connect();
    app.listen(PORT, () => {
      console.log(`🚀 API running locally → http://localhost:${PORT}`);
    });
  })();
}
