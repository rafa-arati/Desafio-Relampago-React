import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Box,
    Grid,
    Typography,
    CircularProgress,
    useTheme,
} from '@mui/material';
import { Build as BuildIcon } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoginForm } from '../../components/forms/LoginForm';
import { RegisterForm } from '../../components/forms/RegisterForm';
import { FormularioLoginData, FormularioRegistroData } from '../../types';

const LoginPage: React.FC = () => {
    const { login, register, isAuthenticated, isLoading: authIsLoading } = useAuth();
    const theme = useTheme();

    const [currentForm, setCurrentForm] = useState<'login' | 'register'>('login');
    const [error, setError] = useState<string>('');
    const [actionLoading, setActionLoading] = useState(false);

    if (!authIsLoading && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLoginSubmit = async (formData: FormularioLoginData) => {
        try {
            setError('');
            setActionLoading(true);
            await login(formData.email, formData.senha);
            // Se o login for bem-sucedido, o <Navigate> acima ou o AppContent cuidará do redirecionamento.
        } catch (err: any) {
            console.error('Erro no login (LoginPage):', err);
            const backendMessage = err.response?.data?.message;
            setError(backendMessage || err.message || 'Falha no login. Verifique suas credenciais.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRegisterSubmit = async (formData: FormularioRegistroData) => {
        if (formData.senha !== formData.confirmarSenha) {
            setError('As senhas não coincidem.');
            return;
        }
        if (formData.senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        try {
            setError('');
            setActionLoading(true);
            await register(formData.email, formData.senha, formData.nome);
        } catch (err: any) {
            console.error('Erro no registro (LoginPage):', err);
            const backendMessage = err.response?.data?.message;
            setError(backendMessage || err.message || 'Falha ao criar conta. Tente novamente.');
        } finally {
            setActionLoading(false);
        }
    };

    const switchToRegister = () => {
        setCurrentForm('register');
        setError('');
    };

    const switchToLogin = () => {
        setCurrentForm('login');
        setError('');
    };

    if (authIsLoading) {
        return (
            <Container
                maxWidth={false}
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}
            >
                <CircularProgress size={60} />
            </Container>
        );
    }

    return (
        <Container
            maxWidth={false}
            sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 4 }, px: { xs: 1, md: 2 }, bgcolor: 'background.default' }}
        >
            <Grid
                container
                spacing={0}
                sx={{ maxWidth: { xs: '100%', sm: 700, md: 900 }, boxShadow: { sm: 3 }, borderRadius: { sm: 2 }, overflow: 'hidden', bgcolor: 'background.paper' }}
            >
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'primary.contrastText', p: { xs: 3, sm: 4, md: 5 }, minHeight: { xs: 280, md: 'auto' }
                    }}
                >
                    <BuildIcon sx={{ fontSize: { xs: 50, md: 70 }, mb: 2 }} />
                    <Typography variant="h3" component="h1" gutterBottom textAlign="center" sx={{ fontWeight: 'medium', fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' } }}>
                        Assistente de Manutenção
                    </Typography>
                    <Typography variant="h6" textAlign="center" sx={{ opacity: 0.9, fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                        Gerencie seus ativos e nunca mais perca uma manutenção.
                    </Typography>
                    <Box sx={{ mt: { xs: 2, md: 3 }, textAlign: 'left', width: '100%', maxWidth: 300 }}>
                        <Typography variant="body1" sx={{ mb: 1, opacity: 0.85 }}>✅ Cadastre equipamentos e veículos</Typography>
                        <Typography variant="body1" sx={{ mb: 1, opacity: 0.85 }}>📅 Acompanhe manutenções e prazos</Typography>
                        <Typography variant="body1" sx={{ mb: 1, opacity: 0.85 }}>🔔 Receba alertas de manutenções</Typography>
                        <Typography variant="body1" sx={{ opacity: 0.85 }}>📊 Visualize histórico completo</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 2, sm: 3, md: 4 } }}>
                        {currentForm === 'login' ? (
                            <LoginForm onSubmit={handleLoginSubmit} isLoading={actionLoading} error={error} onSwitchToRegister={switchToRegister} />
                        ) : (
                            <RegisterForm onSubmit={handleRegisterSubmit} isLoading={actionLoading} error={error} onSwitchToLogin={switchToLogin} />
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default LoginPage;