import { useState, useEffect } from 'react';

export const useLocalStorage = <T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] => {
    // Estado para armazenar nosso valor
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Erro ao ler localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Função para definir valor
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Erro ao definir localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue];
};