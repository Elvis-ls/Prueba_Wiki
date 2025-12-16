import { prisma } from "../../prismaClient/client";

/**
 * Obtener el estado de la solicitud de paquete financiero por accionista_id
 */
export const getEstadoSolicitudPorAccionista = async (accionistaId: number) => {
  console.log(" Buscando solicitud para accionista_id:", accionistaId);
  
  // Buscar la solicitud más reciente del accionista
  const solicitud = await prisma.solicitudPaqueteFinanciero.findFirst({
    where: { 
      accionista_id: accionistaId 
    },
    orderBy: { 
      fechaSolicitud: 'desc' 
    },
    select: {
      id: true,
      estado: true
    }
  });

  console.log(" Solicitud encontrada:", solicitud);

  if (!solicitud) {
    console.log(" No se encontró solicitud");
    return {
      accionista_id: accionistaId,
      estado: "Sin solicitud"
    };
  }

  console.log(" Estado:", solicitud.estado);

  return {
    accionista_id: accionistaId,
    estado: solicitud.estado // "Pendiente", "Aprobado", "Rechazado"
  };
};


