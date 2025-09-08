import { Router } from 'express';
import { updateAdminProfile } from '../update/profile';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticateAdmin } from '../../Admin/middleware/authMiddleware';
import path from 'path';
import fs from 'fs';

const router = Router();
const prisma = new PrismaClient();

// Ruta para actualizar perfil de administrador
router.put('/update/profile', authenticateAdmin, async (req, res, next) => {
    console.log("PUT '/update/profile' peticion recibida");
    await updateAdminProfile(req, res);
});

/* Seccion de Configuracion de Guardado de Imagen */
// configuracion de multer paara guardar las imagenes mediante transferencia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'profile', 'admin');

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
router.post('/profile/upload-image', upload.single('image'), authenticateAdmin, async (req, res): Promise<void> => {
    try {
        console.log("dentro de la ruta profile/upload-imageAdministrador");
        console.log("ver que hay dentro de req.file Administrador");
        console.log(req.file);
        console.log("🚀 [BACKEND] POST /profile/upload-image");
        console.log("📦 Archivo recibido:", req.file);
        console.log("🧠 Administrador autenticado:", req.adminId);

        if (!req.file) {
        res.status(400).json({
            success: false,
            error: 'No se recibió ningún archivo'
        });
        return;
        }

        const adminId  = req.adminId;

        if (!adminId ) {
        console.warn("⚠️ Token válido pero no se encontró el ID del administrador en req.user");
        res.status(401).json({ error: 'Usuario no autenticado' });
        return;
        }

        const imageUrl = `/uploads/profile/admin/${req.file.filename}`;
        console.log("🖼️ URL de imagen generada:", imageUrl);

        // Actualiza la imagen en la tabla admins
        const updatedAdmin = await prisma.admin.update({
            where: { id: adminId },
            data: {
                image: imageUrl  
            },
            select: {
                id: true,
                names: true,
                lastNames: true,
                image: true
            }
        });

        console.log("✅ Imagen de perfil actualizada en BD:", updatedAdmin);

        res.json({
            success: true,
            imageUrl,
            message: 'Imagen de perfil de administrador subida y guardada correctamente',
            admin: updatedAdmin
        });

    } catch (error: any) {
        console.error("❌ Error en upload-image administrador:", error);
        res.status(500).json({
            success: false,
            error: error.message || 'Error al subir y guardar la imagen de perfil del administrador'
        });
    }
});

export default router;