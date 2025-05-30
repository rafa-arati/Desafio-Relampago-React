import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    AuthContextType,
    AtualizarPerfilDto,
    AlterarSenhaDto,
    UsuarioSemSenha 
} from '../types';
import { authService } from '../services/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const TOKEN_KEY = 'assistente_manutencao_token';
const USER_KEY = 'assistente_manutencao_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [usuario, setUsuario] = useState<UsuarioSemSenha | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isAuthenticated = !!(usuario && token);

    const saveAuthData = (userData: UsuarioSemSenha, userToken: string) => {
        localStorage.setItem(TOKEN_KEY, userToken);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        authService.setToken(userToken);
        setUsuario(userData);
        setToken(userToken);
    };

    const clearAuthData = () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        authService.setToken(null);
        setUsuario(null);
        setToken(null);
    };

    const login = async (email: string, senha: string): Promise<void> => {
        try {
            const response = await authService.login({ email, senha });
            // response.usuario já deve ser UsuarioSemSenha vindo do backend
            saveAuthData(response.usuario, response.token);
        } catch (error) {
            console.error('AuthContext: Erro no login capturado:', error);
            clearAuthData();
            throw error; // Relança para LoginPage tratar a UI
        }
    };

    const register = async (email: string, senha: string, nome: string): Promise<void> => {
        try {
            const response = await authService.register({ email, senha, nome });
            saveAuthData(response.usuario, response.token);
        } catch (error) {
            console.error('AuthContext: Erro no registro capturado:', error);
            clearAuthData();
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        setIsLoading(true); // Para mostrar um feedback visual se necessário
        try {
            await authService.logout();
        } catch (error) {
            console.warn('AuthContext: Erro ao deslogar no servidor:', error);
        } finally {
            clearAuthData();
            setIsLoading(false);
        }
    };

    const updatePerfil = async (dados: AtualizarPerfilDto): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authService.updatePerfil(dados);
            const updatedUser = response.usuario; // Já deve ser UsuarioSemSenha
            localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
            setUsuario(updatedUser); // Atualiza o estado local
        } catch (error) {
            console.error('AuthContext: Erro ao atualizar perfil:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const alterarSenha = async (dados: AlterarSenhaDto): Promise<void> => {
        setIsLoading(true);
        try {
            await authService.alterarSenha(dados);
        } catch (error) {
            console.error('AuthContext: Erro ao alterar senha:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const verifyTokenAndLoadUser = async () => {
            setIsLoading(true);
            const savedToken = localStorage.getItem(TOKEN_KEY);
            if (savedToken) {
                authService.setToken(savedToken); // Configura o token para a chamada getPerfil
                try {
                    const currentUser = await authService.getPerfil(); // Tenta buscar o perfil
                    const savedUserString = localStorage.getItem(USER_KEY);
                    // Se getPerfil for bem-sucedido, o token é válido.
                    // Idealmente, getPerfil retorna o usuário atualizado, mas podemos usar o salvo como fallback
                    // ou confiar que o backend sempre retorna o mais atual.
                    const userToSave = currentUser || (savedUserString ? JSON.parse(savedUserString) : null);
                    if (userToSave) {
                        saveAuthData(userToSave, savedToken);
                    } else {
                        clearAuthData(); // Usuário salvo não encontrado ou inválido
                    }
                } catch (error) {
                    console.warn('AuthContext: Token salvo inválido ou sessão expirada.', error);
                    clearAuthData(); // Limpa se o token não for mais válido
                }
            }
            setIsLoading(false);
        };
        verifyTokenAndLoadUser();
    }, []);

    const contextValue: AuthContextType = {
        usuario,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updatePerfil,
        alterarSenha,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};