import { Box, Typography, Button } from '@mui/material';
import { ReactNode } from 'react';

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
            px={2}
            textAlign="center"
        >
            {icon && (
                <Box mb={2} color="text.secondary" sx={{ fontSize: 64 }}>
                    {icon}
                </Box>
            )}

            <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
            </Typography>

            {description && (
                <Typography variant="body2" color="text.secondary" mb={3}>
                    {description}
                </Typography>
            )}

            {action && (
                <Button
                    variant="contained"
                    onClick={action.onClick}
                    sx={{ mt: 1 }}
                >
                    {action.label}
                </Button>
            )}
        </Box>
    );
}