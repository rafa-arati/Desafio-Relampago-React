import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingSpinnerProps {
    message?: string;
    size?: number;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Carregando...',
    size = 40,
    color = 'primary',
    fullScreen = false
}) => {
    const containerStyles = fullScreen ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: 'background.default',
        zIndex: 9999
    } : {};

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
            py={4}
            sx={containerStyles}
        >
            <CircularProgress size={size} color={color} />
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );
};