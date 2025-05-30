import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioSemSenha, JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
    userId?: number;
    user?: UsuarioSemSenha;
}

export const verificarToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({ message: 'Token de acesso requerido' });
            return;
        }

        // Importação dinâmica para evitar dependência circular
        const { AuthController } = require('../controllers/authController');

        // Verificar se o token foi revogado (logout)
        if (AuthController.isTokenRevogado(token)) {
            res.status(401).json({
                message: 'Token foi revogado. Faça login novamente.',
                code: 'TOKEN_REVOKED'
            });
            return;
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-aqui';
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({
                message: 'Token expirado',
                code: 'TOKEN_EXPIRED'
            });
        } else if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                message: 'Token inválido',
                code: 'TOKEN_INVALID'
            });
        } else {
            res.status(401).json({ message: 'Erro na autenticação' });
        }
    }
};