import express from 'express';
import { resetPasswordController } from '../controller/resetPasswordController';

const router = express.Router();

router.post('/reset-password', resetPasswordController);

export default router;
