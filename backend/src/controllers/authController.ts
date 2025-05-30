import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../database/config';
import { CriarUsuarioDto, LoginDto, UsuarioSemSenha, JwtPayload, Usuario } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
    private static tokensRevogados = new Set<string>();
    async registrar(req: Request, res: Response): Promise<void> {
        try {
            const dados: CriarUsuarioDto = req.body;

            // Validações
            if (!dados.email || !dados.email.includes('@')) {
                res.status(400).json({ message: 'Email válido é obrigatório' });
                return;
            }

            if (!dados.senha || dados.senha.length < 6) {
                res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
                return;
            }

            if (!dados.nome || dados.nome.trim().length === 0) {
                res.status(400).json({ message: 'Nome é obrigatório' });
                return;
            }

            // Verificar se o email já existe
            const usuarioExistente = await pool.query(
                'SELECT id FROM usuarios WHERE email = $1',
                [dados.email.toLowerCase()]
            );

            if (usuarioExistente.rows.length > 0) {
                res.status(409).json({ message: 'Email já cadastrado' });
                return;
            }

            // Hash da senha
            const saltRounds = 12;
            const senhaHash = await bcrypt.hash(dados.senha, saltRounds);

            // Criar usuário
            const result = await pool.query(
                `INSERT INTO usuarios (email, senha, nome, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, email, nome, created_at, updated_at`,
                [dados.email.toLowerCase(), senhaHash, dados.nome.trim()]
            );

            const novoUsuario: UsuarioSemSenha = result.rows[0];

            // Gerar JWT
            const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';
            const payload: JwtPayload = {
                userId: novoUsuario.id,
                email: novoUsuario.email
            };

            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

            res.status(201).json({
                message: 'Usuário criado com sucesso',
                usuario: novoUsuario,
                token
            });
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const dados: LoginDto = req.body;

            // Validações
            if (!dados.email || !dados.senha) {
                res.status(400).json({ message: 'Email e senha são obrigatórios.' }); // Mensagem mais específica
                return;
            }

            // Buscar usuário com senha
            const result = await pool.query(
                'SELECT id, email, senha, nome, created_at, updated_at FROM usuarios WHERE email = $1',
                [dados.email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                // Usuário não encontrado
                res.status(401).json({ message: 'Email ou senha inválidos.' }); // Mensagem genérica por segurança
                return;
            }

            const usuario: Usuario = result.rows[0];

            // Verificar senha
            const senhaValida = await bcrypt.compare(dados.senha, usuario.senha);
            if (!senhaValida) {
                // Senha incorreta
                res.status(401).json({ message: 'Email ou senha inválidos.' }); // Mensagem genérica por segurança
                return;
            }

            // Remover senha do objeto de usuário antes de gerar o payload do JWT
            const { senha: _, ...usuarioSemSenha } = usuario;


            // Gerar JWT
            const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';
            const payload: JwtPayload = {
                userId: usuarioSemSenha.id,
                email: usuarioSemSenha.email,
            };
            const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

            res.json({
                message: 'Login realizado com sucesso',
                usuario: usuarioSemSenha, // Enviar usuário sem a senha
                token,
            });

        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ message: 'Erro interno do servidor ao tentar fazer login.' });
        }
    }

    async obterPerfil(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;

            const result = await pool.query(
                'SELECT id, email, nome, created_at, updated_at FROM usuarios WHERE id = $1',
                [usuarioId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            const usuario: UsuarioSemSenha = result.rows[0];
            req.user = usuario; // Adiciona o usuário ao request

            res.json(usuario);
        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async atualizarPerfil(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;
            const { nome, email } = req.body;

            // Validações
            if (email && !email.includes('@')) {
                res.status(400).json({ message: 'Email inválido' });
                return;
            }

            if (nome && nome.trim().length === 0) {
                res.status(400).json({ message: 'Nome não pode ser vazio' });
                return;
            }

            // Verificar se o novo email já existe (se foi fornecido)
            if (email) {
                const emailExistente = await pool.query(
                    'SELECT id FROM usuarios WHERE email = $1 AND id != $2',
                    [email.toLowerCase(), usuarioId]
                );

                if (emailExistente.rows.length > 0) {
                    res.status(409).json({ message: 'Email já está em uso' });
                    return;
                }
            }

            // Construir query dinamicamente
            const camposParaAtualizar: string[] = [];
            const valores: any[] = [];
            let contador = 1;

            if (nome !== undefined) {
                camposParaAtualizar.push(`nome = $${contador}`);
                valores.push(nome.trim());
                contador++;
            }

            if (email !== undefined) {
                camposParaAtualizar.push(`email = $${contador}`);
                valores.push(email.toLowerCase());
                contador++;
            }

            if (camposParaAtualizar.length === 0) {
                res.status(400).json({ message: 'Nenhum campo para atualizar fornecido' });
                return;
            }

            camposParaAtualizar.push(`updated_at = NOW()`);
            valores.push(usuarioId);

            const query = `
        UPDATE usuarios 
        SET ${camposParaAtualizar.join(', ')}
        WHERE id = $${contador}
        RETURNING id, email, nome, created_at, updated_at
      `;

            const result = await pool.query(query, valores);
            const usuarioAtualizado: UsuarioSemSenha = result.rows[0];
            req.user = usuarioAtualizado; // Atualiza o usuário no request

            res.json({
                message: 'Perfil atualizado com sucesso',
                usuario: usuarioAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async alterarSenha(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const usuarioId = req.userId;
            const { senhaAtual, novaSenha } = req.body;

            // Validações
            if (!senhaAtual || !novaSenha) {
                res.status(400).json({ message: 'Senha atual e nova senha são obrigatórias' });
                return;
            }

            if (novaSenha.length < 6) {
                res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
                return;
            }

            // Buscar usuário com senha atual
            const result = await pool.query(
                'SELECT senha FROM usuarios WHERE id = $1',
                [usuarioId]
            );

            if (result.rows.length === 0) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            const usuario = result.rows[0];

            // Verificar senha atual
            const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha);

            if (!senhaAtualValida) {
                res.status(401).json({ message: 'Senha atual incorreta' });
                return;
            }

            // Hash da nova senha
            const saltRounds = 12;
            const novaSenhaHash = await bcrypt.hash(novaSenha, saltRounds);

            // Atualizar senha
            await pool.query(
                'UPDATE usuarios SET senha = $1, updated_at = NOW() WHERE id = $2',
                [novaSenhaHash, usuarioId]
            );

            res.json({ message: 'Senha alterada com sucesso' });
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {
                res.status(401).json({ message: 'Token não fornecido' });
                return;
            }

            // Adiciona o token à blacklist
            AuthController.tokensRevogados.add(token);

            console.log(`🚪 Logout realizado para usuário ID: ${req.userId}`);

            res.json({
                message: 'Logout realizado com sucesso',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    }

    // Método estático para verificar se token está revogado
    static isTokenRevogado(token: string): boolean {
        return this.tokensRevogados.has(token);
    }

    // Método para limpar tokens expirados 
    static limparTokensExpirados(): void {
        // Em uma implementação real, você verificaria a data de expiração
        // Por simplicidade, vamos limpar a cada 1000 tokens
        if (this.tokensRevogados.size > 1000) {
            this.tokensRevogados.clear();
            console.log('🧹 Cache de tokens revogados limpo');
        }
    }
}

export default new AuthController();