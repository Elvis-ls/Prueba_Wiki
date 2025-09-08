import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

export async function seedAdmin() {
  const hashedPassword = await bcrypt.hash("estasbellamujer", 12);
  
  const admin = await prisma.admin.upsert({
    where: { cedula: '0999999999' },
    update: {},
    create: {
      names: 'Administrador del Sistema',
      lastNames: 'ANEUPI Sistema',
      cedula: '0999999999',
      accountNumber: 'TEST-ANEUPI-003',
      email: 'institucionaneupi@gmail.com',
      password: hashedPassword,
      description: 'administrador del BANCO',
      addressHome: 'Guayaquil',
      areaPosition: 'Administracion General',
      institutionLevel: 'Superior',
      location: 'Sede Principal - Oficina de Aneupi',
      fingerprintCode: '+593999999999',
      role: 'Administrador',
    },
  });

  console.log(`Admin creado: ${admin.names}`);
}