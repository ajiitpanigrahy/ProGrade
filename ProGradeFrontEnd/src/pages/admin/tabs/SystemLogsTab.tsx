import React, { useState, useEffect } from 'react';
import { Database, ArrowUpDown, ArrowRight, ArrowLeft, Loader2, UserCircle, Globe, Clock, ShieldAlert, Sparkles, AlertTriangle, Bug, ChevronDown, ChevronUp, Activity, BarChart3, ListTree, User, Server, CheckCircle2, Terminal } from 'lucide-react';
import { adminService } from '../../../features/admin/adminService';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LogEvent {
    id?: number;
    eventId?: number;
    timestamp: number | string;
    levelString?: string;
    level?: string;
    actor?: string;
    ipAddress?: string;
    className?: string;
    loggerName?: string;
    callerClass?: string;
    methodName?: string;
    formattedMessage?: string;
    message?: string;
    exception?: string;
}

const PAGE_SIZE = 100; // Keeps the table fast and paginated

export default function SystemLogsTab() {
    const [activeSubTab, setActiveSubTab] = useState<'AUDIT_STREAM' | 'ANALYTICS'>('AUDIT_STREAM');

    // Filters & Pagination State
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL'); 
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('DESC');
    
    // Table Data State
    const [logs, setLogs] = useState<LogEvent[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRow, setExpandedRow] = useState<number | null>(null);

    // 🌟 Global Analytics State
    const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false);
    const [analytics, setAnalytics] = useState({ severityData: [], moduleData: [], timelineData: [], actorData: [], totalGlobalLogs: 0 });

    const input3DClass = "w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 focus:border-purple-500 focus:ring-4 ring-purple-600/20 outline-none text-gray-900 dark:text-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-pointer font-bold text-xs uppercase tracking-wider";

    // 🌟 FETCH PAGINATED LOGS FOR TABLE
    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getSystemLogs(
                levelFilter, dateFilter, customStart, customEnd, currentPage, PAGE_SIZE, sortOrder
            );
            setLogs(data.content || []);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 🌟 FETCH GLOBAL LOGS FOR ANALYTICS (Background Task)
    const fetchAnalytics = async () => {
        setIsAnalyticsLoading(true);
        try {
            // Fetch up to 50,000 logs for the current filter to guarantee accurate graphs!
            const data = await adminService.getSystemLogs(
                levelFilter, dateFilter, customStart, customEnd, 1, 50000, sortOrder
            );
            const globalLogs = data.content || [];

            const severityCounts = { ERROR: 0, WARN: 0, INFO: 0, DEBUG: 0 };
            const moduleCounts: Record<string, number> = {};
            const timelineCounts: Record<string, number> = {};
            const actorCounts: Record<string, number> = {};

            // Sort oldest to newest for timeline
            [...globalLogs].reverse().forEach((log: any) => {
                // Severity
                const lvl = (log.level || log.levelString || 'INFO').toUpperCase();
                if (severityCounts[lvl as keyof typeof severityCounts] !== undefined) severityCounts[lvl as keyof typeof severityCounts]++;
                else severityCounts.INFO++;

                // Modules
                const modName = log.className || log.callerClass?.split('.').pop() || 'Unknown';
                moduleCounts[modName] = (moduleCounts[modName] || 0) + 1;

                // Actors
                const actorName = log.actor || 'SYSTEM';
                actorCounts[actorName] = (actorCounts[actorName] || 0) + 1;

                // Smart Timeline Grouping (Prevents chart crash with 6000+ logs)
                const d = new Date(log.timestamp);
                let timeKey = '';
                if (dateFilter === 'TODAY') {
                    timeKey = d.toLocaleTimeString([], { hour: '2-digit', hour12: true }); // Groups by Hour
                } else if (dateFilter === 'WEEKLY' || dateFilter === '15D' || dateFilter === '30D') {
                    timeKey = d.toLocaleDateString([], { month: 'short', day: 'numeric' }); // Groups by Day
                } else {
                    timeKey = d.toLocaleDateString([], { year: 'numeric', month: 'short' }); // Groups by Month
                }
                timelineCounts[timeKey] = (timelineCounts[timeKey] || 0) + 1;
            });

            const severityData = [
                { name: 'INFO', value: severityCounts.INFO, color: '#10b981' },
                { name: 'WARN', value: severityCounts.WARN, color: '#f59e0b' },
                { name: 'ERROR', value: severityCounts.ERROR, color: '#ef4444' },
                { name: 'DEBUG', value: severityCounts.DEBUG, color: '#8b5cf6' }
            ].filter(d => d.value > 0);

            const moduleData = Object.entries(moduleCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
            const actorData = Object.entries(actorCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);
            const timelineData = Object.entries(timelineCounts).map(([time, count]) => ({ time, count }));

            setAnalytics({ severityData, moduleData, timelineData, actorData, totalGlobalLogs: globalLogs.length } as any);
        } catch (error) {
            console.error("Failed to compile analytics", error);
        } finally {
            setIsAnalyticsLoading(false);
        }
    };

    useEffect(() => { fetchLogs(); }, [currentPage, sortOrder]);

    // Fetch Analytics ONLY when we first switch to the tab
    const handleTabSwitch = (tab: 'AUDIT_STREAM' | 'ANALYTICS') => {
        setActiveSubTab(tab);
        if (tab === 'ANALYTICS' && analytics.totalGlobalLogs === 0) {
            fetchAnalytics();
        }
    };

    const handleApplyFilters = () => { 
        setCurrentPage(1); 
        fetchLogs(); 
        if (activeSubTab === 'ANALYTICS') fetchAnalytics(); 
    };

    const getLevelBadge = (level?: string) => {
        const lvl = (level || 'INFO').toUpperCase();
        if (lvl === 'ERROR' || lvl === 'CRITICAL') return { icon: AlertTriangle, colors: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]', name: 'ERROR' };
        if (lvl === 'WARN') return { icon: ShieldAlert, colors: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]', name: 'WARN' };
        if (lvl === 'INFO' || lvl === 'SUCCESS') return { icon: CheckCircle2, colors: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]', name: 'INFO' };
        return { icon: Bug, colors: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30 shadow-[inset_0_0_10px_rgba(107,114,128,0.1)]', name: 'DEBUG' };
    };

    const toggleRow = (id: number) => setExpandedRow(expandedRow === id ? null : id);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-[#150a29]/90 backdrop-blur-md border-2 border-gray-200 dark:border-purple-900/50 p-3 rounded-xl shadow-xl">
                    <p className="text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">{label}</p>
                    {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }}></span>
                            {p.name}: <span style={{ color: p.color || p.fill }}>{p.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen">
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-10 shadow-sm relative">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 flex items-center gap-2 drop-shadow-sm">
                        <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Enterprise Audit & Security Telemetry
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1 tracking-wide">Monitor platform security, API execution, and real-time performance analytics.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-[#0f0a1c] p-1.5 rounded-xl border-2 border-gray-200 dark:border-purple-900/50 shadow-inner w-full md:w-auto">
                    <button onClick={() => handleTabSwitch('AUDIT_STREAM')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase ${activeSubTab === 'AUDIT_STREAM' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <ListTree className="w-4 h-4" /> Audit Stream
                    </button>
                    <button onClick={() => handleTabSwitch('ANALYTICS')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase ${activeSubTab === 'ANALYTICS' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <BarChart3 className="w-4 h-4" /> Analytics Visuals
                    </button>
                </div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-4 bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-md p-5 rounded-3xl border-2 border-gray-200 dark:border-purple-900/40 shadow-sm items-end">
                <div className="flex-1 w-full lg:w-auto">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">Severity Status</label>
                    <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className={input3DClass}>
                        <option value="ALL">All Levels</option><option value="ERROR">Errors & Failures</option><option value="WARN">Warnings & Slow APIs</option><option value="INFO">Info & Success</option><option value="DEBUG">Debug Traces</option>
                    </select>
                </div>

                <div className="flex-1 w-full lg:w-auto">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">Time Window</label>
                    <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={input3DClass}>
                        <option value="ALL">All Time History</option><option value="TODAY">Today Only</option><option value="WEEKLY">Last 7 Days</option><option value="30D">Last 30 Days</option><option value="CUSTOM">Custom Range...</option>
                    </select>
                </div>
                
                {dateFilter === 'CUSTOM' && (
                    <div className="flex gap-3 w-full lg:w-auto">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">From</label>
                            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className={`${input3DClass} [color-scheme:light] dark:[color-scheme:dark]`} />
                        </div>
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">To</label>
                            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className={`${input3DClass} [color-scheme:light] dark:[color-scheme:dark]`} />
                        </div>
                    </div>
                )}

                <button onClick={handleApplyFilters} disabled={isLoading || isAnalyticsLoading} className="w-full lg:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black px-10 py-3.5 rounded-xl border-b-4 border-indigo-900 active:border-b-0 active:translate-y-1 shadow-[0_10px_30px_-10px_rgba(147,51,234,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer uppercase tracking-widest text-xs">
                    {(isLoading || isAnalyticsLoading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4"/> Scan Telemetry</>}
                </button>
            </div>

            {/* 🌟 TAB 1: GRAPH ANALYTICS */}
            {activeSubTab === 'ANALYTICS' && (
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4">
                    
                    {/* Area Chart: Timeline */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30 lg:col-span-2 relative overflow-hidden group min-h-[350px]">
                        {isAnalyticsLoading && <div className="absolute inset-0 bg-white/60 dark:bg-[#1a0d36]/60 backdrop-blur-sm z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-colors"></div>
                        
                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500"/> Traffic Pulse (Filtered Window)</h3>
                            <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-[10px] font-black uppercase">Analyzed: {analytics.totalGlobalLogs} Logs</span>
                        </div>

                        <div className="h-72 w-full relative z-10">
                            {analytics.timelineData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">No telemetry data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.timelineData}>
                                        <defs>
                                            <linearGradient id="colorPulse" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6b7280" opacity={0.2} />
                                        <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="count" name="Events" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorPulse)" activeDot={{ r: 6, fill: '#fff', stroke: '#8b5cf6', strokeWidth: 3 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Doughnut Chart: Severity */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden group min-h-[350px]">
                        {isAnalyticsLoading && <div className="absolute inset-0 bg-white/60 dark:bg-[#1a0d36]/60 backdrop-blur-sm z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl group-hover:bg-rose-500/20 transition-colors"></div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-2 relative z-10"><ShieldAlert className="w-5 h-5 text-amber-500"/> Severity Index</h3>
                        <div className="h-64 w-full relative mt-4 z-10">
                            {analytics.severityData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">No telemetry data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={analytics.severityData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} cornerRadius={8} dataKey="value" stroke="none">
                                            {analytics.severityData.map((entry: any, index: number) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'black' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
                                <span className="text-3xl font-black text-gray-900 dark:text-white">{analytics.totalGlobalLogs}</span>
                                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Total</span>
                            </div>
                        </div>
                    </div>

                    {/* Bar Chart: Modules */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30 lg:col-span-2 relative overflow-hidden group min-h-[350px]">
                        {isAnalyticsLoading && <div className="absolute inset-0 bg-white/60 dark:bg-[#1a0d36]/60 backdrop-blur-sm z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2 relative z-10"><Server className="w-5 h-5 text-blue-500"/> Most Active Modules</h3>
                        <div className="h-72 w-full relative z-10">
                            {analytics.moduleData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">No telemetry data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.moduleData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6b7280" opacity={0.2} />
                                        <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{fill: 'rgba(107, 114, 128, 0.1)'}} content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Calls" fill="url(#colorBar)" radius={[8,8,0,0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Bar Chart: Top Actors (Horizontal) */}
                    <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden group min-h-[350px]">
                        {isAnalyticsLoading && <div className="absolute inset-0 bg-white/60 dark:bg-[#1a0d36]/60 backdrop-blur-sm z-20 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-600 animate-spin" /></div>}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2 relative z-10"><User className="w-5 h-5 text-emerald-500"/> Top System Actors</h3>
                        <div className="h-72 w-full relative z-10">
                            {analytics.actorData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold text-sm">No telemetry data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analytics.actorData} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorActor" x1="0" y1="0" x2="1" y2="0">
                                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                                <stop offset="100%" stopColor="#34d399" stopOpacity={1}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#6b7280" opacity={0.2} />
                                        <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} width={80} />
                                        <Tooltip cursor={{fill: 'rgba(107, 114, 128, 0.1)'}} content={<CustomTooltip />} />
                                        <Bar dataKey="count" name="Triggers" fill="url(#colorActor)" radius={[0,8,8,0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* 🌟 TAB 2: AUDIT STREAM TABLE */}
            {activeSubTab === 'AUDIT_STREAM' && (
                <div className="relative z-10 bg-white/80 dark:bg-[#1a0d36]/90 backdrop-blur-xl border-2 border-gray-200 dark:border-purple-900/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden min-h-[600px] flex flex-col animate-in slide-in-from-bottom-4">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/40 dark:bg-[#1a0d36]/40 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-xs font-black uppercase tracking-widest text-purple-600">Querying Audit Tables...</p>
                        </div>
                    )}
                    
                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-gray-50/80 dark:bg-[#150a29]/80 backdrop-blur-md sticky top-0 z-10 border-b-2 border-gray-200 dark:border-purple-900/50">
                                <tr className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-black">
                                    <th className="py-4 px-5 cursor-pointer hover:text-purple-500 transition-colors flex items-center gap-1 select-none" onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}>
                                        Timestamp <ArrowUpDown className="w-3 h-3" />
                                    </th>
                                    <th className="py-4 px-5">Severity</th>
                                    <th className="py-4 px-5">Actor / Network</th>
                                    <th className="py-4 px-5">Module Endpoint</th>
                                    <th className="py-4 px-5 w-full">Operation Signature</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                {logs.length === 0 && !isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="py-24 text-center">
                                            <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                            <p className="text-gray-500 font-bold text-sm tracking-wide">No telemetry matches your parameters.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => {
                                        const logId = log.id || log.eventId || Math.random();
                                        const rawLevel = log.level || log.levelString || 'INFO';
                                        const badge = getLevelBadge(rawLevel);
                                        const Icon = badge.icon;
                                        const isExpanded = expandedRow === logId;
                                        const msg = log.message || log.formattedMessage || '--';
                                        
                                        const isSlow = msg.includes("SLOW") || msg.includes("Duration:") && parseInt(msg.split("Duration:")[1]) > 2000;

                                        return (
                                            <React.Fragment key={logId}>
                                                <tr onClick={() => toggleRow(logId)} className={`group transition-all duration-200 cursor-pointer ${isExpanded ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'hover:bg-gray-50 dark:hover:bg-[#110820]'}`}>
                                                    <td className="py-4 px-5 border-l-4 border-transparent group-hover:border-purple-500 transition-colors">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                                                            <div>
                                                                <div className="text-[11px] font-black text-gray-700 dark:text-gray-300">{new Date(log.timestamp).toLocaleDateString()}</div>
                                                                <div className="text-[10px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <span className={`flex items-center w-max gap-1.5 px-3 py-1.5 rounded-lg border-2 text-[10px] font-black uppercase tracking-wider ${badge.colors}`}>
                                                            <Icon className="w-3.5 h-3.5" /> {badge.name}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border-2 border-gray-200 dark:border-gray-700 shrink-0 shadow-sm">
                                                                <UserCircle className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-black text-gray-900 dark:text-white uppercase">{log.actor || 'SYSTEM'}</div>
                                                                <div className="text-[10px] font-bold text-gray-400 flex items-center gap-1 mt-0.5"><Globe className="w-3 h-3"/> {log.ipAddress || 'INTERNAL'}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <div className="text-xs font-black text-purple-600 dark:text-purple-400 truncate max-w-[200px]" title={log.className || log.callerClass}>
                                                            {log.className || log.callerClass?.split('.').pop() || '--'}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-gray-500 mt-0.5">.{log.methodName || 'execute'}()</div>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <div className={`text-xs font-semibold truncate max-w-[300px] xl:max-w-[400px] ${isSlow ? 'text-amber-600 dark:text-amber-400' : 'text-gray-700 dark:text-gray-300'}`} title={msg}>
                                                                {msg}
                                                            </div>
                                                            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 transition-colors">
                                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-purple-600 transition-colors" />}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>

                                                {isExpanded && (
                                                    <tr className="bg-gray-50/50 dark:bg-[#0d0714]/50 border-b-2 border-gray-100 dark:border-purple-900/30">
                                                        <td colSpan={5} className="p-4 sm:p-6">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">Execution Payload</h4>
                                                                    <div className="bg-white dark:bg-[#150a29] p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 shadow-inner">
                                                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b-2 border-gray-100 dark:border-gray-800">
                                                                            <Terminal className="w-3.5 h-3.5 text-purple-500" />
                                                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Trace</span>
                                                                        </div>
                                                                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{msg}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-wider">System Fingerprint</h4>
                                                                    <div className="bg-white dark:bg-[#150a29] p-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 shadow-inner space-y-2">
                                                                        <div className="flex justify-between text-xs border-b border-gray-100 dark:border-gray-800 pb-1.5"><span className="text-gray-500 font-bold">Event ID</span><span className="font-mono text-gray-900 dark:text-white">{logId}</span></div>
                                                                        <div className="flex justify-between text-xs border-b border-gray-100 dark:border-gray-800 pb-1.5"><span className="text-gray-500 font-bold">Origin Class</span><span className="font-mono text-gray-900 dark:text-white truncate max-w-[200px]">{log.className || log.loggerName || '--'}</span></div>
                                                                        <div className="flex justify-between text-xs pb-1.5"><span className="text-gray-500 font-bold">Authentication</span><span className="font-black text-emerald-600 dark:text-emerald-400 uppercase">{log.actor || 'SYSTEM'}</span></div>
                                                                    </div>
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
                    
                    <div className="p-4 sm:p-6 border-t-2 border-gray-200 dark:border-purple-900/50 bg-gray-50 dark:bg-[#110820] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                        <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                            Page <span className="text-purple-600 dark:text-purple-400">{currentPage}</span> of {totalPages || 1} <span className="text-gray-400 lowercase mx-1">•</span> {totalElements} Events Logged
                        </span>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1 || isLoading}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a0d36] border-2 border-gray-200 dark:border-purple-900/50 hover:border-purple-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs uppercase" 
                            >
                                <ArrowLeft className="w-4 h-4" /> Prev
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a0d36] border-2 border-gray-200 dark:border-purple-900/50 hover:border-purple-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs uppercase"
                            >
                                Next <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}