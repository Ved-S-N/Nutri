// // src/middleware/authMiddleware.ts
// import { Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
// import User, { IUser } from "../models/User";

// interface JwtPayload {
//   id: string;
//   iat?: number;
//   exp?: number;
// }

// export const protect = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     try {
//       token = req.headers.authorization.split(" ")[1];
//       const secret = process.env.JWT_SECRET || "secret";
//       const decoded = jwt.verify(token, secret) as JwtPayload;
//       const user = await User.findById(decoded.id).select("-passwordHash");
//       req.user = user || null;
//       next();
//     } catch (error) {
//       res.status(401).json({ message: "Not authorized, token failed" });
//     }
//   } else {
//     res.status(401).json({ message: "Not authorized, no token" });
//   }
// };
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Express 5 typing requires `req.get()`
    const authHeader = req.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET || "secret";

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select("-passwordHash");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach the user object to req — cast needed for TS
    (req as any).user = user;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
