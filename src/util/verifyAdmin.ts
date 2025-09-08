import { Response, NextFunction } from "express";

export const verifyAdmin = (req: any, res: Response, next: NextFunction) => {
    if (req.user.role !== 'Administrador') {
        res.status(403).json({ message: 'No tienes permisos de administrador' });
        return;
    }
    next();
};