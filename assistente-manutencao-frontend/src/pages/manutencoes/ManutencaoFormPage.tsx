import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Box, Typography, Alert, Breadcrumbs, Link as MuiLink } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { manutencoesService } from '../../services/manutencoes';
import { useApi } from '../../hooks/useApi';
import { ManutencaoForm } from '../../components/forms/ManutencaoForm';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Manutencao, CriarManutencaoDto, AtualizarManutencaoDto } from '../../types';
import { ROUTES } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext'; // <<< IMPORTAR

export default function ManutencaoFormPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const isEditing = !!id;
    const { showNotification } = useNotification(); // <<< USAR O HOOK

    const queryParams = new URLSearchParams(location.search);
    const ativoIdFromQuery = queryParams.get('ativo');
    const rotaRetornoPadrao = isEditing && ativoIdFromQuery ? ROUTES.ATIVOS_DETAIL(ativoIdFromQuery) : ROUTES.MANUTENCOES;
    const rotaRetorno = queryParams.get('retorno') || rotaRetornoPadrao;

    const [manutencaoParaEdicao, setManutencaoParaEdicao] = useState<Manutencao | undefined>();

    const {
        loading: loadingGet, error: errorGet, execute: carregarManutencaoApiExecute, reset: resetGetApiState
    } = useApi<Manutencao>();
    const {
        loading: loadingSave,
        // error: errorSave, // Erro de save será notificação
        execute: executarSaveApiExecute,
        reset: resetSaveApiState
    } = useApi();

    const fetchManutencaoParaEdicao = useCallback(() => {
        if (isEditing && id) {
            resetGetApiState();
            carregarManutencaoApiExecute(() => manutencoesService.buscarManutencao(parseInt(id)))
                .then(data => setManutencaoParaEdicao(data))
                .catch(err => {
                    console.error("Erro ao buscar manutenção para edição:", err);
                    showNotification(err.message || 'Falha ao carregar manutenção para edição.', 'error');
                });
        }
    }, [id, isEditing, carregarManutencaoApiExecute, resetGetApiState, showNotification]);

    useEffect(() => {
        fetchManutencaoParaEdicao();
    }, [fetchManutencaoParaEdicao]);

    const handleSubmitForm = async (dados: CriarManutencaoDto | AtualizarManutencaoDto) => {
        resetSaveApiState();
        try {
            const successMessage = isEditing ? 'Manutenção atualizada com sucesso!' : 'Manutenção criada com sucesso!';
            if (isEditing && id && manutencaoParaEdicao) {
                await executarSaveApiExecute(() => manutencoesService.atualizarManutencao(parseInt(id), dados as AtualizarManutencaoDto));
            } else {
                await executarSaveApiExecute(() => manutencoesService.criarManutencao(dados as CriarManutencaoDto));
            }
            showNotification(successMessage, 'success'); // <<< NOTIFICAÇÃO DE SUCESSO
            navigate(rotaRetorno, { replace: true });
        } catch (error: any) {
            console.error("Erro ao salvar manutenção na página:", error);
            showNotification(error.message || 'Falha ao salvar manutenção.', 'error'); // <<< NOTIFICAÇÃO DE ERRO
        }
    };

    const handleCancel = () => navigate(rotaRetorno, { replace: true });

    if (isEditing && loadingGet) return <LoadingSpinner message="Carregando manutenção..." />;
    if (isEditing && errorGet && !loadingGet && !manutencaoParaEdicao) {
        return <Box p={3}><Alert severity="error" onClose={resetGetApiState}>Erro ao carregar: {errorGet}</Alert></Box>;
    }
    if (isEditing && !manutencaoParaEdicao && !loadingGet && !errorGet) {
        return <Box p={3}><Alert severity="warning">Manutenção não encontrada.</Alert></Box>;
    }

    return (
        <Box p={3}>
            <Breadcrumbs sx={{ mb: 3 }}>
                <MuiLink color="inherit" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(rotaRetorno); }}
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                > <ArrowBackIcon fontSize="small" /> {queryParams.get('retorno') || (isEditing && ativoIdFromQuery) ? 'Voltar ao Ativo' : 'Manutenções'} </MuiLink>
                <Typography color="text.primary">{isEditing ? 'Editar Manutenção' : 'Nova Manutenção'}</Typography>
            </Breadcrumbs>
            <Box maxWidth="md">
                <Typography variant="h4" component="h1" gutterBottom>
                    {isEditing && manutencaoParaEdicao ? `Editar: ${manutencaoParaEdicao.tipo_servico}` : 'Registrar Nova Manutenção'}
                </Typography>
                {/* errorSave não é mais exibido aqui como Alert */}
                <ManutencaoForm
                    manutencao={manutencaoParaEdicao}
                    ativoIdSelecionado={!isEditing && ativoIdFromQuery ? parseInt(ativoIdFromQuery) : undefined}
                    onSubmit={handleSubmitForm}
                    onCancel={handleCancel}
                    loading={loadingSave}
                />
            </Box>
        </Box>
    );
}