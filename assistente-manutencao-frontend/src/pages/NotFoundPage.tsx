import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Button,
} from '@mui/material';
import { Home as HomeIcon, SearchOff as SearchOffIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
    return (
        <Container maxWidth="sm">
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="100vh"
                textAlign="center"
                px={2}
            >
                <SearchOffIcon sx={{ fontSize: 120, color: 'text.disabled', mb: 2 }} />

                <Typography variant="h1" component="h1" gutterBottom>
                    404
                </Typography>

                <Typography variant="h4" component="h2" gutterBottom>
                    Página não encontrada
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    A página que você está procurando não existe ou foi movida.
                </Typography>

                <Button
                    component={RouterLink}
                    to="/dashboard"
                    variant="contained"
                    size="large"
                    startIcon={<HomeIcon />}
                >
                    Voltar ao Dashboard
                </Button>
            </Box>
        </Container>
    );
};

export default NotFoundPage;