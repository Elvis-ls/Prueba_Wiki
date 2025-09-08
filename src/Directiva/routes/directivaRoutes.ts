import express from 'express';
import { DirectivaController } from '../controllers/directivaController';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const controller = new DirectivaController();

// Rutas para usuarios (solo lectura)
// Obtener contenido completo de directiva
router.get('/directiva/content', async (req, res, next) => {
  await controller.getDirectivaContent(req, res);
});

// Obtener miembros de la directiva
router.get('/directiva/members', async (req, res, next) => {
  await controller.getDirectivaMembers(req, res);
});

// Rutas para administradores (lectura y escritura)
// Obtener contenido (también disponible para admins)
router.get('/admin/directiva/content', async (req, res, next) => {
  await controller.getDirectivaContent(req, res);
});

// Obtener miembros (también disponible para admins)
router.get('/admin/directiva/members', async (req, res, next) => {
  await controller.getDirectivaMembers(req, res);
});

// Rutas exclusivas para administradores (escritura)
// Actualizar contenido general de directiva
router.put('/admin/directiva/content', async (req, res, next) => {
  await controller.updateDirectivaContent(req, res);
});

// Actualizar miembro específico
router.put('/admin/directiva/members/:id', async (req, res, next) => {
  await controller.updateDirectivaMember(req, res);
});

// Crear nuevo miembro
router.post('/admin/directiva/members', async (req, res, next) => {
  console.log("Creando un nuevo usuario mediante el metodo post /admin/directiva/members");
  await controller.createDirectivaMember(req, res);
});

// Eliminar miembro especifico
router.delete('/admin/directiva/members/:id', async (req, res, next) => {
  await controller.deleteDirectivaMember(req, res);
});

// Actualizar múltiples miembros
router.put('/admin/directiva/members', async (req, res, next) => {
  await controller.updateMultipleMembers(req, res);
});

// Ruta alternativa para guardar todos los cambios de una vez
router.post('/admin/directiva/save-all', async (req, res) => {
  try {
    console.log('Recibiendo petición save-all:', req.body);
    
    const { content, members, adminId = 1 } = req.body;
    
    let contentResult;
    let membersResult;
    
    // Actualizar contenido si se proporciona
    if (content) {
      console.log('Actualizando contenido:', content);

      // Crear un nuevo request object para el contenido
      const contentReq = {
        ...req,
        body: { ...content, adminId }
      };

      // Crear un objeto response mock que capture la respuesta
      let contentResponseData: any;
      const contentRes = {
        json: (data: any) => { contentResponseData = data; },
        status: (code: number) => ({
          json: (data: any) => { contentResponseData = { statusCode: code, ...data }; }
        }),
        headersSent: false
      };

      // Usar contentRes como respuesta, no contentReq
      await controller.updateDirectivaContent(contentReq as any, contentRes as any);
      const contentResult = contentResponseData; // Ahora contentResult se asigna a la respuesta capturada

      if (contentResult?.statusCode && contentResult.statusCode !== 200) {
        throw new Error(contentResult.error || 'Error al actualizar contenido');
      }
    }
    
    // Actualizar miembros si se proporcionan
    if (members && Array.isArray(members)) {
      console.log('Actualizando miembros:', members);
      
      // Crear un nuevo request object para los miembros
      const membersReq = {
        ...req,
        body: { members: members, adminId }
      };
      
      // Crear un objeto response mock que capture la respuesta
      let membersResponseData: any;
      const membersRes = {
        json: (data: any) => { membersResponseData = data; },
        status: (code: number) => ({
          json: (data: any) => { membersResponseData = { statusCode: code, ...data }; }
        }),
        headersSent: false
      };
      
      await controller.updateMultipleMembers(membersReq as any, membersRes as any);
      membersResult = membersResponseData;
      
      if (membersResult?.statusCode && membersResult.statusCode !== 200) {
        throw new Error(membersResult.error || 'Error al actualizar miembros');
      }
    }
    
    console.log('Resultados:', { contentResult, membersResult });
    
    // Enviar respuesta exitosa
    res.json({
      success: true,
      message: 'Directiva actualizada correctamente', 
      data: {
        content: contentResult,
        members: membersResult
      }
    });
    
  } catch (error: any) {
    console.error('Error en save-all:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar la directiva'
    });
  }
});

// Configurar multer para guardar archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'directiva');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadPath)) {
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

// Ruta para subir imagen
router.post('/admin/directiva/upload-image', upload.single('image'), (req, res): void => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'No se recibió ningún archivo'
      });
      return;
    }

    // Construir URL de la imagen
    const imageUrl = `/uploads/directiva/${req.file.filename}`;
    
    res.json({
      success: true,
      imageUrl: imageUrl,
      message: 'Imagen subida correctamente'
    });
    
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir la imagen'
    });
  }
});

export default router;