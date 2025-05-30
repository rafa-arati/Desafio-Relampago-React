import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { AlertColor } from '@mui/material/Alert';

export interface NotificationState { // Exportar para que GlobalSnackbar possa usá-la se necessário (embora não precise mais)
    open: boolean;
    message: string;
    severity: AlertColor;
    autoHideDuration?: number | null;
}

interface NotificationContextType {
    showNotification: (message: string, severity?: AlertColor, autoHideDuration?: number | null) => void;
    notificationState: NotificationState; // Expor o estado para o GlobalSnackbar
    closeNotification: () => void;      // Expor a função de fechar
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification deve ser usado dentro de um NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notificationState, setNotificationState] = useState<NotificationState>({
        open: false,
        message: '',
        severity: 'info', // Padrão
        autoHideDuration: 6000, // Padrão de 6 segundos
    });

    const showNotification = useCallback((
        message: string,
        severity: AlertColor = 'info',
        autoHideDuration: number | null = 6000 // null para não fechar automaticamente
    ) => {
        setNotificationState({ open: true, message, severity, autoHideDuration });
    }, []);

    const closeNotification = useCallback(() => {
        setNotificationState(prev => ({ ...prev, open: false }));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, notificationState, closeNotification }}>
            {children}
            {/* O GlobalSnackbar será renderizado separadamente e usará este contexto */}
        </NotificationContext.Provider>
    );
};