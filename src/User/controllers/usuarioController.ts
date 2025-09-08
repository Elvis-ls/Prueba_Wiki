import { Request, Response } from "express";
import { crearUsuario, actualizarUsuario, completarInfo, obtenerFotoPerfil, obtenerFotoPortada, getUserById } from '../services/usuarioService';
import { AuthRequest } from '../../util/verifyJwt';


//Crear Usuario
export const crearUsuarioController = async (req: Request, res: Response) => {
    const {
        name,
        lastName,
        cedula,
        accountNumber
    } = req.body;

    // Validación básica
    if (!name || !lastName || !cedula || !accountNumber) {
        res.status(400).json({ message: "Faltan campos obligatorios" });
    }
    try {
        const usuario = await crearUsuario({
            name,
            lastName,
            cedula,
            accountNumber
        });
        res.status(201).json({
            message: "Usuario registrado parcialmente", usuario
        })
    } catch (err: any) {
        res.status(400).json({ message: err.message });
    }
};

// Actualizar Datos
export const actualizarData = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Usuario no autenticado" });
            return;
        }
        const usuarioId = req.user.userId;

        // Copiamos datos enviados en el body
        const datos: any = { ...req.body };

        // Verificamos si hay archivos (perfil / portada)
        if (req.files) {
            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            if (files.foto_perfil) {
                datos.foto_perfil = files.foto_perfil[0].buffer; // Guarda en BYTEA
            }

            if (files.foto_portada) {
                datos.foto_portada = files.foto_portada[0].buffer;
            }
        }

        const usuarioActualizado = await actualizarUsuario(usuarioId, datos);

        res.json({ message: "Datos actualizados correctamente", usuario: usuarioActualizado });
        return;
    } catch (error: any) {
        console.error("Error en actualizarData:", error);
        res.status(500).json({ message: "Error al actualizar los datos" });
        return;
    }
};

// Completar información por nombre, apellido, cédula y número de cuenta
export const completarInformacion = async (req: Request, res: Response) => {
    try {
        // Los cuatro campos obligatorios para identificar al usuario
        const { name, lastName, cedula, accountNumber } = req.body;

        if (!name || !lastName || !cedula || !accountNumber) {
            res.status(400).json({ message: "Faltan datos obligatorios." });
            return;
        }

        // Datos opcionales a completar
        const dataToUpdate = { ...req.body };
        // Eliminamos los campos usados para identificar, para que no se sobrescriban
        delete dataToUpdate.name;
        delete dataToUpdate.lastName;
        delete dataToUpdate.cedula;
        delete dataToUpdate.accountNumber;

        const updatedUser = await completarInfo(
            { name, lastName, cedula, accountNumber },
            dataToUpdate
        );

        res.status(200).json({
            message: "Usuario actualizado correctamente.",
            user: updatedUser,
        });
        return;
    } catch (error: any) {
        console.error("Error en completarInformacion:", error);
        res.status(500).json({ message: error.message || "Error al actualizar usuario." });
        return;
    }
};

// Obtener foto de perfil
export const obtenerFotoPerfilController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Usuario no autenticado" });
            return;
        }
        const usuarioId = req.user.userId;
        const foto = await obtenerFotoPerfil(usuarioId);

        if (!foto) {
            res.status(404).send("El usuario no tiene foto de perfil");
            return;
        }

        res.setHeader("Content-Type", "image/jpeg"); // o image/png según lo que guardes
        res.send(foto);
    } catch (error) {
        console.error("Error al obtener foto de perfil:", error);
        res.status(500).json({ message: "Error al obtener foto de perfil" });
    }
};

//Obtener foto de portada
export const obtenerFotoPortadaController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Usuario no autenticado" });
            return;
        }
        const usuarioId = req.user.userId;
        const fotoPortada = await obtenerFotoPortada(usuarioId);
        if (!fotoPortada) {
            res.status(404).send("El usuario no tiene foto de perfil");
            return;
        }

        res.setHeader("Content-Type", "image/jpeg"); // o image/png según lo que guardes
        res.send(fotoPortada);
    } catch (error) {
        console.error("Error al obtener foto de perfil:", error);
        res.status(500).json({ message: "Error al obtener foto de perfil" });
    }
}

//Obtener datos del accionista
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
};