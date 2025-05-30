import { useState, useCallback } from 'react';

type NotificationSeverity = 'success' | 'info' | 'warning' | 'error';

interface Notification {
    id: string;
    message: string;
    severity: NotificationSeverity;
    autoHide?: boolean;
    duration?: number;
}

interface UseNotificationReturn {
    notifications: Notification[];
    addNotification: (
        message: string,
        severity?: NotificationSeverity,
        options?: { autoHide?: boolean; duration?: number }
    ) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
}

export function useNotification(): UseNotificationReturn {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((
        message: string,
        severity: NotificationSeverity = 'info',
        options: { autoHide?: boolean; duration?: number } = {}
    ) => {
        const id = Date.now().toString();
        const newNotification: Notification = {
            id,
            message,
            severity,
            autoHide: options.autoHide ?? true,
            duration: options.duration ?? 6000,
        };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove se configurado
        if (newNotification.autoHide) {
            setTimeout(() => {
                removeNotification(id);
            }, newNotification.duration);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    return {
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
    };
}