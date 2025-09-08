import { CredencialRepository } from '../repositories/credencialRepository';

export class CredencialService {
    private repository: CredencialRepository;

    constructor() {
        this.repository = new CredencialRepository();
    }

    async getCredencialByUserId(userId: number) {
        const user = await this.repository.findById(userId);
        if (!user || !user.credencialPath) {
            throw new Error("No se encontró la credencial para este usuario.");
        }
        return { url: `/${user.credencialPath}` };
    }

    async getAllCredenciales() {
        const BASE_URL = process.env.BACKEND_PUBLIC_URL || "http://localhost:3001";
        const users = await this.repository.getAll();
        return users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            url: user.credencialPath ? `${BASE_URL}/${user.credencialPath}` : null
        }));
    }


    async uploadCredencial(userId: number, filePath: string) {
        if (!filePath) {
            throw new Error("Archivo no proporcionado");
        }
        return await this.repository.updateCredencial(userId, filePath);
    }

    async deleteCredencial(userId: number) {
        return await this.repository.deleteCredencial(userId);
    }
}
