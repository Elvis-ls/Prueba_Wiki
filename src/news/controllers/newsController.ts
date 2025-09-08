/* NO SE ESTA USANDO ESTA CLASE */

import { Request, Response, NextFunction } from 'express';
import { NewsService } from '../services/newsService';
import { validateNewsData } from '../validators/newsValidator';

export class NewsController {
  private service: NewsService;

  constructor(){
    this.service = new NewsService;
  }

  
  async createNews(req: Request, res: Response): Promise<void> {
    try {
      const result = validateNewsData(req.body);
      if (!result.success) {  
        res.status(400).json({ error: result.errors });
        return;
      }

      const adminId = req.adminId;
      if (!adminId) {
        res.status(401).json({ error: 'No autorizado: adminId no proporcionado' });
        return;
      }

      /*const imageUrl = req.imageUrl;
      if (!imageUrl) {
        res.status(401).json({ error: 'No se subio imagen de la noticia' });
        return;
      }*/

      const newCreated = await this.service.createNews(result.data, adminId);

      res.status(201).json({
        success: true,
        data: newCreated
      });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        error: error.message || "Error al crear depósito" 
      });
    }
  }
}
/*
const newsService = new NewsService();

export const newsController = {
  createNews: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = validateNewsData(req.body);
      if (!result.success) {  
        res.status(400).json({ error: result.errors });
        return;
      }

      const adminId = req.adminId;
      if (!adminId) {
        res.status(401).json({ error: 'No autorizado: adminId no proporcionado' });
        return;
      }

      const news = await newsService.createNews(result.data, adminId);

      res.status(201).json({
        message: 'Noticia creada exitosamente',
        news,
      });
    } catch (error) {
      next(error instanceof Error ? error : new Error('Error desconocido al crear la noticia'));
    }
  },
};
*/