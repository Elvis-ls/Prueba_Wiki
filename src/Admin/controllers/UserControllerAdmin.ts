import { Request, Response } from 'express';
import { UserValidatorAdmin } from '../validators/UserValidatorAdmin';
import { UserServiceAdmin } from '../services/UserServiceAdmin';

export class UserControllerAdmin {
  constructor(private userService: UserServiceAdmin) {}

  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = UserValidatorAdmin.validate(req.body);
      await this.userService.createUser(validatedData);
      res.status(201).json({ message: "Accionista registrado correctamente" });
    } catch (error) {
      console.error("Error en registro:", error);
      if (error instanceof Error) {
        res.status(500).json({ message: "Internal server error" });
      } else {
        res.status(400).json({ message: "Datos inválidos", error });
      }
    }
  };
}