import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

const TOKEN_KEY = 'assistente_manutencao_token';
const USER_KEY = 'assistente_manutencao_user';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem(TOKEN_KEY);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    const originalRequestUrl = error.config?.url;
                    const isAuthAttemptRoute = originalRequestUrl?.includes('/auth/login') ||
                        originalRequestUrl?.includes('/auth/registrar');

                    if (!isAuthAttemptRoute) {
                        console.warn('Interceptor de API: Erro 401 em rota protegida. Token inválido ou expirado. Deslogando...');
                        localStorage.removeItem(TOKEN_KEY);
                        localStorage.removeItem(USER_KEY);
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                        }
                    }
                }
                return Promise.reject(error);
            }
        );
    }

    async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.client.get<T>(url, config);
    }
    async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.client.post<T>(url, data, config);
    }
    async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
        return this.client.put<T>(url, data, config);
    }
    async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
        return this.client.delete<T>(url, config);
    }
}

const apiClient = new ApiClient();
export const api = apiClient;
export default apiClient;

export const setAuthToken = (token: string | null): void => {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
};

export const getAuthToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

export const apiGet = async <T>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
};

export const apiPost = async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
};

export const apiPut = async <T>(url: string, data?: any, config?: any): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
};

export const apiDelete = async <T = void>(url: string, config?: any): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
};