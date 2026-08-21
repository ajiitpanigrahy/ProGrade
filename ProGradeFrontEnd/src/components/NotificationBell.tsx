import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, CheckCheck, MessageSquare, Shield, Rocket, Target, Award } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// 🌟 VITE FIX: Ensure this is explicitly exported as default!
export default function NotificationBell() {
    const { notifications = [], unreadCount = 0, markAsRead, markAllAsRead } = useNotifications() || {};
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'CRITICAL': 
            case 'FRAUD_ALERT': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'WARNING': 
            case 'ADMIN_ALERT': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
            case 'SUCCESS': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'CHAT_MESSAGE': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'ASSESSMENT_CREATED': return <Rocket className="w-4 h-4 text-purple-500" />;
            case 'EXAM_ASSIGNED': return <Target className="w-4 h-4 text-fuchsia-500" />;
            case 'PROMOTION': return <Award className="w-4 h-4 text-yellow-500" />;
            case 'WELCOME': return <Shield className="w-4 h-4 text-indigo-500" />;
            default: return <Info className="w-4 h-4 text-purple-500" />;
        }
    };

    // Only keep items where isRead is false!
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadNotifications = safeNotifications.filter(n => n.isRead === false);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 sm:p-2.5 rounded-xl bg-gray-100 dark:bg-[#1a0d36] border-2 border-transparent hover:border-gray-200 dark:hover:border-purple-900/50 transition-all active:scale-95 cursor-pointer shadow-inner"
            >
                <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-[#0f0a1c] shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)}></div>

                    <div className="fixed sm:absolute top-[70px] sm:top-full right-4 sm:right-0 left-4 sm:left-auto mt-0 sm:mt-3 w-auto sm:w-96 bg-white/90 dark:bg-[#150a29]/90 backdrop-blur-xl border-2 border-gray-100 dark:border-purple-900/50 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in">
                        <div className="bg-gray-50/80 dark:bg-[#1a0d36]/80 p-3 sm:p-4 border-b-2 border-gray-100 dark:border-purple-900/30 flex justify-between items-center">
                            <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-[10px] sm:text-xs flex items-center gap-2"><Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" /> New Alerts</h3>
                            {unreadCount > 0 && markAllAsRead && (
                                <button onClick={markAllAsRead} className="text-[9px] sm:text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer transition-colors"><CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Mark all read</button>
                            )}
                        </div>

                        <div className="max-h-[300px] sm:max-h-[350px] overflow-y-auto custom-scrollbar">
                            {/* MAPPING OVER THE UNREAD NOTIFICATIONS ONLY */}
                            {unreadNotifications.length === 0 ? (
                                <div className="p-10 sm:p-12 text-center flex flex-col items-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3 opacity-50" />
                                    <span className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest">You're all caught up!</span>
                                </div>
                            ) : (
                                unreadNotifications.slice(0, 5).map(notif => (
                                    <div 
                                        key={notif.id} 
                                        onClick={() => { 
                                            if (markAsRead) markAsRead(notif.id); 
                                            if (notif.targetUrl) navigate(notif.targetUrl); 
                                            setIsOpen(false); 
                                        }} 
                                        className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800/50 transition-colors cursor-pointer flex gap-3 group bg-purple-50/30 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    >
                                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 border shadow-inner bg-white dark:bg-[#150a29] border-gray-200 dark:border-gray-700">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-[11px] sm:text-xs font-black text-gray-900 dark:text-white mb-0.5 sm:mb-1 group-hover:text-purple-600 transition-colors">{notif.title}</h4>
                                            <p className="text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 font-medium line-clamp-2 leading-relaxed">{notif.message}</p>
                                            <span className="text-[8px] sm:text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5 sm:mt-2 block">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-600 rounded-full shrink-0 mt-1"></div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => {
                                setIsOpen(false);
                                const rolePath = user?.role ? user.role.toLowerCase() : 'student';
                                navigate(`/${rolePath}/notifications`);
                            }}
                            className="w-full p-3 sm:p-4 bg-gray-50 dark:bg-[#1a0d36] text-[9px] sm:text-[10px] font-black text-center uppercase tracking-widest text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer border-t-2 border-gray-100 dark:border-purple-900/30"
                        >
                            Open Communications Registry
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}