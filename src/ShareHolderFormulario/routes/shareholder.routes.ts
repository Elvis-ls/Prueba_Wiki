import { Router } from 'express';
import { ShareholderFormService } from '../services/shareholderForm.service';
import { ShareholderFormController } from '../controllers/shareholderForm.controller';

const router = Router();
const service = new ShareholderFormService();
const controller = new ShareholderFormController(service);

router.post('/formulario', controller.create);

export default router;