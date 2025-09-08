import { prisma } from '../../prismaClient/client';
import { hashPassword } from '../../util/hashPassword';

// Crear usuario
export const crearUsuario = async ({
    name,
    lastName,
    cedula,
    accountNumber
}: {
    name: string;
    lastName: string;
    cedula: string;
    accountNumber: string;
}) => {
    const usuario = await prisma.users.findUnique({
        where: { cedula }
    })
    if (usuario) {
        throw new Error("Usuario ya registrado")
    }

    const usuarioNuevo = await prisma.users.create({
        data: {
            name,
            lastName,
            cedula,
            accountNumber,
            status: 'PENDIENTE'
        },
    });
    return usuarioNuevo;
};

// Buscar usuario por cédula
export const findUserByCedula = async (cedula: string) => {
    const usuarioExiste = await prisma.users.findUnique({
        where: { cedula },
        select: { status: true }
    });

    if (!usuarioExiste) {
        throw new Error("Usuario no encontrado. Debe ser registrado primero por un administrador.");
    }

    return usuarioExiste;
};

// Actualizar usuario por cédula y devolver datos seleccionados
export const updateUserByCedula = async (cedula: string, data: Partial<{
    name: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    password: string;
    birthDate: Date | null;
    fingerprintCode: string;
    ultimosDigitosCarnet: string;
}>) => {
    const usuarioExiste = await prisma.users.findUnique({
        where: { cedula },
    });

    if (!usuarioExiste) {
        throw new Error("Usuario no encontrado. Debe ser registrado primero por un administrador.");
    }

    // Actualizar solo lo que llega en data
    const usuarioActualizado = await prisma.users.update({
        where: { cedula },
        data,
    });

    return usuarioActualizado;
};

// Actualizar datos de un usuario
export const actualizarUsuario = async (usuarioId: number, data: Partial<{
    name: string;
    lastName: string;
    description: string;
    email: string;
    phone: string;
    location: string;
    areaPosition: string;
    addressHome: string;
    institutionLevel: string;
    foto_perfil: Buffer;
    foto_portada: Buffer;
}>
) => {

    const usuarioActualizado = await prisma.users.update({
        where: { id: usuarioId },
        data,
    });

    return usuarioActualizado;
};

// Completar información por nombre, apellido, cédula y número de cuenta
export const completarInfo = async (
    {
        name,
        lastName,
        cedula,
        accountNumber
    }: {
        name: string;
        lastName: string;
        cedula: string;
        accountNumber: string;
    },
    data: Partial<{
        name: string;
        lastName: string;
        email: string;
        cedula: string;
        birthDate: Date | string | null;
        fingerprintCode: string;
        accountNumber: string;
        ultimosDigitosCarnet: string;
        password: string;
        status: string;
    }>
) => {

    // Buscar usuario por los cuatro campos
    const usuario = await prisma.users.findFirst({
        where: { name, lastName, cedula, accountNumber },
    });

    if (!usuario) throw new Error("Usuario no encontrado.");

    // Validar si ya completó el registro
    if (usuario.status === "COMPLETADO") {
        throw new Error("El usuario ya completó su registro");
    }

    if (!data.status) data.status = "COMPLETADO";

    if (data.password) data.password = await hashPassword(data.password);

    // Convertir birthDate a Date si viene como string
    if (data.birthDate && typeof data.birthDate === "string") {
        const date = new Date(data.birthDate);
        if (!isNaN(date.getTime())) data.birthDate = date;
    }

    // Actualizar el usuario encontrado
    const actualizarUsuario = await prisma.users.update({
        where: { id: usuario.id },
        data,
    });
    return actualizarUsuario;
};

//Obtener foto de perfil
export const obtenerFotoPerfil = async (usuarioId: number) => {
    const usuario = await prisma.users.findUnique({
    where: { id: usuarioId },
    select: { foto_perfil: true },
  });
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  return usuario.foto_perfil;
};

//Obtener foto de portada
export const obtenerFotoPortada = async (usuarioId: number) => {
  const usuario = await prisma.users.findUnique({
    where: { id: usuarioId },
    select: { foto_portada: true },
  });
  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  return usuario.foto_portada;
};

// Obtener usuario por ID con selección específica de campos
export const getUserById = async (usuarioId: number) => {
  const usuario = await prisma.users.findUnique({
    where: { id: usuarioId },
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
  return usuario;
};