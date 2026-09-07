import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { axiosClient } from '../api/axiosClient';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from './AuthContext';

interface Notification {
    id: number;
    sender?: string;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL' | 'FRAUD_ALERT' | 'ADMIN_ALERT';
    targetUrl: string | null;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead?: (id: number) => void;
    markAllAsRead?: () => void;
    markAsUnread?: (id: number) => void;
    markAllAsUnread?: () => void;
    deleteNotification?: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0
});

export const useNotifications = () => useContext(NotificationContext);

// 🌟 CRITICAL: Custom Error class to identify when we should permanently stop retrying
class FatalError extends Error {}

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [liveToast, setLiveToast] = useState<Notification | null>(null);

    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Failed to load notifications", e);
            setNotifications([]);
        }
    };

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }

        fetchNotifications();

        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        if (!token) {
            console.warn("SSE: No token found, skipping connection.");
            return;
        }

        const ctrl = new AbortController();
        
        // 🌟 Ensure we use the exact Environment Variable for production
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:2406/api/v1';
        console.log(`SSE: Attempting to connect to Notification Engine at ${baseURL}...`);

        fetchEventSource(`${baseURL}/notifications/subscribe`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream'
            },
            signal: ctrl.signal,
            async onopen(response) {
                if (response.ok) {
                    console.log("✅ SSE: Successfully connected to Notification Engine!");
                    return; // Everything is good, proceed.
                }
                
                // 🌟 CRITICAL FIX: If the server responds with ANY HTTP error (400, 401, 404, 500), 
                // throw the FatalError so the library immediately STOPS the infinite retry loop.
                if (response.status >= 400) {
                    console.error(`❌ SSE: Server rejected connection with status ${response.status}. Stopping retries.`);
                    throw new FatalError(`Server Error ${response.status}`);
                }
            },
            onmessage(ev) {
                if (['CHAT_MESSAGE', 'ROOM_UPDATE', 'MESSAGES_SEEN', 'TYPING'].includes(ev.event)) {
                    const customEvent = new CustomEvent('onChatEngineEvent', {
                        detail: { type: ev.event, payload: JSON.parse(ev.data) }
                    });
                    document.dispatchEvent(customEvent);
                    return; 
                }

                if (ev.event === 'notification') {
                    const newNotif = JSON.parse(ev.data);
                    setNotifications(prev => [newNotif, ...prev]);
                    setLiveToast(newNotif);
                    setTimeout(() => setLiveToast(null), 5000);
                }
            },
            onclose() {
                // 🌟 Render drops idle connections. We let this run so it reconnects automatically.
                console.log("⚠️ SSE Connection closed by server. Will attempt to reconnect...");
            },
            onerror(err) {
                if (err instanceof FatalError) {
                    console.error("❌ SSE Fatal Error: Stopping all retries.", err);
                    throw err; // Rethrowing STOPS the retry process completely.
                }
                // 🌟 By NOT throwing an error here, the library will automatically retry the connection!
                console.warn("⚠️ SSE Network Error: Automatically retrying connection...", err);
            }
        });

        return () => {
            console.log("SSE: Disconnecting...");
            ctrl.abort();
        };
    }, [user]);

    // =========================================================
    // 🌟 OPTIMISTIC UI UPDATES: Instant Vanish!
    // =========================================================

    const markAsRead = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        try {
            await axiosClient.patch(`/notifications/${id}/read`);
        } catch (e) { 
            console.error("Failed to mark as read", e); 
            fetchNotifications(); 
        }
    };

    const markAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        try {
            await axiosClient.patch(`/notifications/read-all`);
        } catch (e) { 
            console.error("Failed to mark all as read", e); 
            fetchNotifications();
        }
    };

    const deleteNotification = async (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await axiosClient.delete(`/notifications/${id}`);
        } catch (e) { 
            console.error(e); 
            fetchNotifications();
        }
    };

    const markAsUnread = async (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
        try {
            await axiosClient.patch(`/notifications/${id}/unread`);
        } catch (e) { 
            console.error(e); 
            fetchNotifications();
        }
    };

    const markAllAsUnread = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
        try {
            await axiosClient.patch(`/notifications/unread-all`);
        } catch (e) { 
            console.error(e); 
            fetchNotifications();
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getToastColors = (type: string) => {
        if (type === 'CRITICAL' || type === 'FRAUD_ALERT') return { bg: 'bg-red-600', icon: <AlertTriangle className="w-5 h-5 text-white" /> };
        if (type === 'WARNING' || type === 'ADMIN_ALERT') return { bg: 'bg-amber-500', icon: <ShieldAlert className="w-5 h-5 text-white" /> };
        if (type === 'SUCCESS') return { bg: 'bg-emerald-500', icon: <CheckCircle2 className="w-5 h-5 text-white" /> };
        return { bg: 'bg-purple-600', icon: <Info className="w-5 h-5 text-white" /> };
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, markAsUnread, markAllAsUnread, deleteNotification }}>            
            {children}

            {/* GLOBAL LIVE TOAST POPUP */}
            {liveToast && (
                <div className="fixed bottom-6 right-6 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-300">
                    <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-xl border-2 border-gray-100 dark:border-purple-900/50 p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex gap-4 max-w-sm relative overflow-hidden">
                        <div className={`absolute top-0 left-0 w-2 h-full ${getToastColors(liveToast.type).bg}`}></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${getToastColors(liveToast.type).bg}`}>
                            {getToastColors(liveToast.type).icon}
                        </div>
                        <div className="flex-1 pr-6">
                            <h4 className="text-sm font-black text-gray-900 dark:text-white leading-tight mb-1">{liveToast.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold line-clamp-2">{liveToast.message}</p>
                        </div>
                        <button onClick={() => setLiveToast(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};