import { Response, NextFunction } from "express";
import { AuthRequest } from "../interfaces/authRequest";
import { verifyJwtToken } from '../../util/verifyToken';

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Token no proporcionado" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyJwtToken(token);
    console.log('Decoded JWT:', decoded);
    req.user = { userId: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido o expirado" });
  }
};