import { RequestHandler } from 'express';
import { resetPasswordService } from '../services/resetPasswordService';

export const resetPasswordController: RequestHandler = async (req, res) => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };

    if (!token || !newPassword) {
      res.status(400).json({
        success: false,
        message: 'Token y nueva contraseña son requeridos.'
      });
      return;
    }

    await resetPasswordService(token, newPassword);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente.'
    });

  } catch (err: any) {
    console.error("Error en resetPasswordController:", err);
    res.status(500).json({
      success: false,
      message: err.message || 'Error interno al cambiar la contraseña'
    });
  }
};
