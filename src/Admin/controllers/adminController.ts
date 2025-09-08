import { Request, Response } from 'express';
import { crearAdmin } from '../services/AdminService';

export const crearAdminController = async (req: Request, res: Response) => {
  const {
    names,
    lastNames,
    cedula,
    accountNumber,
    ultimosDigitosCarnet,
    email,
    password,
    phone,
    addressHome,
    location,
    description,
    areaPosition,
    institutionLevel,
    fingerprintCode,
    birthDate,
    image
  } = req.body;

  // Validación básica
  if (!names || !lastNames || !cedula || !accountNumber) {
    res.status(400).json({ message: "Faltan campos obligatorios" });
  }

  try {
    const admin = await crearAdmin({
      names,
      lastNames,
      cedula,
      accountNumber,
      ultimosDigitosCarnet,
      email,
      password,
      phone,
      addressHome,
      location,
      description,
      areaPosition,
      institutionLevel,
      fingerprintCode,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      image
    });

    // Devolver solo datos seguros
    res.status(201).json({
      message: "Administrador creado correctamente",
      admin: {
        id: admin.id,
        names: admin.names,
        lastNames: admin.lastNames,
        cedula: admin.cedula,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};