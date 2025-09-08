import { prisma } from '../../prismaClient/client';
import { comparePassword } from '../../util/comparePassword';
import { generateToken } from '../../util/generateToken';

export const loginGeneral = async (email: string, password: string) => {
  // Buscar primero en tabla users
  let entity: any = await prisma.users.findUnique({ where: { email } });

  let userType: "user" | "admin" = "user";

  if (!entity) {
    // Si no está en users, buscar en admin
    entity = await prisma.admin.findUnique({ where: { email } });
    userType = "admin";
  }

  if (!entity) {
    throw new Error("Usuario o administrador no encontrado");
  }

  if (!entity.password) {
    throw new Error("Cuenta sin contraseña configurada");
  }

  const isMatch = await comparePassword(password, entity.password);
  if (!isMatch) {
    throw new Error("Contraseña incorrecta");
  }

  // Generar token con el mismo formato
  const token = generateToken({ userId: entity.id, role: entity.role });

  console.log(`${userType.toUpperCase()} logueado:`, {
    id: entity.id,
    email: entity.email,
    role: entity.role,
    nombre: userType === "user" ? entity.name : entity.names,
    apellido: userType === "user" ? entity.lastName : entity.lastNames,
  });

  // Normalizar para que frontend siempre reciba la misma estructura
  return {
    usuario: {
      id: entity.id,
      email: entity.email,
      role: entity.role,
      name: userType === "user" ? entity.name : entity.names,
      lastName: userType === "user" ? entity.lastName : entity.lastNames,
      phone: entity.phone ?? null,
      userType,
      description: entity.description ?? null,
      addressHome: entity.addressHome ?? null,
      areaPosition: entity.areaPosition ?? null,
      location: entity.location ?? null,
      image: entity.image ?? null,
      accountNumber: entity.accountNumber ?? null,
      status: entity.status ?? null,
      cedula: entity.cedula ?? null,
      institutionLevel: entity.institutionLevel ?? null,
      createdAt: entity.createdAt ?? null,
    },
    token,
  };
};