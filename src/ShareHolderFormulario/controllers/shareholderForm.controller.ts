import { Request, Response, NextFunction } from 'express';
import { ShareholderFormValidator } from '../validators/ShareholderFormValidator';
import { ShareholderFormService } from '../services/shareholderForm.service';

export class ShareholderFormController {
  constructor(private formService: ShareholderFormService) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = ShareholderFormValidator.validate(req.body);
      const form = await this.formService.createShareholderForm(validatedData);
      res.status(201).json({
        message: 'Formulario enviado exitosamente para revisión',
        form,
      });
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      if (error instanceof Error) {
        next(error);
      } else {
        res.status(400).json({ error });
      }
    }
  };
}