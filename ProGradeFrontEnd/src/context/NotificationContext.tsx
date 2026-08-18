import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { axiosClient } from '../api/axiosClient';
import { ShieldAlert, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useAuth } from './AuthContext'; // 🌟 1. IMPORT USEAUTH

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    targetUrl: string | null;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    markAsRead?: (id: number) => void;
    markAllAsRead?: () => void;
    markAsUnread?: (id: number) => void; // 🌟 NEW
    markAllAsUnread?: () => void; // 🌟 NEW
    deleteNotification?: (id: number) => void;
}

const NotificationContext = createContext<NotificationContextType>({
    notifications: [],
    unreadCount: 0
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth(); // 🌟 2. GET CURRENT USER
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [liveToast, setLiveToast] = useState<Notification | null>(null);

    // Initial Fetch
    const fetchNotifications = async () => {
        try {
            const res = await axiosClient.get('/notifications');
            setNotifications(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error("Failed to load notifications", e);
            setNotifications([]);
        }
    };

    // Global SSE Subscription
    useEffect(() => {
        // 🌟 3. LOGOUT DESTROYER: If there is no user, destroy connection instantly!
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
        console.log("SSE: Attempting to connect to Notification Engine on port 2406...");

        const baseURL = axiosClient.defaults.baseURL || 'http://localhost:2406/api/v1';

        fetchEventSource(`${baseURL}/notifications/subscribe`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'text/event-stream'
            },
            signal: ctrl.signal,
            onopen(response) {
                if (response.ok) {
                    console.log("✅ SSE: Successfully connected to Notification Engine!");
                    return Promise.resolve();
                }
                console.error("❌ SSE: Server responded with error", response.status);
                return Promise.resolve();
            },
            onmessage(ev) {
                // 🌟 CHAT EVENTS INTERCEPTOR
                if (['CHAT_MESSAGE', 'ROOM_UPDATE', 'MESSAGES_SEEN', 'TYPING'].includes(ev.event)) {
                    const customEvent = new CustomEvent('onChatEngineEvent', {
                        detail: { type: ev.event, payload: JSON.parse(ev.data) }
                    });
                    document.dispatchEvent(customEvent);
                    return; // Don't show a toast for every single typed letter!
                }

                // Normal notification toast logic
                if (ev.event === 'notification') {
                    const newNotif = JSON.parse(ev.data);
                    setNotifications(prev => [newNotif, ...prev]);
                    setLiveToast(newNotif);
                    setTimeout(() => setLiveToast(null), 5000);
                }
            },
            onerror(err) {
                console.error("❌ SSE Connection Lost or Failed", err);
                throw err;
            }
        });

        // Cleanup runs automatically when component unmounts OR when `user` becomes null
        return () => {
            console.log("SSE: Disconnecting...");
            ctrl.abort();
        };
    }, [user]); // 🌟 4. THIS ARRAY MUST INCLUDE `user` SO IT RE-RUNS ON LOGOUT

    const markAsRead = async (id: number) => {
        try {
            await axiosClient.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (e) { console.error(e); }
    };

    const markAllAsRead = async () => {
        try {
            await axiosClient.patch(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (e) { console.error(e); }
    };

    const deleteNotification = async (id: number) => {
        try {
            await axiosClient.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) { console.error(e); }
    };

    const markAsUnread = async (id: number) => {
        try {
            await axiosClient.patch(`/notifications/${id}/unread`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: false } : n));
        } catch (e) { console.error(e); }
    };

    const markAllAsUnread = async () => {
        try {
            await axiosClient.patch(`/notifications/unread-all`);
            setNotifications(prev => prev.map(n => ({ ...n, isRead: false })));
        } catch (e) { console.error(e); }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getToastColors = (type: string) => {
        if (type === 'CRITICAL') return { bg: 'bg-red-600', icon: <AlertTriangle className="w-5 h-5 text-white" /> };
        if (type === 'WARNING') return { bg: 'bg-amber-500', icon: <ShieldAlert className="w-5 h-5 text-white" /> };
        if (type === 'SUCCESS') return { bg: 'bg-emerald-500', icon: <CheckCircle2 className="w-5 h-5 text-white" /> };
        return { bg: 'bg-purple-600', icon: <Info className="w-5 h-5 text-white" /> };
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, markAsUnread, markAllAsUnread, deleteNotification }}>            {children}

            {/* 🌟 GLOBAL LIVE TOAST POPUP */}
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