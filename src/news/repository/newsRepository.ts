/* NO SE ESTA USANDO ESTA CLASE */

import { prisma } from '../../prismaClient/client';

export class NewsRepository {
  async createNews(newsData: any, authorId: number) {
    return await prisma.news.create({
      data: {
        ...newsData,
        publicationDate: new Date(newsData.publicationDate),
        authorId,
        //imageUrl,
      },
    });
  }

  async findAdminById(id: number) {
    return await prisma.admin.findUnique({ where: { id } });
  }

  async getShareholders() {
    return await prisma.users.findMany({
      where: { role: 'Accionista' },
      select: { id: true },
    });
  }
}