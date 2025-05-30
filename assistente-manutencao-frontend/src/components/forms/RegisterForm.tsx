import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Alert,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { FormularioRegistroData } from '../../types';

interface RegisterFormProps {
    onSubmit: (data: FormularioRegistroData) => Promise<void>;
    isLoading: boolean;
    error?: string;
    onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
    onSubmit,
    isLoading,
    error,
    onSwitchToLogin,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState<FormularioRegistroData>({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (field: keyof FormularioRegistroData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({
                ...prev,
                [field]: e.target.value
            }));

            // Limpar erro quando começar a digitar
            if (errors[field]) {
                setErrors(prev => ({
                    ...prev,
                    [field]: ''
                }));
            }
        };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.nome) {
            newErrors.nome = 'Nome é obrigatório';
        } else if (formData.nome.length < 2) {
            newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
        } else if (formData.nome.length > 100) {
            newErrors.nome = 'Nome deve ter no máximo 100 caracteres';
        }

        if (!formData.email) {
            newErrors.email = 'Email é obrigatório';
        } else if (!formData.email.includes('@')) {
            newErrors.email = 'Email deve ter um formato válido';
        }

        if (!formData.senha) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (formData.senha.length < 6) {
            newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
        }

        if (!formData.confirmarSenha) {
            newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
        } else if (formData.senha !== formData.confirmarSenha) {
            newErrors.confirmarSenha = 'As senhas não coincidem';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await onSubmit(formData);
        } catch (error) {
            // Erro já tratado no componente pai
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                Criar Conta
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                Crie sua conta para começar a usar o sistema
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Nome completo"
                value={formData.nome}
                onChange={handleChange('nome')}
                error={!!errors.nome}
                helperText={errors.nome}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <PersonIcon color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailIcon color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={formData.senha}
                onChange={handleChange('senha')}
                error={!!errors.senha}
                helperText={errors.senha}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                disabled={isLoading}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />

            <TextField
                fullWidth
                label="Confirmar senha"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmarSenha}
                onChange={handleChange('confirmarSenha')}
                error={!!errors.confirmarSenha}
                helperText={errors.confirmarSenha}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon color="action" />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 3 }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ mb: 2 }}
            >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
            </Button>

            <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    Já tem uma conta?{' '}
                    <Link
                        component="button"
                        type="button"
                        onClick={onSwitchToLogin}
                        underline="hover"
                        disabled={isLoading}
                    >
                        Entrar
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};