import { Chip } from '@mui/material';
import { StatusUrgencia } from '../../types';

interface StatusBadgeProps {
    status: StatusUrgencia;
    count?: number;
}

export function StatusBadge({ status, count }: StatusBadgeProps) {
    const getStatusConfig = (status: StatusUrgencia) => {
        switch (status) {
            case 'atrasada':
                return {
                    label: `Atrasada${count ? ` (${count})` : ''}`,
                    color: 'error' as const,
                    variant: 'filled' as const,
                };
            case 'urgente':
                return {
                    label: `Urgente${count ? ` (${count})` : ''}`,
                    color: 'warning' as const,
                    variant: 'filled' as const,
                };
            case 'proxima':
                return {
                    label: `Próxima${count ? ` (${count})` : ''}`,
                    color: 'info' as const,
                    variant: 'filled' as const,
                };
            case 'ok':
                return {
                    label: `Em dia${count ? ` (${count})` : ''}`,
                    color: 'success' as const,
                    variant: 'outlined' as const,
                };
            default:
                return {
                    label: 'Desconhecido',
                    color: 'default' as const,
                    variant: 'outlined' as const,
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <Chip
            label={config.label}
            color={config.color}
            variant={config.variant}
            size="small"
        />
    );
}