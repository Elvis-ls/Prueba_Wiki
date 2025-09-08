import { prisma } from '../../prismaClient/client';

/*// Buscar usuario por cédula, solo devuelve el status (o null si no existe)
export const findUserByCedula = async (cedula: string): Promise<{ status: string | null } | null> => {
  return prisma.users.findUnique({
    where: { cedula },
    select: { status: true },
  });
};

// Actualizar usuario por cédula y devolver datos seleccionados
export const updateUserByCedula = async (
  cedula: string,
  data: Partial<{
    name: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    password: string;
    birthDate: Date | null;
    fingerprintCode: string;
    ultimosDigitosCarnet: string;
    // otros campos que puedan actualizarse
  }>
) => {
  return prisma.users.update({
    where: { cedula },
    data,
    select: {
      name: true,
      lastName: true,
      cedula: true,
      email: true,
      phone: true,
      status: true,
      birthDate: true,
      fingerprintCode: true,
      ultimosDigitosCarnet: true,
    },
  });
};

// TIPO ACTUALIZADO - Incluye TODOS los campos necesarios
type UserOrAdmin = {
  id: number;
  email: string | null;
  password: string | null;
  role: string;
  name: string;
  lastName: string;
  phone?: string | null;
  userType: 'user' | 'admin';
  // CAMPOS CRÍTICOS AGREGADOS:
  description?: string | null;
  addressHome?: string | null;
  areaPosition?: string | null;
  location?: string | null;
  image?: string | null;
  profilePhoto?: string | null;
  coverPhoto?: string | null;
  accountNumber?: string | null;
  status?: string | null;
  cedula?: string | null;
  institutionLevel?: string | null;
  // Campos adicionales para compatibilidad
  names?: string | null;
  lastNames?: string | null;
};

// FUNCIÓN ACTUALIZADA - Buscar usuario o admin por email con TODOS los campos
export const findUserOrAdminByEmail = async (email: string): Promise<UserOrAdmin | null> => {
  console.log("🔍 Buscando usuario/admin con email:", email);
  
  // Buscar en tabla users con TODOS los campos
  const user = await prisma.users.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      name: true,
      lastName: true,
      phone: true,
      // CAMPOS CRÍTICOS QUE FALTABAN:
      description: true,
      addressHome: true,
      areaPosition: true,
      location: true,
      image: true,
      accountNumber: true,
      status: true,
      cedula: true,
      institutionLevel: true,
      // Cualquier otro campo que tengas en tu esquema de users
      createdAt: true,
    }
  });
  
  if (user) {
    console.log("✅ Usuario encontrado en tabla users:", {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      description: user.description,
      accountNumber: user.accountNumber
    });
    
    return {
      id: user.id,
      email: user.email ?? null,
      password: user.password ?? null,
      role: user.role,
      name: user.name,
      lastName: user.lastName,
      phone: user.phone ?? null,
      userType: 'user',
      // DEVOLVER TODOS LOS CAMPOS:
      description: user.description ?? null,
      addressHome: user.addressHome ?? null,
      areaPosition: user.areaPosition ?? null,
      location: user.location ?? null,
      image: user.image ?? null,
      accountNumber: user.accountNumber ?? null,
      status: user.status ?? null,
      cedula: user.cedula ?? null,
      institutionLevel: user.institutionLevel ?? null,
      // Para compatibilidad con el frontend
      names: user.name,
      lastNames: user.lastName
    };
  }

  // Buscar en tabla admin con TODOS los campos
  const admin = await prisma.admin.findUnique({ 
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      names: true,
      lastNames: true,
      phone: true,
      // Agregar todos los campos de admin que tengas
      description: true,
      addressHome: true,
      areaPosition: true,
      location: true,
      image: true,
      accountNumber: true,
      cedula: true,
      institutionLevel: true
    }
  });
  
  if (admin) {
    console.log("✅ Admin encontrado en tabla admin:", {
      id: admin.id,
      names: admin.names,
      email: admin.email,
      role: admin.role,
      description: admin.description
    });
    
    return {
      id: admin.id,
      email: admin.email ?? null,
      password: admin.password ?? null,
      role: admin.role,
      name: admin.names,
      lastName: admin.lastNames,
      phone: admin.phone ?? null,
      userType: 'admin',
      // DEVOLVER TODOS LOS CAMPOS DEL ADMIN:
      description: admin.description ?? null,
      addressHome: admin.addressHome ?? null,
      areaPosition: admin.areaPosition ?? null,
      location: admin.location ?? null,
      image: admin.image ?? null,

      accountNumber: admin.accountNumber ?? null,
      cedula: admin.cedula ?? null,
      institutionLevel: admin.institutionLevel ?? null,
      // Para compatibilidad
      names: admin.names,
      lastNames: admin.lastNames
    };
  }

  console.log("❌ No se encontró usuario ni admin con email:", email);
  return null;
};

// Buscar usuario por datos completos: nombre, apellido, cédula y número de cuenta
export const findUserByCompleteData = async (
  name: string,
  lastName: string,
  cedula: string,
  accountNumber: string
) => {
  return prisma.users.findFirst({
    where: {
      AND: [
        { name: { equals: name, mode: 'insensitive' } },
        { lastName: { equals: lastName, mode: 'insensitive' } },
        { cedula },
        { accountNumber },
      ],
    },
  });
};

// Actualizar información de usuario por ID con cualquier conjunto de campos válidos
export const updateUserInformation = async (
  userId: number,
  data: Partial<{
    name: string;
    lastName: string;
    email: string;
    phone: string;
    description: string;
    addressHome: string;
    areaPosition: string;
    location: string;
    image: string;
    accountNumber: string;
    role: string;
    status: string;
    // otros campos que quieras permitir actualizar
  }>
) => {
  return prisma.users.update({
    where: { id: userId },
    data,
  });
};*/

/*// Obtener usuario por ID con selección específica de campos
export const getUserById = async (userId: number) => {
  return prisma.users.findUnique({
    where: { id: userId },
    select: {
      // id: true,
      name: true,
      lastName: true,
      phone: true,
      description: true,
      addressHome: true,
      areaPosition: true,
      location: true,
      accountNumber: true,
      email: true,
      role: true,
      status: true,
      institutionLevel: true,
    },
  });
};*/