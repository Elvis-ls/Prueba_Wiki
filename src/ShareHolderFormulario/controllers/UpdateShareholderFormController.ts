import { Request, Response, NextFunction } from 'express';
import { ShareholderFormService } from '../services/shareholderForm.service';
import { updateShareholderFormSchema } from '../../Admin/zodSchemaAdmin/updateSFSchema';


export class UpdateShareholderFormController {
  constructor(private formService: ShareholderFormService) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.adminId;

      if (!adminId) {
        res.status(401).json({ error: 'No autorizado: adminId no proporcionado' });
        return;
      }

      const parsed = updateShareholderFormSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: parsed.error.flatten().fieldErrors });
        return;
      }

      const updatedForm = await this.formService.updateFormEstado({
        adminId,
        numeroDocumento: parseInt(id),
        ...parsed.data,
      });

      res.status(200).json({
        message: 'Formulario actualizado exitosamente',
        form: {
          numeroDocumento: updatedForm.numeroDocumento,
          estado: updatedForm.estado,
          revisadoEn: updatedForm.revisadoEn,
          aprobadoPorId: updatedForm.aprobadoPorId,
          rechazadoPorId: updatedForm.rechazadoPorId,
          comentariosRechazo: updatedForm.comentariosRechazo,
        },
      });
    } catch (error) {
      console.error('Error al actualizar el formulario:', error);
      next(error instanceof Error ? error : new Error('Error desconocido'));
    }
  }
}