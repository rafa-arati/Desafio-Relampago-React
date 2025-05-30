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
    CircularProgress,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
    Lock as LockIcon,
} from '@mui/icons-material';
import { FormularioLoginData } from '../../types';

interface LoginFormProps {
    onSubmit: (data: FormularioLoginData) => Promise<void>;
    isLoading: boolean;
    error?: string;
    onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
    onSubmit,
    isLoading,
    error,
    onSwitchToRegister,
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState<FormularioLoginData>({
        email: '',
        senha: ''
    });
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const handleChange = (field: keyof FormularioLoginData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.value }));
            if (validationErrors[field]) {
                setValidationErrors(prev => ({ ...prev, [field]: '' }));
            }
            // Limpar o erro da API também, se o usuário começar a digitar
            // if (error) { /* setError(''); // Isso precisaria ser passado como prop */ }
        };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email é obrigatório.';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Formato de email inválido.';
        }
        if (!formData.senha) { // Senha não precisa de trim()
            newErrors.senha = 'Senha é obrigatória.';
        } else if (formData.senha.length < 6) {
            newErrors.senha = 'Senha deve ter pelo menos 6 caracteres.';
        }
        setValidationErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }
        // A prop onSubmit (que é handleLoginSubmit do LoginPage) fará o try-catch
        await onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Typography variant="h4" component="h1" gutterBottom textAlign="center">
                Entrar
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
                Acesse sua conta para gerenciar suas manutenções.
            </Typography>

            {/* Exibe o erro de submissão vindo da API (passado pelo LoginPage) */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => { /* setError(''); // Se você passar setError */ }}>
                    {error}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange('email')}
                error={!!validationErrors.email}
                helperText={validationErrors.email}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailIcon color={validationErrors.email ? "error" : "action"} />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 2 }}
            />
            <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.senha}
                onChange={handleChange('senha')}
                error={!!validationErrors.senha}
                helperText={validationErrors.senha}
                disabled={isLoading}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockIcon color={validationErrors.senha ? "error" : "action"} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                                disabled={isLoading}
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
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
                sx={{ mb: 2, py: 1.5 }} // Um pouco mais de padding vertical
            >
                {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
            <Box textAlign="center">
                <Typography variant="body2" color="text.secondary">
                    Não tem uma conta?{' '}
                    <Link
                        component="button"
                        type="button"
                        onClick={onSwitchToRegister}
                        underline="hover"
                        disabled={isLoading}
                    >
                        Criar conta
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};