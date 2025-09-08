import { Request, Response, NextFunction } from 'express';
import { CreditService } from '../services/creditService';
import { validateCredit } from '../validators/creditValidator';

const creditService = new CreditService();

// Opción 1: Definir cada función por separado
const requestCredit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // validación zod
        const validateData = validateCredit(req.body);
        const credit = await creditService.requestCredit(validateData);
        res.status(201).json({ message: 'Solicitud registrada', credit });
    } catch (error) {
        next(error);
    }
};

const getUserCredits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { cedula } = req.params;
        const credits = await creditService.getUserCredits(cedula);
        res.json({ credits });
    } catch (error) {
        next(error);
    }
};

const getCreditDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const numeroDocumento = Number(req.params.numeroDocumento);
        const credit = await creditService.getCreditDetails(numeroDocumento);
        res.json({ credit });
    } catch (error) {
        next(error);
    }
};

const searchCredits = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { term, type } = req.query;
        
        // Validar que se proporcionen los parámetros necesarios
        if (!term || !type) {
            res.status(400).json({ 
                error: 'Se requieren los parámetros term y type' 
            });
            return;
        }

        const searchTerm = String(term).trim();
        const searchType = String(type);

        // Validar que el tipo de búsqueda sea válido
        const validTypes = ['cedula', 'nombre', 'accountNumber', 'carnet'];
        if (!validTypes.includes(searchType)) {
            res.status(400).json({ 
                error: 'Tipo de búsqueda no válido. Use: cedula, nombre, accountNumber, carnet' 
            });
            return;
        }

        const credits = await creditService.searchCredits(searchTerm, searchType);
        res.json({ credits });
    } catch (error) {
        next(error);
    }
};

// Exportar como objeto
export const creditController = {
    requestCredit,
    getUserCredits,
    getCreditDetails,
    searchCredits,
};