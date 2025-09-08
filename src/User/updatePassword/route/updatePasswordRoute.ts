/*import express from 'express';
import { updatePasswordController } from '../controller/updatePasswordController';
import { verifyToken } from '../../../User/middleware/auth.middleware';

const router = express.Router();
const controller = new updatePasswordController();

// Ruta para enviar el enlace de recuperación de contraseña
router.post('/update-password', verifyToken, async(req, res, next) => {
    console.log("POST /update-password peticion recibida");
    await controller.updatePassword(req, res);
});

export default router;*/