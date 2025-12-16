import { Router } from 'express';
import { guarantorController } from '../controllers/guarantorController';

const router = Router();

// Crear un nuevo garante
router.post('/guarantors', guarantorController.createGuarantor);

// Obtener todos los garantes con paginación
router.get('/guarantors', guarantorController.getAllGuarantors);

// Buscar garantes (debe ir antes de /:id para evitar conflictos)
router.get('/guarantors/search', guarantorController.searchGuarantors);

// Obtener estadísticas de garantes
router.get('/guarantors/stats', guarantorController.getGuarantorsStats);

// Obtener garantes por cédula del usuario (ENDPOINT PRINCIPAL QUE PEDISTE)
router.get('/guarantors/user/:cedula', guarantorController.getGuarantorsByUserCedula);

// Obtener garantes por solicitud específica
router.get('/guarantors/solicitud/:solicitudId', guarantorController.getGuarantorsBySolicitudId);

// Obtener garante por ID
router.get('/guarantors/:id', guarantorController.getGuarantorById);

// Actualizar un garante
router.put('/guarantors/:id', guarantorController.updateGuarantor);

// Eliminar un garante
router.delete('/guarantors/:id', guarantorController.deleteGuarantor);

export default router;