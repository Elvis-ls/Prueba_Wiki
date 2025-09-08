import { Request, Response } from "express";
import { cambiarPassword } from '../services/cambiarPService'

export const cambiarPasswordController = async (req: Request, res: Response) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      res.status(400).json({ error: "Faltan campos requeridos" });
      return;
    }

    const result = await cambiarPassword(email, oldPassword, newPassword);

    res.status(200).json(result);
    return;
  } catch (error: any) {
    console.error("Error al cambiar la contraseña:", error);
    res.status(400).json({ error: error.message || "Error inesperado" });
    return;
  }
};