import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Adicionado useLocation
import {
    Box, Typography, Button, Chip, IconButton, Stack, Alert, Paper,
    List, ListItem, ListItemText, ListItemSecondaryAction, Divider, Tooltip, Pagination, CircularProgress, Link as MuiLink,
} from '@mui/material';
import {
    Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Build as BuildIcon,
    Event as EventIcon, Update as UpdateIcon, DirectionsCar as AtivoIcon,
} from '@mui/icons-material';
import { manutencoesService } from '../../services/manutencoes';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ManutencaoComAtivo, PaginationResponse, StatusUrgenciaEnum } from '../../types';
import { formatDate, getUrgencyStatus } from '../../utils/date';
import { ROUTES, STATUS_URGENCIA_COLORS, STATUS_URGENCIA_LABELS } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext'; // <<< IMPORTAR

export default function ManutencoesListPage() {
    const navigate = useNavigate();
    const location = useLocation(); // Para ler mensagens de sucesso da navegação
    const { showNotification } = useNotification(); // <<< USAR O HOOK
    const [manutencaoParaDeletar, setManutencaoParaDeletar] = useState<ManutencaoComAtivo | null>(null);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const {
        data: responseData, loading: loadingList, error: errorList,
        execute: carregarManutencoesExecute, reset: resetListApiState,
    } = useApi<PaginationResponse<ManutencaoComAtivo>>(
        () => manutencoesService.listarManutencoes({ page, limit })
    );
    const {
        loading: loadingDelete,
        // error: errorDelete, // Erro de delete será notificação
        execute: executarDelete, reset: resetDeleteApiState
    } = useApi();

    const fetchManutencoes = useCallback(() => {
        resetListApiState();
        carregarManutencoesExecute();
    }, [page, limit, carregarManutencoesExecute, resetListApiState]);

    useEffect(() => {
        fetchManutencoes();
    }, [fetchManutencoes]);

    // Exibe mensagem de sucesso vinda do state da navegação (ex: após criar/editar)
    useEffect(() => {
        if (location.state?.message) {
            showNotification(location.state.message, 'success');
            navigate(location.pathname, { replace: true, state: {} }); // Limpa o state
        }
    }, [location.state, showNotification, navigate, location.pathname]);

    const manutencoes = responseData?.data;
    const paginationInfo = responseData?.pagination;

    const handleNovaManutencao = () => navigate(ROUTES.MANUTENCOES_NOVO);
    const handleEditarManutencao = (id: number) => navigate(ROUTES.MANUTENCOES_EDIT(id));
    const handleVisualizarAtivo = (id: number) => navigate(ROUTES.ATIVOS_DETAIL(id));

    const handleDeletarManutencao = (manutencao: ManutencaoComAtivo) => {
        resetDeleteApiState();
        setManutencaoParaDeletar(manutencao);
    };

    const confirmarDelete = async () => {
        if (!manutencaoParaDeletar) return;
        try {
            await executarDelete(() => manutencoesService.deletarManutencao(manutencaoParaDeletar.id));
            showNotification('Manutenção excluída com sucesso!', 'success'); // <<< NOTIFICAÇÃO DE SUCESSO
            setManutencaoParaDeletar(null);
            if (manutencoes && manutencoes.length === 1 && page > 1) {
                setPage(prevPage => prevPage - 1);
            } else {
                fetchManutencoes();
            }
        } catch (err: any) {
            console.error("Erro ao confirmar delete na página:", err);
            showNotification(err.message || 'Falha ao excluir manutenção.', 'error'); // <<< NOTIFICAÇÃO DE ERRO
        }
    };

    // ... (resto do componente como na sua última versão, mas os Alerts de errorDelete podem ser removidos se preferir)
    // Se errorDelete for removido, o catch em confirmarDelete tratará a notificação.
    // Se mantiver o Alert para errorDelete, ele aparecerá junto com o Snackbar.
    if (loadingList && !responseData) return <LoadingSpinner message="Carregando manutenções..." />;
    if (errorList && !loadingList && !responseData) {
        return (<Box p={3}><Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchManutencoes}> Tentar Novamente </Button>}>{errorList}</Alert></Box>);
    }

    const getStatusChip = (manutencao: ManutencaoComAtivo) => {
        const status = getUrgencyStatus(manutencao.proxima_manutencao || null) as StatusUrgenciaEnum;
        return (<Chip label={STATUS_URGENCIA_LABELS[status] || 'Desconhecido'} color={STATUS_URGENCIA_COLORS[status] || 'default'} size="small" sx={{ ml: 1 }} />);
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1">Todas as Manutenções</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleNovaManutencao}> Nova Manutenção </Button>
            </Box>
            {/* ... (Alerts e JSX como antes, pode remover o Alert para errorDelete se quiser) ... */}
            {errorList && manutencoes && manutencoes.length > 0 && !loadingList && (<Alert severity="warning" sx={{ mb: 2 }} onClose={resetListApiState}> {`Falha ao atualizar a lista: ${errorList}. Mostrando dados anteriores.`} </Alert>)}
            {/* O errorDelete agora será tratado pelo Snackbar, então este Alert pode ser removido */}
            {/* {errorDelete && ( <Alert severity="error" sx={{ mb: 2 }} onClose={resetDeleteApiState}> {`Falha ao excluir: ${errorDelete}`} </Alert> )} */}

            {!loadingList && (!manutencoes || manutencoes.length === 0) ? (
                <EmptyState icon={<BuildIcon />} title="Nenhuma manutenção registrada" description="Comece registrando as manutenções dos seus ativos." action={{ label: 'Registrar Manutenção', onClick: handleNovaManutencao }} />
            ) : (
                <Paper>
                    <List>
                        {manutencoes && manutencoes.map((manutencao: ManutencaoComAtivo, index: number) => (
                            <React.Fragment key={manutencao.id}>
                                <ListItem sx={{ py: 2 }}>
                                    <ListItemText
                                        primary={<React.Fragment> {manutencao.tipo_servico} {manutencao.proxima_manutencao && getStatusChip(manutencao)} </React.Fragment>}
                                        secondary={<Stack spacing={0.5} sx={{ mt: 0.5 }}> <Box display="flex" alignItems="center" gap={1}><AtivoIcon fontSize="small" color="action" /><Typography variant="body2" color="text.secondary"> Ativo: <MuiLink component="button" onClick={() => handleVisualizarAtivo(manutencao.ativo_id)} sx={{ fontWeight: 'medium' }}>{manutencao.ativo_nome}</MuiLink></Typography></Box> <Box display="flex" alignItems="center" gap={1}><EventIcon fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">Realizada em: {formatDate(manutencao.data_realizada)}</Typography></Box> {manutencao.proxima_manutencao && (<Box display="flex" alignItems="center" gap={1}><UpdateIcon fontSize="small" color="action" /><Typography variant="body2" color="text.secondary">Próxima: {formatDate(manutencao.proxima_manutencao)}</Typography></Box>)} {manutencao.descricao && (<Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block', whiteSpace: 'pre-wrap' }}>{manutencao.descricao.length > 100 ? `${manutencao.descricao.substring(0, 100)}...` : manutencao.descricao}</Typography>)} </Stack>}
                                        primaryTypographyProps={{ component: 'div', variant: 'h6', sx: { display: 'flex', alignItems: 'center' } }}
                                        secondaryTypographyProps={{ component: 'div' }}
                                    />
                                    <ListItemSecondaryAction sx={{ opacity: 1 }}>
                                        <Tooltip title="Editar Manutenção"><IconButton onClick={() => handleEditarManutencao(manutencao.id)}><EditIcon /></IconButton></Tooltip>
                                        <Tooltip title="Excluir Manutenção"><IconButton color="error" onClick={() => handleDeletarManutencao(manutencao)}><DeleteIcon /></IconButton></Tooltip>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                {index < (manutencoes.length - 1) && <Divider component="li" />}
                            </React.Fragment>
                        ))}
                    </List>
                    {loadingList && <Box display="flex" justifyContent="center" p={2}><CircularProgress size={24} /></Box>}
                    {paginationInfo && paginationInfo.totalPages > 1 && !loadingList && (<Box display="flex" justifyContent="center" p={2} mt={2}> <Pagination count={paginationInfo.totalPages} page={page} onChange={(_event, value) => setPage(value)} color="primary" /> </Box>)}
                </Paper>
            )}
            <ConfirmDialog open={!!manutencaoParaDeletar} title="Confirmar Exclusão" message={`Tem certeza que deseja excluir a manutenção "${manutencaoParaDeletar?.tipo_servico}" do ativo "${manutencaoParaDeletar?.ativo_nome}"? Esta ação não pode ser desfeita.`} confirmText="Excluir" severity="error" loading={loadingDelete} onConfirm={confirmarDelete} onCancel={() => setManutencaoParaDeletar(null)} />
        </Box>
    );
}