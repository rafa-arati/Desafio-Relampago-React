import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    Button,
    Alert,
    CircularProgress,
    Container,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemButton,
    Fab,
    Tooltip,
    ButtonGroup
} from '@mui/material';
import {
    TrendingUp,
    Warning,
    Schedule,
    CheckCircle,
    Build,
    Add,
    Refresh,
    FilterList,
    DirectionsCar
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { dashboardService, ResumoManutencoes, AtivoComManutencao } from '../../services/dashboardService';

type StatusFilter = 'todos' | 'atrasada' | 'urgente' | 'proxima' | 'ok';

const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const [resumo, setResumo] = useState<ResumoManutencoes | null>(null);
    const [ativos, setAtivos] = useState<AtivoComManutencao[]>([]);
    const [filtroStatus, setFiltroStatus] = useState<StatusFilter>('todos');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carregar dados do dashboard - APENAS UMA VEZ
    const carregarDados = async () => {
        try {
            setLoading(true);
            setError(null);

            const [resumoData, ativosData] = await Promise.all([
                dashboardService.obterResumo(),
                dashboardService.obterAtivos() // SEM filtro - busca TODOS os ativos
            ]);

            setResumo(resumoData);
            setAtivos(ativosData);
        } catch (err: any) {
            console.error('Erro ao carregar dashboard:', err);
            setError(err.response?.data?.message || 'Erro ao carregar dados do dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Carregar dados apenas UMA VEZ quando o componente monta
    useEffect(() => {
        carregarDados();
    }, []); // Array vazio - só roda uma vez!

    // Configurações dos cards de estatísticas
    const getCardConfig = (tipo: string) => {
        switch (tipo) {
            case 'atrasadas':
                return {
                    color: 'error.main',
                    icon: <Warning />,
                    bgColor: 'error.light',
                    textColor: 'error.contrastText'
                };
            case 'urgentes':
                return {
                    color: 'warning.main',
                    icon: <Schedule />,
                    bgColor: 'warning.light',
                    textColor: 'warning.contrastText'
                };
            case 'proximas':
                return {
                    color: 'info.main',
                    icon: <TrendingUp />,
                    bgColor: 'info.light',
                    textColor: 'info.contrastText'
                };
            case 'realizadas':
                return {
                    color: 'success.main',
                    icon: <CheckCircle />,
                    bgColor: 'success.light',
                    textColor: 'success.contrastText'
                };
            default:
                return {
                    color: 'primary.main',
                    icon: <Build />,
                    bgColor: 'primary.light',
                    textColor: 'primary.contrastText'
                };
        }
    };

    // Obter cor do status de urgência
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'atrasada':
                return 'error';
            case 'urgente':
                return 'warning';
            case 'proxima':
                return 'info';
            case 'ok':
                return 'success';
            default:
                return 'default';
        }
    };

    // Obter texto do status
    const getStatusText = (status: string) => {
        switch (status) {
            case 'atrasada':
                return 'Atrasada';
            case 'urgente':
                return 'Urgente';
            case 'proxima':
                return 'Próxima';
            case 'ok':
                return 'Em dia';
            default:
                return 'Desconhecido';
        }
    };

    // Formatar data da próxima manutenção
    const formatarProximaManutencao = (data: string) => {
        try {
            return format(parseISO(data), 'dd/MM/yyyy', { locale: ptBR });
        } catch {
            return 'Data inválida';
        }
    };

    // Filtrar ativos por status
    const ativosFiltrados = ativos.filter(ativo => {
        if (filtroStatus === 'todos') return true;
        return ativo.status_urgencia === filtroStatus;
    });

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress size={60} />
                </Box>
            </Container>
        );
    }

    // Removemos o return early para erro - vamos mostrar o erro mas manter a interface

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Header */}
            <Box mb={4}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Visão geral dos seus ativos e manutenções
                </Typography>
            </Box>

            {/* Mostrar erro se houver, mas não bloquear a interface */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={carregarDados}>
                            Tentar Novamente
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* Cards de Estatísticas - mostrar mesmo sem dados */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="body2">
                                        Total de Ativos
                                    </Typography>
                                    <Typography variant="h4">
                                        {resumo?.total_ativos || 0}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: getCardConfig('total').color }}>
                                    {getCardConfig('total').icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="body2">
                                        Atrasadas
                                    </Typography>
                                    <Typography variant="h4" color="error.main">
                                        {resumo?.manutencoes_atrasadas || 0}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: getCardConfig('atrasadas').color }}>
                                    {getCardConfig('atrasadas').icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="body2">
                                        Urgentes
                                    </Typography>
                                    <Typography variant="h4" color="warning.main">
                                        {resumo?.manutencoes_urgentes || 0}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: getCardConfig('urgentes').color }}>
                                    {getCardConfig('urgentes').icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="body2">
                                        Próximas
                                    </Typography>
                                    <Typography variant="h4" color="info.main">
                                        {resumo?.manutencoes_proximas || 0}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: getCardConfig('proximas').color }}>
                                    {getCardConfig('proximas').icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={2.4}>
                    <Card>
                        <CardContent>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                                <Box>
                                    <Typography color="text.secondary" gutterBottom variant="body2">
                                        Realizadas no Mês
                                    </Typography>
                                    <Typography variant="h4" color="success.main">
                                        {resumo?.manutencoes_realizadas_mes || 0}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: getCardConfig('realizadas').color }}>
                                    {getCardConfig('realizadas').icon}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filtros */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box display="flex" flexDirection="column" gap={2}>
                    {/* Header dos filtros */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                            <FilterList />
                            <Typography variant="h6">Filtrar por Status:</Typography>
                        </Box>

                        <Button
                            startIcon={<Refresh />}
                            onClick={carregarDados}
                            variant="outlined"
                            size="small"
                        >
                            Atualizar
                        </Button>
                    </Box>

                    {/* Botões de filtro responsivos */}
                    <Box
                        display="flex"
                        flexWrap="wrap"
                        gap={1}
                        justifyContent={{ xs: 'center', sm: 'flex-start' }}
                    >
                        <Button
                            variant={filtroStatus === 'todos' ? 'contained' : 'outlined'}
                            onClick={() => setFiltroStatus('todos')}
                            size="small"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filtroStatus === 'atrasada' ? 'contained' : 'outlined'}
                            color="error"
                            onClick={() => setFiltroStatus('atrasada')}
                            size="small"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Atrasadas
                        </Button>
                        <Button
                            variant={filtroStatus === 'urgente' ? 'contained' : 'outlined'}
                            color="warning"
                            onClick={() => setFiltroStatus('urgente')}
                            size="small"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Urgentes
                        </Button>
                        <Button
                            variant={filtroStatus === 'proxima' ? 'contained' : 'outlined'}
                            color="info"
                            onClick={() => setFiltroStatus('proxima')}
                            size="small"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Próximas
                        </Button>
                        <Button
                            variant={filtroStatus === 'ok' ? 'contained' : 'outlined'}
                            color="success"
                            onClick={() => setFiltroStatus('ok')}
                            size="small"
                            sx={{ minWidth: 'auto', px: 2 }}
                        >
                            Em Dia
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Lista de Ativos */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Paper>
                        <Box p={3}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                <Typography variant="h6">
                                    Seus Ativos ({ativosFiltrados.length})
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => navigate('/ativos/novo')}
                                >
                                    Novo Ativo
                                </Button>
                            </Box>

                            {ativosFiltrados.length === 0 ? (
                                <Alert severity="info">
                                    {filtroStatus === 'todos'
                                        ? 'Nenhum ativo encontrado. Que tal adicionar o primeiro?'
                                        : `Nenhum ativo com status "${getStatusText(filtroStatus)}" encontrado.`
                                    }
                                </Alert>
                            ) : (
                                <List>
                                    {ativosFiltrados.map((ativo) => (
                                        <ListItem key={ativo.id} disablePadding>
                                            <ListItemButton
                                                onClick={() => navigate(`/ativos/${ativo.id}`)}
                                                sx={{
                                                    border: 1,
                                                    borderColor: 'divider',
                                                    borderRadius: 1,
                                                    mb: 1,
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon>
                                                    <DirectionsCar color="primary" />
                                                </ListItemIcon>

                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="h6" component="span">
                                                                {ativo.nome}
                                                            </Typography>
                                                            <Chip
                                                                label={getStatusText(ativo.status_urgencia)}
                                                                color={getStatusColor(ativo.status_urgencia) as any}
                                                                size="small"
                                                            />
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            {ativo.descricao && (
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {ativo.descricao}
                                                                </Typography>
                                                            )}

                                                            {ativo.proxima_manutencao_mais_urgente && (
                                                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                                    Próxima manutenção: {formatarProximaManutencao(ativo.proxima_manutencao_mais_urgente)}
                                                                </Typography>
                                                            )}

                                                            {ativo.total_proximas_manutencoes && ativo.total_proximas_manutencoes > 0 && (
                                                                <Typography variant="caption" display="block">
                                                                    {ativo.total_proximas_manutencoes} manutenção(ões) programada(s)
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* FAB para adicionar ativo */}
            <Tooltip title="Adicionar Novo Ativo">
                <Fab
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 16,
                        right: 16,
                    }}
                    onClick={() => navigate('/ativos/novo')}
                >
                    <Add />
                </Fab>
            </Tooltip>
        </Container>
    );

};

export default DashboardPage;