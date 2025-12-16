import { prisma } from '../../prismaClient/client';

// ============================================
// OBTENER NOTICIA COMPLETA
// ============================================
export const obtenerNoticiaCompleta = async (newsId: number, accionistaId?: number) => {
  const noticia = await prisma.news.findUnique({
    where: { id: newsId },
    select: {
      id: true,
      title: true,
      content: true,
      resumen: true,
      publicationDate: true,
      tag: true,
      isPublished: true,
      createdAt: true,
      authorId: true,
      tamanio: {
        select: {
          id: true,
          tipo: true
        }
      },
      author: {
        select: {
          id: true,
          names: true,
          lastNames: true
        }
      },
      _count: {
        select: {
          likes: true,
          comentarios: true
        }
      }
    }
  });

  if (!noticia) {
    throw new Error('Noticia no encontrada');
  }

  // Verificar si el usuario actual dio like
  let userLiked = false;
  if (accionistaId) {
    const like = await prisma.news_like.findUnique({
      where: {
        news_id_accionista_id: {
          news_id: newsId,
          accionista_id: accionistaId
        }
      }
    });
    userLiked = !!like;
  }

  return {
    ...noticia,
    likesCount: noticia._count.likes,
    comentariosCount: noticia._count.comentarios,
    userLiked
  };
};

// ============================================
// LIKES
// ============================================
export const darLikeNoticia = async (newsId: number, accionistaId: number) => {
  // Verificar que la noticia existe
  const noticia = await prisma.news.findUnique({ where: { id: newsId } });
  if (!noticia) {
    throw new Error('Noticia no encontrada');
  }

  // Verificar si ya dio like
  const likeExistente = await prisma.news_like.findUnique({
    where: {
      news_id_accionista_id: {
        news_id: newsId,
        accionista_id: accionistaId
      }
    }
  });

  if (likeExistente) {
    throw new Error('El like ya existe');
  }

  return await prisma.news_like.create({
    data: {
      news_id: newsId,
      accionista_id: accionistaId
    },
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true
        }
      }
    }
  });
};

export const quitarLikeNoticia = async (newsId: number, accionistaId: number) => {
  const like = await prisma.news_like.findUnique({
    where: {
      news_id_accionista_id: {
        news_id: newsId,
        accionista_id: accionistaId
      }
    }
  });

  if (!like) {
    throw new Error('Like no encontrado');
  }

  return await prisma.news_like.delete({
    where: { id: like.id }
  });
};

export const obtenerLikesNoticia = async (newsId: number) => {
  const likes = await prisma.news_like.findMany({
    where: { news_id: newsId },
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true,
          foto_perfil: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return {
    total: likes.length,
    likes: likes.map(like => ({
      id: like.id,
      accionista: like.accionista,
      createdAt: like.createdAt
    }))
  };
};

// ============================================
// COMENTARIOS
// ============================================
export const crearComentarioNoticia = async (
  newsId: number, 
  accionistaId: number, 
  contenido: string
) => {
  // Verificar que la noticia existe
  const noticia = await prisma.news.findUnique({ where: { id: newsId } });
  if (!noticia) {
    throw new Error('Noticia no encontrada');
  }

  return await prisma.news_comentario.create({
    data: {
      news_id: newsId,
      accionista_id: accionistaId,
      contenido: contenido.trim()
    },
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true,
          foto_perfil: true
        }
      }
    }
  });
};

export const obtenerComentariosNoticia = async (newsId: number) => {
  return await prisma.news_comentario.findMany({
    where: { news_id: newsId },
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true,
          foto_perfil: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

export const actualizarComentarioNoticia = async (
  comentarioId: number,
  accionistaId: number,
  contenido: string
) => {
  // Verificar que el comentario existe y pertenece al usuario
  const comentario = await prisma.news_comentario.findUnique({
    where: { id: comentarioId }
  });

  if (!comentario) {
    throw new Error('Comentario no encontrado');
  }

  if (comentario.accionista_id !== accionistaId) {
    throw new Error('No tienes permiso para editar este comentario');
  }

  return await prisma.news_comentario.update({
    where: { id: comentarioId },
    data: {
      contenido: contenido.trim(),
      updatedAt: new Date()
    },
    include: {
      accionista: {
        select: {
          id: true,
          name: true,
          lastName: true
        }
      }
    }
  });
};

export const eliminarComentarioNoticia = async (
  comentarioId: number,
  accionistaId: number,
  isAdmin: boolean
) => {
  const comentario = await prisma.news_comentario.findUnique({
    where: { id: comentarioId }
  });

  if (!comentario) {
    throw new Error('Comentario no encontrado');
  }

  // Solo el dueño del comentario o un admin pueden eliminarlo
  if (comentario.accionista_id !== accionistaId && !isAdmin) {
    throw new Error('No tienes permiso para eliminar este comentario');
  }

  return await prisma.news_comentario.delete({
    where: { id: comentarioId }
  });
};