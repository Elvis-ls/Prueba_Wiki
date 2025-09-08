import { prisma } from '../../prismaClient/client';
import { comparePassword } from '../../util/comparePassword';
import { hashPassword } from '../../util/hashPassword';

export const cambiarPassword = async (
    email: string,
    oldPassword: string,
    newPassword: string
) => {
    // Buscar en users primero
    let entity: any = await prisma.users.findUnique({
        where: { email }
    });
    let userType: "user" | "admin" = "user";

    if (!entity) {
        // Buscar en admin
        entity = await prisma.admin.findUnique({
            where: { email }
        });
        userType = "admin";
    }

    if (!entity) {
        throw new Error("Usuario o administrador no encontrado");
    }

    if (!entity.password) {
        throw new Error("Cuenta sin contraseña configurada");
    }

    // Verificar contraseña actual
    const isMatch = await comparePassword(oldPassword, entity.password);
    if (!isMatch) {
        throw new Error("La contraseña actual es incorrecta");
    }

    // Hashear nueva contraseña
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar según el tipo
    if (userType === "user") {
        await prisma.users.update({
            where: { email },
            data: { password: hashedPassword },
        });
    } else {
        await prisma.admin.update({
            where: { email },
            data: { password: hashedPassword },
        });
    }

    return { message: "Contraseña cambiada exitosamente" };
};