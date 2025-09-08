export class AdminAuthService {
  validateAdminRole(role: string): void {
    console.log('🔍 Validando rol de administrador:', role);
    
    if (!role) {
      throw new Error('Rol no especificado');
    }
    
    if (role !== 'Administrador') {
      throw new Error('Administrador no autenticado');
    }
    
    console.log('✅ Rol de administrador validado correctamente');
  }
  
  // Método adicional para validar por userType si es necesario
  validateAdminUserType(userType: string): void {
    console.log('🔍 Validando tipo de usuario:', userType);
    
    const validUserTypes = ['admin', 'Admin', 'ADMIN'];
    
    if (!userType) {
      throw new Error('Tipo de usuario no especificado');
    }
    
    if (!validUserTypes.includes(userType)) {
      throw new Error('Tipo de usuario no autorizado');
    }
    
    console.log('✅ Tipo de usuario validado correctamente');
  }

  // Método combinado para validación completa
  validateAdmin(role: string, userType: string): void {
    this.validateAdminRole(role);
    this.validateAdminUserType(userType);
  }
}