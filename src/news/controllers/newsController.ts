import { Request, Response } from 'express';
import { AuthRequest } from '../../util/verifyJwt';
import {
  darLikeNoticia,
  quitarLikeNoticia,
  obtenerLikesNoticia,
  crearComentarioNoticia,
  obtenerComentariosNoticia,
  eliminarComentarioNoticia,
  actualizarComentarioNoticia,
  obtenerNoticiaCompleta
} from '../services/newsService';

// ============================================
// OBTENER NOTICIA COMPLETA (con likes y comentarios)
// ============================================
export const getNoticiaByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const accionistaId = (req as AuthRequest).user?.id; // Opcional, para saber si el usuario dio like

    const noticia = await obtenerNoticiaCompleta(Number(id), accionistaId);

    res.json({
      success: true,
      data: noticia
    });
  } catch (error: any) {
    console.error('Error al obtener noticia:', error);
    res.status(500).json({ 
      message: 'Error al obtener noticia',
      error: error.message 
    });
  }
};

// ============================================
// LIKES
// ============================================
export const likeNoticiaController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const newsId = Number(req.params.id);
    const accionistaId = req.user.id;

    const like = await darLikeNoticia(newsId, accionistaId);

    res.status(201).json({
      success: true,
      message: 'Like agregado',
      data: like
    });
  } catch (error: any) {
    console.error('Error al dar like:', error);
    
    // Si el like ya existe, devolver 200 en lugar de error
    if (error.message.includes('ya existe')) {
      res.status(200).json({
        success: true,
        message: 'Ya has dado like a esta noticia'
      });
      return;
    }

    res.status(500).json({ 
      message: 'Error al dar like',
      error: error.message 
    });
  }
};

export const unlikeNoticiaController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const newsId = Number(req.params.id);
    const accionistaId = req.user.id;

    await quitarLikeNoticia(newsId, accionistaId);

    res.json({
      success: true,
      message: 'Like eliminado'
    });
  } catch (error: any) {
    console.error('Error al quitar like:', error);
    res.status(500).json({ 
      message: 'Error al quitar like',
      error: error.message 
    });
  }
};

export const getNoticiaLikesController = async (req: Request, res: Response) => {
  try {
    const newsId = Number(req.params.id);

    const likes = await obtenerLikesNoticia(newsId);

    res.json({
      success: true,
      data: likes
    });
  } catch (error: any) {
    console.error('Error al obtener likes:', error);
    res.status(500).json({ 
      message: 'Error al obtener likes',
      error: error.message 
    });
  }
};

// ============================================
// COMENTARIOS
// ============================================
export const comentarNoticiaController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const newsId = Number(req.params.id);
    const accionistaId = req.user.id;
    const { contenido } = req.body;

    if (!contenido || contenido.trim() === '') {
      res.status(400).json({ error: 'El comentario no puede estar vacío' });
      return;
    }

    const comentario = await crearComentarioNoticia(newsId, accionistaId, contenido);

    res.status(201).json({
      success: true,
      message: 'Comentario agregado',
      data: comentario
    });
  } catch (error: any) {
    console.error('Error al comentar:', error);
    res.status(500).json({ 
      message: 'Error al agregar comentario',
      error: error.message 
    });
  }
};

export const getNoticiaComentariosController = async (req: Request, res: Response) => {
  try {
    const newsId = Number(req.params.id);

    const comentarios = await obtenerComentariosNoticia(newsId);

    res.json({
      success: true,
      data: comentarios
    });
  } catch (error: any) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).json({ 
      message: 'Error al obtener comentarios',
      error: error.message 
    });
  }
};

export const actualizarComentarioController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const comentarioId = Number(req.params.comentarioId);
    const accionistaId = req.user.id;
    const { contenido } = req.body;

    if (!contenido || contenido.trim() === '') {
      res.status(400).json({ error: 'El comentario no puede estar vacío' });
      return;
    }

    const comentario = await actualizarComentarioNoticia(comentarioId, accionistaId, contenido);

    res.json({
      success: true,
      message: 'Comentario actualizado',
      data: comentario
    });
  } catch (error: any) {
    console.error('Error al actualizar comentario:', error);
    res.status(403).json({ 
      message: 'No tienes permiso para editar este comentario',
      error: error.message 
    });
  }
};

export const eliminarComentarioController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuario no autenticado' });
      return;
    }

    const comentarioId = Number(req.params.comentarioId);
    const accionistaId = req.user.id;
    const isAdmin = req.user.role === 'Administrador';

    await eliminarComentarioNoticia(comentarioId, accionistaId, isAdmin);

    res.json({
      success: true,
      message: 'Comentario eliminado'
    });
  } catch (error: any) {
    console.error('Error al eliminar comentario:', error);
    res.status(403).json({ 
      message: 'No tienes permiso para eliminar este comentario',
      error: error.message 
    });
  }
};