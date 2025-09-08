/*// User/update/profile.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import path from 'path';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    userType?: string;
  };
}

// Middleware para verificar el token JWT
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Token de acceso requerido' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta', (err: any, user: any) => {
    if (err) {
      res.status(403).json({ error: 'Token inválido' });
      return;
    }
    req.user = user;
    next();
  });
};

// actualizar el perfil del usuario accionista en este caso
export const updateUserProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    console.log("PUT /api/user/update/profile recibido");
    console.log("Usuario autenticado con ID:", req.user?.id);
    console.log("Datos recibidos para actualización:", req.body);
    const userId = req.user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const { 
      name, 
      lastName, 
      description, 
      addressHome,
      areaPosition,
      institutionLevel,
      location,
      phone 
    } = req.body;

    let image;
    if(req.file){
      image = `/uploads/profile/user/${req.file.filename}`;
    }

    // Verificar que el usuario existe y mostrar datos actuales
    const existingUser = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    console.log("📋 Datos del usuario ANTES de la actualización:");
    console.log("- ID:", existingUser.id);
    console.log("- Descripción actual:", existingUser.description);
    console.log("- Nombre actual:", existingUser.name);

    // Actualizar solo los campos que se envían
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (description !== undefined) updateData.description = description;
    if (addressHome !== undefined) updateData.addressHome = addressHome;
    if (areaPosition !== undefined) updateData.areaPosition = areaPosition;
    if (institutionLevel !== undefined) updateData.institutionLevel = institutionLevel;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    if (image) updateData.image = image;

    console.log("🔄 Datos que se van a actualizar:", updateData);

    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        lastName: true,
        description: true,
        addressHome: true,
        areaPosition: true,
        institutionLevel: true,
        location: true,
        phone: true,
        email: true,
        role: true,
        cedula: true,
        accountNumber: true,
        image:true
      }
    });

    console.log("✅ Usuario actualizado exitosamente:");
    console.log("- ID:", updatedUser.id);
    console.log("- Descripción nueva:", updatedUser.description);
    console.log("- Nombre nuevo:", updatedUser.name);

    // Verificar que la actualización se guardó correctamente
    const verificationUser = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        lastName: true,
        description: true,
        email: true,
        role: true
      }
    });

    console.log("🔍 Verificación - Usuario en BD después de actualización:");
    console.log(verificationUser);

    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });

  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};*/