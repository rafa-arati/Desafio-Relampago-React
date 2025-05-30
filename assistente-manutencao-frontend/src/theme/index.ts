import { createTheme, ThemeOptions, alpha } from '@mui/material/styles';
type PaletteMode = 'light' | 'dark';

// --- CORES PARA MODO CLARO ---
const PRIMARY_MAIN_LIGHT = '#004d40';
const PRIMARY_DARK_LIGHT = '#00251a';
const PRIMARY_LIGHT_LIGHT = '#39796b';
const SECONDARY_MAIN_LIGHT = '#ffab40';
const SECONDARY_DARK_LIGHT = '#c67c00';
const SECONDARY_LIGHT_LIGHT = '#ffdd71';
const BACKGROUND_DEFAULT_LIGHT = '#f7f9fc';
const BACKGROUND_PAPER_LIGHT = '#ffffff';
const TEXT_PRIMARY_LIGHT = 'rgba(0, 0, 0, 0.87)';
const TEXT_SECONDARY_LIGHT = 'rgba(0, 0, 0, 0.6)';
const TEXT_DISABLED_LIGHT = 'rgba(0, 0, 0, 0.38)';
const DIVIDER_LIGHT = 'rgba(0, 0, 0, 0.12)';

// --- CORES PARA MODO ESCURO ---
const PRIMARY_MAIN_DARK = '#66bb6a';
const PRIMARY_DARK_DARK = '#388e3c';
const PRIMARY_LIGHT_DARK = '#98ee99';
const SECONDARY_MAIN_DARK = '#ffa726';
const SECONDARY_DARK_DARK = '#f57c00';
const SECONDARY_LIGHT_DARK = '#ffd95a';
const BACKGROUND_DEFAULT_DARK = '#121212';
const BACKGROUND_PAPER_DARK = '#1e1e1e';
const TEXT_PRIMARY_DARK = '#ffffff';
const TEXT_SECONDARY_DARK = 'rgba(255, 255, 255, 0.7)';
const TEXT_DISABLED_DARK = 'rgba(255, 255, 255, 0.5)';
const DIVIDER_DARK = 'rgba(255, 255, 255, 0.12)';

// --- CORES DE ESTADO (Podem ser as mesmas ou ajustadas por modo) ---
const ERROR_MAIN = '#D32F2F';
const ERROR_LIGHT = '#E57373';
const ERROR_DARK = '#C62828';

const WARNING_MAIN = '#FFA000';
const WARNING_LIGHT = '#FFC107';
const WARNING_DARK = '#FF8F00';

const INFO_MAIN = '#1976D2'; // Azul padrão
const INFO_LIGHT = '#64B5F6';
const INFO_DARK = '#0D47A1'; // Azul escuro para info

const SUCCESS_MAIN = '#2E7D32';
const SUCCESS_LIGHT = '#4CAF50';
const SUCCESS_DARK = '#1B5E20';


export const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? { // Paleta para modo CLARO
                primary: { main: PRIMARY_MAIN_LIGHT, light: PRIMARY_LIGHT_LIGHT, dark: PRIMARY_DARK_LIGHT, contrastText: '#ffffff' },
                secondary: { main: SECONDARY_MAIN_LIGHT, light: SECONDARY_LIGHT_LIGHT, dark: SECONDARY_DARK_LIGHT, contrastText: TEXT_PRIMARY_LIGHT },
                background: { default: BACKGROUND_DEFAULT_LIGHT, paper: BACKGROUND_PAPER_LIGHT },
                text: { primary: TEXT_PRIMARY_LIGHT, secondary: TEXT_SECONDARY_LIGHT, disabled: TEXT_DISABLED_LIGHT },
                divider: DIVIDER_LIGHT,
                error: { main: ERROR_MAIN, light: ERROR_LIGHT, dark: ERROR_DARK },
                warning: { main: WARNING_MAIN, light: WARNING_LIGHT, dark: WARNING_DARK },
                info: { main: INFO_MAIN, light: INFO_LIGHT, dark: INFO_DARK },
                success: { main: SUCCESS_MAIN, light: SUCCESS_LIGHT, dark: SUCCESS_DARK },
            }
            : { // Paleta para modo ESCURO
                primary: { main: PRIMARY_MAIN_DARK, light: PRIMARY_LIGHT_DARK, dark: PRIMARY_DARK_DARK, contrastText: TEXT_PRIMARY_LIGHT }, // contrastText geralmente é escuro para primárias claras no modo dark
                secondary: { main: SECONDARY_MAIN_DARK, light: SECONDARY_LIGHT_DARK, dark: SECONDARY_DARK_DARK, contrastText: TEXT_PRIMARY_LIGHT },
                background: { default: BACKGROUND_DEFAULT_DARK, paper: BACKGROUND_PAPER_DARK },
                text: { primary: TEXT_PRIMARY_DARK, secondary: TEXT_SECONDARY_DARK, disabled: TEXT_DISABLED_DARK },
                divider: DIVIDER_DARK,
                error: { main: ERROR_LIGHT, light: '#ef9a9a', dark: ERROR_DARK }, // Erro um pouco mais claro no dark
                warning: { main: WARNING_LIGHT, light: '#ffcc80', dark: WARNING_DARK }, // Warning um pouco mais claro no dark
                info: { main: INFO_LIGHT, light: '#90caf9', dark: INFO_MAIN }, // Info mais claro no dark
                success: { main: SUCCESS_LIGHT, light: '#a5d6a7', dark: SUCCESS_MAIN }, // Success mais claro no dark
            }),
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
        h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.25 },
        h3: { fontSize: '1.5rem', fontWeight: 500, lineHeight: 1.3 },
        h4: { fontSize: '1.25rem', fontWeight: 500, lineHeight: 1.35 },
        h5: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.4 },
        h6: { fontSize: '1rem', fontWeight: 500, lineHeight: 1.5 },
        subtitle1: { fontSize: '1rem', fontWeight: 400 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
        body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
        body2: { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5 },
        button: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
        caption: { fontSize: '0.75rem', lineHeight: 1.4 },
        overline: { fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }
    },
    shape: {
        borderRadius: 12,
    },
    spacing: 8,
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: ({ theme }) => ({
                    boxShadow: theme.shadows[1], // Sombra mais sutil para AppBar
                    // No modo escuro, o AppBar pode ter a cor do 'paper' para se destacar do fundo 'default'
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.primary.main,
                    color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.primary.contrastText,
                }),
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: ({ theme }) => ({
                    borderRight: theme.palette.mode === 'dark' ? `1px solid ${theme.palette.divider}` : 'none',
                    backgroundColor: theme.palette.background.paper, // Drawer usa cor de paper
                })
            }
        },
        MuiButton: {
            styleOverrides: {
                root: ({ ownerState, theme }) => ({
                    borderRadius: 8,
                    textTransform: 'none',
                    padding: theme.spacing(1, 2.75), // 8px 22px
                    // Para botões contained, uma sombra sutil. Para outros, nenhuma.
                    boxShadow: ownerState.variant === 'contained' ? theme.shadows[2] : 'none',
                    '&:hover': {
                        boxShadow: ownerState.variant === 'contained' ? theme.shadows[4] : 'none',
                    }
                }),
                containedPrimary: ({ theme }) => ({ '&:hover': { backgroundColor: theme.palette.primary.dark } }),
                containedSecondary: ({ theme }) => ({ '&:hover': { backgroundColor: theme.palette.secondary.dark } })
            },
        },
        MuiCard: {
            defaultProps: {
                elevation: 0, // Remover elevação padrão para usar bordas
            },
            styleOverrides: {
                root: ({ theme }) => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                }),
            },
        },
        MuiPaper: { // Aplica a todos os Papers, incluindo o fundo do Drawer e Cards se não sobrescrito
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: theme.shape.borderRadius,
                    backgroundColor: theme.palette.background.paper,
                }),
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: ({ theme }) => ({
                    borderRadius: 8,
                    margin: theme.spacing(0.5, 1),
                    padding: theme.spacing(1, 2),
                    '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.25 : 0.10), // Opacidade diferente para dark
                        color: theme.palette.primary.main, // Cor do texto e ícone quando selecionado
                        '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                        },
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.30 : 0.15),
                        },
                    },
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover, // Usa a cor de hover padrão do tema
                    },
                }),
            },
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined', },
            styleOverrides: {
                root: ({ theme }) => ({
                    '& .MuiOutlinedInput-root': {
                        borderRadius: theme.shape.borderRadius * (2 / 3), // Um pouco menos arredondado
                    }
                })
            }
        },
        MuiChip: {
            styleOverrides: {
                root: ({ theme, ownerState }) => ({
                    borderRadius: 8,
                    fontWeight: 500,
                    // Para chips coloridos no modo escuro, você pode querer torná-los mais sutis
                    ...(ownerState.color && ownerState.color !== 'default' && ownerState.color !== 'primary' && ownerState.color !== 'secondary' && theme.palette.mode === 'dark' && {
                        backgroundColor: alpha(theme.palette[ownerState.color].main, 0.3),
                        color: theme.palette[ownerState.color].light,
                    }),
                })
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }) => ({
                    backgroundColor: alpha(theme.palette.grey[theme.palette.mode === 'dark' ? 800 : 700], 0.95),
                    borderRadius: theme.shape.borderRadius / 2,
                    color: theme.palette.common.white, // Garante que o texto do tooltip seja legível
                }),
                arrow: ({ theme }) => ({
                    color: alpha(theme.palette.grey[theme.palette.mode === 'dark' ? 800 : 700], 0.95),
                })
            }
        }
    },
});