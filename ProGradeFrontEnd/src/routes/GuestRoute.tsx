import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function GuestRoute() {
    const { user, isAuthenticated } = useAuth();

    // 🌟 If they are already logged in, intercept the request and redirect them!
    if (isAuthenticated && user) {
        switch (user.role) {
            case 'ADMIN': 
                return <Navigate to="/admin/dashboard" replace />;
            case 'EDUCATOR': 
                return <Navigate to="/educator/dashboard" replace />;
            case 'STUDENT': 
                return <Navigate to="/student/dashboard" replace />;
            default: 
                return <Navigate to="/student/dashboard" replace />;
        }
    }

    // If they are not logged in, let them see the public page (Login, Landing, etc.)
    return <Outlet />;
}