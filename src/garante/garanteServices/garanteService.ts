import { guarantorRepository, CreateGuarantorData, UpdateGuarantorData, GuarantorWithSolicitud } from '../repositories/guarantorRepository';

interface FormattedGuarantor {
    id: number;
    nombresGarante: string;
    apellidosGarante: string;
    whatsappGarante: string;
    nombreCompletoGarante: string;
    solicitud: {
        numeroDocumento: number;
        solicitante: string;
        cedula: string;
        montoCredito: number;
        tipodeCredito: string;
        fechaEmision: string;
    };
}

interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

export const guarantorService = {
    // Crear un nuevo garante
    async createGuarantor(data: CreateGuarantorData): Promise<GuarantorWithSolicitud> {
        try {
            // Verificar que la solicitud existe
            const solicitudExists = await guarantorRepository.findCreditFormById(data.solicitudId);
            
            if (!solicitudExists) {
                throw new Error('La solicitud de crédito no existe');
            }

            const guarantor = await guarantorRepository.create(data);
            return guarantor;
        } catch (error: any) {
            console.error('Error en createGuarantor:', error);
            throw new Error(`Error al crear el garante: ${error.message}`);
        }
    },

    // Obtener todos los garantes con paginación
    async getAllGuarantors(page: number = 1, limit: number = 10): Promise<PaginatedResponse<GuarantorWithSolicitud>> {
        try {
            const [guarantors, total] = await Promise.all([
                guarantorRepository.findMany({ page, limit }),
                guarantorRepository.count()
            ]);

            return {
                data: guarantors,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            };
        } catch (error: any) {
            console.error('Error en getAllGuarantors:', error);
            throw new Error(`Error al obtener los garantes: ${error.message}`);
        }
    },

    // Obtener garante por ID
    async getGuarantorById(id: number): Promise<GuarantorWithSolicitud> {
        try {
            const guarantor = await guarantorRepository.findById(id);

            if (!guarantor) {
                throw new Error('Garante no encontrado');
            }

            return guarantor;
        } catch (error: any) {
            console.error('Error en getGuarantorById:', error);
            throw new Error(`Error al obtener el garante: ${error.message}`);
        }
    },

    // Obtener garantes por cédula del usuario (ENDPOINT PRINCIPAL)
    async getGuarantorsByUserCedula(cedula: string): Promise<FormattedGuarantor[]> {
        try {
            const guarantors = await guarantorRepository.findByUserCedula(cedula);

            // Formatear datos para el frontend
            const formattedGuarantors: FormattedGuarantor[] = guarantors.map(guarantor => ({
                id: guarantor.id,
                nombresGarante: guarantor.nombresGarante,
                apellidosGarante: guarantor.apellidosGarante,
                whatsappGarante: guarantor.whatsappGarante,
                nombreCompletoGarante: `${guarantor.nombresGarante} ${guarantor.apellidosGarante}`,
                solicitud: {
                    numeroDocumento: guarantor.solicitud.numeroDocumento!,
                    solicitante: `${guarantor.solicitud.nombres} ${guarantor.solicitud.apellidos}`,
                    cedula: guarantor.solicitud.cedula!,
                    montoCredito: guarantor.solicitud.montoCredito!,
                    tipodeCredito: guarantor.solicitud.tipodeCredito!,
                    fechaEmision: guarantor.solicitud.fechaEmision!
                }
            }));

            return formattedGuarantors;
        } catch (error: any) {
            console.error('Error en getGuarantorsByUserCedula:', error);
            throw new Error(`Error al obtener los garantes del usuario: ${error.message}`);
        }
    },

    // Obtener garantes por solicitud específica
    async getGuarantorsBySolicitudId(solicitudId: number): Promise<GuarantorWithSolicitud[]> {
        try {
            const guarantors = await guarantorRepository.findBySolicitudId(solicitudId);
            return guarantors;
        } catch (error: any) {
            console.error('Error en getGuarantorsBySolicitudId:', error);
            throw new Error(`Error al obtener los garantes de la solicitud: ${error.message}`);
        }
    },

    // Actualizar un garante
    async updateGuarantor(id: number, data: UpdateGuarantorData): Promise<GuarantorWithSolicitud> {
        try {
            const guarantorExists = await guarantorRepository.exists(id);

            if (!guarantorExists) {
                throw new Error('Garante no encontrado');
            }

            const updatedGuarantor = await guarantorRepository.update(id, data);
            return updatedGuarantor;
        } catch (error: any) {
            console.error('Error en updateGuarantor:', error);
            throw new Error(`Error al actualizar el garante: ${error.message}`);
        }
    },

    // Eliminar un garante
    async deleteGuarantor(id: number): Promise<{ message: string }> {
        try {
            const guarantorExists = await guarantorRepository.exists(id);

            if (!guarantorExists) {
                throw new Error('Garante no encontrado');
            }

            await guarantorRepository.delete(id);
            return { message: 'Garante eliminado exitosamente' };
        } catch (error: any) {
            console.error('Error en deleteGuarantor:', error);
            throw new Error(`Error al eliminar el garante: ${error.message}`);
        }
    },

    // Buscar garantes por nombre o datos del solicitante
    async searchGuarantors(searchTerm: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<GuarantorWithSolicitud>> {
        try {
            const [guarantors, total] = await Promise.all([
                guarantorRepository.search({ searchTerm, page, limit }),
                guarantorRepository.countSearch(searchTerm)
            ]);

            return {
                data: guarantors,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalItems: total,
                    itemsPerPage: limit
                }
            };
        } catch (error: any) {
            console.error('Error en searchGuarantors:', error);
            throw new Error(`Error al buscar garantes: ${error.message}`);
        }
    },

    // Obtener estadísticas de garantes
    async getGuarantorsStats(): Promise<{
        totalGuarantors: number;
        averageGuarantorsPerCredit: string;
        creditApplicationsWithGuarantors: number;
    }> {
        try {
            const stats = await guarantorRepository.getStats();
            
            const averageGuarantorsPerCredit = stats.totalCreditApplicationsWithGuarantors > 0 
                ? (stats.totalGuarantors / stats.totalCreditApplicationsWithGuarantors).toFixed(2)
                : '0';

            return {
                totalGuarantors: stats.totalGuarantors,
                averageGuarantorsPerCredit,
                creditApplicationsWithGuarantors: stats.totalCreditApplicationsWithGuarantors
            };
        } catch (error: any) {
            console.error('Error en getGuarantorsStats:', error);
            throw new Error(`Error al obtener estadísticas de garantes: ${error.message}`);
        }
    },

    // Obtener garantes por múltiples cédulas
    async getGuarantorsByMultipleCedulas(cedulas: string[]): Promise<FormattedGuarantor[]> {
        try {
            if (!Array.isArray(cedulas) || cedulas.length === 0) {
                return [];
            }

            const guarantors = await guarantorRepository.findByMultipleCedulas(cedulas);

            const formattedGuarantors: FormattedGuarantor[] = guarantors.map(guarantor => ({
                id: guarantor.id,
                nombresGarante: guarantor.nombresGarante,
                apellidosGarante: guarantor.apellidosGarante,
                whatsappGarante: guarantor.whatsappGarante,
                nombreCompletoGarante: `${guarantor.nombresGarante} ${guarantor.apellidosGarante}`,
                solicitud: {
                    numeroDocumento: guarantor.solicitud.numeroDocumento!,
                    solicitante: `${guarantor.solicitud.nombres} ${guarantor.solicitud.apellidos}`,
                    cedula: guarantor.solicitud.cedula!,
                    montoCredito: guarantor.solicitud.montoCredito!,
                    tipodeCredito: guarantor.solicitud.tipodeCredito!,
                    fechaEmision: guarantor.solicitud.fechaEmision!
                }
            }));

            return formattedGuarantors;
        } catch (error: any) {
            console.error('Error en getGuarantorsByMultipleCedulas:', error);
            throw new Error(`Error al obtener garantes por múltiples cédulas: ${error.message}`);
        }
    },

    // Obtener garantes por rango de fechas
    async getGuarantorsByDateRange(fechaDesde: string, fechaHasta: string): Promise<GuarantorWithSolicitud[]> {
        try {
            const guarantors = await guarantorRepository.findByDateRange(fechaDesde, fechaHasta);
            return guarantors;
        } catch (error: any) {
            console.error('Error en getGuarantorsByDateRange:', error);
            throw new Error(`Error al obtener garantes por rango de fechas: ${error.message}`);
        }
    },

    // Validar datos de garante
    validateGuarantorData(data: CreateGuarantorData): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!data.nombresGarante || data.nombresGarante.trim().length < 2) {
            errors.push('El nombre del garante debe tener al menos 2 caracteres');
        }

        if (!data.apellidosGarante || data.apellidosGarante.trim().length < 2) {
            errors.push('Los apellidos del garante deben tener al menos 2 caracteres');
        }

        if (!data.whatsappGarante || data.whatsappGarante.trim().length < 10) {
            errors.push('El WhatsApp del garante debe ser válido');
        }

        if (!data.solicitudId || isNaN(data.solicitudId)) {
            errors.push('El ID de solicitud debe ser un número válido');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};