import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';
import { authService } from '../features/auth/authService';
import { axiosClient } from '../api/axiosClient';

interface AuthContextType {
    user: AuthResponse | null;
    isAuthenticated: boolean;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthResponse | null>(null);

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const login = async (credentials: LoginRequest) => {
        const data = await authService.login(credentials);
        setUser(data);
    };

    const register = async (data: RegisterRequest) => {
        await authService.register(data);
    };

    const logout = async () => {
    try {
        await axiosClient.post('/auth/logout');
    } catch (e) {
        console.error("Logout error", e);
    }
    authService.logout();
    setUser(null);
    window.location.href = '/login';
};

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};