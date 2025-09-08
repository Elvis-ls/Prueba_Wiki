import jwt from 'jsonwebtoken';
import { JwtPayload } from '../User/interfaces/jwtPayload';

export const verifyJwtToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
};
