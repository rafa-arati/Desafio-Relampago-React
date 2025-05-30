import { pool } from './config';

async function executarMigracoes(): Promise<void> {
  try {
    console.log('🚀 Iniciando migrações do Assistente de Manutenção...\n');

    // ==========================================
    // 1. TABELA DE USUÁRIOS
    // ==========================================
    console.log('📋 Criando tabela usuarios...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha VARCHAR(255) NOT NULL,
        nome VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela usuarios criada');

    // ==========================================
    // 2. TABELA DE ATIVOS
    // ==========================================
    console.log('📋 Criando tabela ativos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ativos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        descricao TEXT,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela ativos criada');

    // ==========================================
    // 3. TABELA DE MANUTENÇÕES
    // ==========================================
    console.log('📋 Criando tabela manutencoes...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS manutencoes (
        id SERIAL PRIMARY KEY,
        ativo_id INTEGER NOT NULL REFERENCES ativos(id) ON DELETE CASCADE,
        tipo_servico VARCHAR(255) NOT NULL,
        data_realizada DATE NOT NULL,
        descricao TEXT,
        proxima_manutencao DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Tabela manutencoes criada');

    // ==========================================
    // 4. ÍNDICES PARA PERFORMANCE
    // ==========================================
    console.log('📋 Criando índices...');

    // Índices essenciais para as consultas do dashboard e controllers
    await pool.query('CREATE INDEX IF NOT EXISTS idx_ativos_usuario_id ON ativos(usuario_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_manutencoes_ativo_id ON manutencoes(ativo_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_manutencoes_proxima_manutencao ON manutencoes(proxima_manutencao)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_manutencoes_data_realizada ON manutencoes(data_realizada)');

    console.log('✓ Índices criados');

    // ==========================================
    // 5. VERIFICAR ESTRUTURA CRIADA
    // ==========================================
    console.log('📋 Verificando estrutura...');

    const tabelas = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('usuarios', 'ativos', 'manutencoes')
      ORDER BY table_name
    `);

    const tabelasEncontradas = tabelas.rows.map(row => row.table_name);
    console.log('✓ Tabelas encontradas:', tabelasEncontradas.join(', '));

    // ==========================================
    // 6. INSERIR DADOS DE EXEMPLO (OPCIONAL)
    // ==========================================
    const usuariosExistentes = await pool.query('SELECT COUNT(*) FROM usuarios');
    const totalUsuarios = parseInt(usuariosExistentes.rows[0].count);

    if (totalUsuarios === 0) {
      console.log('📋 Inserindo dados de exemplo...');

      // Usuário de exemplo (senha: 123456)
      const senhaHashExemplo = '$2b$12$rMYSNPHTBx4wjJYXDxqMa.OqmV8W.GxKjJCv5P7JcJKcNcZyQHnue'; // hash de "123456"

      const novoUsuario = await pool.query(`
        INSERT INTO usuarios (email, senha, nome, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id
      `, ['usuario@exemplo.com', senhaHashExemplo, 'Usuário de Exemplo']);

      const usuarioId = novoUsuario.rows[0].id;

      // Ativos de exemplo
      const ativo1 = await pool.query(`
        INSERT INTO ativos (nome, descricao, usuario_id, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id
      `, ['Carro - Honda Civic', 'Honda Civic 2020, placa ABC-1234', usuarioId]);

      const ativo2 = await pool.query(`
        INSERT INTO ativos (nome, descricao, usuario_id, created_at, updated_at)
        VALUES ($1, $2, $3, NOW(), NOW())
        RETURNING id
      `, ['Ar Condicionado Escritório', 'Ar condicionado split 12.000 BTUs da sala principal', usuarioId]);

      // Manutenções de exemplo
      await pool.query(`
        INSERT INTO manutencoes (ativo_id, tipo_servico, data_realizada, descricao, proxima_manutencao, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [
        ativo1.rows[0].id,
        'Troca de óleo e filtro',
        '2024-12-01',
        'Realizada troca de óleo 5W30 e filtro de óleo',
        '2025-06-01'
      ]);

      await pool.query(`
        INSERT INTO manutencoes (ativo_id, tipo_servico, data_realizada, descricao, proxima_manutencao, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [
        ativo2.rows[0].id,
        'Limpeza filtros e gás',
        '2024-11-15',
        'Limpeza dos filtros e verificação do gás refrigerante',
        '2025-05-15'
      ]);

      // Manutenção próxima (urgente para testar dashboard)
      await pool.query(`
        INSERT INTO manutencoes (ativo_id, tipo_servico, data_realizada, descricao, proxima_manutencao, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [
        ativo1.rows[0].id,
        'Revisão geral',
        '2024-10-01',
        'Revisão completa do veículo',
        '2025-06-01' // Próxima manutenção em breve
      ]);

      console.log('✓ Dados de exemplo inseridos');
      console.log('  📧 Email: usuario@exemplo.com');
      console.log('  🔑 Senha: 123456');
      console.log('  📋 2 ativos criados com manutenções');
    } else {
      console.log('✓ Dados já existem, pulando inserção de exemplos');
    }

    console.log('\n🎉 Migrações concluídas com sucesso!');
    console.log('📊 Estrutura do banco pronta para o Assistente de Manutenção');

  } catch (error) {
    console.error('\n❌ Erro ao executar migrações:', error);
    throw error;
  }
}

// Função para reverter migrações (útil para desenvolvimento)
async function reverterMigracoes(): Promise<void> {
  try {
    console.log('⚠️  Revertendo migrações...');

    await pool.query('DROP TABLE IF EXISTS manutencoes CASCADE');
    await pool.query('DROP TABLE IF EXISTS ativos CASCADE');
    await pool.query('DROP TABLE IF EXISTS usuarios CASCADE');

    console.log('✓ Todas as tabelas removidas');
  } catch (error) {
    console.error('❌ Erro ao reverter migrações:', error);
    throw error;
  }
}

// Executar migrações se o arquivo for executado diretamente
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--reset')) {
    // npm run migrate -- --reset
    reverterMigracoes()
      .then(() => executarMigracoes())
      .then(() => {
        console.log('\n✨ Reset completo realizado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Falha no reset:', error);
        process.exit(1);
      });
  } else {
    // npm run migrate
    executarMigracoes()
      .then(() => {
        console.log('\n✨ Processo de migração finalizado!');
        process.exit(0);
      })
      .catch((error) => {
        console.error('\n💥 Falha na migração:', error);
        process.exit(1);
      });
  }
}

export { executarMigracoes, reverterMigracoes };