// ===== TIPOS PRINCIPAIS =====
export interface Usuario {
    id: number;
    email: string;
    nome: string;
    created_at: string;
    updated_at: string;
}

export interface UsuarioSemSenha {
    id: number;
    email: string;
    nome: string;
    created_at: string;
    updated_at: string;
}

export interface Ativo {
    id: number;
    nome: string;
    descricao?: string;
    usuario_id: number;
    created_at: string;
    updated_at: string;
}

export interface AtivoComManutencao extends Ativo {
    total_proximas_manutencoes?: number;
    proxima_manutencao_mais_urgente?: string;
    status_urgencia: 'atrasada' | 'urgente' | 'proxima' | 'ok';
}

export interface Manutencao {
    id: number;
    ativo_id: number;
    tipo_servico: string;
    data_realizada: string;
    descricao?: string;
    proxima_manutencao?: string;
    created_at: string;
    updated_at: string;
}

export interface ManutencaoComAtivo extends Manutencao {
    ativo_nome: string;
    ativo_descricao?: string;
}

export interface ResumoManutencoes {
    total_ativos: number;
    manutencoes_atrasadas: number;
    manutencoes_urgentes: number;
    manutencoes_proximas: number;
    manutencoes_realizadas_mes: number;
}

// ===== DTOs PARA REQUESTS =====
export interface CriarUsuarioDto {
    email: string;
    senha: string;
    nome: string;
}

export interface LoginDto {
    email: string;
    senha: string;
}

export interface CriarAtivoDto {
    nome: string;
    descricao?: string;
}

export interface AtualizarAtivoDto {
    nome?: string;
    descricao?: string;
}

export interface CriarManutencaoDto {
    ativo_id: number;
    tipo_servico: string;
    data_realizada: string; // Format: "YYYY-MM-DD"
    descricao?: string;
    proxima_manutencao?: string; // Format: "YYYY-MM-DD"
}

export interface AtualizarManutencaoDto {
    tipo_servico?: string;
    data_realizada?: string; // Format: "YYYY-MM-DD" 
    descricao?: string;
    proxima_manutencao?: string; // Format: "YYYY-MM-DD"
}

export interface AtualizarPerfilDto {
    nome?: string;
    email?: string;
}

export interface AlterarSenhaDto {
    senhaAtual: string;
    novaSenha: string;
}

// ===== TIPOS DE RESPOSTA DA API =====
export interface ApiResponse<T = any> {
    message?: string;
    data?: T;
    error?: string;
    status?: number;
}

export interface AuthResponse {
    message: string;
    usuario: UsuarioSemSenha;
    token: string;
}

export interface PaginationResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// ===== TIPOS PARA CONTEXT E ESTADO =====
export interface AuthContextType {
    usuario: UsuarioSemSenha | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, senha: string) => Promise<void>;
    register: (email: string, senha: string, nome: string) => Promise<void>;
    logout: () => void;
    updatePerfil: (dados: AtualizarPerfilDto) => Promise<void>;
    alterarSenha: (dados: AlterarSenhaDto) => Promise<void>;
}

// ===== TIPOS PARA COMPONENTES =====
export type StatusUrgencia = 'atrasada' | 'urgente' | 'proxima' | 'ok';

export interface StatusBadgeProps {
    status: StatusUrgencia;
    variant?: 'filled' | 'outlined';
}

export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    severity?: 'error' | 'warning' | 'info';
}

// ===== TIPOS PARA FORMULÁRIOS =====
export interface FormularioLoginData {
    email: string;
    senha: string;
}

export interface FormularioRegistroData {
    email: string;
    senha: string;
    confirmarSenha: string;
    nome: string;
}

export interface FormularioAtivoData {
    nome: string;
    descricao?: string;
}

export interface FormularioManutencaoData {
    ativo_id: string;
    tipo_servico: string;
    data_realizada: string;
    descricao?: string;
    proxima_manutencao?: string;
}

export interface FormularioPerfilData {
    nome: string;
    email: string;
}

export interface FormularioAlterarSenhaData {
    senhaAtual: string;
    novaSenha: string;
    confirmarNovaSenha: string;
}

// ===== TIPOS PARA HOOKS =====
export interface UseApiResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>; // Sempre retorna Promise<void>
}

export interface UseApiOptions {
    immediate?: boolean;
    deps?: any[];
}

// ===== ENUMS E CONSTANTES =====
export enum StatusUrgenciaEnum {
    ATRASADA = 'atrasada',
    URGENTE = 'urgente',
    PROXIMA = 'proxima',
    OK = 'ok'
}

export const STATUS_URGENCIA_LABELS = {
    [StatusUrgenciaEnum.ATRASADA]: 'Atrasada',
    [StatusUrgenciaEnum.URGENTE]: 'Urgente',
    [StatusUrgenciaEnum.PROXIMA]: 'Próxima',
    [StatusUrgenciaEnum.OK]: 'Em dia'
};

export const STATUS_URGENCIA_COLORS = {
    [StatusUrgenciaEnum.ATRASADA]: 'error',
    [StatusUrgenciaEnum.URGENTE]: 'warning',
    [StatusUrgenciaEnum.PROXIMA]: 'info',
    [StatusUrgenciaEnum.OK]: 'success'
} as const;

