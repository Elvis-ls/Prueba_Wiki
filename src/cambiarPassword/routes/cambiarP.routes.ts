import express from 'express';
import { cambiarPasswordController } from '../controller/cambiarPController';
import { verifyJwt } from '../../util/verifyJwt';

const router = express.Router();

//Ruta para cambiar de contraseña
router.post("/cambiar-password", verifyJwt, cambiarPasswordController);

export default router;