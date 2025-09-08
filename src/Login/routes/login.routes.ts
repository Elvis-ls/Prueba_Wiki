import express from 'express';
import { loginGeneralController } from '../controller/loginController';

const router = express.Router();

router.post('/auth/login', loginGeneralController);

export default router;