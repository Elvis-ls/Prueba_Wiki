import { prisma } from '../../../prismaClient/client';
import bcrypt from 'bcrypt';

export const resetPasswordService = async (token: string, newPassword: string) => {
  // 1. Buscar el token en la tabla passwordResetToken
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  });

  if (!resetToken) {
    throw new Error('Token inválido o ya utilizado.');
  }

  // 2. Verificar si está expirado
  if (new Date() > resetToken.expiresAt) {
    throw new Error('El token ha expirado. Solicita un nuevo enlace.');
  }

  // 3. Encriptar la nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // 4. Actualizar el usuario con la nueva contraseña
  await prisma.users.update({
    where: { id: resetToken.userId },
    data: {
      password: hashedPassword
    }
  });

  // 5. Eliminar el token para que no pueda usarse de nuevo
  await prisma.passwordResetToken.delete({
    where: { token }
  });

  console.log(`✅ Contraseña actualizada para userId: ${resetToken.userId}`);
};
