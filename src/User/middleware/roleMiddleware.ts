/*import { Response, NextFunction } from "express";
import { AuthRequest } from "../interfaces/authRequest";

export const requireRole = (role: string) => (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== role) {
    return res.status(403).json({ error: "Acceso denegado" });
  }
  next();
};*/