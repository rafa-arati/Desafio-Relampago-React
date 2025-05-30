import React from 'react';
import { Alert, Button, Box } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
    severity?: 'error' | 'warning' | 'info';
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    onRetry,
    severity = 'error'
}) => {
    return (
        <Alert
            severity={severity}
            action={
                onRetry ? (
                    <Button
                        color="inherit"
                        size="small"
                        startIcon={<Refresh />}
                        onClick={onRetry}
                    >
                        Tentar Novamente
                    </Button>
                ) : undefined
            }
        >
            {message}
        </Alert>
    );
};