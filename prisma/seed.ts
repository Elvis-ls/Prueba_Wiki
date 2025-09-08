import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import bcrypt from 'bcrypt';

async function main() {
  const hashedPassword = await bcrypt.hash("estasbellamujer", 12);
  const tipos = ['Mayoritario', 'Institucional', 'Minoritario'];
  const currentYear = new Date().getFullYear();
  const usuarios: any[] = [];

  // Crear admin si no existe
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

  console.log(`🛡️ Admin creado: ${admin.names}`);

  for (let i = 1; i <= 20; i++) {
    const cedula = `09876543${i.toString().padStart(2, '0')}`;
    const accountNumber = `TEST-ANEUPI-${(i + 1).toString().padStart(3, '0')}`;
    const role = `AccionPrueba_${i.toString().padStart(2, '0')}`;

    const user = await prisma.users.upsert({
      where: { cedula },
      update: {},
      create: {
        name: `AccionPrueba${i}`,
        lastName: 'ANEUPI Accionista',
        cedula,
        accountNumber,
        email: `accionista${i}@gmail.com`,
        password: hashedPassword,
        addressHome: 'Guayaquil',
        areaPosition: 'Administracion General',
        institutionLevel: 'Superior',
        location: 'Sede Principal - Oficina de Aneupi',
        fingerprintCode: `+593999999${i.toString().padStart(3, '0')}`,
        role,
      },
    });

    await prisma.accionistaLista.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        tipo: tipos[i % 3],
        porcentajeParticipacion: parseFloat((Math.random() * 10).toFixed(2)),
        cantidadAcciones: Math.floor(Math.random() * 1000) + 1,
      },
    });

    // Contribuciones aleatorias (años 2022-2025)
    for (let year = 2022; year <= currentYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const amountToPay = parseFloat((Math.random() * 100 + 20).toFixed(2));
        const amountPaid = Math.random() < 0.8 ? amountToPay : 0;

        await prisma.montoContribution.upsert({
          where: {
            userId_year_month: {
              userId: user.id,
              year,
              month,
            },
          },
          update: {},
          create: {
            userId: user.id,
            year,
            month,
            amountToPay,
            amountPaid,
            status: amountPaid > 0 ? 'Pagado' : 'Pendiente',
            paidAt: amountPaid > 0 ? new Date() : null,
            comments: 'Generado automáticamente',
          },
        });
      }
    }

    // Token de recuperación de contraseña
    await prisma.passwordResetToken.upsert({
      where: { token: `reset-${user.id}` },
      update: {},
      create: {
        token: `reset-${user.id}`,
        userId: user.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });


    // Formulario de accionista
    await prisma.shareholderFormulario.create({
      data: {
        cedula: user.cedula,
        nombres: user.name,
        apellidos: user.lastName,
        email: user.email ?? '',
        direccion: 'Guayaquil',
        pais: 'Ecuador',
        ciudad: 'Guayaquil',
        provincia: 'Guayas',
        canton: 'Guayaquil',
        estadoCivil: 'Soltero',
        tituloProfesional: 'Economista',
        nombreUniversidad: 'ESPOL',
        descripcionProfesional: 'Profesional en economía',
        numeroTelefono: user.fingerprintCode ?? '',
        codigoPais: '+593',
        discapacidad: 'No',
        fechaNacimiento: '1990-01-01',
        fechaSolicitud: new Date().toISOString(),
        fechaEmision: new Date().toISOString(),
        montoInversion: Math.floor(Math.random() * 10000),
        tipo: 'Accionista',
        comprobantePago: '',
        estado: 'aceptado',
        aprobadoPorId: admin.id,
      },
    });

    // Crédito ficticio
    const creditForm = await prisma.creditForm.create({
      data: {
        cedula: user.cedula,
        nombres: user.name,
        apellidos: user.lastName,
        email: user.email ?? '',
        direccion: 'Guayaquil',
        pais: 'Ecuador',
        ciudad: 'Guayaquil',
        provincia: 'Guayas',
        canton: 'Guayaquil',
        estadoCivil: 'Soltero',
        tituloProfesional: 'Economista',
        nombreUniversidad: 'ESPOL',
        descripcionProfesional: 'Experiencia en microfinanzas',
        numeroTelefono: user.fingerprintCode ?? '',
        codigoPais: '+593',
        discapacidad: 'No',
        fechaEmision: new Date().toISOString(),
        montoCredito: Math.random() * 5000,
        tipodeCredito: 'Personal',
        accionistas: {
          connect: { id: user.id },
        },
      },
    });

    // Garantía
    await prisma.guarantor.create({
      data: {
        nombresGarante: 'Juan',
        apellidosGarante: 'García',
        whatsappGarante: '+593900000000',
        solicitudId: creditForm.numeroDocumento,
      },
    });

    // Depositar fondos
    await prisma.deposito.createMany({
      data: [
        {
          userId: user.id,
          amount: Math.random() * 100 + 50,
          method: 'Transferencia',
          status: 'Aprobado',
          comprobanteUrl: '',
        },
        {
          userId: user.id,
          amount: Math.random() * 200 + 100,
          method: 'Tarjeta',
          status: 'Pendiente',
        },
      ],
    });

    // Retirar fondos
    await prisma.retiro.create({
      data: {
        userId: user.id,
        amount: Math.random() * 100,
        method: 'Transferencia',
        destination: 'Cuenta Bancaria ABC-123',
        status: 'Pendiente',
      },
    });

    // Invertir fondos
    await prisma.inversion.create({
      data: {
        userId: user.id,
        amount: Math.random() * 500 + 100,
        plazoMeses: 12,
        origen: 'Saldo Disponible',
        rentabilidad: Math.random() * 10,
        status: 'Activo',
      },
    });

    // Donación
    await prisma.donacion.create({
      data: {
        userId: user.id,
        causa: 'Educación para todos',
        amount: Math.random() * 20 + 5,
        mensaje: 'Espero que esto ayude.',
        anonimo: false,
      },
    });

    // Transacciones generales (historial)
    await prisma.transaccion.createMany({
      data: [
        {
          userId: user.id,
          tipo: 'Depósito',
          monto: 120,
          descripcion: 'Depósito inicial',
        },
        {
          userId: user.id,
          tipo: 'Inversión',
          monto: 200,
          descripcion: 'Inversión en fondo X',
        },
        {
          userId: user.id,
          tipo: 'Donación',
          monto: 25,
          descripcion: 'Donación a causa social',
        },
      ],
    });
    usuarios.push(user);
  }

  for (let i = 0; i < usuarios.length - 2; i++) {
    await prisma.transferencia.create({
      data: {
        fromUserId: usuarios[i].id,
        toUserId: usuarios[i + 1].id,
        amount: Math.random() * 50 + 10,
        concepto: 'Transferencia ANEUPI entre accionistas',
      },
    });
  }

  // Noticias
  await prisma.news.createMany({
    data: Array.from({ length: 5 }, (_, i) => ({
      title: `Noticia de prueba ${i + 1}`,
      summary: 'Resumen de prueba.',
      content: 'Contenido de prueba para noticias institucionales.',
      authorId: admin.id,
      isPublished: true,
      tags: ['tag1', 'tag2'],
    })),
  });

  // Directiva
  await prisma.directivaContent.create({
    data: {
      title: 'Directiva de la Fundación',
      description: 'Contenido detallado de la directiva.',
      quote: 'Compromiso y transparencia.',
      institutionalTitle: 'Excelencia Institucional',
      institutionalContent: 'Trabajamos por un mejor mañana.',
      adminId: admin.id,
    },
  });

  await prisma.directivaMember.create({
    data: {
      title: 'Presidente',
      name: 'Dr. Carlos Méndez',
      image: 'https://via.placeholder.com/100',
      href: '#',
      adminId: admin.id,
    },
  });

  // Ganancias e ingresos por año
  for (let year = 2022; year <= currentYear; year++) {
    for (let month = 1; month <= 12; month++) {
      await prisma.financialBalance.upsert({
        where: {
          year_month: { year, month },
        },
        update: {},
        create: {
          year,
          month,
          totalShareholderContributions: Math.random() * 5000,
          totalCreditIncome: Math.random() * 7000,
          lastModifiedById: admin.id,
        },
      });

      await prisma.institutionalEarnings.upsert({
        where: {
          year_month: { year, month },
        },
        update: {},
        create: {
          year,
          month,
          intereses: Math.random() * 1000,
          creditos: Math.random() * 2000,
          otrosIngresos: Math.random() * 500,
        },
      });
    }
  }

  console.log('✅ Seed completado');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar seed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
