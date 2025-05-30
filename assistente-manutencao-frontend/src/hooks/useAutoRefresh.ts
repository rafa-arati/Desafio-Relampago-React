import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
    enabled?: boolean;
    interval?: number; // em milissegundos
    onRefresh: () => void;
}

export const useAutoRefresh = ({
    enabled = false,
    interval = 30000, // 30 segundos por padrão
    onRefresh
}: UseAutoRefreshOptions) => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (enabled) {
            intervalRef.current = setInterval(onRefresh, interval);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [enabled, interval, onRefresh]);

    // Limpar ao desmontar
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
};