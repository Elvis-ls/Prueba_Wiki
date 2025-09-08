import express from 'express';
import { DepositoController } from '../controllers/depositoController';
import { verifyToken } from '../../User/middleware/auth.middleware';
import { authenticateAdmin } from '../../Admin/middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const controller = new DepositoController();

// Crear un nuevo depósito (usuario)
router.post('/deposito', verifyToken, async (req, res, next) => {
  await controller.createDeposito(req, res);
});

// Obtener depósitos propios del usuario
router.get('/depositos', verifyToken, async (req, res, next) => {
  await controller.getUserDepositos(req, res);
});

// Ruta para admins para listar todos los depósitos
router.get('/admin/depositos', authenticateAdmin, async (req, res, next) => {
  await controller.getAllDepositos(req, res);
});

// Opcional de implementar:Cambiar estado (aprobado/rechazado)
router.put('/admin/depositos/:id', authenticateAdmin, async (req, res, next) => {
  await controller.updateEstadoDeposito(req, res);
});


/* Seccion de Configuracion de Guardado de Imagen */
// configuracion de multer paara guardar las imagenes mediante transferencia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'deposito');

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

// endpoint para aceptar la subida de una imagen desde el frontend
router.post('/deposito/upload-image', upload.single('image'), (req, res): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      });
      return;
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/deposito/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen del deposito subida correctamente'
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir la imagen del deposito'
    });
  }
});

export default router;
