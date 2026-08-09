import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    // 1. We extract 'user', not 'isAuthenticated'
    const { user } = useAuth();

    // 2. If there is no user, redirect to the correct '/login' route
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}