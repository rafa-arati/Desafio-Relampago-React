import { Response } from 'express';
import { pool } from '../database/config';
import { AuthenticatedRequest } from '../middleware/auth';
import { CriarManutencaoDto, AtualizarManutencaoDto, ManutencaoComAtivo } from '../types';

export class ManutencoesController {
    async listarManutencoes(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;
            const { ativo_id, page = '1', limit = '10' } = req.query;

            const pageNum = parseInt(page as string);
            const limitNum = parseInt(limit as string);
            const offset = (pageNum - 1) * limitNum;

            let whereClause = 'WHERE a.usuario_id = $1';
            const params: any[] = [usuarioId];

            if (ativo_id) {
                whereClause += ' AND m.ativo_id = $2';
                params.push(parseInt(ativo_id as string));
            }

            const query = `
        SELECT 
          m.*,
          a.nome as ativo_nome,
          a.descricao as ativo_descricao
        FROM manutencoes m
        INNER JOIN ativos a ON m.ativo_id = a.id
        ${whereClause}
        ORDER BY m.data_realizada DESC, m.created_at DESC
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

            params.push(limitNum, offset);

            const result = await pool.query(query, params);
            const manutencoes: ManutencaoComAtivo[] = result.rows;

            // Query para contar total de registros
            const countQuery = `
        SELECT COUNT(*) as total
        FROM manutencoes m
        INNER JOIN ativos a ON m.ativo_id = a.id
        ${whereClause}
      `;

            const countResult = await pool.query(countQuery, params.slice(0, ativo_id ? 2 : 1));
            const total = parseInt(countResult.rows[0].total);

            res.json({
                manutencoes,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            });
        } catch (error) {
            console.error('Erro ao listar manutenções:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async buscarManutencaoPorId(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuarioId = req.userId;

            if (!id) {
                res.status(400).json({ message: 'ID da manutenção é obrigatório' });
                return;
            }

            const query = `
        SELECT 
          m.*,
          a.nome as ativo_nome,
          a.descricao as ativo_descricao
        FROM manutencoes m
        INNER JOIN ativos a ON m.ativo_id = a.id
        WHERE m.id = $1 AND a.usuario_id = $2
      `;

            const result = await pool.query(query, [id, usuarioId]);

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Manutenção não encontrada' });
                return;
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao buscar manutenção:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async criarManutencao(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;
            const dados: CriarManutencaoDto = req.body;

            // Validações
            if (!dados.ativo_id) {
                res.status(400).json({ message: 'ID do ativo é obrigatório' });
                return;
            }

            if (!dados.tipo_servico || dados.tipo_servico.trim().length === 0) {
                res.status(400).json({ message: 'Tipo de serviço é obrigatório' });
                return;
            }

            if (!dados.data_realizada) {
                res.status(400).json({ message: 'Data realizada é obrigatória' });
                return;
            }

            // Verificar se o ativo pertence ao usuário
            const ativoCheck = await pool.query(
                'SELECT id FROM ativos WHERE id = $1 AND usuario_id = $2',
                [dados.ativo_id, usuarioId]
            );

            if (ativoCheck.rows.length === 0) {
                res.status(404).json({ message: 'Ativo não encontrado' });
                return;
            }

            // Validar datas
            const dataRealizada = new Date(dados.data_realizada);
            if (isNaN(dataRealizada.getTime())) {
                res.status(400).json({ message: 'Data realizada inválida' });
                return;
            }

            let proximaManutencao = null;
            if (dados.proxima_manutencao) {
                proximaManutencao = new Date(dados.proxima_manutencao);
                if (isNaN(proximaManutencao.getTime())) {
                    res.status(400).json({ message: 'Data da próxima manutenção inválida' });
                    return;
                }
            }

            const result = await pool.query(
                `INSERT INTO manutencoes (ativo_id, tipo_servico, data_realizada, descricao, proxima_manutencao, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
                [
                    dados.ativo_id,
                    dados.tipo_servico.trim(),
                    dataRealizada,
                    dados.descricao?.trim() || null,
                    proximaManutencao
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao criar manutenção:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async atualizarManutencao(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuarioId = req.userId;
            const dados: AtualizarManutencaoDto = req.body;

            if (!id) {
                res.status(400).json({ message: 'ID da manutenção é obrigatório' });
                return;
            }

            // Verificar se a manutenção existe e pertence ao usuário
            const manutencaoCheck = await pool.query(
                `SELECT m.id FROM manutencoes m
         INNER JOIN ativos a ON m.ativo_id = a.id
         WHERE m.id = $1 AND a.usuario_id = $2`,
                [id, usuarioId]
            );

            if (manutencaoCheck.rows.length === 0) {
                res.status(404).json({ message: 'Manutenção não encontrada' });
                return;
            }

            // Construir query dinamicamente
            const camposParaAtualizar: string[] = [];
            const valores: any[] = [];
            let contador = 1;

            if (dados.tipo_servico !== undefined) {
                if (!dados.tipo_servico || dados.tipo_servico.trim().length === 0) {
                    res.status(400).json({ message: 'Tipo de serviço não pode ser vazio' });
                    return;
                }
                camposParaAtualizar.push(`tipo_servico = $${contador}`);
                valores.push(dados.tipo_servico.trim());
                contador++;
            }

            if (dados.data_realizada !== undefined) {
                const dataRealizada = new Date(dados.data_realizada);
                if (isNaN(dataRealizada.getTime())) {
                    res.status(400).json({ message: 'Data realizada inválida' });
                    return;
                }
                camposParaAtualizar.push(`data_realizada = $${contador}`);
                valores.push(dataRealizada);
                contador++;
            }

            if (dados.descricao !== undefined) {
                camposParaAtualizar.push(`descricao = $${contador}`);
                valores.push(dados.descricao?.trim() || null);
                contador++;
            }

            if (dados.proxima_manutencao !== undefined) {
                let proximaManutencao = null;
                if (dados.proxima_manutencao) {
                    proximaManutencao = new Date(dados.proxima_manutencao);
                    if (isNaN(proximaManutencao.getTime())) {
                        res.status(400).json({ message: 'Data da próxima manutenção inválida' });
                        return;
                    }
                }
                camposParaAtualizar.push(`proxima_manutencao = $${contador}`);
                valores.push(proximaManutencao);
                contador++;
            }

            if (camposParaAtualizar.length === 0) {
                res.status(400).json({ message: 'Nenhum campo para atualizar fornecido' });
                return;
            }

            camposParaAtualizar.push(`updated_at = NOW()`);
            valores.push(id);

            const query = `
        UPDATE manutencoes 
        SET ${camposParaAtualizar.join(', ')}
        WHERE id = $${contador}
        RETURNING *
      `;

            const result = await pool.query(query, valores);
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Erro ao atualizar manutenção:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async deletarManutencao(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const usuarioId = req.userId;

            if (!id) {
                res.status(400).json({ message: 'ID da manutenção é obrigatório' });
                return;
            }

            const result = await pool.query(
                `DELETE FROM manutencoes 
         WHERE id = $1 AND ativo_id IN (
           SELECT id FROM ativos WHERE usuario_id = $2
         )
         RETURNING id`,
                [id, usuarioId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Manutenção não encontrada' });
                return;
            }

            res.status(204).send();
        } catch (error) {
            console.error('Erro ao deletar manutenção:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async listarManutencoesPorAtivo(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { ativoId } = req.params;
            const usuarioId = req.userId;

            if (!ativoId) {
                res.status(400).json({ message: 'ID do ativo é obrigatório' });
                return;
            }

            // Verificar se o ativo pertence ao usuário
            const ativoCheck = await pool.query(
                'SELECT id FROM ativos WHERE id = $1 AND usuario_id = $2',
                [ativoId, usuarioId]
            );

            if (ativoCheck.rows.length === 0) {
                res.status(404).json({ message: 'Ativo não encontrado' });
                return;
            }

            const result = await pool.query(
                `SELECT * FROM manutencoes 
         WHERE ativo_id = $1 
         ORDER BY data_realizada DESC, created_at DESC`,
                [ativoId]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Erro ao listar manutenções por ativo:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }
}

export default new ManutencoesController();