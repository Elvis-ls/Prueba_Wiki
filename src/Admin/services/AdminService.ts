import { prisma } from '../../prismaClient/client';
import bcrypt from 'bcrypt';

export const crearAdmin = async ({
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
}: {
  names: string;
  lastNames: string;
  cedula: string;
  accountNumber: string;
  ultimosDigitosCarnet?: string;
  email?: string;
  password?: string;
  phone?: string;
  addressHome?: string;
  location?: string;
  description?: string;
  areaPosition?: string;
  institutionLevel?: string;
  fingerprintCode?: string;
  birthDate?: Date;
  image?: string;
}) => {
  const existingAdmin = await prisma.admin.findFirst()
  if (existingAdmin) {
    throw new Error("Ya existe un administrador registrado en el sistema")
  }

  const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

  const admin = await prisma.admin.create({
    data: {
      names,
      lastNames,
      cedula,
      accountNumber,
      ultimosDigitosCarnet,
      email,
      password: hashedPassword,
      phone,
      addressHome,
      location,
      description,
      areaPosition,
      institutionLevel,
      fingerprintCode,
      birthDate,
      image
    },
  })

  return admin
};