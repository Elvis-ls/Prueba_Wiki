import { Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthRequest } from '../../User/interfaces/authRequest';

const notificationService = new NotificationService();

export const notificationController = {
  getNotificationsForUser: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> =>{
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'No autorizado: userId no proporcionado' });
        return;
      }

      const notifications = await notificationService.getNotificationsForUser(userId);
      res.json({ notifications });
    } catch (error) {
      next(error instanceof Error ? error : new Error('Error al obtener notificaciones'));
    }
  },

  // Método para crear una notificación
  markAsRead: async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> =>{
    try {
      const userId = req.user?.userId;
      const notificationId = Number(req.params.id);

      if (!userId) {
        res.status(401).json({ error: 'No autorizado: userId no proporcionado' });
        return;
      }

      await notificationService.markAsRead(notificationId, userId);
      res.json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      next(error instanceof Error ? error : new Error('Error al actualizar notificación'));
    }
  },
};