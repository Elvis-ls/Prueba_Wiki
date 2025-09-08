import express from 'express';
import { notificationController } from '../controllers/notificationController';
import { verifyToken } from '../../User/middleware/auth.middleware';

const router = express.Router();

// Obtener notificaciones para un usuario
router.get('/my-notifications', verifyToken, notificationController.getNotificationsForUser);
// Marcar notificación como leída
router.post('/mark-as-read/:id', verifyToken, notificationController.markAsRead);

export default router;