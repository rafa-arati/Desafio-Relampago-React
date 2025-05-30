export { useAuth } from '../contexts/AuthContext';

import { useState, useEffect } from 'react';

type SetValue<T> = T | ((val: T) => T);

export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: SetValue<T>) => void] {
    // Função para ler o valor do localStorage
    const readValue = (): T => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Erro ao ler localStorage key "${key}":`, error);
            return initialValue;
        }
    };

    // Estado para armazenar o valor atual
    const [storedValue, setStoredValue] = useState<T>(readValue);

    // Função para definir o valor
    const setValue = (value: SetValue<T>) => {
        try {
            // Permite que value seja uma função para atualização baseada no valor anterior
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Salva no estado
            setStoredValue(valueToStore);

            // Salva no localStorage
            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Erro ao definir localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
}