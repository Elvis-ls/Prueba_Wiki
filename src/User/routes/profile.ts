// User/routes/profile.routes.ts
// Actualizacion del perfil del usuario
/*
import { Router } from 'express';
import { updateUserProfile } from '../update/profile';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../../../src/User/interfaces/authRequest';
import { verifyToken } from '../../User/middleware/auth.middleware';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Ruta para actualizar perfil de usuariopero con vista de profileHeader
router.put('/update/profile', verifyToken, async (req, res, next) => {
    console.log("PUT '/update/profile' peticion recibida");
    await updateUserProfile(req, res);
});

//Seccion de Configuracion de Guardado de Imagen
// configuracion de multer paara guardar las imagenes mediante transferencia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'profile', 'user');

    // creacion del directorio si no existe
    if (!fs.existsSync(uploadPath)){
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB límite
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

//router.post('/profile/upload-image', upload.single('image'), (req, res): void => {

// endpoint para aceptar la subida de una imagen desde el frontend
router.post('/profile/upload-image', upload.single('image'), verifyToken, async (req: AuthRequest, res): Promise<void> => {
  try {
    console.log("dentro de la ruta profile/upload-image");
    console.log("ver que hay dentro de req.file");
    console.log(req.file);
    console.log("🚀 [BACKEND] POST /profile/upload-image");
    console.log("📦 Archivo recibido:", req.file);
    console.log("🧠 Usuario autenticado:", req.user);

    

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      });
      return;
    }

    const userId = req.user?.userId;

    if (!userId) {
      console.warn("⚠️ Token válido pero no se encontró el ID del usuario en req.user");
      res.status(401).json({ error: 'Usuario no autenticado' });
      return;
    }

    const imageUrl = `/uploads/profile/user/${req.file.filename}`;
    console.log("🖼️ URL de imagen generada:", imageUrl);
    
    // Aquí actualizas la BD
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        image: imageUrl
      },
      select: {
        id: true,
        name: true,
        image: true
      }
    });

    console.log("✅ Imagen de perfil actualizada en BD:", updatedUser);

    res.json({
      success: true,
      imageUrl,
      message: 'Imagen de perfil subida y guardada correctamente',
      user: updatedUser
    });
    
  } catch (error: any) {
    console.error("❌ Error en upload-image:", error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir y guardar la imagen de perfil'
    });
  }
});

export default router;
*/