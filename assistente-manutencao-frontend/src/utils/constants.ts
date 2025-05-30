import { StatusUrgenciaEnum } from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const ROUTES = {
    // Públicas
    LOGIN: '/login',
    REGISTER: '/register',

    // Protegidas
    DASHBOARD: '/dashboard',
    ATIVOS: '/ativos',
    ATIVOS_NOVO: '/ativos/novo',
    ATIVOS_DETAIL: (id: string | number) => `/ativos/${id}`,
    ATIVOS_EDIT: (id: string | number) => `/ativos/${id}/editar`, 
    MANUTENCOES: '/manutencoes',
    MANUTENCOES_NOVO: '/manutencoes/novo',
    MANUTENCOES_EDIT: (id: string | number) => `/manutencoes/${id}/editar`,
    PERFIL: '/perfil',
    CONFIGURACOES: '/configuracoes'
} as const;

export const STATUS_URGENCIA = { 
    ATRASADA: 'atrasada' as const,
    URGENTE: 'urgente' as const,
    PROXIMA: 'proxima' as const,
    OK: 'ok' as const
};

export const STORAGE_KEYS = {
    AUTH_TOKEN: 'assistente_manutencao_token', 
    USER_DATA: 'assistente_manutencao_user', 
    THEME_MODE: 'theme_mode'
} as const;

export const STATUS_URGENCIA_LABELS: Record<StatusUrgenciaEnum, string> = {
    [StatusUrgenciaEnum.ATRASADA]: 'Atrasada',
    [StatusUrgenciaEnum.URGENTE]: 'Urgente',
    [StatusUrgenciaEnum.PROXIMA]: 'Próxima',
    [StatusUrgenciaEnum.OK]: 'Em dia'
};

export const STATUS_URGENCIA_COLORS: Record<StatusUrgenciaEnum, 'error' | 'warning' | 'info' | 'success' | 'default'> = {
    [StatusUrgenciaEnum.ATRASADA]: 'error',
    [StatusUrgenciaEnum.URGENTE]: 'warning',
    [StatusUrgenciaEnum.PROXIMA]: 'info',
    [StatusUrgenciaEnum.OK]: 'success'
};