/*import { Request, Response, NextFunction } from 'express';
import { validateSaveInformationData } from "../validators/saveInformation.validator";
import { updateUserInformation } from "../services/user.service";
import { verifyJwtToken } from '../../util/verifyToken';

export const saveInformation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log('Datos recibidos:', req.body);

    // Validar token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const decoded = verifyJwtToken(token);
    if (!decoded) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }

    const userId = (decoded as any).userId;

    // Validar datos
    const parsedData = validateSaveInformationData(req.body);

    // Actualizar usuario
    const updatedUser = await updateUserInformation(Number(userId), parsedData);

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      lastName: updatedUser.lastName,
      phone: updatedUser.phone,
      description: updatedUser.description,
      email: updatedUser.email,
      addressHome: updatedUser.addressHome,
      areaPosition: updatedUser.areaPosition,
      location: updatedUser.location,
      image: updatedUser.image,
      accountNumber: updatedUser.accountNumber,
      role: updatedUser.role,
    });

  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new Error('Error desconocido'));
    }
  }
};*/