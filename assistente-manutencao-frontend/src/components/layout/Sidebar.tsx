import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Box,
    Typography
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    DirectionsCar,
    Build,
    Person,
    Settings
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        {
            text: 'Dashboard',
            icon: <DashboardIcon />,
            path: '/dashboard',
            active: location.pathname === '/dashboard'
        },
        {
            text: 'Ativos',
            icon: <DirectionsCar />,
            path: '/ativos',
            active: location.pathname.startsWith('/ativos')
        },
        {
            text: 'Manutenções',
            icon: <Build />,
            path: '/manutencoes',
            active: location.pathname.startsWith('/manutencoes')
        }
    ];

    const secondaryItems = [
        {
            text: 'Perfil',
            icon: <Person />,
            path: '/perfil',
            active: location.pathname === '/perfil'
        },
        {
            text: 'Configurações',
            icon: <Settings />,
            path: '/configuracoes',
            active: location.pathname === '/configuracoes'
        }
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
    };

    return (
        <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo/Brand */}
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h6" component="div" fontWeight="bold">
                    Assistente de Manutenção
                </Typography>
            </Box>

            {/* Menu Principal */}
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={item.active}
                            onClick={() => handleNavigation(item.path)}
                            sx={{
                                '&.Mui-selected': {
                                    backgroundColor: 'primary.main',
                                    color: 'primary.contrastText',
                                    '&:hover': {
                                        backgroundColor: 'primary.dark',
                                    },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.contrastText',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>

            <Divider />

            {/* Menu Secundário */}
            <List>
                {secondaryItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            selected={item.active}
                            onClick={() => handleNavigation(item.path)}
                        >
                            <ListItemIcon>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default Sidebar;