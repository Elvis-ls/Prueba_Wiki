import express from 'express';
import { 
  createNoticiaController, 
  getTodasNoticiasController,
  getNoticiaByIdController,
  actualizarNoticiaController,
  eliminarNoticiaController,
  publicarNewsController,
  noPublicarNewsController,
  getImagenNoticiaController,
  
  // Nuevos controllers
  likeNoticiaController,
  unlikeNoticiaController,
  getNoticiaLikesController,
  comentarNoticiaController,
  getNoticiaComentariosController,
  eliminarComentarioController,
  actualizarComentarioController
} from '../controllers/newsController';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { uploadMemory } from '../../util/upload';

const router = express.Router();

// ============================================
// RUTAS PÚBLICAS (Noticias)
// ============================================
// Obtener imagen de noticia
router.get('/news/:id/portada', getImagenNoticiaController);

// Obtener todas las noticias
router.get('/news', getTodasNoticiasController);

// Obtener noticia específica con likes y comentarios
router.get('/news/:id', getNoticiaByIdController);

// ============================================
// RUTAS ACCIONISTAS (Likes y Comentarios)
// ============================================
// Dar like a una noticia
router.post('/news/:id/like', verifyJwt, likeNoticiaController);

// Quitar like de una noticia
router.delete('/news/:id/like', verifyJwt, unlikeNoticiaController);

// Ver likes de una noticia
router.get('/news/:id/likes', getNoticiaLikesController);

// Comentar en una noticia
router.post('/news/:id/comentarios', verifyJwt, comentarNoticiaController);

// Ver comentarios de una noticia
router.get('/news/:id/comentarios', getNoticiaComentariosController);

// Actualizar propio comentario
router.put('/news/comentarios/:comentarioId', verifyJwt, actualizarComentarioController);

// Eliminar propio comentario
router.delete('/news/comentarios/:comentarioId', verifyJwt, eliminarComentarioController);

// ============================================
// RUTAS ADMIN
// ============================================
// Crear noticia
router.post('/admin/news/create-news', 
  uploadMemory.single('foto_portada'), 
  verifyJwt, 
  verifyAdmin, 
  createNoticiaController
);

// Actualizar noticia
router.put('/admin/news/update-data/:id', 
  uploadMemory.single('foto_portada'), 
  verifyJwt, 
  verifyAdmin, 
  actualizarNoticiaController
);

// Eliminar noticia
router.delete('/admin/news/eliminar/:id', 
  verifyJwt, 
  verifyAdmin, 
  eliminarNoticiaController
);

// Publicar noticia
router.put('/admin/news/publicar/:id', 
  verifyJwt, 
  verifyAdmin, 
  publicarNewsController
);

// Despublicar noticia
router.put('/admin/news/no-publicar/:id', 
  verifyJwt, 
  verifyAdmin, 
  noPublicarNewsController
);

// Admin puede eliminar cualquier comentario
router.delete('/admin/news/comentarios/:comentarioId', 
  verifyJwt, 
  verifyAdmin, 
  eliminarComentarioController
);

export default router;