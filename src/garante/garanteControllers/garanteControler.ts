import { Request, Response, NextFunction } from 'express';
import { guarantorService } from '../services/guarantorService';
import { CreateGuarantorData, UpdateGuarantorData } from '../repositories/guarantorRepository';

// Crear un nuevo garante
const createGuarantor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { nombresGarante, apellidosGarante, whatsappGarante, solicitudId } = req.body;

        const guarantorData: CreateGuarantorData = {
            nombresGarante: nombresGarante?.trim(),
            apellidosGarante: apellidosGarante?.trim(),
            whatsappGarante: whatsappGarante?.trim(),
            solicitudId: parseInt(solicitudId)
        };

        // Validar datos
        const validation = guarantorService.validateGuarantorData(guarantorData);
        if (!validation.isValid) {
            res.status(400).json({
                success: false,
                message: 'Datos de garante inválidos',
                errors: validation.errors
            });
            return;
        }

        const guarantor = await guarantorService.createGuarantor(guarantorData);

        res.status(201).json({
            success: true,
            message: 'Garante creado exitosamente',
            data: guarantor
        });
    } catch (error: any) {
        if (error.message.includes('La solicitud de crédito no existe')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        next(error);
    }
};

// Obtener todos los garantes con paginación
const getAllGuarantors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

        const result = await guarantorService.getAllGuarantors(page, limit);

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
            message: `Se encontraron ${result.data.length} garante(s)`
        });
    } catch (error) {
        next(error);
    }
};

// Obtener garante por ID
const getGuarantorById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const guarantorId = parseInt(id);

        if (!guarantorId || isNaN(guarantorId) || guarantorId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de garante inválido'
            });
            return;
        }

        const guarantor = await guarantorService.getGuarantorById(guarantorId);

        res.json({
            success: true,
            data: guarantor,
            message: 'Garante encontrado exitosamente'
        });
    } catch (error: any) {
        if (error.message.includes('Garante no encontrado')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        next(error);
    }
};

// Obtener garantes por cédula del usuario (ENDPOINT PRINCIPAL)
const getGuarantorsByUserCedula = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { cedula } = req.params;

        if (!cedula || cedula.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Cédula es requerida y no puede estar vacía'
            });
            return;
        }

        // Validar formato de cédula (básico)
        const cedulaClean = cedula.trim();
        if (cedulaClean.length < 8 || cedulaClean.length > 15) {
            res.status(400).json({
                success: false,
                message: 'Formato de cédula inválido'
            });
            return;
        }

        const guarantors = await guarantorService.getGuarantorsByUserCedula(cedulaClean);

        res.json({
            success: true,
            data: guarantors,
            total: guarantors.length,
            message: guarantors.length === 0 
                ? 'No se encontraron garantes para este usuario' 
                : `Se encontraron ${guarantors.length} garante(s) para el usuario con cédula ${cedulaClean}`
        });
    } catch (error) {
        next(error);
    }
};

// Obtener garantes por solicitud específica
const getGuarantorsBySolicitudId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { solicitudId } = req.params;
        const solicitudIdNum = parseInt(solicitudId);

        if (!solicitudIdNum || isNaN(solicitudIdNum) || solicitudIdNum <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de solicitud inválido'
            });
            return;
        }

        const guarantors = await guarantorService.getGuarantorsBySolicitudId(solicitudIdNum);

        res.json({
            success: true,
            data: guarantors,
            total: guarantors.length,
            message: guarantors.length === 0 
                ? 'No se encontraron garantes para esta solicitud' 
                : `Se encontraron ${guarantors.length} garante(s) para la solicitud ${solicitudIdNum}`
        });
    } catch (error) {
        next(error);
    }
};

// Actualizar un garante
const updateGuarantor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const guarantorId = parseInt(id);

        if (!guarantorId || isNaN(guarantorId) || guarantorId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de garante inválido'
            });
            return;
        }

        const { nombresGarante, apellidosGarante, whatsappGarante } = req.body;

        // Preparar datos de actualización
        const updateData: UpdateGuarantorData = {};
        if (nombresGarante && nombresGarante.trim()) {
            updateData.nombresGarante = nombresGarante.trim();
        }
        if (apellidosGarante && apellidosGarante.trim()) {
            updateData.apellidosGarante = apellidosGarante.trim();
        }
        if (whatsappGarante && whatsappGarante.trim()) {
            updateData.whatsappGarante = whatsappGarante.trim();
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({
                success: false,
                message: 'No hay datos válidos para actualizar'
            });
            return;
        }

        const updatedGuarantor = await guarantorService.updateGuarantor(guarantorId, updateData);

        res.json({
            success: true,
            message: 'Garante actualizado exitosamente',
            data: updatedGuarantor
        });
    } catch (error: any) {
        if (error.message.includes('Garante no encontrado')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        next(error);
    }
};

// Eliminar un garante
const deleteGuarantor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;
        const guarantorId = parseInt(id);

        if (!guarantorId || isNaN(guarantorId) || guarantorId <= 0) {
            res.status(400).json({
                success: false,
                message: 'ID de garante inválido'
            });
            return;
        }

        const result = await guarantorService.deleteGuarantor(guarantorId);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        if (error.message.includes('Garante no encontrado')) {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        next(error);
    }
};

// Buscar garantes
const searchGuarantors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { q } = req.query;
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));

        if (!q || typeof q !== 'string' || q.trim().length === 0) {
            res.status(400).json({
                success: false,
                message: 'Parámetro de búsqueda es requerido y no puede estar vacío'
            });
            return;
        }

        const result = await guarantorService.searchGuarantors(q.trim(), page, limit);

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination,
            searchTerm: q.trim(),
            message: `Se encontraron ${result.data.length} resultado(s) para "${q.trim()}"`
        });
    } catch (error) {
        next(error);
    }
};

// Obtener estadísticas de garantes
const getGuarantorsStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stats = await guarantorService.getGuarantorsStats();

        res.json({
            success: true,
            data: stats,
            message: 'Estadísticas de garantes obtenidas exitosamente'
        });
    } catch (error) {
        next(error);
    }
};

export const guarantorController = {
    createGuarantor,
    getAllGuarantors,
    getGuarantorById,
    getGuarantorsByUserCedula,
    getGuarantorsBySolicitudId,
    updateGuarantor,
    deleteGuarantor,
    searchGuarantors,
    getGuarantorsStats
};