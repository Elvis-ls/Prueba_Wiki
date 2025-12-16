import express from 'express';
import { UserControllerAdmin } from '../controllers/UserControllerAdmin';
import { UserServiceAdmin } from '../services/UserServiceAdmin';
//import { CreateAdminController } from '../controllers/CreateAdminController';
import { crearAdminController } from '../controllers/adminController';
import { ShareholderFormService } from '../../lista_accionista/services/listaAccionistaService';
import { UpdateShareholderFormController } from '../../lista_accionista/controllers/UpdateShareholderFormController';
import { authenticateAdmin } from '../middleware/authMiddleware';

const router = express.Router();

const userService = new UserServiceAdmin();

const formService = new ShareholderFormService();
const formController = new UpdateShareholderFormController(formService);

const userController = new UserControllerAdmin(userService);

// administrador registra un nuevo accionista
//router.post('/create-user', userController.createUser);
router.post('/admin/crear', crearAdminController);


router.post('/shareholder-form/:id', authenticateAdmin, (req, res, next) => {
  formController.handle(req, res, next);
});

export default router;