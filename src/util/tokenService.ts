import jwt from 'jsonwebtoken';

// Interfaz actualizada para coincidir con el payload real del token
interface TokenPayload {
  id: number;          // Cambiado de adminId a id
  role: string;
  userType: string;
  email: string;
  iat: number;
  exp: number;
}

export class TokenService {
  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
      console.log('Token verificado exitosamente:', {
        id: decoded.id,
        role: decoded.role,
        userType: decoded.userType,
        email: decoded.email
      });
      return decoded;
    } catch (error) {
      console.error('Error verificando token:', error);
      throw new Error('Token inválido');
    }
  }
}