import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Breadcrumbs, Link as MuiLink, Alert } from '@mui/material'; // Alert pode ser mantido para erros de carregamento
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { ativosService } from '../../services/ativos';
import { useApi } from '../../hooks/useApi';
import { AtivoForm } from '../../components/forms/AtivoForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Ativo, CriarAtivoDto, AtualizarAtivoDto } from '../../types';
import { ROUTES } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext'; // <<< IMPORTAR

export default function AtivoFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditing = !!id;
    const { showNotification } = useNotification(); // <<< USAR O HOOK

    const [ativoParaEdicao, setAtivoParaEdicao] = useState<Ativo | undefined>();

    const {
        loading: loadingGet, error: errorGet, execute: carregarAtivoExecute, reset: resetGetApi
    } = useApi<Ativo>();
    const {
        loading: loadingSave,
        // error: errorSave, // Erro de save será mostrado pela notificação
        execute: executarSave,
        reset: resetSaveApi
    } = useApi<Ativo>();

    const fetchAtivoParaEdicao = useCallback(() => {
        if (isEditing && id) {
            resetGetApi();
            carregarAtivoExecute(() => ativosService.buscarAtivo(parseInt(id)))
                .then(data => setAtivoParaEdicao(data))
                .catch(err => {
                    console.error("Erro ao buscar ativo para edição:", err);
                    showNotification(err.message || 'Falha ao carregar ativo para edição.', 'error');
                });
        }
    }, [id, isEditing, carregarAtivoExecute, resetGetApi, showNotification]);

    useEffect(() => {
        fetchAtivoParaEdicao();
    }, [fetchAtivoParaEdicao]);

    const handleSubmit = async (dadosFormulario: CriarAtivoDto | AtualizarAtivoDto) => {
        resetSaveApi();
        try {
            let savedAtivo;
            const successMessage = isEditing ? 'Ativo atualizado com sucesso!' : 'Ativo criado com sucesso!';

            if (isEditing && id) {
                savedAtivo = await executarSave(
                    () => ativosService.atualizarAtivo(parseInt(id), dadosFormulario as AtualizarAtivoDto)
                );
            } else {
                savedAtivo = await executarSave(
                    () => ativosService.criarAtivo(dadosFormulario as CriarAtivoDto)
                );
            }

            if (savedAtivo) {
                showNotification(successMessage, 'success'); // <<< NOTIFICAÇÃO DE SUCESSO
                navigate(ROUTES.ATIVOS, { replace: true });
            }
        } catch (error: any) {
            console.error('Erro ao salvar ativo (AtivoFormPage):', error);
            showNotification(error.message || 'Falha ao salvar ativo. Tente novamente.', 'error'); // <<< NOTIFICAÇÃO DE ERRO
        }
    };

    const handleCancel = () => {
        navigate(ROUTES.ATIVOS);
    };

    if (isEditing && loadingGet) return <LoadingSpinner message="Carregando ativo..." />;
    if (isEditing && errorGet && !loadingGet && !ativoParaEdicao) {
        // Para erro de carregamento inicial, um Alert na página ainda pode ser útil
        return <Box p={3}><Alert severity="error" onClose={resetGetApi}>Erro ao carregar dados do ativo: {errorGet}</Alert></Box>;
    }
    if (isEditing && !ativoParaEdicao && !loadingGet && !errorGet) {
        return <Box p={3}><Alert severity="warning">Ativo para edição não encontrado.</Alert></Box>;
    }

    return (
        <Box p={3}>
            <Breadcrumbs sx={{ mb: 3 }}>
                <MuiLink color="inherit" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(ROUTES.ATIVOS); }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                > <ArrowBackIcon fontSize="small" /> Ativos </MuiLink>
                <Typography color="text.primary"> {isEditing && ativoParaEdicao ? `Editar: ${ativoParaEdicao.nome}` : 'Novo Ativo'} </Typography>
            </Breadcrumbs>
            <Box maxWidth="md">
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditing && ativoParaEdicao ? `Editar Ativo: ${ativoParaEdicao.nome}` : 'Criar Novo Ativo'}
                </Typography>
                {/* O erro de 'save' (errorSave) não precisa mais ser exibido aqui como Alert se o Snackbar cuida disso */}
                <AtivoForm
                    ativo={ativoParaEdicao}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    loading={loadingSave}
                />
            </Box>
        </Box>
    );
}