/*import { Request, Response, NextFunction } from "express";
import { validateLoginData } from "../validators/login.validator";
import { findUserOrAdminByEmail } from "../services/user.service";
import { comparePassword } from "../../util/comparePassword";
import { generateToken } from "../../util/generateToken";

export const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    console.log("POST /api/auth/login recibido");
    console.log("Cuerpo recibido:", req.body);

    const parsedData = validateLoginData(req.body);

    const { email, password } = parsedData;
    const userOrAdmin = await findUserOrAdminByEmail(email);

    if (!userOrAdmin) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const isMatch = await comparePassword(parsedData.password, userOrAdmin.password || '');
    if (!isMatch) {
      console.log("Contraseña incorrecta");
      res.status(401).json({ error: "Contraseña incorrecta" });
      return;
    }

    const token = generateToken({ 
      id: userOrAdmin.id, 
      role: userOrAdmin.role,
      userType: userOrAdmin.userType, 
      email: userOrAdmin.email  
    });

    console.log("Login exitoso, enviando token");
    console.log("📋 Datos completos del usuario encontrado:", {
      id: userOrAdmin.id,
      name: userOrAdmin.name,
      email: userOrAdmin.email,
      role: userOrAdmin.role,
      description: userOrAdmin.description,
      userType: userOrAdmin.userType
    });
    
    // SOLUCIÓN COMPLETA: Devolver TODOS los campos disponibles
    res.json({
      token,
      user: {
        id: userOrAdmin.id,
        name: userOrAdmin.name,
        lastName: userOrAdmin.lastName,
        phone: userOrAdmin.phone,
        email: userOrAdmin.email,
        role: userOrAdmin.role,
        userType: userOrAdmin.userType,
        // TODOS LOS CAMPOS ADICIONALES:
        description: userOrAdmin.description,
        addressHome: userOrAdmin.addressHome,
        areaPosition: userOrAdmin.areaPosition,
        location: userOrAdmin.location,
        image: userOrAdmin.image,
        profilePhoto: userOrAdmin.profilePhoto,
        coverPhoto: userOrAdmin.coverPhoto,
        accountNumber: userOrAdmin.accountNumber,
        status: userOrAdmin.status,
        cedula: userOrAdmin.cedula,
        institutionLevel: userOrAdmin.institutionLevel,
        // Campos de compatibilidad
        names: userOrAdmin.names || userOrAdmin.name,
        lastNames: userOrAdmin.lastNames || userOrAdmin.lastName
      },
    });

    console.log("✅ Respuesta enviada con TODOS los campos del usuario");

  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Error desconocido" });
    }
  }
};*/