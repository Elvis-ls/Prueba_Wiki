import { Request, Response } from 'express';
import { CredencialService } from '../services/credencialServices';
import { AuthRequest } from '../../../User/interfaces/authRequest';
import { AuthenticatedRequest } from '../../../Admin/interfaces/authRequest';
import bcrypt from 'bcrypt';

export class CredencialController {
  private service: CredencialService;

  constructor() {
    this.service = new CredencialService();
  }

    getUserCredencial = async (req: AuthRequest, res: Response): Promise<void> => {
        console.log("dentro de getUserCredencial");
        try {
            const userId = req.user?.userId;
            console.log("userId: ", userId);
            if (!userId) {
                res.status(400).json({ success: false, error: "ID de usuario no proporcionado" });
                return;
            }
            const data = await this.service.getCredencialByUserId(userId);
            console.log("data que se devuelve al frontend: ",data);

            const BASE_URL = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";

            /* Creacion credenciales hash */
            const passwordnew = "SolLuna123"
            const hashedPassword = await bcrypt.hash(passwordnew, 10);
            console.log("credencial creada: ");
            console.log(hashedPassword);

            res.json({ 
                success: true, 
                data: {
                url: `${BASE_URL}${data.url}` // así queda http://localhost:3001/uploads/credenciales/...
            }
        });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    //  tener todas las credenciales
    getAllCredenciales = async (req: Request, res: Response): Promise<void> => {
        try {
            const data = await this.service.getAllCredenciales();
            res.json({ success: true, data });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // metodo de admin para obtener la credencial del usuario que se ha seleccionado
    getCredencialByUserId = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ success: false, error: "ID inválido" });
                return;
            }

            const data = await this.service.getCredencialByUserId(userId);

            const BASE_URL = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";

            res.json({
                success: true,
                data: { url: `${BASE_URL}${data.url}` }
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    // metodo para el administrador para subir una credencial
    uploadCredencial = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.userId);
            const filePath = req.file?.path;

            if (isNaN(userId)) {
                res.status(400).json({ success: false, error: "ID inválido" });
                return;
            }

            if (!filePath) {
                res.status(400).json({ success: false, error: "No se subió ningún archivo" });
                return;
            }

            const data = await this.service.uploadCredencial(userId, filePath);
            const BASE_URL = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";
            res.json({
                success: true,
                message: "Credencial subida correctamente",
                data: { url: `${BASE_URL}/${data.credencialPath}` }
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }

    //metodo para el usuario administrador para eliminar una credencial
    deleteCredencial = async (req: Request, res: Response): Promise<void> => {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId)) {
                res.status(400).json({ success: false, error: "ID inválido" });
                return;
            }

            await this.service.deleteCredencial(userId);

            res.json({
                success: true,
                message: "Credencial eliminada correctamente"
            });
        } catch (err: any) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}
