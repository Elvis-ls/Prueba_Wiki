import { Response } from 'express';
import { AuthRequest } from '../../../User/interfaces/authRequest';
import { updatePasswordServices } from '../services/updatePasswordService';

export class updatePasswordController {
  private service: updatePasswordServices;

  constructor(){
    this.service = new updatePasswordServices();
  }

  updatePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId || !currentPassword || !newPassword) {
        res.status(400).json({ message: 'Datos incompletos' });
        return;
      }

      await this.service.updatePassword(userId, currentPassword, newPassword);

      res.json({ success: true, message: 'Contraseña actualizada' });

    } catch (err: any) {
      console.error("Error al cambiar contraseña:", err);
      res.status(500).json({ 
        message: err.message || 'Error interno' 
      });
    }
  };
}
