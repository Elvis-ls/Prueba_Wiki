import { Request, Response } from 'express';
import { prisma } from '../../../prismaClient/client';
import { sendPasswordResetEmail } from '../../../services/passwordResetService';

export const sendPasswordResetLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, ultimosDigitosCarnet } = req.body;

    const admin = await prisma.admin.findFirst({
      where: { email, ultimosDigitosCarnet, role: 'Administrador' },
    });

    if (!admin) {
      res.status(404).json({ message: 'Administrador no encontrado' });
      return;
    }

    await sendPasswordResetEmail({
      email,
      displayName: `${admin.names} ${admin.lastNames}`,
      saveToken: async (token, expiresAt) => {
        await prisma.passwordResetTokenAdmin.create({
          data: {
            token,
            adminId: admin.id,
            expiresAt,
          },
        });
      },
    });

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error('Error al enviar enlace de recuperación (admin):', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
