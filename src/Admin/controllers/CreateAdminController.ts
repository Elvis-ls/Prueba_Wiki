import { Request, Response } from 'express';
import { AdminValidator } from '../validators/AdminValidator';
import { AdminService } from '../services/AdminService';


export class CreateAdminController {
  constructor(private adminService: AdminService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = AdminValidator.validate(req.body);
      const admin = await this.adminService.createAdmin(validatedData);
      res.status(201).json({
        message: 'Administrador creado exitosamente',
        admin,
      });
    } catch (error) {
      console.error('Error al crear administrador:', error);
      if (error instanceof Error) {
        res.status(500).json({ message: 'Error interno del servidor' });
      } else {
        res.status(400).json({ message: 'Datos inválidos', error });
      }
    }
  };
}
