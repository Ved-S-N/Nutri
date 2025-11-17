import serverless from "serverless-http";
import app from "../src/app";
import connectDB from "../src/config/db";

const MONGO_URI = process.env.MONGO_URI || "";

let isConnected = false;

const connect = async () => {
  if (!isConnected) {
    await connectDB(MONGO_URI);
    isConnected = true;
  }
};

const handler = async (req: any, res: any) => {
  await connect();
  const expressHandler = serverless(app);
  return expressHandler(req, res);
};

export default handler;
