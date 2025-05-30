import { api } from './api';
import {
    Manutencao,
    ManutencaoComAtivo,
    CriarManutencaoDto,
    AtualizarManutencaoDto,
    PaginationResponse // interface para o tipo de retorno do serviço
} from '../types';

// Esta interface descreve a estrutura exata que o seu backend retorna
interface BackendListarManutencoesApiResponse {
    manutencoes: ManutencaoComAtivo[]; // O backend usa a chave 'manutencoes'
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface ListarManutencoesParams {
    page?: number;
    limit?: number;
    ativo_id?: number;
}

export const manutencoesService = {
    async listarManutencoes(params: ListarManutencoesParams = {}): Promise<PaginationResponse<ManutencaoComAtivo>> {
        // 1. Faz a chamada esperando a estrutura exata do backend
        const response = await api.get<BackendListarManutencoesApiResponse>('/manutencoes', { params });

        // 2. Mapeia a resposta do backend para a estrutura PaginationResponse<ManutencaoComAtivo>
        //    que o resto do frontend (useApi, ManutencoesListPage) espera.
        return {
            data: response.data.manutencoes, // Mapeia a chave 'manutencoes' para 'data'
            pagination: response.data.pagination,
        };
    },

    async buscarManutencao(id: number): Promise<Manutencao> {
        const response = await api.get<Manutencao>(`/manutencoes/${id}`);
        return response.data;
    },

    async criarManutencao(dados: CriarManutencaoDto): Promise<Manutencao> {
        const response = await api.post<Manutencao>('/manutencoes', dados);
        return response.data;
    },

    async atualizarManutencao(id: number, dados: AtualizarManutencaoDto): Promise<Manutencao> {
        const response = await api.put<Manutencao>(`/manutencoes/${id}`, dados);
        return response.data;
    },

    async deletarManutencao(id: number): Promise<void> {
        await api.delete(`/manutencoes/${id}`);
    },

    async listarManutencoesPorAtivo(ativoId: number): Promise<Manutencao[]> {
        const response = await api.get<Manutencao[]>(`/ativos/${ativoId}/manutencoes`);
        return Array.isArray(response.data) ? response.data : [];
    }
};