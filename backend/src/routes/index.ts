import { Router } from 'express';
import ativosController from '../controllers/ativosController';
import manutencoesController from '../controllers/manutencoesController';
import dashboardController from '../controllers/dashboardController';
import authController from '../controllers/authController';
import { verificarToken } from '../middleware/auth';

const router = Router();

// ==========================================
// ROTAS DE AUTENTICAÇÃO (NÃO PROTEGIDAS)
// ==========================================
router.post('/auth/registrar', authController.registrar);
router.post('/auth/login', authController.login);

// ==========================================
// ROTAS DE AUTENTICAÇÃO (PROTEGIDAS)
// ==========================================
router.get('/auth/perfil', verificarToken, authController.obterPerfil);
router.put('/auth/perfil', verificarToken, authController.atualizarPerfil);
router.put('/auth/alterar-senha', verificarToken, authController.alterarSenha);
router.post('/auth/logout', verificarToken, authController.logout); 

// ==========================================
// ROTAS DO DASHBOARD (PROTEGIDAS)
// ==========================================
router.get('/dashboard/resumo', verificarToken, dashboardController.obterResumo);
router.get('/dashboard/ativos', verificarToken, dashboardController.obterAtivosComManutencoes);
router.get('/dashboard/estatisticas', verificarToken, dashboardController.obterEstatisticas);

// ==========================================
// ROTAS DE ATIVOS (PROTEGIDAS)
// ==========================================
router.get('/ativos', verificarToken, ativosController.listarAtivos);
router.get('/ativos/:id', verificarToken, ativosController.buscarAtivoPorId);
router.post('/ativos', verificarToken, ativosController.criarAtivo);
router.put('/ativos/:id', verificarToken, ativosController.atualizarAtivo);
router.delete('/ativos/:id', verificarToken, ativosController.deletarAtivo);

// ==========================================
// ROTAS DE MANUTENÇÕES (PROTEGIDAS)
// ==========================================
router.get('/manutencoes', verificarToken, manutencoesController.listarManutencoes);
router.get('/manutencoes/:id', verificarToken, manutencoesController.buscarManutencaoPorId);
router.post('/manutencoes', verificarToken, manutencoesController.criarManutencao);
router.put('/manutencoes/:id', verificarToken, manutencoesController.atualizarManutencao);
router.delete('/manutencoes/:id', verificarToken, manutencoesController.deletarManutencao);

// Rota especial: listar manutenções de um ativo específico
router.get('/ativos/:ativoId/manutencoes', verificarToken, manutencoesController.listarManutencoesPorAtivo);

export default router;