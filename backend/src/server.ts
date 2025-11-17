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
// src/server.ts
// src/server.ts
// src/server.ts
// import app from "./app";
// import serverless from "serverless-http";
// import connectDB from "./config/db";

// const MONGO_URI = process.env.MONGO_URI || "";
// const PORT = process.env.PORT || 5000;

// let isConnected = false;

// // connect once
// const connect = async () => {
//   if (!isConnected) {
//     await connectDB(MONGO_URI);
//     isConnected = true;
//   }
// };

// // single express wrapper
// const expressHandler = serverless(app);

// // vercel default export
// const handler = async (req: any, res: any) => {
//   await connect();
//   return expressHandler(req, res);
// };

// export default handler;

// // local dev mode
// if (process.env.NODE_ENV !== "production") {
//   (async () => {
//     await connect();
//     app.listen(PORT, () => {
//       console.log(`🚀 API running locally → http://localhost:${PORT}`);
//     });
//   })();
// }
