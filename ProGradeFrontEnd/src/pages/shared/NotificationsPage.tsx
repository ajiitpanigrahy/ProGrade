import React, { useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, ShieldAlert, Info, Trash2, CheckCheck, Filter, Clock, ExternalLink, ChevronDown, ChevronUp, Mail, MailOpen, MailPlus } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationsPage() {
    const { notifications = [], markAsRead, markAllAsRead, markAsUnread, markAllAsUnread, deleteNotification } = useNotifications() || {};
    const navigate = useNavigate();

    // Filters & Sorting
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL'>('ALL');
    const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
    
    // Expandable Rows State
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const safeNotifications = Array.isArray(notifications) ? notifications : [];

    // Apply Filters & Sort
    const processedNotifications = safeNotifications.filter(n => {
        if (statusFilter === 'READ' && !n.isRead) return false;
        if (statusFilter === 'UNREAD' && n.isRead) return false;
        if (typeFilter !== 'ALL' && n.type !== typeFilter) return false;
        return true;
    }).sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

    const toggleRow = (id: number) => {
        const newSet = new Set(expandedRows);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedRows(newSet);

        // Auto-mark as read when expanding an unread message
        const notif = safeNotifications.find(n => n.id === id);
        if (notif && !notif.isRead && markAsRead) {
            markAsRead(id);
        }
    };

    const getTypeStyles = (type: string) => {
        if (type === 'CRITICAL' || type === 'FRAUD_ALERT') return { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' };
        if (type === 'WARNING' || type === 'ADMIN_ALERT') return { icon: <ShieldAlert className="w-4 h-4 text-amber-500" />, dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30' };
        if (type === 'SUCCESS') return { icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30' };
        return { icon: <Info className="w-4 h-4 text-purple-500" />, dot: 'bg-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-900/30' };
    };

    // Calculate time ago
    const timeAgo = (dateString: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
        if (seconds < 60) return "Just now";
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
            
            {/* 3D Atmospheric Background */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* HEADER & BULK ACTIONS */}
            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 sm:p-8 rounded-[2rem] flex flex-col xl:flex-row xl:items-center justify-between gap-6 shrink-0 z-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 flex items-center gap-3 drop-shadow-sm">
                        <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" /> Communications Registry
                    </h2>
                    <p className="text-sm text-gray-500 font-bold mt-2 tracking-wide">Monitor all automated system alerts, administrative messages, and test updates.</p>
                </div>
                
                <div className="flex flex-wrap gap-3 w-full xl:w-auto">
                    {markAllAsRead && (
                        <button onClick={markAllAsRead} className="flex-1 xl:flex-none bg-white dark:bg-[#1a0d36] text-emerald-600 dark:text-emerald-400 font-black px-5 py-2.5 rounded-xl border-2 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                            <CheckCheck className="w-4 h-4"/> Mark All Read
                        </button>
                    )}
                    {markAllAsUnread && (
                        <button onClick={markAllAsUnread} className="flex-1 xl:flex-none bg-white dark:bg-[#1a0d36] text-amber-600 dark:text-amber-400 font-black px-5 py-2.5 rounded-xl border-2 border-amber-200 dark:border-amber-900/50 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                            <MailPlus className="w-4 h-4"/> Mark All Unread
                        </button>
                    )}
                </div>
            </div>

            {/* CONTROL BAR (Filters & Sort) */}
            <div className="flex flex-col md:flex-row gap-4 justify-between bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-md p-4 rounded-3xl border-2 border-gray-200 dark:border-purple-900/40 shadow-sm relative z-10">
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                    
                    {/* Status Filter */}
                    <div className="flex items-center w-full sm:w-auto bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-1 shadow-inner focus-within:border-purple-500 transition-colors">
                        <Filter className="w-4 h-4 text-gray-400 shrink-0 mx-2" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="w-full bg-transparent py-2.5 text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
                            <option value="ALL">All Status</option>
                            <option value="UNREAD">Unread Only</option>
                            <option value="READ">Read Only</option>
                        </select>
                    </div>
                    
                    {/* Type Filter */}
                    <div className="flex items-center w-full sm:w-auto bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-1 shadow-inner focus-within:border-purple-500 transition-colors">
                        <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mx-2" />
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="w-full bg-transparent py-2.5 text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
                            <option value="ALL">All Types</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="WARNING">Warning</option>
                            <option value="SUCCESS">Success</option>
                            <option value="INFO">Information</option>
                        </select>
                    </div>

                    {/* Sort Order */}
                    <div className="flex items-center w-full sm:w-auto sm:ml-auto bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-1 shadow-inner focus-within:border-purple-500 transition-colors">
                        <Clock className="w-4 h-4 text-gray-400 shrink-0 mx-2" />
                        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-full bg-transparent py-2.5 text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* DATA TABLE */}
            <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-200 dark:border-purple-900/50 overflow-hidden min-h-[400px] relative z-10">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50/80 dark:bg-[#150a29]/80 backdrop-blur-md border-b-2 border-gray-200 dark:border-purple-900/50">
                            <tr className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-black">
                                <th className="py-4 px-6 w-16 text-center">Status</th>
                                <th className="py-4 px-6">Sender</th>
                                <th className="py-4 px-6">Subject / Title</th>
                                <th className="py-4 px-6 text-center w-32">Received</th>
                                <th className="py-4 px-6 text-right w-48">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {processedNotifications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                            <Bell className="w-12 h-12 mb-3 opacity-50" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No notifications found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processedNotifications.map((notif) => {
                                    const isExpanded = expandedRows.has(notif.id);
                                    const styles = getTypeStyles(notif.type);
                                    
                                    return (
                                        <React.Fragment key={notif.id}>
                                            {/* MAIN ROW */}
                                            <tr 
                                                onClick={() => toggleRow(notif.id)}
                                                className={`group cursor-pointer transition-all duration-200 ${notif.isRead ? 'hover:bg-gray-50 dark:hover:bg-[#110820] opacity-80' : 'bg-purple-50/30 dark:bg-purple-900/10 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
                                            >
                                                <td className="py-4 px-6 text-center relative">
                                                    {!notif.isRead ? (
                                                        <span className="relative flex h-3 w-3 mx-auto">
                                                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}></span>
                                                          <span className={`relative inline-flex rounded-full h-3 w-3 ${styles.dot}`}></span>
                                                        </span>
                                                    ) : (
                                                        <MailOpen className="w-4 h-4 text-gray-400 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className={`text-sm ${!notif.isRead ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-600 dark:text-gray-400'}`}>
                                                        {notif.sender}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="shrink-0">{styles.icon}</div>
                                                        <div className={`text-sm truncate max-w-[200px] sm:max-w-xs md:max-w-md ${!notif.isRead ? 'font-black text-gray-900 dark:text-white' : 'font-bold text-gray-700 dark:text-gray-300'}`}>
                                                            {notif.title}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center text-xs font-bold text-gray-500 whitespace-nowrap">
                                                    {timeAgo(notif.createdAt)}
                                                </td>
                                                <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex justify-end gap-2 items-center">
                                                        {notif.isRead && markAsUnread ? (
                                                            <button title="Mark as Unread" onClick={() => markAsUnread(notif.id)} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors cursor-pointer"><Mail className="w-4 h-4"/></button>
                                                        ) : markAsRead && !notif.isRead ? (
                                                            <button title="Mark as Read" onClick={() => markAsRead(notif.id)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors cursor-pointer"><CheckCheck className="w-4 h-4"/></button>
                                                        ) : null}
                                                        
                                                        {deleteNotification && (
                                                            <button title="Delete Notification" onClick={() => deleteNotification(notif.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"><Trash2 className="w-4 h-4"/></button>
                                                        )}
                                                        
                                                        <button className="p-2 text-gray-400 group-hover:text-purple-500 transition-colors pointer-events-none">
                                                            {isExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* EXPANDED DESCRIPTION ROW */}
                                            {isExpanded && (
                                                <tr className={`border-b-0 animate-in fade-in slide-in-from-top-2 ${styles.bg}`}>
                                                    <td colSpan={5} className="py-6 px-8 sm:px-12">
                                                        <div className="flex flex-col gap-4">
                                                            <div className="flex items-start gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#150a29] flex items-center justify-center shadow-inner shrink-0 border border-gray-100 dark:border-gray-800">
                                                                    {styles.icon}
                                                                </div>
                                                                <div>
                                                                    <h4 className="text-base font-black text-gray-900 dark:text-white mb-1">{notif.title}</h4>
                                                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{notif.message}</p>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-200 dark:border-gray-800/50 pl-14">
                                                                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">{new Date(notif.createdAt).toLocaleString()}</span>
                                                                
                                                                {notif.targetUrl && (
                                                                    <button 
                                                                        onClick={() => navigate(notif.targetUrl!)} 
                                                                        className="bg-purple-600 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-purple-700 transition-colors flex items-center gap-2 cursor-pointer shadow-[0_4px_10px_rgba(147,51,234,0.3)] active:scale-95"
                                                                    >
                                                                        View Action <ExternalLink className="w-3.5 h-3.5"/>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}