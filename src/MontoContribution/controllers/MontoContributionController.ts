import { Request, Response, NextFunction } from 'express';
import { MontoContributionService } from '../services/MontoContributionService';
import jwt from 'jsonwebtoken';

export class MontoContributionController {
  constructor(private service: MontoContributionService) {}

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, year, month, amountToPay } = req.body;
      const result = await this.service.create({ userId, year, month, amountToPay });
      // Si result es null (monto 0 y no existe registro), enviar respuesta apropiada
      if (result === null) {
        return res.status(200).json({ 
          message: 'Monto eliminado correctamente',
          deleted: true 
        });
      }
      res.status(201).json(result);
    } catch (err) {
      next(err instanceof Error ? err : new Error('Error desconocido'));
    }
  }

  
  //FUNCIÓN: Actualizar comentarios
  async updateComments(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, year, month, comments } = req.body;
      
      // Validar que userId sea numérico
      const numericUserId = Number(userId);
      if (!numericUserId) {
        return res.status(400).json({ error: "userId es requerido y debe ser numérico" });
      }

      // Verificar token del admin
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Token de autenticación requerido' });
      }

      try {
        jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      } catch (tokenError) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      const result = await this.service.updateComments({
        userId: numericUserId,
        year,
        month,
        comments: comments || '' // Permitir comentarios vacíos
      });

      res.status(200).json({
        message: 'Comentarios actualizados correctamente',
        contribution: result
      });
    } catch (err) {
      console.error('Error en updateComments:', err);
      next(err instanceof Error ? err : new Error('Error desconocido'));
    }
  }
  

  async markAsPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const updated = await this.service.markAsPaid(id);
      res.status(200).json(updated);
    } catch (err) {
      next(err instanceof Error ? err : new Error('Error desconocido'));
    }
  }

  // NUEVA FUNCIÓN: Aprobar o rechazar una contribución
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, year, month, status, amountToPay } = req.body;
      // Asegurarse de que userId sea numérico
      const numericUserId = Number(userId);
      if (!numericUserId) {
        return res.status(400).json({ error: "userId es requerido y debe ser numérico" });
      }

      // Extraer información del admin del token
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Token de autenticación requerido' });
      }
      let adminId: number;
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        adminId = decoded.userId || decoded.id;
      } catch (tokenError) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      // Validar el status
      if (!['Aprobado', 'Rechazado', 'Pendiente'].includes(status)) {
        return res.status(400).json({ 
          error: 'Estado inválido. Debe ser: Aprobado, Rechazado o Pendiente' 
        });
      }

      // Buscar la contribución específica pasando el userId numérico
      const contribution = await this.service.findByUserYearMonth(numericUserId, year, month);
      if (!contribution) {
        return res.status(404).json({ error: 'No se encontró la contribución especificada' });
      }

      // Actualizar el estado
      const updated = await this.service.updateStatus({
        contributionId: contribution.id,
        status: status as 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Pagado',
        adminId,
        amountToPay,
      });

      res.status(200).json({
        message: `Contribución ${status.toLowerCase()} correctamente`,
        contribution: updated
      });

    } catch (err) {
      console.error('Error en updateStatus:', err);
      next(err instanceof Error ? err : new Error('Error desconocido'));
    }
  }

  async getByUser(req: Request, res: Response, next: NextFunction) {
    try {
      let userId: number;
      
      // Si viene en parámetros (para admin viendo otros usuarios)
      if (req.params.userId) {
        userId = parseInt(req.params.userId);
      } else {
        // Extraer del token para usuario viendo sus propias contribuciones
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
          return res.status(401).json({ error: 'Token requerido' });
        }
        
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
          userId = decoded.userId || decoded.id;
        } catch (tokenError) {
          return res.status(401).json({ error: 'Token inválido' });
        }
      }
      
      const contributions = await this.service.findByUser(userId);
      res.status(200).json(contributions);
    } catch (err) {
      next(err instanceof Error ? err : new Error('Error desconocido'));
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const contributions = await this.service.findAll();
      res.status(200).json(contributions);
    } catch (err) {
      next(err instanceof Error ? err : new Error('Error desconocido'));
    }
  }
}