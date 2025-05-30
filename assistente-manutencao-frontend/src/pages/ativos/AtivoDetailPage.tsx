import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box, Typography, Alert, Breadcrumbs, Link as MuiLink, Paper, Stack,
    Chip, Button, Divider, List, ListItem, ListItemText,
    ListItemSecondaryAction, IconButton, Card, CardContent, Tooltip, CircularProgress
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon, Edit as EditIcon, Delete as DeleteIcon,
    Add as AddIcon, Build as BuildIcon, Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { ativosService } from '../../services/ativos';
import { manutencoesService as manutencoesApiService } from '../../services/manutencoes';
import { useApi } from '../../hooks/useApi';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Ativo, Manutencao } from '../../types';
import { formatDate } from '../../utils/date';
import { ROUTES } from '../../utils/constants';
import { useNotification } from '../../contexts/NotificationContext'; // <<< IMPORTAR

const AtivoDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const ativoId = id ? parseInt(id) : 0;
    const { showNotification } = useNotification(); // <<< USAR O HOOK

    const [showDeleteAtivoDialog, setShowDeleteAtivoDialog] = useState(false);
    const [ativo, setAtivo] = useState<Ativo | null>(null);
    const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
    const [manutencaoParaDeletar, setManutencaoParaDeletar] = useState<Manutencao | null>(null);

    const { loading: loadingAtivo, error: errorAtivo, execute: carregarAtivoApiExecute, reset: resetAtivoApi } = useApi<Ativo>();
    const { loading: loadingManutencoes, error: errorManutencoes, execute: carregarManutencoesApiExecute, reset: resetManutencoesApi } = useApi<Manutencao[]>();
    const { loading: loadingDeleteAtivo, execute: executarDeleteAtivo, reset: resetDeleteAtivoApi } = useApi();
    const { loading: loadingDeleteManutencao, execute: executarDeleteManutencao, reset: resetDeleteManutencaoApi } = useApi();

    const fetchAtivo = useCallback(() => { /* ... como antes ... */
        if (ativoId) {
            resetAtivoApi();
            carregarAtivoApiExecute(() => ativosService.buscarAtivo(ativoId))
                .then(data => setAtivo(data || null))
                .catch((err) => {
                    setAtivo(null);
                    showNotification(err.message || 'Falha ao carregar detalhes do ativo.', 'error');
                });
        } else { setAtivo(null); }
    }, [ativoId, carregarAtivoApiExecute, resetAtivoApi, showNotification]);

    const fetchManutencoes = useCallback(() => { /* ... como antes ... */
        if (ativoId) {
            resetManutencoesApi();
            carregarManutencoesApiExecute(() => manutencoesApiService.listarManutencoesPorAtivo(ativoId))
                .then(data => setManutencoes(data || []))
                .catch((err) => {
                    setManutencoes([]);
                    showNotification(err.message || 'Falha ao carregar manutenções do ativo.', 'error');
                });
        } else { setManutencoes([]); }
    }, [ativoId, carregarManutencoesApiExecute, resetManutencoesApi, showNotification]);

    useEffect(() => { /* ... como antes ... */
        if (ativoId > 0) { fetchAtivo(); fetchManutencoes(); }
    }, [ativoId, fetchAtivo, fetchManutencoes]);

    const confirmarDeleteAtivo = async () => { /* ... como antes, mas com notificação ... */
        if (!ativoId || !ativo) return; // Adicionado !ativo para o nome na notificação
        try {
            await executarDeleteAtivo(() => ativosService.deletarAtivo(ativoId));
            showNotification(`Ativo "${ativo.nome}" excluído com sucesso!`, 'success');
            navigate(ROUTES.ATIVOS, { replace: true });
        } catch (error: any) {
            showNotification(error.message || 'Falha ao excluir ativo.', 'error');
        }
        setShowDeleteAtivoDialog(false);
    };

    const confirmarDeleteManutencao = async () => { /* ... como antes, mas com notificação ... */
        if (!manutencaoParaDeletar) return;
        try {
            await executarDeleteManutencao(() => manutencoesApiService.deletarManutencao(manutencaoParaDeletar.id));
            showNotification(`Manutenção "${manutencaoParaDeletar.tipo_servico}" excluída com sucesso!`, 'success');
            setManutencaoParaDeletar(null);
            fetchManutencoes();
        } catch (error: any) {
            showNotification(error.message || 'Falha ao excluir manutenção.', 'error');
        }
    };

    // ... (handleEditarAtivo, handleDeletarAtivo, handleNovaManutencao, handleEditarManutencao, handleDeletarManutencao como antes)
    const handleEditarAtivo = () => { if (ativoId) navigate(ROUTES.ATIVOS_EDIT(ativoId)); };
    const handleDeletarAtivo = () => { resetDeleteAtivoApi(); setShowDeleteAtivoDialog(true); };
    const handleNovaManutencao = () => { if (ativoId) navigate(`${ROUTES.MANUTENCOES_NOVO}?ativo=${ativoId}&retorno=${ROUTES.ATIVOS_DETAIL(ativoId)}`); };
    const handleEditarManutencao = (manutencaoId: number) => { if (ativoId) navigate(`${ROUTES.MANUTENCOES_EDIT(manutencaoId)}?retorno=${ROUTES.ATIVOS_DETAIL(ativoId)}`); };
    const handleDeletarManutencao = (manutencao: Manutencao) => { resetDeleteManutencaoApi(); setManutencaoParaDeletar(manutencao); };


    // Lógica de renderização e JSX como na sua última versão correta,
    // mas os Alerts para errorDeleteAtivo e errorDeleteManutencao podem ser removidos
    // se o Snackbar for suficiente.
    if (!ativoId) return <Box p={3}><Alert severity="warning">ID do ativo inválido.</Alert></Box>;
    if (loadingAtivo && !ativo) return <LoadingSpinner message="Carregando ativo..." />;
    // O errorAtivo já dispara notificação no catch do fetchAtivo
    // if (errorAtivo && !ativo && !loadingAtivo) return <Box p={3}><Alert severity="error" onClose={resetAtivoApi}>Erro ao carregar ativo: {errorAtivo}</Alert></Box>;
    if (!ativo && !loadingAtivo && !errorAtivo) return <Box p={3}><Alert severity="warning">Ativo não encontrado.</Alert></Box>;
    if (!ativo) return null; // Fallback se ativo ainda for null

    return (
        <Box p={3}>
            {/* ... (Breadcrumbs e Header do Ativo como antes) ... */}
            <Breadcrumbs sx={{ mb: 3 }}> <MuiLink color="inherit" onClick={(e: React.MouseEvent) => { e.preventDefault(); navigate(ROUTES.ATIVOS); }} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}> <ArrowBackIcon fontSize="small" /> Ativos </MuiLink> <Typography color="text.primary">{ativo.nome}</Typography> </Breadcrumbs>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}> <Box> <Typography variant="h4" component="h1" gutterBottom>{ativo.nome}</Typography> {ativo.descricao && <Typography variant="body1" color="text.secondary" paragraph>{ativo.descricao}</Typography>} </Box> <Stack direction="row" spacing={1}> <Button variant="outlined" startIcon={<EditIcon />} onClick={handleEditarAtivo}>Editar Ativo</Button> <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDeletarAtivo}>Excluir Ativo</Button> </Stack> </Box>
            {/* errorDeleteAtivo será notificação */}
            <Paper sx={{ p: 3, mb: 3 }}> <Typography variant="h6" gutterBottom>Informações do Ativo</Typography> <Stack spacing={2}> <Box><Typography variant="body2" color="text.secondary">Criado em</Typography><Typography variant="body1">{formatDate(ativo.created_at)}</Typography></Box> {ativo.updated_at !== ativo.created_at && (<Box><Typography variant="body2" color="text.secondary">Última atualização</Typography><Typography variant="body1">{formatDate(ativo.updated_at)}</Typography></Box>)} </Stack> </Paper>

            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}> <Typography variant="h6" component="h2">Histórico de Manutenções ({manutencoes?.length || 0})</Typography> <Button variant="contained" startIcon={<AddIcon />} onClick={handleNovaManutencao}>Nova Manutenção para este Ativo</Button> </Box>
                    {/* errorDeleteManutencao será notificação */}
                    {/* errorManutencoes já dispara notificação no catch do fetchManutencoes */}
                    {loadingManutencoes && manutencoes.length === 0 ? <LoadingSpinner /> // Só mostra spinner se não houver dados antigos
                        : !loadingManutencoes && (!manutencoes || manutencoes.length === 0) ? (
                            <EmptyState icon={<BuildIcon />} title="Nenhuma manutenção registrada" description="Registre as manutenções realizadas neste ativo." action={{ label: 'Registrar Primeira Manutenção', onClick: handleNovaManutencao }} />
                        ) : (
                            <List>
                                {manutencoes.map((manutencao, index) => (
                                    <React.Fragment key={manutencao.id}>
                                        <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                                            <ListItemText
                                                primary={<Box display="flex" alignItems="center" gap={1}><Typography variant="subtitle1" fontWeight="medium">{manutencao.tipo_servico}</Typography><Chip label={`Realizada em: ${formatDate(manutencao.data_realizada)}`} size="small" variant="outlined" /></Box>}
                                                secondary={<Stack spacing={0.5} sx={{ mt: 0.5 }}>{manutencao.descricao && <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{manutencao.descricao}</Typography>}{manutencao.proxima_manutencao && (<Box display="flex" alignItems="center" gap={0.5}><ScheduleIcon fontSize="inherit" color="action" sx={{ mr: 0.5 }} /><Typography variant="body2" color="text.secondary">Próxima: {formatDate(manutencao.proxima_manutencao)}</Typography></Box>)}</Stack>}
                                                primaryTypographyProps={{ component: 'div' }}
                                                secondaryTypographyProps={{ component: 'div' }}
                                            />
                                            <ListItemSecondaryAction sx={{ opacity: 1 }}><Tooltip title="Editar Manutenção"><IconButton edge="end" onClick={() => handleEditarManutencao(manutencao.id)}><EditIcon /></IconButton></Tooltip><Tooltip title="Excluir Manutenção"><IconButton edge="end" color="error" onClick={() => handleDeletarManutencao(manutencao)}><DeleteIcon /></IconButton></Tooltip></ListItemSecondaryAction>
                                        </ListItem>
                                        {index < manutencoes.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    {loadingManutencoes && manutencoes.length > 0 && <Box textAlign="center" p={2}><CircularProgress size={24} /></Box>}
                </CardContent>
            </Card>
            <ConfirmDialog open={showDeleteAtivoDialog} title="Confirmar Exclusão do Ativo" message={ativo ? `Tem certeza que deseja excluir o ativo "${ativo.nome}"? Todas as manutenções relacionadas também serão removidas.` : "Tem certeza que deseja excluir este ativo?"} confirmText="Excluir Ativo" severity="error" loading={loadingDeleteAtivo} onConfirm={confirmarDeleteAtivo} onCancel={() => setShowDeleteAtivoDialog(false)} />
            <ConfirmDialog open={!!manutencaoParaDeletar} title="Confirmar Exclusão da Manutenção" message={`Tem certeza que deseja excluir a manutenção "${manutencaoParaDeletar?.tipo_servico || ''}" realizada em ${manutencaoParaDeletar ? formatDate(manutencaoParaDeletar.data_realizada) : ''}?`} confirmText="Excluir Manutenção" severity="error" loading={loadingDeleteManutencao} onConfirm={confirmarDeleteManutencao} onCancel={() => setManutencaoParaDeletar(null)} />
        </Box>
    );
};
export default AtivoDetailPage;