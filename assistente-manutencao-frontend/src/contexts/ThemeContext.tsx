import React, { createContext, useState, useMemo, useContext, ReactNode, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { useLocalStorage } from '../hooks/useLocalStorage'; 

interface ThemeContextType {
    mode: PaletteMode;
    toggleThemeMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const AppThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Tenta carregar o modo salvo do localStorage, padrão para 'light'
    const [storedMode, setStoredMode] = useLocalStorage<PaletteMode>('appThemeMode', 'light');
    const [mode, setMode] = useState<PaletteMode>(storedMode);

    // Sincroniza o estado 'mode' com 'storedMode' quando 'storedMode' muda (ex: de outra aba)
    useEffect(() => {
        setMode(storedMode);
    }, [storedMode]);

    const toggleThemeMode = () => {
        setStoredMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    // useMemo para evitar recriações desnecessárias do objeto de contexto
    const themeContextValue = useMemo(() => ({
        mode,
        toggleThemeMode,
    }), [mode]); // Recria o valor do contexto apenas se 'mode' mudar

    return <ThemeContext.Provider value={themeContextValue}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useAppTheme deve ser usado dentro de um AppThemeProvider');
    }
    return context;
};