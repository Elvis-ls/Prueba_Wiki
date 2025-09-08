import express from "express";
import { CredencialController  } from '../controller/credencialController';
import { verifyToken } from '../../../User/middleware/auth.middleware';
import { authenticateAdmin } from '../../../Admin/middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const controller = new CredencialController ();

//visualizar lka credencial del usuario

/* Seccion de recepcionm del pdf para nviarlo al frontedn */
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/credenciales/");
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `credencial-${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

// ============== RUTAS PARA USUARIO ==============
router.get('/credencial', verifyToken, controller.getUserCredencial);

// ============== RUTAS PARA ADMIN ==============
router.get('/credenciales', authenticateAdmin, controller.getAllCredenciales);
router.get('/credencial/:userId', authenticateAdmin, controller.getCredencialByUserId);
router.post('/credencial/:userId', authenticateAdmin, upload.single("credencial"), controller.uploadCredencial);
router.delete('/credencial/:userId', authenticateAdmin, controller.deleteCredencial);
export default router;