import {
    AuthResponse,
    CriarUsuarioDto,
    LoginDto,
    Usuario, 
    UsuarioSemSenha, 
    AtualizarPerfilDto,
    AlterarSenhaDto
} from '../types';
import { apiPost, apiGet, apiPut, setAuthToken as setAxiosAuthToken } from './api'; 

class AuthService {
    // Define o token no localStorage E informa o Axios (via api.ts)
    setToken(token: string | null) {
        setAxiosAuthToken(token); // Isso atualiza o localStorage e o header padrão do Axios
    }

    async register(dados: CriarUsuarioDto): Promise<AuthResponse> {
        try {
            const response = await apiPost<AuthResponse>('/auth/registrar', dados);
            if (response.token && response.usuario) {
                this.setToken(response.token);
                // Guardar usuário sem senha no localStorage é feito pelo AuthContext
            }
            return response;
        } catch (error) {
            console.error("Erro no serviço de registro:", error);
            throw error;
        }
    }

    async login(dados: LoginDto): Promise<AuthResponse> {
        try {
            const response = await apiPost<AuthResponse>('/auth/login', dados);
            if (response.token && response.usuario) {
                this.setToken(response.token);
            }
            return response;
        } catch (error) {
            // O erro de credenciais inválidas (401) será propagado daqui
            console.error("Erro no serviço de login:", error);
            throw error;
        }
    }

    async logout(): Promise<void> {
        try {
            // Tenta chamar a API de logout, mas não falha se não conseguir
            await apiPost('/auth/logout');
        } catch (error) {
            console.warn("Erro ao chamar API de logout no backend:", error);
        } finally {
            // Sempre remove o token localmente
            this.setToken(null);
        }
    }

    async getPerfil(): Promise<UsuarioSemSenha> { // Espera UsuarioSemSenha da API
        try {
            return await apiGet<UsuarioSemSenha>('/auth/perfil');
        } catch (error) {
            console.error("Erro ao obter perfil:", error);
            throw error;
        }
    }

    async updatePerfil(dados: AtualizarPerfilDto): Promise<{ message: string; usuario: UsuarioSemSenha }> {
        try {
            return await apiPut<{ message: string; usuario: UsuarioSemSenha }>('/auth/perfil', dados);
        } catch (error) {
            console.error("Erro ao atualizar perfil:", error);
            throw error;
        }
    }

    async alterarSenha(dados: AlterarSenhaDto): Promise<{ message: string }> {
        try {
            return await apiPut<{ message: string }>('/auth/alterar-senha', dados);
        } catch (error) {
            console.error("Erro ao alterar senha:", error);
            throw error;
        }
    }
}

export const authService = new AuthService();