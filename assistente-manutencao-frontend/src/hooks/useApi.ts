import { useState, useEffect, useCallback, useRef } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
    execute: (fn?: (...args: any[]) => Promise<T>, ...args: any[]) => Promise<T | undefined>; 
    reset: () => void;
    setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useApi<T = any>(
    defaultApiFunction?: (...args: any[]) => Promise<T> // Função padrão que pode ser passada na inicialização
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    // Ref para a função da API para que execute não precise dela como dependência e seja estável
    const apiFunctionRef = useRef(defaultApiFunction);

    // Atualiza a ref se a função padrão mudar (raro, mas para completude)
    useEffect(() => {
        apiFunctionRef.current = defaultApiFunction;
    }, [defaultApiFunction]);

    const execute = useCallback(async (
        runtimeApiFunction?: (...args: any[]) => Promise<T>,
        ...args: any[]
    ): Promise<T | undefined> => {
        const functionToCall = runtimeApiFunction || apiFunctionRef.current;

        if (!functionToCall) {
            console.error("useApi: Nenhuma função da API foi fornecida para execução.");
            setState(prev => ({ ...prev, error: 'Função da API não definida.', loading: false }));
            throw new Error('API function not provided'); // Lança para que o chamador saiba
        }

        setState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const result = await functionToCall(...args);
            setState(prev => ({ ...prev, data: result, loading: false }));
            return result;
        } catch (error: any) {
            let errorMessage = 'Ocorreu um erro ao processar sua solicitação.';
            if (error instanceof AxiosError) {
                errorMessage = error.response?.data?.message ||
                    (error.response?.status ? `Erro no servidor (${error.response.status})` : error.message) ||
                    'Falha na comunicação com o servidor.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            console.error("useApi - Erro capturado:", { errorDetails: error, parsedMessage: errorMessage });
            setState(prev => ({ ...prev, error: errorMessage, loading: false, data: null }));
            throw error; // Relança o erro original para que o chamador possa tratá-lo se necessário
        }
    }, []); // useCallback sem dependências, pois apiFunctionRef.current lida com a função

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    const setData = useCallback((value: React.SetStateAction<T | null>) => {
        setState(prev => ({ ...prev, data: typeof value === 'function' ? (value as (prevState: T | null) => T | null)(prev.data) : value }));
    }, []);

    return { ...state, execute, reset, setData };
}