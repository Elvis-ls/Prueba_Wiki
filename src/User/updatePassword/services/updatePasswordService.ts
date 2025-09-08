import { prisma } from '../../../prismaClient/client';
import bcrypt from 'bcrypt';

export class updatePasswordServices {
  async updatePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user || !user.password) {
      throw new Error("Usuario no encontrado o sin contraseña configurada.");
    }

    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      throw new Error("La contraseña actual no es correcta.");
    }

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { id: userId },
      data: { password: hashedNew }
    });

    console.log(`✅ Contraseña actualizada para userId ${userId}`);
  }
}
