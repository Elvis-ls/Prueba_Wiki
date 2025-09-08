import express from 'express';
import { crearUsuarioController, actualizarData, completarInformacion, obtenerFotoPerfilController, obtenerFotoPortadaController, getUserData } from '../controllers/usuarioController';
import { verifyJwt } from '../../util/verifyJwt';
import { verifyAdmin } from '../../util/verifyAdmin';
import { upload } from '../../util/upload';

const router = express.Router();

//Accionista
router.put('/accionista/actualizar', upload.fields([
    { name: "foto_perfil", maxCount: 1 },
    { name: "foto_portada", maxCount: 1 }
]), verifyJwt, actualizarData);
router.put('/accionista/completar-informacion', completarInformacion);
router.get('/accionista/foto-perfil', verifyJwt, obtenerFotoPerfilController);
router.get('/accionista/foto-portada', verifyJwt, obtenerFotoPortadaController);
router.get('/user/me', verifyJwt, getUserData);


//Administrador
router.post('/admin/create-user', verifyJwt, verifyAdmin, crearUsuarioController);

export default router;