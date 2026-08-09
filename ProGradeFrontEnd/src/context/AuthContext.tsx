import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    login: (token: string, userData: any, rememberMe: boolean) => void;
    logout: () => void;
    updateUser: (updatedUserData: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // Synchronously check BOTH storages on initial load to prevent the refresh bug!
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = (token: string, userData: any, rememberMe: boolean) => {
        setUser(userData);
        const storage = rememberMe ? localStorage : sessionStorage;
        
        storage.setItem('token', token);
        storage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
    };

    const updateUser = (updatedUserData: any) => {
        setUser(updatedUserData);
        // Update whichever storage currently has the user
        if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(updatedUserData));
        } else {
            sessionStorage.setItem('user', JSON.stringify(updatedUserData));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};