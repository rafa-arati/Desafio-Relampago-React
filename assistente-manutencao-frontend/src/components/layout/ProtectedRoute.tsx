import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <LoadingSpinner fullScreen message="Verificando autenticação..." />;
    }

    if (!isAuthenticated) {
        // Redireciona para login, salvando a rota atual
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};