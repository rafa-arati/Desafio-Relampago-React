# 🔧 Assistente de Manutenção de Ativos

Um sistema completo para gerenciamento de ativos e suas manutenções, desenvolvido para o **Desafio Relâmpago 3**. O sistema permite cadastrar equipamentos e veículos, registrar manutenções realizadas, agendar manutenções futuras e receber alertas sobre manutenções próximas ou atrasadas.

## 📋 Sobre o Projeto

O Assistente de Manutenção resolve o problema comum de esquecimento de manutenções importantes em equipamentos e veículos. Com ele, você pode:

- **📦 Cadastrar Ativos**: Registre seus equipamentos, veículos e máquinas
- **🔧 Gerenciar Manutenções**: Registre o que foi feito e quando deve ser feito novamente
- **⚠️ Alertas Inteligentes**: Receba notificações sobre manutenções próximas ou atrasadas
- **📊 Dashboard Completo**: Visualize o status geral dos seus ativos
- **📱 Interface Moderna**: Design responsivo e intuitivo

## 🛠️ Tecnologias Utilizadas

### Backend
- **Node.js** com **TypeScript**
- **Express.js** para API REST
- **PostgreSQL** como banco de dados
- **JWT** para autenticação
- **bcrypt** para criptografia de senhas
- **pg** para conexão direta com PostgreSQL

### Frontend
- **React 18** com **TypeScript**
- **Material-UI (MUI)** para componentes de interface
- **React Router** para navegação
- **Axios** para requisições HTTP
- **date-fns** para manipulação de datas
- **Vite** como bundler

## 📁 Estrutura do Projeto

```
assistente-manutencao/
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── controllers/       # Controladores da API
│   │   ├── database/          # Configuração e migrações do BD
│   │   ├── middleware/        # Middlewares de autenticação
│   │   ├── routes/           # Definição das rotas
│   │   ├── types/            # Tipos TypeScript
│   │   └── server.ts         # Servidor principal
│   └── package.json
│
├── assistente-manutencao-frontend/  # Aplicação React
│   ├── src/
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── contexts/         # Contextos React (Auth, Theme, etc)
│   │   ├── hooks/            # Hooks customizados
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── services/         # Serviços de API
│   │   ├── theme/            # Configuração de tema MUI
│   │   ├── types/            # Tipos TypeScript
│   │   └── utils/            # Utilitários
│   └── package.json
│
└── README.md
```

## 🚀 Funcionalidades Principais

### 1. **Sistema de Autenticação**
- Registro e login de usuários
- Senhas criptografadas com bcrypt
- JWT para sessões seguras
- Cada usuário vê apenas seus próprios dados

### 2. **Gestão de Ativos**
- Cadastro de equipamentos, veículos e máquinas
- Informações detalhadas (nome, descrição, localização)
- Histórico completo de cada ativo
- Interface para edição e exclusão

### 3. **Controle de Manutenções**
- Registro de manutenções realizadas
- Agendamento de próximas manutenções
- Descrições detalhadas dos serviços
- Histórico cronológico por ativo

### 4. **Dashboard Inteligente**
- **Manutenções Atrasadas**: Destaque vermelho para urgência máxima
- **Manutenções Urgentes**: Alerta laranja para próximos 7 dias
- **Manutenções Próximas**: Aviso azul para próximos 30 dias
- **Estatísticas**: Total de ativos e manutenções realizadas no mês

### 5. **Sistema de Alertas**
- Status visual por cores (vermelho/laranja/azul/verde)
- Filtros por urgência no dashboard
- Contadores em tempo real
- Navegação direta para detalhes

## 🔧 Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **PostgreSQL** 12+
- **npm** ou **yarn**

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd assistente-manutencao
```

### 2. Configuração do Banco de Dados

Crie um banco PostgreSQL:

```sql
CREATE DATABASE assistente_manutencao;
```

### 3. Configuração do Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend`:

```env
# Configurações do Servidor
PORT=3001
NODE_ENV=development

# Configurações do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=assistente_manutencao
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT Secret (use uma chave forte em produção)
JWT_SECRET=sua_chave_super_secreta_aqui

# CORS Origins
CORS_ORIGINS=http://localhost:5173
```

Execute as migrações:

```bash
npm run migrate
```

Inicie o servidor:

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3001`

### 4. Configuração do Frontend

```bash
cd assistente-manutencao-frontend
npm install
```

Crie o arquivo `.env` na pasta raiz do frontend:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Assistente de Manutenção
```

Inicie o frontend:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## 📖 Como Usar

### 1. **Primeiro Acesso**
1. Acesse `http://localhost:5173`
2. Clique em "Criar conta" 
3. Preencha seus dados e faça login

### 2. **Cadastrando Ativos**
1. No menu lateral, clique em "Ativos"
2. Clique no botão "+ Novo Ativo"
3. Preencha nome e descrição do equipamento
4. Salve para adicionar à sua lista

### 3. **Registrando Manutenções**
1. Clique em um ativo para ver seus detalhes
2. Clique em "Nova Manutenção"
3. Preencha:
   - **Tipo de Serviço**: Ex: "Troca de óleo"
   - **Data Realizada**: Quando foi feito
   - **Descrição**: Detalhes do que foi feito
   - **Próxima Manutenção**: Quando deve ser feita novamente
4. Salve para adicionar ao histórico

### 4. **Acompanhando o Dashboard**
- **Cards no topo**: Mostram totais e alertas
- **Lista de ativos**: Ordenada por urgência
- **Filtros**: Clique nos botões para filtrar por status
- **Cores dos status**:
  - 🔴 **Vermelho**: Manutenção atrasada
  - 🟠 **Laranja**: Manutenção urgente (7 dias)
  - 🔵 **Azul**: Manutenção próxima (30 dias)
  - 🟢 **Verde**: Tudo em dia

## 🎯 Principais Desafios Resolvidos

### 1. **Problema da "Condição de Corrida"**
- **Problema**: Quando usuário navega rapidamente entre ativos, requisições podem chegar fora de ordem
- **Solução**: Implementado sistema de cleanup no `useEffect` que ignora respostas de requisições obsoletas

### 2. **Cálculo Inteligente de Urgência**
- **Algoritmo**: Sistema classifica automaticamente baseado em dias até a próxima manutenção
- **Implementação**: Query SQL otimizada que calcula status diretamente no banco

### 3. **Interface Responsiva e Acessível**
- **Problema**: Sistema precisa funcionar bem em desktop e mobile
- **Solução**: Material-UI com breakpoints responsivos e navegação adaptativa

### 4. **Gerenciamento de Estado Complexo**
- **Desafio**: Sincronizar dados entre dashboard, listas e formulários
- **Solução**: Context API para autenticação, hooks customizados para API, e sistema de notificações global

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Hash de Senhas**: bcrypt com salt rounds altos
- **Validação de Dados**: Validação completa no frontend e backend
- **Proteção de Rotas**: Middleware de autenticação em todas as rotas protegidas
- **Sanitização**: Dados limpos e validados antes de persistir

## 📱 Recursos de UX/UI

- **Tema Claro/Escuro**: Alternância completa de temas
- **Notificações Toast**: Feedback visual para todas as ações
- **Loading States**: Indicadores de carregamento em todas as operações
- **Estados Vazios**: Telas informativas quando não há dados
- **Confirmações**: Diálogos de confirmação para ações destrutivas
- **Breadcrumbs**: Navegação clara entre seções

## 🚀 Deploy

### Backend (Produção)

```bash
cd backend
npm run build
npm start
```

### Frontend (Build)

```bash
cd assistente-manutencao-frontend
npm run build
```

## 🤝 Dados de Exemplo

O sistema inclui dados de exemplo que são inseridos automaticamente na primeira execução:

- **Usuário**: `usuario@exemplo.com`
- **Senha**: `123456`
- **Ativos**: Carro Honda Civic, Ar Condicionado
- **Manutenções**: Exemplos com diferentes status de urgência

## 📄 API Endpoints

### Autenticação
- `POST /api/auth/registrar` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/perfil` - Obter perfil do usuário

### Dashboard
- `GET /api/dashboard/resumo` - Estatísticas gerais
- `GET /api/dashboard/ativos` - Ativos com status de manutenção

### Ativos
- `GET /api/ativos` - Listar ativos do usuário
- `POST /api/ativos` - Criar novo ativo
- `GET /api/ativos/:id` - Detalhes de um ativo
- `PUT /api/ativos/:id` - Atualizar ativo
- `DELETE /api/ativos/:id` - Excluir ativo

### Manutenções
- `GET /api/manutencoes` - Listar manutenções
- `POST /api/manutencoes` - Registrar nova manutenção
- `GET /api/manutencoes/:id` - Detalhes de uma manutenção
- `PUT /api/manutencoes/:id` - Atualizar manutenção
- `DELETE /api/manutencoes/:id` - Excluir manutenção

## 👨‍💻 Desenvolvimento

### Scripts Disponíveis

**Backend:**
```bash
npm run dev          # Servidor em modo desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção
npm run migrate      # Executa migrações do banco
npm run migrate:reset # Reset completo do banco
```

**Frontend:**
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linting do código
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**
   - Verifique se o PostgreSQL está rodando
   - Confirme as credenciais no arquivo `.env`

2. **Token inválido**
   - Faça logout e login novamente
   - Verifique se JWT_SECRET está configurado

3. **CORS errors**
   - Verifique se CORS_ORIGINS inclui a URL do frontend

4. **Migrações falhando**
   - Execute `npm run migrate:reset` para reset completo


## 📧 Suporte

Para dúvidas e suporte:
- Abra uma issue no repositório
- Consulte a documentação técnica nos comentários do código

---

**Desenvolvido para o Desafio Relâmpago 3** - Um sistema completo de manutenção de ativos com foco na experiência do usuário e robustez técnica.