import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    login: (token: string, userData: any, rememberMe: boolean) => void;
    logout: () => void;
    updateUser: (updatedUserData: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    // 🌟 STRICTLY use localStorage for cross-tab persistence
    const [user, setUser] = useState(() => {
        // 🌟 Only look at localStorage!
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    // Listen for cross-tab login/logout events automatically
    useEffect(() => {
        const handleStorageChange = () => {
            const savedUser = localStorage.getItem('user');
            setUser(savedUser ? JSON.parse(savedUser) : null);
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = (token: string, userData: any) => {
        setUser(userData);
        // 🌟 Only save to localStorage!
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const updateUser = (updatedUserData: any) => {
        setUser(updatedUserData);
        localStorage.setItem('user', JSON.stringify(updatedUserData));
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