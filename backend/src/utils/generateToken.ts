// // src/utils/generateToken.ts
// import jwt from "jsonwebtoken";

// export const generateToken = (
//   userId: string,
//   secret: string,
//   expiresIn = "30d"
// ) => {
//   return jwt.sign({ id: userId }, secret, { expiresIn });
// };
import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  const secret = process.env.JWT_SECRET as string;

  return jwt.sign({ id: userId }, secret, { expiresIn: "30d" });
};
