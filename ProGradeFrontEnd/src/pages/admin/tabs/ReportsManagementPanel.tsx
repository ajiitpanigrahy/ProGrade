import { useState, useEffect, type SyntheticEvent } from 'react';
import { reportService } from '../../../features/shared/reportService';
import { AlertTriangle, CheckSquare, Search, Loader2, Edit3, X, ChevronDown, ChevronUp, AlertOctagon, User, Bug, MessageSquare, Ticket, RefreshCcw, Link, Calendar, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie } from 'recharts';

export default function ReportsManagementPanel() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // 🌟 ADVANCED FILTERING & SORTING STATE
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [sortOrder, setSortOrder] = useState('NEWEST');
    const [searchStr, setSearchStr] = useState('');
    
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: number | null; status: string; notes: string }>({
        isOpen: false, id: null, status: '', notes: ''
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = () => {
        setLoading(true);
        reportService.getAdminReports()
            .then(setReports)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const initiateStatusUpdate = (e: SyntheticEvent, id: number, newStatus: string) => {
        e.stopPropagation();
        setConfirmModal({ isOpen: true, id, status: newStatus, notes: '' });
    };

    const executeStatusUpdate = async () => {
        if (confirmModal.id) {
            await reportService.updateReportStatus(confirmModal.id, confirmModal.status, confirmModal.notes);
            setConfirmModal({ isOpen: false, id: null, status: '', notes: '' });
            fetchReports();
        }
    };

    // 🌟 ENHANCED FILTER & SORT LOGIC
    let processedReports = reports.filter(r => {
        const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
        const matchType = filterType === 'ALL' || r.type === filterType;
        const matchSeverity = filterSeverity === 'ALL' || r.severity === filterSeverity;
        const matchSearch = r.cause.toLowerCase().includes(searchStr.toLowerCase()) || r.reporterEmail.toLowerCase().includes(searchStr.toLowerCase());
        return matchStatus && matchType && matchSeverity && matchSearch;
    });

    processedReports.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === 'NEWEST' ? dateB - dateA : dateA - dateB;
    });

    // KPI Calculations
    const totalCount = reports.length;
    const openCount = reports.filter(r => r.status === 'OPEN').length;
    const investigatingCount = reports.filter(r => r.status === 'INVESTIGATING').length;
    const resolvedCount = reports.filter(r => r.status === 'RESOLVED').length;
    const dismissedCount = reports.filter(r => r.status === 'DISMISSED').length;

    const typeDistribution = [
        { name: 'Bugs', count: reports.filter(r => r.type === 'BUG_REPORT').length, color: '#ec4899' },
        { name: 'Users', count: reports.filter(r => r.type === 'USER_BEHAVIOR').length, color: '#f59e0b' },
        { name: 'Features', count: reports.filter(r => r.type === 'FEATURE_REQUEST').length, color: '#3b82f6' },
        { name: 'Chat', count: reports.filter(r => r.type === 'CHAT_ABUSE').length, color: '#ef4444' },
    ];

    const statusPieData = [
        { name: 'Open', value: openCount, color: '#f59e0b' },
        { name: 'Investigating', value: investigatingCount, color: '#3b82f6' },
        { name: 'Resolved', value: resolvedCount, color: '#10b981' },
        { name: 'Dismissed', value: dismissedCount, color: '#6b7280' },
    ].filter(d => d.value > 0);

    const formatTime = (dateString?: string) => {
        if (!dateString) return 'Pending';
        return new Date(dateString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="py-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600"/></div>;

    const selectClass = "bg-gray-50 dark:bg-[#0f0a1c] border-2 border-transparent hover:border-purple-500/50 focus:border-purple-500 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-3 sm:py-3.5 outline-none cursor-pointer dark:text-white text-xs sm:text-sm font-bold transition-all shadow-inner appearance-none w-full";

    return (
        <div className="space-y-6 sm:space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 relative">
            
            {/* 🌟 STATUS UPDATE MODAL */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#150a29] w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-purple-900/50 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2"><Edit3 className="w-5 h-5 text-purple-500"/> Update Status</h3>
                            <button onClick={() => setConfirmModal({isOpen:false, id:null, status:'', notes:''})} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors cursor-pointer"><X className="w-4 h-4"/></button>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4">
                            You are changing this ticket's status to <span className="font-black text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded uppercase">{confirmModal.status}</span>.
                        </p>

                        <div className="space-y-3 mb-8">
                            <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Resolution Notes (Visible to User)</label>
                            <textarea 
                                rows={3} 
                                placeholder="Explain what action was taken..."
                                value={confirmModal.notes}
                                onChange={(e) => setConfirmModal(prev => ({...prev, notes: e.target.value}))}
                                className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 outline-none cursor-text focus:border-purple-500 transition-colors text-sm dark:text-white resize-none custom-scrollbar shadow-inner"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal({isOpen:false, id:null, status:'', notes:''})} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer text-sm">Cancel</button>
                            <button onClick={executeStatusUpdate} className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all cursor-pointer text-sm">Confirm Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* KPI WIDGETS */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[
                    { label: 'Total Reports', count: totalCount, icon: Ticket, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800/50' },
                    { label: 'Open', count: openCount, icon: AlertOctagon, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50' },
                    { label: 'Investigating', count: investigatingCount, icon: Search, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800/50' },
                    { label: 'Resolved', count: resolvedCount, icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50' },
                    { label: 'Dismissed', count: dismissedCount, icon: X, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-700' },
                ].map((kpi, idx) => (
                    <div key={idx} className={`p-4 sm:p-5 rounded-[1.5rem] border ${kpi.border} bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-xl shadow-[0_8px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_15px_30px_rgba(147,51,234,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-center items-center text-center cursor-default group`}>
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${kpi.bg} ${kpi.color} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform`}>
                            <kpi.icon className="w-4 h-4 sm:w-5 sm:h-5"/>
                        </div>
                        <p className="text-xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-none">{kpi.count}</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                <div className="bg-white dark:bg-[#150a29] rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-purple-900/50 shadow-sm flex flex-col items-center">
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 text-sm uppercase tracking-widest w-full text-left">Status Distribution</h3>
                    <div className="h-56 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Tooltip contentStyle={{backgroundColor: '#0f0a1c', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold'}} itemStyle={{color: 'white'}} />
                                <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                    {statusPieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="text-2xl font-black dark:text-white">{totalCount}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-[#150a29] rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-purple-900/50 shadow-sm">
                    <h3 className="font-black text-gray-900 dark:text-white mb-6 text-sm uppercase tracking-widest">Category Distribution</h3>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeDistribution} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} dy={10} />
                                <YAxis stroke="#6b7280" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.05)'}} contentStyle={{backgroundColor: '#0f0a1c', border: '1px solid rgba(88, 28, 135, 0.5)', borderRadius: '12px', color: 'white', fontWeight: 'bold'}} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                                    {typeDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* LIST AREA */}
            <div className="bg-white dark:bg-[#150a29] rounded-[2rem] p-4 sm:p-8 border border-gray-100 dark:border-purple-900/50 shadow-sm flex flex-col">
                
                {/* 🌟 ADVANCED FILTERS */}
                <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 mb-6 shrink-0">
                    <div className="flex-1 relative group w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                        <input type="text" placeholder="Search subject or email..." value={searchStr} onChange={e => setSearchStr(e.target.value)} className="w-full pl-11 pr-4 py-3 sm:py-3.5 bg-gray-50 dark:bg-[#0f0a1c] border-2 border-transparent focus:border-purple-500 rounded-xl sm:rounded-2xl outline-none cursor-text dark:text-white text-sm transition-all shadow-inner font-medium" />
                    </div>
                    
                    <div className="grid grid-cols-2 md:flex gap-3 sm:gap-4 w-full xl:w-auto">
                        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass}>
                            <option value="ALL">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="INVESTIGATING">Investigating</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="DISMISSED">Dismissed</option>
                        </select>
                        <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectClass}>
                            <option value="ALL">All Categories</option>
                            <option value="BUG_REPORT">System Bugs</option>
                            <option value="FEATURE_REQUEST">Features</option>
                            <option value="USER_BEHAVIOR">User Issues</option>
                            <option value="CHAT_ABUSE">Chat Abuse</option>
                        </select>
                        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className={selectClass}>
                            <option value="ALL">All Severities</option>
                            <option value="IMMEDIATE">Immediate</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className={selectClass}>
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                    </div>
                </div>

                {/* 🌟 REPORTS LIST */}
                <div className="space-y-4">
                    {processedReports.map(report => {
                        const isExpanded = expandedId === report.id;
                        const isReopened = report.reopened || report.isReopened;

                        return (
                            <div key={report.id} className={`bg-gray-50 dark:bg-[#1a0d36] rounded-2xl border-2 transition-all duration-300 overflow-hidden ${isExpanded ? 'border-purple-500 shadow-lg dark:shadow-purple-900/20' : 'border-gray-200 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md'}`}>
                                
                                {/* CARD HEADER */}
                                <div 
                                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                                    className="p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer"
                                >
                                    <div className="flex-1 flex flex-col gap-2.5 min-w-0 w-full">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-widest shadow-sm shrink-0
                                                ${report.severity === 'IMMEDIATE' ? 'bg-red-500 text-white' : 
                                                  report.severity === 'HIGH' ? 'bg-amber-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                                                {report.severity}
                                            </span>
                                            
                                            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-md border border-purple-200 dark:border-purple-800/50 shrink-0">
                                                {report.type.replace('_', ' ')}
                                            </span>
                                            
                                            {isReopened && (
                                                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white bg-red-600 px-2.5 py-1 rounded border border-red-800 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse shrink-0 flex items-center gap-1">
                                                    <RefreshCcw className="w-3 h-3"/> Re-Reported
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-sm sm:text-base dark:text-white truncate w-full">{report.cause}</h4>
                                    </div>

                                    <div className="flex items-center gap-3 sm:gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                                        <select 
                                            value={report.status}
                                            onChange={(e) => initiateStatusUpdate(e, report.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className={`flex-1 md:flex-none text-xs sm:text-sm font-black px-4 py-2 sm:py-2.5 rounded-xl outline-none cursor-pointer border-2 transition-all appearance-none text-center shadow-sm hover:scale-[1.02]
                                                ${report.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800' : 
                                                  report.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 
                                                  report.status === 'DISMISSED' ? 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' :
                                                  'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'}`}
                                        >
                                            <option value="OPEN">🟢 OPEN</option>
                                            <option value="INVESTIGATING">🟡 INVESTIGATING</option>
                                            <option value="RESOLVED">🔵 RESOLVED</option>
                                            <option value="DISMISSED">⚪ DISMISSED</option>
                                        </select>
                                        
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500 shrink-0">
                                            {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5"/> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5"/>}
                                        </div>
                                    </div>
                                </div>

                                {/* 🌟 ENHANCED DETAILS PANEL */}
                                {isExpanded && (
                                    <div className="border-t-2 border-gray-200 dark:border-purple-900/50 p-4 sm:p-8 bg-white dark:bg-[#110820] animate-in slide-in-from-top-2 relative overflow-hidden">
                                        
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] pointer-events-none rounded-full"></div>

                                        {isReopened && (
                                            <div className="mb-6 p-4 sm:p-5 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-2xl flex items-start gap-3 sm:gap-4 shadow-sm relative z-10">
                                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 shrink-0 mt-0.5"/>
                                                <div>
                                                    <h5 className="text-sm sm:text-base font-black text-red-800 dark:text-red-400 mb-1">User Dissatisfaction Alert</h5>
                                                    <p className="text-xs sm:text-sm text-red-700 dark:text-red-300 font-medium leading-relaxed">This report was previously marked closed, but the user was unsatisfied with the resolution and forcefully re-opened it. Please review their ticket carefully.</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* 🌟 3-COLUMN METADATA GRID */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 mb-8 relative z-10">
                                            
                                            {/* Users Column */}
                                            <div className="bg-gray-50 dark:bg-[#1a0d36] p-5 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm space-y-4">
                                                <div>
                                                    <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><User className="w-3.5 h-3.5"/> Reporter Email</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white break-all">{report.reporterEmail}</p>
                                                </div>
                                                {report.targetUserEmail && (
                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                                                        <p className="text-[10px] sm:text-xs font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><AlertTriangle className="w-3.5 h-3.5"/> Target User (Reported)</p>
                                                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400 break-all">{report.targetUserEmail}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Context Column */}
                                            <div className="bg-gray-50 dark:bg-[#1a0d36] p-5 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm space-y-4">
                                                {report.featureName && (
                                                    <div>
                                                        <p className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Bug className="w-3.5 h-3.5"/> Target Feature</p>
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400 break-all">{report.featureName}</p>
                                                    </div>
                                                )}
                                                {report.pageUrl && (
                                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-800">
                                                        <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2"><Link className="w-3.5 h-3.5"/> Page URL</p>
                                                        <p className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all bg-gray-200 dark:bg-gray-800 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700">{report.pageUrl}</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Timeline Column */}
                                            <div className="bg-gray-50 dark:bg-[#1a0d36] p-5 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm space-y-4 md:col-span-2 xl:col-span-1">
                                                <div>
                                                    <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Calendar className="w-3.5 h-3.5"/> Initial Report</p>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{formatTime(report.createdAt)}</p>
                                                </div>
                                                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between gap-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Investigating</p>
                                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatTime(report.investigatingAt)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Resolved</p>
                                                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatTime(report.resolvedAt)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>

                                        {/* Content Areas */}
                                        <div className="space-y-6 relative z-10">
                                            <div>
                                                <p className="text-[10px] sm:text-xs font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-purple-500"/> Detailed Description</p>
                                                <div className="bg-gray-50 dark:bg-[#0f0a1c] p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-purple-900/50 shadow-inner">
                                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                                                </div>
                                            </div>

                                            {report.suggestions && (
                                                <div>
                                                    <p className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Lightbulb className="w-4 h-4"/> User Suggestions</p>
                                                    <div className="bg-emerald-50/80 dark:bg-emerald-900/10 p-5 sm:p-6 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                                                        <p className="text-sm text-emerald-900 dark:text-emerald-200 italic leading-relaxed whitespace-pre-wrap">"{report.suggestions}"</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {processedReports.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500 font-medium text-sm bg-gray-50/50 dark:bg-[#1a0d36]/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-purple-900/30">
                            <Search className="w-12 h-12 mb-4 opacity-20"/>
                            <p className="text-xl font-black text-gray-400 dark:text-gray-600 mb-1">No reports found</p>
                            <p className="text-xs">Try adjusting your search query or dropdown filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}