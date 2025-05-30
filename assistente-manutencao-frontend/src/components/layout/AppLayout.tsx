import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box, CssBaseline, Drawer, AppBar, Toolbar, List, Typography, Divider,
    IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText,
    Avatar, Menu, MenuItem, Tooltip, useTheme, useMediaQuery, alpha // <<< alpha importado
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard as DashboardIcon, Build as BuildToolIcon,
    Construction as ConstructionIcon, Person as PersonIcon, Logout as LogoutIcon,
    Brightness4 as Brightness4Icon, Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';
import { useAppTheme } from '../../contexts/ThemeContext';

const drawerWidth = 240;

interface NavigationItem { label: string; path: string; icon: React.ReactNode; }

const mainNavigationItems: NavigationItem[] = [
    { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: <DashboardIcon /> },
    { label: 'Ativos', path: ROUTES.ATIVOS, icon: <BuildToolIcon /> },
    { label: 'Manutenções', path: ROUTES.MANUTENCOES, icon: <ConstructionIcon /> },
];

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const muiTheme = useTheme(); // Este é o tema MUI já processado com o modo (light/dark)
    const { mode, toggleThemeMode } = useAppTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const { usuario, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);
    const handleNavigate = (path: string) => { navigate(path); if (isMobile) setMobileOpen(false); };
    const handleLogout = async () => { handleCloseUserMenu(); await logout(); };
    const handleProfile = () => { handleCloseUserMenu(); navigate(ROUTES.PERFIL); };

    const drawerContent = (
        <Box>
            <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: [1] }}>
                <BuildToolIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" noWrap component="div">Assistente</Typography>
            </Toolbar>
            <Divider />
            <List>
                {mainNavigationItems.map((item) => (
                    <ListItem key={item.label} disablePadding>
                        <ListItemButton
                            selected={location.pathname.startsWith(item.path)}
                            onClick={() => handleNavigate(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: alpha(muiTheme.palette.primary.main, muiTheme.palette.mode === 'dark' ? 0.20 : 0.12),
                                    color: muiTheme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: alpha(muiTheme.palette.primary.main, muiTheme.palette.mode === 'dark' ? 0.25 : 0.15),
                                    },
                                    '& .MuiListItemIcon-root': { color: muiTheme.palette.primary.main },
                                },
                                '&:hover': { backgroundColor: muiTheme.palette.action.hover },
                                margin: muiTheme.spacing(0.5, 1),
                                padding: muiTheme.spacing(1, 2),
                                borderRadius: muiTheme.shape.borderRadius / 1.5,
                            }}
                        >
                            <ListItemIcon sx={{ color: location.pathname.startsWith(item.path) ? muiTheme.palette.primary.main : 'inherit' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                    zIndex: muiTheme.zIndex.drawer + 1,
                    // A cor do AppBar agora será definida pelos overrides no tema
                }}
                elevation={1}
            >
                <Toolbar>
                    <IconButton color="inherit" aria-label="abrir menu" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}><MenuIcon /></IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>Manutenção de Ativos</Typography>
                    <Tooltip title={mode === 'dark' ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}><IconButton sx={{ ml: 1 }} onClick={toggleThemeMode} color="inherit">{mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton></Tooltip>
                    <Box sx={{ flexGrow: 0, ml: 1 }}><Tooltip title="Menu do Usuário"><IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}><Avatar sx={{ bgcolor: 'secondary.main' }}>{usuario?.nome?.charAt(0).toUpperCase() || 'U'}</Avatar></IconButton></Tooltip>
                        <Menu sx={{ mt: '45px' }} id="menu-appbar-usuario" anchorEl={anchorElUser} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right' }} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu} MenuListProps={{ 'aria-labelledby': 'menu-appbar-usuario-button' }}>
                            <MenuItem onClick={handleProfile}><ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon><ListItemText>Meu Perfil</ListItemText></MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem onClick={handleLogout}><ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon><ListItemText>Sair</ListItemText></MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>
            <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }} aria-label="menu de navegação principal">
                <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, }}>{drawerContent}</Drawer>
                <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }, }} open>{drawerContent}</Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` }, bgcolor: 'background.default', }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};