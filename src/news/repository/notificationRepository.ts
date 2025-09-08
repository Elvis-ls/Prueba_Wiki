import { prisma } from '../../prismaClient/client';

export class NotificationRepository {
  async createNotification(data: {
    title: string;
    message: string;
    type: string;
    hour: string;
  }) {
    return await prisma.notification.create({ data });
  }

  async createReaders(notificationId: number, userIds: number[]) {
    const readers = userIds.map((userId) => ({
      notificationId,
      userId,
    }));

    return await prisma.notificationReader.createMany({ data: readers });
  }

  async getNotificationsForUser(userId: number) {
    return await prisma.notificationReader.findMany({
      where: { userId },
      include: {
        notification: true,
      },
      orderBy: {
        notification: {
          date: 'desc',
        },
      },
    });
  }

  // Método para marcar una notificación como leída
  // Este método utiliza upsert para crear o actualizar el registro de lectura
  async markAsRead(notificationId: number, userId: number) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) {
      throw new Error('Notificación no encontrada.');
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('Usuario no encontrado.');
    }

    await prisma.notificationReader.upsert({
      where: {
        notificationId_userId: {
          notificationId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        notificationId,
        userId,
        readAt: new Date(),
      },
    });
  }

}