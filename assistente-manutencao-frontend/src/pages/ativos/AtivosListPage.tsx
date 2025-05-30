import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, Typography, Button, Card, CardContent, CardActions, Grid,
    Stack, Alert, IconButton, Tooltip, CircularProgress // Adicionado CircularProgress
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Visibility as ViewIcon, Build as BuildIcon } from '@mui/icons-material';
import { ativosService } from '../../services/ativos';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Ativo } from '../../types';
import { formatDate } from '../../utils/date';
import { ROUTES } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext';

export default function AtivosListPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showNotification } = useNotification();
    const [ativoParaDeletar, setAtivoParaDeletar] = useState<Ativo | null>(null);

    const {
        data: ativosData, // Renomeado para evitar conflito com o estado 'ativos' se você o tivesse
        loading, error, execute: carregarAtivosExecute, reset: resetListApi
    } = useApi<Ativo[]>(ativosService.listarAtivos);

    const {
        loading: loadingDelete, execute: executarDelete, reset: resetDeleteApi
    } = useApi();

    const fetchAtivos = useCallback(() => {
        resetListApi();
        carregarAtivosExecute();
    }, [carregarAtivosExecute, resetListApi]);

    useEffect(() => {
        fetchAtivos();
    }, [fetchAtivos]);

    useEffect(() => {
        if (location.state?.message) {
            showNotification(location.state.message, 'success');
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, showNotification, navigate, location.pathname]);

    const handleNovoAtivo = () => navigate(ROUTES.ATIVOS_NOVO);
    const handleEditarAtivo = (id: number) => navigate(ROUTES.ATIVOS_EDIT(id));
    const handleVisualizarAtivo = (id: number) => navigate(ROUTES.ATIVOS_DETAIL(id));

    const handleDeletarAtivo = (ativo: Ativo) => {
        resetDeleteApi();
        setAtivoParaDeletar(ativo);
    };

    const confirmarDelete = async () => {
        if (!ativoParaDeletar) return;
        try {
            await executarDelete(() => ativosService.deletarAtivo(ativoParaDeletar.id));
            showNotification('Ativo excluído com sucesso!', 'success');
            setAtivoParaDeletar(null);
            fetchAtivos(); // Recarregar lista
        } catch (error: any) {
            showNotification(error.message || 'Falha ao excluir ativo.', 'error');
        }
    };

    const cancelarDelete = () => setAtivoParaDeletar(null);

    // Usa ativosData do useApi
    const ativos = ativosData;

    if (loading && !ativos) return <LoadingSpinner message="Carregando ativos..." />;
    if (error && !ativos && !loading) {
        return (
            <Box p={3}>
                <Alert severity="error" action={
                    // Corrigido: onClick deve chamar uma função que chama carregarAtivosExecute
                    <Button color="inherit" size="small" onClick={() => fetchAtivos()}>
                        Tentar Novamente
                    </Button>
                }>{error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Meus Ativos</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleNovoAtivo}>Novo Ativo</Button>
            </Box>

            {error && ativos && ativos.length > 0 && !loading && (
                <Alert severity="warning" sx={{ mb: 2 }} onClose={resetListApi}>
                    {`Falha ao atualizar lista: ${error}. Mostrando dados anteriores.`}
                </Alert>
            )}

            {/* Adiciona a verificação de 'ativos' antes de 'ativos.length' */}
            {!loading && (!ativos || ativos.length === 0) ? (
                <EmptyState icon={<BuildIcon />} title="Nenhum ativo cadastrado"
                    description="Comece cadastrando seus equipamentos, veículos ou outros itens que precisam de manutenção."
                    action={{ label: 'Cadastrar Primeiro Ativo', onClick: handleNovoAtivo }}
                />
            ) : (
                <Grid container spacing={3}>
                    {/* Adiciona a verificação de 'ativos' antes do map */}
                    {ativos && ativos.map((ativo) => (
                        <Grid item xs={12} sm={6} md={4} key={ativo.id}>
                            <Card>
                                <CardContent sx={{ minHeight: 120 }}> {/* Altura mínima para consistência */}
                                    <Typography variant="h6" component="h2" gutterBottom noWrap title={ativo.nome}>
                                        {ativo.nome}
                                    </Typography>
                                    {ativo.descricao && (
                                        <Typography variant="body2" color="text.secondary" title={ativo.descricao}
                                            sx={{ mb: 1, height: 40, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {ativo.descricao}
                                        </Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Criado em: {formatDate(ativo.created_at)}
                                    </Typography>
                                </CardContent>
                                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1.5, pt: 0 }}>
                                    <Stack direction="row" spacing={0.5}>
                                        <Tooltip title="Visualizar Detalhes"><IconButton size="small" onClick={() => handleVisualizarAtivo(ativo.id)}><ViewIcon /></IconButton></Tooltip>
                                        <Tooltip title="Editar Ativo"><IconButton size="small" onClick={() => handleEditarAtivo(ativo.id)}><EditIcon /></IconButton></Tooltip>
                                    </Stack>
                                    <Tooltip title="Excluir Ativo"><IconButton size="small" color="error" onClick={() => handleDeletarAtivo(ativo)}><DeleteIcon /></IconButton></Tooltip>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
            {/* Exibe um spinner de loading se estiver carregando mas já tiver alguns ativos (ex: recarregando) */}
            {loading && ativos && ativos.length > 0 && (
                <Box textAlign="center" p={2}><CircularProgress size={24} /></Box>
            )}

            <ConfirmDialog
                open={!!ativoParaDeletar} title="Confirmar Exclusão"
                message={`Tem certeza que deseja excluir o ativo "${ativoParaDeletar?.nome}"? Esta ação não pode ser desfeita e todas as manutenções relacionadas também serão removidas.`}
                confirmText="Excluir" severity="error" loading={loadingDelete}
                onConfirm={confirmarDelete} onCancel={cancelarDelete}
            />
        </Box>
    );
}