export interface Usuario {
    id: number;
    email: string;
    senha: string;
    nome: string;
    created_at: Date;
    updated_at: Date;
}

export interface UsuarioSemSenha {
    id: number;
    email: string;
    nome: string;
    created_at: Date;
    updated_at: Date;
}

export interface JwtPayload {
    userId: number;
    email: string;
}

export interface Ativo {
    id: number;
    nome: string;
    descricao?: string;
    usuario_id: number;
    created_at: Date;
    updated_at: Date;
}

export interface Manutencao {
    id: number;
    ativo_id: number;
    tipo_servico: string;
    data_realizada: Date;
    descricao?: string;
    proxima_manutencao?: Date;
    created_at: Date;
    updated_at: Date;
}

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
    data_realizada: string; // ISO string
    descricao?: string;
    proxima_manutencao?: string; // ISO string
}

export interface AtualizarManutencaoDto {
    tipo_servico?: string;
    data_realizada?: string;
    descricao?: string;
    proxima_manutencao?: string;
}

// Tipos específicos para o Dashboard
export interface AtivoComManutencao extends Ativo {
    proxima_manutencao?: Date;
    tipo_servico_proximo?: string;
    dias_para_proxima?: number;
    status_urgencia: 'atrasada' | 'urgente' | 'proxima' | 'ok';
}

export interface ResumoManutencoes {
    total_ativos: number;
    manutencoes_atrasadas: number;
    manutencoes_urgentes: number;
    manutencoes_proximas: number;
    manutencoes_realizadas_mes: number;
}

export interface ManutencaoComAtivo extends Manutencao {
    ativo_nome: string;
    ativo_descricao?: string;
}