import express from 'express';
import { sendPasswordResetLink } from '../controller/recoveryController';

const router = express.Router();

// Ruta para enviar el enlace de recuperación de contraseña
router.post('/recovery-password', sendPasswordResetLink);

export default router;