import { Response } from 'express';
import { pool } from '../database/config';
import { CriarAtivoDto, AtualizarAtivoDto } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export class AtivosController {
    async listarAtivos(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;

            const result = await pool.query(
                'SELECT * FROM ativos WHERE usuario_id = $1 ORDER BY created_at DESC',
                [usuarioId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar ativos:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async buscarAtivoPorId(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuarioId = req.userId;

            if (!id) {
                res.status(400).json({ message: 'ID do ativo é obrigatório' });
                return;
            }

            const result = await pool.query(
                'SELECT * FROM ativos WHERE id = $1 AND usuario_id = $2',
                [id, usuarioId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Ativo não encontrado' });
                return;
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar ativo:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async criarAtivo(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;
            const dados: CriarAtivoDto = req.body;

            // Validações
            if (!dados.nome || dados.nome.trim().length === 0) {
                res.status(400).json({ message: 'Nome é obrigatório' });
                return;
            }

            if (dados.nome.trim().length > 100) {
                res.status(400).json({ message: 'Nome deve ter no máximo 100 caracteres' });
                return;
            }

            const result = await pool.query(
                `INSERT INTO ativos (nome, descricao, usuario_id, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         RETURNING *`,
                [dados.nome.trim(), dados.descricao || null, usuarioId]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar ativo:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async atualizarAtivo(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuarioId = req.userId;
            const dados: AtualizarAtivoDto = req.body;

            if (!id) {
                res.status(400).json({ message: 'ID do ativo é obrigatório' });
                return;
            }

            // Validações
            if (dados.nome !== undefined && (!dados.nome || dados.nome.trim().length === 0)) {
                res.status(400).json({ message: 'Nome não pode ser vazio' });
                return;
            }

            if (dados.nome && dados.nome.trim().length > 100) {
                res.status(400).json({ message: 'Nome deve ter no máximo 100 caracteres' });
                return;
            }

            // Verificar se o ativo existe e pertence ao usuário
            const ativoPertenceUsuario = await pool.query(
                'SELECT id FROM ativos WHERE id = $1 AND usuario_id = $2',
                [id, usuarioId]
            );

            if (ativoPertenceUsuario.rows.length === 0) {
                res.status(404).json({ message: 'Ativo não encontrado' });
                return;
            }

            // Construir query dinamicamente
            const camposParaAtualizar: string[] = [];
            const valores: any[] = [];
            let contador = 1;

            if (dados.nome !== undefined) {
                camposParaAtualizar.push(`nome = $${contador}`);
                valores.push(dados.nome.trim());
                contador++;
            }

            if (dados.descricao !== undefined) {
                camposParaAtualizar.push(`descricao = $${contador}`);
                valores.push(dados.descricao);
                contador++;
            }

            if (camposParaAtualizar.length === 0) {
                res.status(400).json({ message: 'Nenhum campo para atualizar fornecido' });
                return;
            }

            camposParaAtualizar.push(`updated_at = NOW()`);
            valores.push(id, usuarioId);

            const query = `
        UPDATE ativos 
        SET ${camposParaAtualizar.join(', ')}
        WHERE id = $${contador} AND usuario_id = $${contador + 1}
        RETURNING *
      `;

            const result = await pool.query(query, valores);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar ativo:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async deletarAtivo(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuarioId = req.userId;

            if (!id) {
                res.status(400).json({ message: 'ID do ativo é obrigatório' });
                return;
            }

            const result = await pool.query(
                'DELETE FROM ativos WHERE id = $1 AND usuario_id = $2 RETURNING id',
                [id, usuarioId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Ativo não encontrado' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar ativo:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
}

export default new AtivosController();