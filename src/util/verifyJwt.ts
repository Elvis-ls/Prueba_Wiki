import { Request, Response, NextFunction } from 'express';
import { verifyJwtToken } from '../util/verifyToken';

export interface JwtPayload {
  id: number;
  role: string;
  userType: string;
  email: string;
  iat: number;
  exp: number;
}

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const verifyJwt = (
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