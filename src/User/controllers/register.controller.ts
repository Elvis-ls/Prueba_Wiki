/*import { Request, Response } from 'express';
import { findUserByCedula, updateUserByCedula } from "../services/user.service";
import { validateUserUpdateData } from "../validators/user.validator";
import { hashPassword } from '../../util/hashPassword';

export const completeUserRegistration = async (req: Request, res: Response) => {
  try {
    const { cedula } = req.params;
    const parsedData = validateUserUpdateData(req.body);

    const existingUser = await findUserByCedula(cedula);

    if (existingUser?.status === 'COMPLETADO') {
      res.status(400).json({
        success: false,
        message: "Este usuario ya completó su registro.",
      });
    }

    const hashedPassword = parsedData.password 
      ? await hashPassword(parsedData.password)
      : undefined;

    const updatedUser = await updateUserByCedula(cedula, {
      email: parsedData.email,
      phone: parsedData.phone,
      ...(hashedPassword && { password: hashedPassword }),
      birthDate: parsedData.birthDate ? new Date(parsedData.birthDate) : null,
      fingerprintCode: parsedData.fingerprintCode,
      ultimosDigitosCarnet: parsedData.ultimosDigitosCarnet,
      status: 'COMPLETADO',
    });

    res.status(200).json({
      success: true,
      message: "Registro completado exitosamente",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Error al completar registro:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};*/