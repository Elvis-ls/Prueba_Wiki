import { Request, Response, NextFunction } from 'express';
import { AdminAuthService } from '../services/adminAuthService';
import { TokenService } from '../../util/tokenService';

declare module 'express-serve-static-core' {
  interface Request {
    adminId?: number;
  }
}

const tokenService = new TokenService();
const adminAuthService = new AdminAuthService();

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  try {
    const decoded = tokenService.verifyToken(token);
    console.log('🔍 Token decodificado:', decoded);
    
    // Validar que el usuario sea administrador
    adminAuthService.validateAdminRole(decoded.role);

    // CORRECCIÓN: Usar 'id' en lugar de 'adminId' ya que así viene en el token
    req.adminId = decoded.id;
    
    console.log('✅ Administrador autenticado correctamente:', {
      adminId: req.adminId,
      role: decoded.role,
      userType: decoded.userType
    });
    
    next();
  } catch (error) {
    console.error('❌ Error en autenticación de admin:', error);
    
    if (error instanceof Error) {
      res.status(401).json({ 
        success: false, 
        error: error.message === 'Solo administradores pueden agregar noticias' 
          ? 'Administrador no autenticado' 
          : error.message 
      });
    } else {
      res.status(401).json({ success: false, error: 'Administrador no autenticado' });
    }
  }
};