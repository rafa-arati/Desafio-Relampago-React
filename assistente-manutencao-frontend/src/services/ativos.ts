import { api } from './api';
import { Ativo, CriarAtivoDto, AtualizarAtivoDto, AtivoComManutencao } from '../types';

export const ativosService = {
    // Listar todos os ativos do usuário
    async listarAtivos(): Promise<Ativo[]> {
        const response = await api.get('/ativos');
        return response.data;
    },

    // Buscar ativo específico por ID
    async buscarAtivo(id: number): Promise<Ativo> {
        const response = await api.get(`/ativos/${id}`);
        return response.data;
    },

    // Criar novo ativo
    async criarAtivo(dados: CriarAtivoDto): Promise<Ativo> {
        const response = await api.post('/ativos', dados);
        return response.data;
    },

    // Atualizar ativo existente
    async atualizarAtivo(id: number, dados: AtualizarAtivoDto): Promise<Ativo> {
        const response = await api.put(`/ativos/${id}`, dados);
        return response.data;
    },

    // Deletar ativo
    async deletarAtivo(id: number): Promise<void> {
        await api.delete(`/ativos/${id}`);
    },

    // Buscar ativos com informações de manutenção (para dashboard)
    async listarAtivosComManutencao(status?: string): Promise<AtivoComManutencao[]> {
        const params = status ? { status } : {};
        const response = await api.get('/dashboard/ativos', { params });
        return response.data;
    }
};