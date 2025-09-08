// Backend/src/Admin/uploads/news.ts
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

// Interfaz para las peticiones autenticadas
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

/**
 * Crear una nueva noticia
 * Solo disponible para administradores autenticados
 */
export const createNews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    console.log("controlador1");
    if (!req.user) {
      res.status(401).json({ 
        error: 'No autorizado. Token requerido.' 
      });
      return;
    }
    console.log("controlador2");
    // Verificar permisos de administrador
    if (req.user.role !== 'Administrador' && req.user.role !== 'superusuario') {
      res.status(403).json({ 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
      return;
    }
    console.log("controlador3");
    const { title, summary, content, imageSize, tags, isPublished, imageUrl } = req.body;

    // Validaciones básicas
    if (!title || !summary) {
      res.status(400).json({ 
        error: 'Título y resumen son campos obligatorios' 
      });
      return;
    }

    // Procesar tags si vienen como string separado por comas
    let processedTags: string[] = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }

    // Crear la noticia en la base de datos
    const newNews = await prisma.news.create({
      data: {
        title: title.trim(),
        summary: summary.trim(),
        content: content ? content.trim() : summary.trim(), // Si no hay contenido, usar el resumen
        imageUrl: imageUrl || null,
        imageSize: imageSize || 'grande', // valor por defect
        authorId: req.user.id,
        tags: processedTags,
        isPublished: true,
        publicationDate: new Date()
      },
      include: {
        author: {
          select: {
            id: true,
            names: true,
            lastNames: true,
            role: true
          }
        }
      }
    });

    console.log(`Admin ${req.user.id} creó una nueva noticia: ${newNews.title}`);
    const BASE_URL = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";
    res.status(201).json({
      success: true,
      message: 'Noticia creada exitosamente',
      news: {
        ...newNews,
        imageUrl: newNews.imageUrl ? `${BASE_URL}${newNews.imageUrl}` : null
      }
    });

  } catch (error) {
    console.error('Error al crear noticia:', error);

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

/**
 * Obtener todas las noticias (con paginación)
 * Disponible para todos los usuarios autenticados
 */
export const getAllNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const BASE_URL = process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001';

    // Obtener noticias publicadas
    const news = await prisma.news.findMany({
      where: {
        isPublished: true
      },
      skip: skip,
      take: limit,
      orderBy: {
        publicationDate: 'desc'
      },
      include: {
        author: {
          select: {
            names: true,
            lastNames: true,
            role: true
          }
        }
      }
    });

    // Reconstruir imageUrl en cada noticia
    const formattedNews = news.map(n => ({
      ...n,
      imageUrl: n.imageUrl ? `${BASE_URL}${n.imageUrl}` : null
    }));

    // Total
    const totalNews = await prisma.news.count({
      where: { isPublished: true }
    });

    console.log("totalNewsen la bbdd: ", totalNews);

    const totalPages = Math.ceil(totalNews / limit);

    res.status(200).json({
      success: true,
      data: formattedNews,
      pagination: {
        currentPage: page,
        totalPages,
        totalNews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error al obtener noticias:', error);
    res.status(500).json({
      error: 'Error interno al obtener noticias'
    });
  } finally {
    await prisma.$disconnect();
  }
};


/**
 * Obtener una noticia específica por ID
 */
export const getNewsById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      res.status(400).json({ 
        error: 'ID de noticia inválido' 
      });
      return;
    }

    const news = await prisma.news.findUnique({
      where: {
        id: newsId,
        isPublished: true // Solo mostrar noticias publicadas
      },
      include: {
        author: {
          select: {
            names: true,
            lastNames: true,
            role: true
          }
        }
      }
    });

    if (!news) {
      res.status(404).json({ 
        error: 'Noticia no encontrada' 
      });
      return;
    }

    const BASE_URL = process.env.BACKEND_PUBLIC_URL || 'http://localhost:3001';

    res.status(200).json({
      message: 'Noticia obtenida exitosamente',
      news: {
        ...news,
        imageUrl: news.imageUrl ? `${BASE_URL}${news.imageUrl}` : null
      }
    });

  } catch (error) {
    console.error('Error al obtener noticia por ID:', error);
    
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

/**
 * Actualizar una noticia existente
 * Solo disponible para administradores
 */
export const updateNews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    if (!req.user) {
      res.status(401).json({ 
        error: 'No autorizado. Token requerido.' 
      });
      return;
    }

    // Verificar permisos de administrador
    if (req.user.role !== 'Administrador' && req.user.role !== 'superusuario') {
      res.status(403).json({ 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
      return;
    }

    const { id } = req.params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      res.status(400).json({ 
        error: 'ID de noticia inválido' 
      });
      return;
    }

    const { title, summary, content, imageSize, tags, isPublished } = req.body;

    // Verificar que la noticia existe
    const existingNews = await prisma.news.findUnique({
      where: { id: newsId }
    });

    if (!existingNews) {
      res.status(404).json({ 
        error: 'Noticia no encontrada' 
      });
      return;
    }

    // Construir objeto de actualización
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (imageSize !== undefined) updateData.imageSize = imageSize;
    if (isPublished !== undefined) updateData.isPublished = isPublished === 'true' || isPublished === true;

    // Procesar tags si se proporcionan
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        updateData.tags = tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
      } else if (Array.isArray(tags)) {
        updateData.tags = tags;
      }
    }

    // Manejar nueva imagen si se sube
    if (req.file) {
      // Eliminar imagen anterior si existe
      if (existingNews.imageUrl) {
        const oldImagePath = path.join(__dirname, '../../../', existingNews.imageUrl);
        try {
          await fs.unlink(oldImagePath);
        } catch (deleteError) {
          console.log('No se pudo eliminar la imagen anterior:', deleteError);
        }
      }
      
      updateData.imageUrl = `/uploads/news/${req.file.filename}`;
    }

    // Actualizar la noticia
    const updatedNews = await prisma.news.update({
      where: { id: newsId },
      data: updateData,
      include: {
        author: {
          select: {
            names: true,
            lastNames: true,
            role: true
          }
        }
      }
    });

    console.log(`Admin ${req.user.id} actualizó la noticia: ${updatedNews.title}`);

    res.status(200).json({
      message: 'Noticia actualizada exitosamente',
      news: updatedNews
    });

  } catch (error) {
    console.error('Error al actualizar noticia:', error);
    
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

/**
 * Eliminar una noticia
 * Solo disponible para administradores
 */
export const deleteNews = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Verificar autenticación
    if (!req.user) {
      res.status(401).json({ 
        error: 'No autorizado. Token requerido.' 
      });
      return;
    }

    // Verificar permisos de administrador
    if (req.user.role !== 'Administrador' && req.user.role !== 'superusuario') {
      res.status(403).json({ 
        error: 'Acceso denegado. Se requieren permisos de administrador.' 
      });
      return;
    }

    const { id } = req.params;
    const newsId = parseInt(id);

    if (isNaN(newsId)) {
      res.status(400).json({ 
        error: 'ID de noticia inválido' 
      });
      return;
    }

    // Verificar que la noticia existe antes de eliminar
    const existingNews = await prisma.news.findUnique({
      where: { id: newsId }
    });

    if (!existingNews) {
      res.status(404).json({ 
        error: 'Noticia no encontrada' 
      });
      return;
    }

    // Eliminar imagen asociada si existe
    if (existingNews.imageUrl) {
      const imagePath = path.join(__dirname, '../../../', existingNews.imageUrl);
      try {
        await fs.unlink(imagePath);
      } catch (deleteError) {
        console.log('No se pudo eliminar la imagen:', deleteError);
      }
    }

    // Eliminar la noticia de la base de datos
    await prisma.news.delete({
      where: { id: newsId }
    });

    console.log(`Admin ${req.user.id} eliminó la noticia: ${existingNews.title}`);

    res.status(200).json({
      message: 'Noticia eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error al eliminar noticia:', error);
    
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

// Middleware para verificar JWT específico para admin (reutilizado del archivo de perfil)
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

    console.log("Token decodificado para noticias:", decoded);
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido o expirado." });
  }
};