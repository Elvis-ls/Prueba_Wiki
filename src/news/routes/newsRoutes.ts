/* NO SE ESTA USANDO ESTA CLASE */

import express from 'express';
import { NewsController } from '../controllers/newsController';
import { authenticateAdmin } from '../../Admin/middleware/authMiddleware';
import {  } from '../controllers/newsController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const newsController = new NewsController();

// Ruta para crear una noticia
//router.post('/create-news', authenticateAdmin, newsController.createNews);


router.post('/create-news', authenticateAdmin, async (req, res, next) => {
  await newsController.createNews(req, res);
});


/* Seccion de Configuracion de Guardado de Imagen de la noticia */
// configuracion de multer paara guardar las imagenes mediante transferencia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'noticia');

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
router.post('/new/upload-image', upload.single('image'), (req, res): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      });
      return;
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/new/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen de la noticia subida correctamente'
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir la imagen de la noticia'
    });
  }
});

export default router;