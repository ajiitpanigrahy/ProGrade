import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    token: string | null;
    login: (token: string, userData: any, rememberMe: boolean) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    
    // Prevents the login screen from flashing while we check other tabs
    const [isInitializing, setIsInitializing] = useState(true); 

    useEffect(() => {
        // 1. Normal Hydration: Check Local and Session storage
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
            setIsInitializing(false);
        } else {
            // 2. THE MAGIC BRIDGE: If empty, broadcast a request to other tabs for their session!
            localStorage.setItem('requestSessionSync', Date.now().toString());
            
            // Give other open tabs 50 milliseconds to respond before we default to the Login page
            setTimeout(() => {
                setIsInitializing(false);
            }, 50); 
        }

        // 3. Cross-Tab Event Listeners
        const handleStorage = (e: StorageEvent) => {
            
            // EVENT A: A new empty tab asked for sync! We have a session, let's share it securely.
            if (e.key === 'requestSessionSync' && sessionStorage.getItem('token')) {
                const sessionPayload = {
                    token: sessionStorage.getItem('token'),
                    user: sessionStorage.getItem('user')
                };
                localStorage.setItem('provideSessionSync', JSON.stringify(sessionPayload));
                localStorage.removeItem('provideSessionSync'); // Immediately wipe it so it doesn't stay in local storage
            }

            // EVENT B: We are the new tab, and an existing tab just provided the session!
            if (e.key === 'provideSessionSync' && e.newValue) {
                const data = JSON.parse(e.newValue);
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('user', data.user);
                setToken(data.token);
                setUser(JSON.parse(data.user));
            }

            // EVENT C: Cross-Tab Logout (If the user logs out in tab A, instantly log them out of tab B)
            if (e.key === 'logoutEvent') {
                setToken(null);
                setUser(null);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        };

        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const login = (newToken: string, userData: any, rememberMe: boolean) => {
        setToken(newToken);
        setUser(userData);

        if (rememberMe) {
            // PERSISTENT: Survives complete browser restarts
            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        } else {
            // TEMPORARY: Wipes when the browser closes, but synced across tabs while open!
            sessionStorage.setItem('token', newToken);
            sessionStorage.setItem('user', JSON.stringify(userData));
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        // Broadcast the logout event to instantly close all other open tabs
        localStorage.setItem('logoutEvent', Date.now().toString());
    };

    // Do not render the app (or the GuestRoute barrier) until hydration/sync is finished
    if (isInitializing) return null; 

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};