import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldCheck, Ban, Edit, GraduationCap, CheckCircle2, XCircle, Clock, BookOpen, BarChart3, Users, Star, Activity, Terminal, ArrowUpDown, Loader2, PlayCircle, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, ZAxis } from 'recharts';
import { adminService } from '../../../features/admin/adminService';

export default function EducatorHubTab() {
    const [activeTab, setActiveTab] = useState<'MANAGEMENT' | 'ANALYTICS'>('MANAGEMENT');
    
    // Filtering & Sorting
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST' | 'A-Z' | 'Z-A'>('NEWEST');
    
    // Data State
    const [educators, setEducators] = useState<any[]>([]);
    const [contributionLog, setContributionLog] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedEducator, setSelectedEducator] = useState<any | null>(null);

    // Modal State
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'ACTIVATE' | '', educator: any | null }>({
        isOpen: false, type: '', educator: null
    });
    const [actionLoading, setActionLoading] = useState(false);

    // FETCH REAL DATA
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [eduData, logData] = await Promise.all([
                adminService.getAllEducators(),
                adminService.getQuestionContributionHistory() 
            ]);
            setEducators(eduData);
            setContributionLog(logData || []);
        } catch (e) { 
            console.error("Failed to fetch educator data", e); 
        } finally { 
            setIsLoading(false); 
        }
    };

    useEffect(() => { fetchData(); }, []);

    // HELPER: Map Educator Email to their actual contribution count
    const getEducatorContributions = (email: string) => {
        const log = contributionLog.find((l: any) => l.email === email);
        return log ? log.totalQuestions : 0;
    };

    // Modal Action Executor
    const executeAction = async () => {
        if (!modalConfig.educator) return;
        setActionLoading(true);
        try {
            if (modalConfig.type === 'APPROVE') await adminService.approveEducator(modalConfig.educator.id);
            if (modalConfig.type === 'REJECT') await adminService.rejectEducator(modalConfig.educator.id);
            if (modalConfig.type === 'SUSPEND' || modalConfig.type === 'ACTIVATE') await adminService.toggleEducatorStatus(modalConfig.educator.id);
            
            setModalConfig({ isOpen: false, type: '', educator: null });
            fetchData(); 
        } catch (e) {
            alert("Action failed to execute. Check server logs.");
        } finally {
            setActionLoading(false);
        }
    };

    // Process Data (Filter & Sort)
    let processedEducators = [...educators].filter(edu => {
        const matchesSearch = edu.name.toLowerCase().includes(searchTerm.toLowerCase()) || edu.email.toLowerCase().includes(searchTerm.toLowerCase());
        const rawStatus = edu.status || 'PENDING';
        const matchesStatus = statusFilter === 'ALL' || rawStatus.toUpperCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    processedEducators.sort((a, b) => {
        if (sortOrder === 'NEWEST') return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        if (sortOrder === 'OLDEST') return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
        if (sortOrder === 'A-Z') return a.name.localeCompare(b.name);
        if (sortOrder === 'Z-A') return b.name.localeCompare(a.name);
        return 0;
    });

    const getStatusStyle = (status: string) => {
        const s = (status || 'PENDING').toUpperCase();
        if (s === 'ACTIVE') return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400';
        if (s === 'PENDING') return 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200 dark:bg-fuchsia-900/20 dark:border-fuchsia-800 dark:text-fuchsia-400';
        if (s === 'REJECTED') return 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400';
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400';
    };

    // DYNAMIC KPI CALCULATIONS
    const pendingCount = educators.filter(e => (e.status || 'PENDING').toUpperCase() === 'PENDING').length;
    const activeCount = educators.filter(e => e.status?.toUpperCase() === 'ACTIVE').length;
    const suspendedCount = educators.length - activeCount - pendingCount;
    const totalQuestionsAddedByEducators = educators.reduce((acc, curr) => acc + getEducatorContributions(curr.email), 0);

    // ============================================================================
    // 🌟 DYNAMIC ANALYTICS GENERATION (PURPLE THEME)
    // ============================================================================

    // 1. Top Contributors (Bar Chart)
    const topContributorsData = educators
        .map(edu => ({ name: edu.name.split(' ')[0], questions: getEducatorContributions(edu.email) }))
        .filter(edu => edu.questions > 0)
        .sort((a, b) => b.questions - a.questions)
        .slice(0, 5); 

    // 2. Status Distribution (Pie Chart) - Purple Spectrum
    const statusData = [
        { name: 'Active', value: activeCount, color: '#8b5cf6' }, // Purple
        { name: 'Pending', value: pendingCount, color: '#d946ef' }, // Fuchsia
        { name: 'Restricted', value: suspendedCount, color: '#6366f1' } // Indigo
    ].filter(d => d.value > 0);

    // 3. Onboarding Timeline (Area Chart)
    const onboardingMap: Record<string, number> = {};
    const sortedByDate = [...educators].sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());
    let cumulative = 0;
    sortedByDate.forEach(edu => {
        const d = new Date(edu.joinedAt);
        const label = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
        cumulative += 1;
        onboardingMap[label] = cumulative; 
    });
    const onboardingData = Object.keys(onboardingMap).map(date => ({ date, totalEducators: onboardingMap[date] }));

    // 4. Contribution vs Tenure (Scatter Chart)
    const activityScatterData = educators.map(edu => ({
        name: edu.name.split(' ')[0],
        daysActive: Math.max(1, Math.floor((new Date().getTime() - new Date(edu.joinedAt).getTime()) / (1000 * 3600 * 24))),
        questions: getEducatorContributions(edu.email)
    })).filter(edu => edu.questions > 0);


    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-[#150a29]/90 backdrop-blur-md border-2 border-gray-200 dark:border-purple-900/50 p-3 rounded-xl shadow-xl z-50">
                    <p className="text-xs font-black text-gray-500 mb-1 uppercase tracking-wider">{label || payload[0]?.payload?.name}</p>
                    {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || p.fill }}></span>
                            {p.name}: <span style={{ color: p.color || p.fill }}>{p.value}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* ACTION CONFIRMATION MODAL */}
            {modalConfig.isOpen && modalConfig.educator && (
                <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => !actionLoading && setModalConfig({ isOpen: false, type: '', educator: null })}>
                    <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-[2rem] p-8 text-center shadow-2xl border-2 border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        
                        {modalConfig.type === 'APPROVE' && (
                            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-emerald-100 dark:border-emerald-800">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                        )}
                        {modalConfig.type === 'REJECT' && (
                            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-gray-200 dark:border-gray-700">
                                <XCircle className="w-10 h-10 text-gray-500" />
                            </div>
                        )}
                        {(modalConfig.type === 'SUSPEND' || modalConfig.type === 'ACTIVATE') && (
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 ${modalConfig.type === 'SUSPEND' ? 'bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800'}`}>
                                {modalConfig.type === 'SUSPEND' ? <Ban className="w-10 h-10 text-red-500" /> : <PlayCircle className="w-10 h-10 text-purple-500" />}
                            </div>
                        )}

                        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                            {modalConfig.type === 'APPROVE' && 'Confirm Approval'}
                            {modalConfig.type === 'REJECT' && 'Deny Application'}
                            {modalConfig.type === 'SUSPEND' && 'Suspend Educator?'}
                            {modalConfig.type === 'ACTIVATE' && 'Restore Access?'}
                        </h2>
                        
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                            {modalConfig.type === 'APPROVE' && `Are you sure you want to grant full platform access to ${modalConfig.educator.name}? They will be notified immediately.`}
                            {modalConfig.type === 'REJECT' && `This will permanently reject ${modalConfig.educator.name}'s request to join as an educator.`}
                            {modalConfig.type === 'SUSPEND' && `Suspending ${modalConfig.educator.name} will immediately revoke their ability to login or grade assessments.`}
                            {modalConfig.type === 'ACTIVATE' && `This will restore ${modalConfig.educator.name}'s platform access and notify them immediately.`}
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setModalConfig({ isOpen: false, type: '', educator: null })} disabled={actionLoading} className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 cursor-pointer">
                                Cancel
                            </button>
                            <button onClick={executeAction} disabled={actionLoading} className={`flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-md active:translate-y-0.5 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 ${modalConfig.type === 'APPROVE' || modalConfig.type === 'ACTIVATE' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Confirm Action'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER & TABS */}
            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-10 shadow-sm relative">
                <div>
                    <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 flex items-center gap-2 drop-shadow-sm">
                        <GraduationCap className="w-7 h-7 text-purple-600 dark:text-purple-400" /> Educator Hub
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1 tracking-wide">Manage approvals, review workloads, and track academic contributions.</p>
                </div>
                <div className="flex bg-gray-100 dark:bg-[#0f0a1c] p-1.5 rounded-xl border-2 border-gray-200 dark:border-purple-900/50 shadow-inner w-full md:w-auto">
                    <button onClick={() => setActiveTab('MANAGEMENT')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase ${activeTab === 'MANAGEMENT' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <Users className="w-4 h-4" /> Team Roster
                    </button>
                    <button onClick={() => setActiveTab('ANALYTICS')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase ${activeTab === 'ANALYTICS' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <BarChart3 className="w-4 h-4" /> Actual Analytics
                    </button>
                </div>
            </div>

            {/* TAB 1: MANAGEMENT */}
            {activeTab === 'MANAGEMENT' && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 relative z-10">
                    
                    {/* DYNAMIC KPI CARDS (PURPLE THEMATIC) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-purple-500"/> Total Educators</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{educators.length}</h3>
                        </div>
                        <div className="bg-fuchsia-50/80 dark:bg-fuchsia-900/20 backdrop-blur-md p-6 rounded-3xl shadow-sm border-2 border-fuchsia-200 dark:border-fuchsia-800/50">
                            <p className="text-[10px] font-black text-fuchsia-600 dark:text-fuchsia-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Clock className="w-4 h-4"/> Pending Verification</p>
                            <h3 className="text-3xl font-black text-fuchsia-700 dark:text-fuchsia-300">{pendingCount} <span className="text-xs bg-fuchsia-200 dark:bg-fuchsia-800 px-2 py-1 rounded-md ml-2 text-fuchsia-800 dark:text-fuchsia-100">Action Req</span></h3>
                        </div>
                        <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-indigo-500"/> Active Status</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{activeCount}</h3>
                        </div>
                        <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 rounded-3xl shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-violet-500"/> Content Created</p>
                            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{totalQuestionsAddedByEducators} <span className="text-xs text-gray-500 font-bold">Qs</span></h3>
                        </div>
                    </div>

                    {/* CONTROL BAR */}
                    <div className="flex flex-col lg:flex-row gap-4 justify-between bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-md p-4 rounded-3xl border-2 border-gray-200 dark:border-purple-900/40 shadow-sm">
                        <div className="relative w-full lg:w-96 shrink-0">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder="Search by Name or Email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl text-sm font-bold focus:outline-none focus:border-purple-500 dark:text-white shadow-inner" />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="flex items-center w-full sm:w-auto bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-1 shadow-inner focus-within:border-purple-500">
                                <Filter className="w-4 h-4 text-gray-400 shrink-0 mx-2" />
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full bg-transparent py-2 text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
                                    <option value="ALL">All Statuses</option><option value="ACTIVE">Active</option><option value="PENDING">Pending</option><option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                            
                            <div className="flex items-center w-full sm:w-auto bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-1 shadow-inner focus-within:border-purple-500">
                                <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0 mx-2" />
                                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)} className="w-full bg-transparent py-2 text-sm font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 outline-none cursor-pointer">
                                    <option value="NEWEST">Newest First</option><option value="OLDEST">Oldest First</option><option value="A-Z">Name (A-Z)</option><option value="Z-A">Name (Z-A)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* DATA GRID */}
                    <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border-2 border-gray-200 dark:border-purple-900/50 overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead className="bg-gray-50/80 dark:bg-[#150a29]/80 backdrop-blur-md border-b-2 border-gray-200 dark:border-purple-900/50">
                                    <tr className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-black">
                                        <th className="py-4 px-6">Educator Profile</th>
                                        <th className="py-4 px-6 text-center">Registration Date</th>
                                        <th className="py-4 px-6 text-center">Contributions</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th className="py-4 px-6 text-right">Administrative Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                    {isLoading ? (
                                        <tr><td colSpan={5} className="py-16 text-center text-purple-500 font-black animate-pulse flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin"/> Loading Directory...</td></tr>
                                    ) : processedEducators.length === 0 ? (
                                        <tr><td colSpan={5} className="py-16 text-center text-gray-500 font-bold bg-gray-50 dark:bg-[#110820]">No educators match your search or filter.</td></tr>
                                    ) : (
                                        processedEducators.map((edu: any) => {
                                            const status = (edu.status || 'PENDING').toUpperCase();
                                            const actualContributions = getEducatorContributions(edu.email);

                                            return (
                                                <tr key={edu.id} className={`transition-colors ${status === 'PENDING' ? 'bg-fuchsia-50/30 dark:bg-fuchsia-900/10 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20' : 'hover:bg-gray-50 dark:hover:bg-[#110820]'}`}>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            {/* 🌟 PURPLE/FUCHSIA PROFILE ICONS */}
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-white font-black shadow-md">{edu.name.charAt(0)}</div>
                                                            <div>
                                                                <div className="font-black text-gray-900 dark:text-white text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{edu.name}</div>
                                                                <div className="text-[10px] font-mono text-gray-500">{edu.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                        {new Date(edu.joinedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className="text-base font-black text-purple-600 dark:text-purple-400">{actualContributions}</span> <span className="text-[10px] font-bold text-gray-400">Qs</span>
                                                    </td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`px-3 py-1.5 rounded-lg border-2 text-[10px] font-black tracking-wider uppercase ${getStatusStyle(status)}`}>
                                                            {status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {status === 'PENDING' && (
                                                                <>
                                                                    <button onClick={() => setModalConfig({isOpen: true, type: 'APPROVE', educator: edu})} title="Approve Application" className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-500 hover:text-white dark:bg-emerald-900/20 dark:border-emerald-800 transition-all shadow-sm active:scale-95 cursor-pointer">
                                                                        <CheckCircle2 className="w-5 h-5"/>
                                                                    </button>
                                                                    <button onClick={() => setModalConfig({isOpen: true, type: 'REJECT', educator: edu})} title="Reject Application" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 border border-gray-200 hover:bg-red-500 hover:text-white hover:border-red-500 dark:bg-[#0f0a1c] dark:border-gray-800 transition-all shadow-sm active:scale-95 cursor-pointer">
                                                                        <XCircle className="w-5 h-5"/>
                                                                    </button>
                                                                </>
                                                            )}
                                                            
                                                            {status === 'ACTIVE' && (
                                                                <>
                                                                    {/* 🌟 PURPLE VIEW ANALYTICS BUTTON */}
                                                                    <button title="View Analytics" onClick={() => setSelectedEducator(edu)} className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-200 hover:bg-purple-500 hover:text-white dark:bg-purple-900/20 dark:border-purple-800 transition-all shadow-sm active:scale-95 cursor-pointer">
                                                                        <BarChart3 className="w-4 h-4"/>
                                                                    </button>
                                                                    <button onClick={() => setModalConfig({isOpen: true, type: 'SUSPEND', educator: edu})} title="Suspend Account" className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:border-red-800 transition-all shadow-sm active:scale-95 cursor-pointer">
                                                                        <Ban className="w-4 h-4"/>
                                                                    </button>
                                                                </>
                                                            )}

                                                            {(status === 'SUSPENDED' || status === 'BLOCKED') && (
                                                                <button onClick={() => setModalConfig({isOpen: true, type: 'ACTIVATE', educator: edu})} title="Restore Access" className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 border border-gray-300 hover:bg-purple-500 hover:text-white hover:border-purple-500 dark:bg-gray-800 dark:border-gray-700 transition-all shadow-sm active:scale-95 cursor-pointer">
                                                                    <PlayCircle className="w-4 h-4"/>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: ANALYTICS */}
            {activeTab === 'ANALYTICS' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-4 relative z-10">
                    
                    {/* Chart 1: Onboarding Timeline */}
                    <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500"/> Platform Onboarding Growth</h3>
                        <div className="h-72 w-full">
                            {onboardingData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 font-bold">No historical data available.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={onboardingData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorO" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false} />
                                        <XAxis dataKey="date" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                        <Area type="monotone" dataKey="totalEducators" name="Total Educators" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorO)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Chart 2: Top Contributors */}
                    <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Star className="w-5 h-5 text-indigo-500"/> Top 5 Data Contributors</h3>
                        <div className="h-64 w-full">
                            {topContributorsData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 font-bold text-center px-4">Educators have not added any questions yet.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topContributorsData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#6b7280" opacity={0.15} />
                                        <XAxis type="number" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} width={80} />
                                        <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.1)'}} content={<CustomTooltip />} />
                                        <Bar dataKey="questions" name="Questions Added" fill="#a855f7" radius={[0,8,8,0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Chart 3: Account Status Distribution */}
                    <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-wider flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-violet-500"/> Account Status Distribution</h3>
                        <div className="h-64 w-full relative mt-4">
                            {statusData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 font-bold">No accounts registered.</div>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={statusData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={5} cornerRadius={8} dataKey="value" stroke="none">
                                                {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -mt-6">
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">Status</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Chart 4: Contribution vs Tenure (Scatter Plot) */}
                    <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                        <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><BookOpen className="w-5 h-5 text-fuchsia-500"/> Contribution Velocity vs Days Active</h3>
                        <div className="h-72 w-full">
                            {activityScatterData.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 font-bold">Insufficient contribution data.</div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} />
                                        <XAxis type="number" dataKey="daysActive" name="Days Active" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} unit=" Days" />
                                        <YAxis type="number" dataKey="questions" name="Questions Added" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                        <ZAxis type="category" dataKey="name" name="Educator" />
                                        <Tooltip cursor={{strokeDasharray: '3 3'}} content={<CustomTooltip />} />
                                        <Scatter name="Educators" data={activityScatterData} fill="#d946ef" shape="circle" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}