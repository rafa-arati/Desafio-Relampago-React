import { Response } from 'express';
import { pool } from '../database/config';
import { AuthenticatedRequest } from '../middleware/auth';
import { AtivoComManutencao, ResumoManutencoes } from '../types';

export class DashboardController {
  async obterResumo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.userId;

      // Query para buscar resumo das manutenções
      const resumoQuery = `
        WITH todas_proximas_manutencoes AS (
          SELECT 
            m.id,
            m.ativo_id,
            m.proxima_manutencao,
            m.tipo_servico,
            a.nome as ativo_nome,
            CASE 
              WHEN m.proxima_manutencao < CURRENT_DATE THEN 'atrasada'
              WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '7 days' THEN 'urgente'
              WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days' THEN 'proxima'
              ELSE 'ok'
            END as status_urgencia
          FROM manutencoes m
          INNER JOIN ativos a ON m.ativo_id = a.id
          WHERE a.usuario_id = $1 
            AND m.proxima_manutencao IS NOT NULL
            AND m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days'
        )
        SELECT 
          (SELECT COUNT(*) FROM ativos WHERE usuario_id = $1) as total_ativos,
          (SELECT COUNT(*) FROM todas_proximas_manutencoes WHERE status_urgencia = 'atrasada') as manutencoes_atrasadas,
          (SELECT COUNT(*) FROM todas_proximas_manutencoes WHERE status_urgencia = 'urgente') as manutencoes_urgentes,
          (SELECT COUNT(*) FROM todas_proximas_manutencoes WHERE status_urgencia = 'proxima') as manutencoes_proximas,
          (SELECT COUNT(*) FROM manutencoes m 
          INNER JOIN ativos a ON m.ativo_id = a.id 
          WHERE a.usuario_id = $1 
          AND m.data_realizada >= DATE_TRUNC('month', CURRENT_DATE)
          AND m.data_realizada < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
          ) as manutencoes_realizadas_mes
        `;

      const resumoResult = await pool.query(resumoQuery, [usuarioId]);
      const resumo: ResumoManutencoes = resumoResult.rows[0];

      res.json(resumo);
    } catch (error) {
      console.error('Erro ao obter resumo do dashboard:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async obterAtivosComManutencoes(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.userId;
      const { status } = req.query;

      let whereClause = '';
      const params: any[] = [usuarioId];

      if (status && typeof status === 'string') {
        if (status === 'atrasada') {
          whereClause = 'AND pm.proxima_manutencao < CURRENT_DATE';
        } else if (status === 'urgente') {
          whereClause = 'AND pm.proxima_manutencao >= CURRENT_DATE AND pm.proxima_manutencao <= CURRENT_DATE + INTERVAL \'7 days\'';
        } else if (status === 'proxima') {
          whereClause = 'AND pm.proxima_manutencao > CURRENT_DATE + INTERVAL \'7 days\' AND pm.proxima_manutencao <= CURRENT_DATE + INTERVAL \'30 days\'';
        }
      }

      const query = `
        SELECT 
          a.*,
          -- Conta quantas manutenções próximas este ativo tem
          COUNT(CASE WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days' 
                    AND m.proxima_manutencao IS NOT NULL THEN 1 END) as total_proximas_manutencoes,
          -- Pega a manutenção mais urgente deste ativo
          MIN(CASE WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days' 
                  THEN m.proxima_manutencao END) as proxima_manutencao_mais_urgente,
          -- Status baseado na manutenção mais urgente
          CASE 
            WHEN MIN(CASE WHEN m.proxima_manutencao < CURRENT_DATE THEN m.proxima_manutencao END) IS NOT NULL THEN 'atrasada'
            WHEN MIN(CASE WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '7 days' AND m.proxima_manutencao >= CURRENT_DATE THEN m.proxima_manutencao END) IS NOT NULL THEN 'urgente'
            WHEN MIN(CASE WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days' AND m.proxima_manutencao > CURRENT_DATE + INTERVAL '7 days' THEN m.proxima_manutencao END) IS NOT NULL THEN 'proxima'
            ELSE 'ok'
          END as status_urgencia
        FROM ativos a
        LEFT JOIN manutencoes m ON a.id = m.ativo_id
        WHERE a.usuario_id = $1 ${whereClause}
        GROUP BY a.id, a.nome, a.descricao, a.usuario_id, a.created_at, a.updated_at
        ORDER BY 
          CASE 
            WHEN MIN(CASE WHEN m.proxima_manutencao < CURRENT_DATE THEN m.proxima_manutencao END) IS NOT NULL THEN 1
            WHEN MIN(CASE WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '7 days' AND m.proxima_manutencao >= CURRENT_DATE THEN m.proxima_manutencao END) IS NOT NULL THEN 2
            WHEN MIN(CASE WHEN m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days' AND m.proxima_manutencao > CURRENT_DATE + INTERVAL '7 days' THEN m.proxima_manutencao END) IS NOT NULL THEN 3
            ELSE 4
          END,
          MIN(m.proxima_manutencao) ASC NULLS LAST,
          a.nome ASC
        `;

      const result = await pool.query(query, params);
      const ativos: AtivoComManutencao[] = result.rows;

      res.json(ativos);
    } catch (error) {
      console.error('Erro ao obter ativos com manutenções:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }

  async obterEstatisticas(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.userId;

      const query = `
        SELECT 
          COUNT(DISTINCT a.id) as total_ativos,
          COUNT(m.id) as total_manutencoes,
          COUNT(CASE WHEN m.data_realizada >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as manutencoes_ultimo_mes,
          COUNT(CASE WHEN m.proxima_manutencao IS NOT NULL AND m.proxima_manutencao <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as manutencoes_proximos_30_dias
        FROM ativos a
        LEFT JOIN manutencoes m ON a.id = m.ativo_id
        WHERE a.usuario_id = $1
      `;

      const result = await pool.query(query, [usuarioId]);
      const estatisticas = result.rows[0];

      res.json(estatisticas);
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  }
}

export default new DashboardController();