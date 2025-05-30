import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, alpha } from '@mui/material/styles'; 
import { PaletteMode } from '@mui/material'; 
import CssBaseline from '@mui/material/CssBaseline';
import { getDesignTokens } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import GlobalSnackbar from './components/ui/GlobalSnackbar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { AppThemeProvider, useAppTheme } from './contexts/ThemeContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Páginas
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AtivosListPage from './pages/ativos/AtivosListPage';
import AtivoFormPage from './pages/ativos/AtivoFormPage';
import AtivoDetailPage from './pages/ativos/AtivoDetailPage';
import ManutencoesListPage from './pages/manutencoes/ManutencoesListPage';
import ManutencaoFormPage from './pages/manutencoes/ManutencaoFormPage';
import PerfilPage from './pages/perfil/PerfilPage';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './utils/constants';

const ProtectedRoutesWrapper: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) { return <LoadingSpinner fullScreen message="Verificando autenticação..." />; }
  return isAuthenticated ? <AppLayout><Outlet /></AppLayout> : <Navigate to={ROUTES.LOGIN} replace />;
};

const ThemedAppContent: React.FC = () => {
  const { mode } = useAppTheme();
  const muiTheme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline enableColorScheme />
      <NotificationProvider>
        <Router>
          <GlobalSnackbar />
          <Routes>
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route element={<ProtectedRoutesWrapper />}>
              <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
              <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
              <Route path={ROUTES.ATIVOS} element={<AtivosListPage />} />
              <Route path={ROUTES.ATIVOS_NOVO} element={<AtivoFormPage />} />
              <Route path={ROUTES.ATIVOS_DETAIL(':id')} element={<AtivoDetailPage />} />
              <Route path={ROUTES.ATIVOS_EDIT(':id')} element={<AtivoFormPage />} />
              <Route path={ROUTES.MANUTENCOES} element={<ManutencoesListPage />} />
              <Route path={ROUTES.MANUTENCOES_NOVO} element={<ManutencaoFormPage />} />
              <Route path={ROUTES.MANUTENCOES_EDIT(':id')} element={<ManutencaoFormPage />} />
              <Route path={ROUTES.PERFIL} element={<PerfilPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </MuiThemeProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <ThemedAppContent />
      </AppThemeProvider>
    </AuthProvider>
  );
}
export default App;