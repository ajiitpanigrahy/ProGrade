import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // Make it optional so old routes don't break!
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    // 🌟 ONLY pull 'user' from the context to avoid TypeScript errors
    const { user } = useAuth();

    // 1. If there is no user object, they are not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 2. CHECK IF USER HAS THE RIGHT ROLE
    if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        // If an Admin tries to take a Student exam, kick them to their own dashboard
        if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'EDUCATOR') return <Navigate to="/educator/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    // 3. If they pass all checks, render the component!
    return <>{children}</>;
}