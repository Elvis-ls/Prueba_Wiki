import { CreditRepository } from '../repositories/creditRepository';
import { prisma } from '../../prismaClient/client';

export class CreditService {
  private creditRepository: CreditRepository;

  constructor() {
    this.creditRepository = new CreditRepository();
  }

  async requestCredit(data: any) {
    /*const existingCredit = await this.creditRepository.findById(data.numeroDocumento);
    if (existingCredit) {
        throw new Error('Ya existe una solicitud con este número de documento');
        }*/
    return await this.creditRepository.createCredit(data);
  }

  async getUserCredits(cedula: string) {
    return await this.creditRepository.getCreditsByUser(cedula);
  }

  async getCreditDetails(numeroDocumento: number) {
    const credit = await this.creditRepository.findById(numeroDocumento);
    if (!credit) throw new Error('Solicitud no encontrada');
    return credit;
  }

  async searchCredits(searchTerm: string, searchType: string) {
        try {
            console.log(`Buscando créditos por ${searchType}: ${searchTerm}`);
            
            let whereCondition: any = {};

            switch (searchType) {
                case 'cedula':
                    // Búsqueda exacta por cédula
                    whereCondition = {
                        cedula: searchTerm
                    };
                    break;

                case 'nombre':
                    // Búsqueda por nombre o apellido (parcial, insensible a mayúsculas)
                    whereCondition = {
                        OR: [
                            {
                                nombres: {
                                    contains: searchTerm,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                apellidos: {
                                    contains: searchTerm,
                                    mode: 'insensitive'
                                }
                            },
                            // También buscar en la combinación nombre + apellido
                            {
                                AND: [
                                    {
                                        OR: [
                                            { nombres: { contains: searchTerm.split(' ')[0] || '', mode: 'insensitive' } },
                                            { apellidos: { contains: searchTerm.split(' ')[0] || '', mode: 'insensitive' } }
                                        ]
                                    }
                                ]
                            }
                        ]
                    };
                    break;

                case 'accountNumber':
                    // Para número de cuenta, necesitamos extraer los números
                    // Si el searchTerm viene como "ACC123456", extraemos "123456"
                    // Si viene solo como "123456", lo usamos directamente
                    let cedulaFromAccount = searchTerm;
                    if (searchTerm.toUpperCase().startsWith('ACC')) {
                        cedulaFromAccount = searchTerm.replace(/^ACC/i, '');
                    }
                    
                    // Verificar que solo contenga números
                    if (!/^\d+$/.test(cedulaFromAccount)) {
                        throw new Error('El número de cuenta debe contener solo números');
                    }

                    whereCondition = {
                        cedula: cedulaFromAccount
                    };
                    break;

                case 'carnet':
                    // Para número de carnet, similar al número de cuenta
                    // Si el searchTerm viene como "CR123456", extraemos "123456"
                    // Si viene solo como "123456", lo usamos directamente
                    let cedulaFromCarnet = searchTerm;
                    if (searchTerm.toUpperCase().startsWith('CR')) {
                        cedulaFromCarnet = searchTerm.replace(/^CR/i, '');
                    }
                    
                    // Verificar que solo contenga números
                    if (!/^\d+$/.test(cedulaFromCarnet)) {
                        throw new Error('El número de carnet debe contener solo números');
                    }

                    whereCondition = {
                        cedula: cedulaFromCarnet
                    };
                    break;

                default:
                    throw new Error(`Tipo de búsqueda no válido: ${searchType}`);
            }

            // Ejecutar la consulta con la condición construida
            const credits = await prisma.creditForm.findMany({
                where: whereCondition,
                orderBy: [
                    { creadoEn: 'desc' }, // Ordenar por fecha de creación (más recientes primero)
                    { apellidos: 'asc' },  // Luego por apellido
                    { nombres: 'asc' }     // Finalmente por nombre
                ],
                // Incluir información relacionada si es necesaria
                include: {
                    garantes: true,
                    accionistas: {
                        select: {
                            id: true,
                            name: true,
                            lastName: true,
                            email: true
                        }
                    }
                }
            });

            console.log(`Encontrados ${credits.length} créditos para la búsqueda`);
            return credits;

        } catch (error: any) {
            console.error('Error en searchCredits:', error);
            throw new Error(`Error al buscar créditos: ${error.message}`);
        }
    }

    // Método auxiliar para normalizar nombres en búsquedas
    private normalizeSearchTerm(term: string): string {
        return term
            .toLowerCase()
            .trim()
            .normalize('NFD') // Normalizar caracteres acentuados
            .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
    }


}