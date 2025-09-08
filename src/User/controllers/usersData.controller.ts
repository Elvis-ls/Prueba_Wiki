/*import { Response } from "express";
import { getUserById } from "../services/user.service";
import { AuthRequest } from "../interfaces/authRequest";

  export const getUserData = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const user = await getUserById(Number(req.user!.userId));
      console.log("mandando el user desde el backend");
      res.json({
        success: true, 
        user
      });
    } catch (error) {
      res.status(500).json({ 
          success: false,
          error: 'Error al obtener user' 
        });
    }
  };*/