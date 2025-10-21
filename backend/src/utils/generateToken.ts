// src/utils/generateToken.ts
import jwt from "jsonwebtoken";

export const generateToken = (
  userId: string,
  secret: string,
  expiresIn = "30d"
) => {
  return jwt.sign({ id: userId }, secret, { expiresIn });
};
