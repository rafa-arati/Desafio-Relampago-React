import React from 'react';
import { Box, Typography, Paper, Grid, Divider, Alert } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { PerfilForm } from '../../components/forms/PerfilForm';
import { AlterarSenhaForm } from '../../components/forms/AlterarSenhaForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AtualizarPerfilDto, AlterarSenhaDto } from '../../types';
import { useApi } from '../../hooks/useApi'; // Para encapsular as chamadas de update

const PerfilPage: React.FC = () => {
    const { usuario, updatePerfil, alterarSenha, isLoading: authLoading } = useAuth();

    // Hook para atualizar perfil
    const {
        loading: loadingUpdatePerfil,
        error: errorUpdatePerfil,
        execute: executarUpdatePerfil,
        reset: resetUpdatePerfilError
    } = useApi();

    // Hook para alterar senha
    const {
        loading: loadingAlterarSenha,
        error: errorAlterarSenha,
        execute: executarAlterarSenha,
        reset: resetAlterarSenhaError
    } = useApi();


    const handleUpdatePerfilSubmit = async (dados: AtualizarPerfilDto) => {
        resetUpdatePerfilError(); // Limpa erro anterior
        try {
            await executarUpdatePerfil(() => updatePerfil(dados));
            // Mensagem de sucesso será tratada dentro do PerfilForm
        } catch (err) {
            // Erro já estará em errorUpdatePerfil e será passado para o PerfilForm
        }
    };

    const handleAlterarSenhaSubmit = async (dados: AlterarSenhaDto) => {
        resetAlterarSenhaError(); // Limpa erro anterior
        try {
            await executarAlterarSenha(() => alterarSenha(dados));
            // Mensagem de sucesso será tratada dentro do AlterarSenhaForm
        } catch (err) {
            // Erro já estará em errorAlterarSenha e será passado para o AlterarSenhaForm
        }
    };

    if (authLoading || !usuario) {
        return <LoadingSpinner message="Carregando perfil..." />;
    }

    return (
        <Box p={{ xs: 2, sm: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Meu Perfil
            </Typography>

            <Grid container spacing={3}>
                {/* Card de Informações do Perfil */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Informações Pessoais
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <PerfilForm
                            usuario={usuario}
                            onSubmit={handleUpdatePerfilSubmit}
                            loading={loadingUpdatePerfil}
                            errorApi={errorUpdatePerfil}
                        />
                    </Paper>
                </Grid>

                {/* Card de Alteração de Senha */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" component="h2" gutterBottom>
                            Alterar Senha
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <AlterarSenhaForm
                            onSubmit={handleAlterarSenhaSubmit}
                            loading={loadingAlterarSenha}
                            errorApi={errorAlterarSenha}
                        />
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PerfilPage;