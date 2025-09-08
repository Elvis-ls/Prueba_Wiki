// Backend/src/Admin/routes/news.routes.ts
import { Router } from 'express';
import { 
  createNews, 
  getAllNews, 
  getNewsById, 
  updateNews, 
  deleteNews, 
  authenticateAdminToken,
} from '../update/news';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

/**
 * Rutas públicas (no requieren autenticación admin, pero sí token de usuario)
 * Estas rutas pueden ser accedidas por cualquier usuario autenticado
 */

// GET /api/admin/news - Obtener todas las noticias publicadas (con paginación)
// Query params opcionales: ?page=1&limit=10
router.get(
  '/update/news',
  async (req, res, next) => {
    console.log("peticion GET de listado de noticias");
    await getAllNews(req, res);
  }
);

// GET /api/admin/news/:id - Obtener una noticia específica por ID
router.get('/update/news/:id', getNewsById);

/**
 * Rutas protegidas (requieren autenticación y permisos de administrador)
 * Solo los administradores pueden crear, actualizar y eliminar noticias
 */

// POST /api/admin/news - Crear nueva noticia
// Requiere: autenticación de admin + posible imagen
// Body: { title, summary, content?, imageSize?, tags?, isPublished? }
// File: imagen opcional

router.post('/update/news', authenticateAdminToken, async (req, res, next)=> {
  console.log("peticion de upate de create news");
  console.log("==========");
  console.log("contenido: ", req);
  console.log("==========");
  await createNews(req, res);
});


// PUT /api/admin/news/:id - Actualizar noticia existente
// Requiere: autenticación de admin + posible nueva imagen
// Body: { title?, summary?, content?, imageSize?, tags?, isPublished? }
// File: nueva imagen opcional
// ACTUALIZAR ESTA FUN DE ACTUALIZAR LA NOTICIA CON EL MANEJO DE NOTICIAS
//router.put('/update/news/:id', authenticateAdminToken, uploadNewsImage.single('image'), updateNews);

// DELETE /api/admin/news/:id - Eliminar noticia
// Requiere: autenticación de admin
router.delete('/update/news/:id', authenticateAdminToken, deleteNews);

/* Seccion de Configuracion de Guardado de Imagen */
// configuracion de multer paara guardar las imagenes mediante transferencia
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'news');

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
router.post('/news/upload-image', upload.single('image'), (req, res): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      });
      return;
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/news/${req.file.filename}`;
    
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