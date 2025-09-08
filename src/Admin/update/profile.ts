// Backend/src/Admin/update/profile.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';


const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

export const updateAdminProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar que el usuario esté autenticado
    if (!req.user) {
      res.status(401).json({ 
        error: 'No autorizado. Token requerido.' 
      });
      return; // Termina la ejecución sin devolver valor
    }

    // Verificar que el usuario sea admin o superusuario
    if (req.user.role !== 'Administrador' && req.user.role !== 'superusuario') {
      res.status(403).json({ 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
      return;
    }

    const adminId = req.user.id;
    const { 
      names, 
      lastNames, 
      description, 
      addressHome, 
      phone, 
      areaPosition, 
      institutionLevel, 
      location 
    } = req.body;

    // Validar que al menos un campo esté presente
    if (!names && !lastNames && !description && !addressHome && !phone && !areaPosition && !institutionLevel && !location) {
      res.status(400).json({ 
        error: 'Se requiere al menos un campo para actualizar' 
      });
      return;
    }

    // Construir objeto de actualización solo con campos presentes
    const updateData: any = {};
    if (names !== undefined) updateData.names = names.trim();
    if (lastNames !== undefined) updateData.lastNames = lastNames.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (addressHome !== undefined) updateData.addressHome = addressHome.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (areaPosition !== undefined) updateData.areaPosition = areaPosition.trim();
    if (institutionLevel !== undefined) updateData.institutionLevel = institutionLevel.trim();
    if (location !== undefined) updateData.location = location.trim();

    // Verificar que el admin existe
    const existingAdmin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!existingAdmin) {
      res.status(404).json({ 
        error: 'Administrador no encontrado' 
      });
      return;
    }

    // Actualizar el perfil del administrador
    const updatedAdmin = await prisma.admin.update({
      where: { id: adminId },
      data: updateData,
      select: {
        id: true,
        names: true,
        lastNames: true,
        description: true,
        email: true,
        role: true,
        addressHome: true,
        phone: true,
        areaPosition: true,
        institutionLevel: true,
        location: true,
        cedula: true,
        accountNumber: true,
        createdAt: true,
        // No incluir password ni campos sensibles
      }
    });

    console.log(`Admin ${adminId} actualizó su perfil:`, updateData);

    res.status(200).json({
      message: 'Perfil de administrador actualizado exitosamente',
      user: updatedAdmin // Mantengo 'user' para compatibilidad con el frontend
    });

  } catch (error) {
    console.error('Error al actualizar perfil de administrador:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message 
      });
    } else {
      res.status(500).json({ 
        error: 'Error interno del servidor desconocido' 
      });
    }
  } finally {
    await prisma.$disconnect();
  }
};

// Middleware para verificar JWT específico para admin
export const authenticateAdminToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "No autorizado. Token requerido." });
    return;
  }

  const tokenParts = authHeader.split(' ');

  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    res.status(401).json({ error: "Formato de token inválido." });
    return;
  }

  const token = tokenParts[1];

  try {
    interface JwtPayload {
      id: number;
      role: string;
      email: string;
      iat?: number;
      exp?: number;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta') as JwtPayload;

    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email
    };

    console.log("Token decodificado:", decoded);
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};