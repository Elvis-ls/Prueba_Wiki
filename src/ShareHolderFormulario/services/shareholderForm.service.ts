import { prisma } from "../../prismaClient/client";

interface UpdateShareholderFormDTO {
  adminId: number;
  estado: 'aceptado' | 'rechazado' | 'pendiente';
  comentariosRechazo?: string;
  numeroDocumento: number;
}

export class ShareholderFormService {
  async createShareholderForm(data: any) {
    const form = await prisma.shareholderFormulario.create({
      data: {
        ...data,
        creadoEn: new Date(),
        estado: 'pendiente',
      },
    });

    return {
      numeroDocumento: form.numeroDocumento,
      cedula: form.cedula,
      nombres: form.nombres,
      apellidos: form.apellidos,
      submittedAt: new Date().toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).replace(',', ''),
      estado: form.estado,
    };
  }

  async updateFormEstado(data: UpdateShareholderFormDTO) {
    const form = await prisma.shareholderFormulario.findUnique({
      where: { numeroDocumento: data.numeroDocumento },
    });

    if (!form) {
      throw new Error('Formulario no encontrado');
    }

    let updateData: any = { estado: data.estado };

    switch (data.estado) {
      case 'aceptado':
        updateData = {
          ...updateData,
          revisadoEn: new Date(),
          aprobadoPorId: data.adminId,
          rechazadoPorId: null,
          comentariosRechazo: null,
        };
        break;
      case 'rechazado':
        updateData = {
          ...updateData,
          revisadoEn: new Date(),
          aprobadoPorId: null,
          rechazadoPorId: data.adminId,
          comentariosRechazo: data.comentariosRechazo,
        };
        break;
      default:
        updateData = {
          ...updateData,
          revisadoEn: null,
          aprobadoPorId: null,
          rechazadoPorId: null,
          comentariosRechazo: null,
        };
        break;
    }

    const updatedForm = await prisma.shareholderFormulario.update({
      where: { numeroDocumento: data.numeroDocumento },
      data: updateData,
    });

    return updatedForm;
  }
}