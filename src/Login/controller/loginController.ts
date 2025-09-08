import { Request, Response } from "express";
import { loginGeneral } from '../services/loginService';

//Login Usuario
export const loginGeneralController = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: "Email y contraseña son requeridos" });
    }

    try {
        const { usuario, token } = await loginGeneral(email, password);
        res.json({
            message: "Login exitoso",
            token,
            user: {
                id: usuario.id,
                name: usuario.name,
                lastName: usuario.lastName,
                email: usuario.email,
                role: usuario.role,
            }
        });
    } catch (err: any) {
        res.status(401).json({ message: err.message });
    }
};