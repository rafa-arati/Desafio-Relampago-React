import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './database/config';
import { executarMigracoes } from './database/migration';
import routes from './routes';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES GLOBAIS
// ==========================================
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de log das requisições
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ==========================================
// ROTAS DA API
// ==========================================
// Rota de teste para verificar se o servidor está funcionando
app.get('/api/health', (req, res) => {
    res.json({
        message: 'Servidor do Assistente de Manutenção funcionando!',
        timestamp: new Date().toISOString(),
        status: 'ok',
        version: '1.0.0'
    });
});

// Todas as rotas da API (incluindo auth)
app.use('/api', routes);

// ==========================================
// MIDDLEWARES DE ERRO
// ==========================================
// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

// ==========================================
// INICIALIZAÇÃO DO SERVIDOR
// ==========================================
async function iniciarServidor(): Promise<void> {
    try {
        console.log('🔧 Assistente de Manutenção - Backend');
        console.log('=====================================');

        // Testar conexão com o banco
        await pool.query('SELECT NOW()');
        console.log('✓ Conexão com PostgreSQL estabelecida');

        // Executar migrações
        await executarMigracoes();
        console.log('✓ Migrações executadas');

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('\n🚀 Servidor iniciado com sucesso!');
            console.log(`📍 Porta: ${PORT}`);
            console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
            console.log('\n📚 Endpoints disponíveis:');
            console.log('┌─ Autenticação:');
            console.log('│  ├─ POST /api/auth/registrar');
            console.log('│  ├─ POST /api/auth/login');
            console.log('│  ├─ GET  /api/auth/perfil');
            console.log('│  └─ PUT  /api/auth/alterar-senha');
            console.log('├─ Dashboard:');
            console.log('│  ├─ GET  /api/dashboard/resumo');
            console.log('│  ├─ GET  /api/dashboard/ativos');
            console.log('│  └─ GET  /api/dashboard/estatisticas');
            console.log('├─ Ativos:');
            console.log('│  ├─ GET    /api/ativos');
            console.log('│  ├─ POST   /api/ativos');
            console.log('│  ├─ GET    /api/ativos/:id');
            console.log('│  ├─ PUT    /api/ativos/:id');
            console.log('│  └─ DELETE /api/ativos/:id');
            console.log('└─ Manutenções:');
            console.log('   ├─ GET    /api/manutencoes');
            console.log('   ├─ POST   /api/manutencoes');
            console.log('   ├─ GET    /api/manutencoes/:id');
            console.log('   ├─ PUT    /api/manutencoes/:id');
            console.log('   ├─ DELETE /api/manutencoes/:id');
            console.log('   └─ GET    /api/ativos/:id/manutencoes');
            console.log('\n✨ Pronto para receber requisições!\n');
        });
    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
}

// ==========================================
// TRATAMENTO DE SINAIS DE TÉRMINO
// ==========================================
process.on('SIGINT', async () => {
    console.log('\n⚠️  Recebido SIGINT. Fechando servidor graciosamente...');
    await pool.end();
    console.log('✓ Conexões fechadas');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⚠️  Recebido SIGTERM. Fechando servidor graciosamente...');
    await pool.end();
    console.log('✓ Conexões fechadas');
    process.exit(0);
});

// Inicializar o servidor
iniciarServidor();

export default app;