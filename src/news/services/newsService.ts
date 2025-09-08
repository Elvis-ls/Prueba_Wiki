/* NO SE ESTA USANDO ESTA CLASE */

import { NewsRepository } from '../repository/newsRepository';
import { NotificationService } from './notificationService';

export class NewsService {

  /*
  private repository: NewsRepository();

  
  constructor(){
    this.repository = new NewsRepository
  }
    */

  constructor(
    private readonly newsRepo = new NewsRepository(),
    private readonly notifier = new NotificationService()
  ) {}

  async createNews(newsData: any, adminId: number) {
    const admin = await this.newsRepo.findAdminById(adminId);
    if (!admin) {
      throw new Error('Administrador no encontrado');
    }

    const news = await this.newsRepo.createNews(newsData, adminId);

    const shareholders = await this.newsRepo.getShareholders();
    const userIds = shareholders.map((u) => u.id);
    await this.notifier.notifyShareholders(news.title, news.summary, userIds);

    return news;
  }
}