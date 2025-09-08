import { Request, Response } from 'express';
import { prisma } from '../../../prismaClient/client';
import { sendPasswordResetEmail } from '../../../services/passwordResetService';

export const sendPasswordResetLink = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, accountNumber } = req.body;
    console.log("dentro del controlador de recuperacion de la constrasena");
    console.log("email: ", email);
    console.log("accountNumber: ", accountNumber);
    console.log();
    const user = await prisma.users.findFirst({
      where: { email, accountNumber, role: 'Accionista' },
    });

    console.log("Usuario encontrado");
    console.log(user);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    await sendPasswordResetEmail({
      email,
      displayName: `${user.name} ${user.lastName}`,
      saveToken: async (token, expiresAt) => {
        await prisma.passwordResetToken.create({
          data: {
            token,
            userId: user.id,
            expiresAt,
          },
        });
      },
    });

    res.json({ message: 'Correo de recuperación enviado' });
  } catch (error) {
    console.error('Error al enviar enlace de recuperación (user):', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};