import api from './api';

export interface ResumoManutencoes {
    total_ativos: number;
    manutencoes_atrasadas: number;
    manutencoes_urgentes: number;
    manutencoes_proximas: number;
    manutencoes_realizadas_mes: number;
}

export interface AtivoComManutencao {
    id: number;
    nome: string;
    descricao?: string;
    usuario_id: number;
    created_at: string;
    updated_at: string;
    total_proximas_manutencoes?: number;
    proxima_manutencao_mais_urgente?: string;
    status_urgencia: 'atrasada' | 'urgente' | 'proxima' | 'ok';
}

export const dashboardService = {
    // Obter resumo das estatísticas do dashboard
    async obterResumo(): Promise<ResumoManutencoes> {
        const response = await api.get<ResumoManutencoes>('/dashboard/resumo');
        return response.data;
    },

    // Obter ativos com informações de manutenção
    async obterAtivos(status?: string): Promise<AtivoComManutencao[]> {
        const params = status ? { status } : {};
        const response = await api.get<AtivoComManutencao[]>('/dashboard/ativos', { params });
        return response.data;
    },

    // Obter estatísticas gerais
    async obterEstatisticas(): Promise<any> {
        const response = await api.get('/dashboard/estatisticas');
        return response.data;
    }
};