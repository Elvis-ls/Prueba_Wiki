import { prisma } from '../../prismaClient/client';
import { NotificationRepository } from '../repository/notificationRepository';


export class NotificationService {

  private notificationRepository: NotificationRepository;
  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async notifyShareholders(newsTitle: string, newsSummary: string, userIds: number[]) {
    // Crear una sola notificación
    const notification = await prisma.notification.create({
      data: {
        title: `Nueva noticia: ${newsTitle}`,
        message: newsSummary,
        type: 'Noticia',
        date: new Date(),
        hour: new Date().toTimeString().slice(0, 5),
      },
    });

    // Crear registros de lectura para cada usuario
    const readers = userIds.map((id) => ({
      notificationId: notification.id,
      userId: id,
    }));

    await prisma.notificationReader.createMany({
      data: readers,
    });
  }


  // Método para crear una notificación
  // Método para 
  async getNotificationsForUser(userId: number) {
    return await prisma.notificationReader.findMany({
      where: { userId },
      include: { notification: true },
      orderBy: { notification: { date: 'desc' } },
    });
  }

  // Método para marcar una notificación como leída
  async markAsRead(notificationId: number, userId: number) {
    return await this.notificationRepository.markAsRead(notificationId, userId);
  }
}