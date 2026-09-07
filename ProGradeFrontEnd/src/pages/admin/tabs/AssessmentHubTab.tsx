import { useState, useEffect, type MouseEvent } from 'react';
import { ShieldAlert, Plus, FileText, KeyRound, Fingerprint, Copy, ChevronRight, BarChart3, Lock, Loader2, AlertTriangle, Clock, Activity, Code2, Calendar, Search, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AssessmentBuilder from './subtabs/AssessmentBuilder';
import AssessmentDetailsPanel from './subtabs/AssessmentDetailsPanel';
import { adminService } from '../../../features/admin/adminService';
import { useAuth } from '../../../context/AuthContext';

// 🌟 Import the Central Taxonomy
import { ALL_TECHNOLOGIES } from '../../../constants/taxonomy';

export default function AssessmentHubTab({ activeSubTab }: { activeSubTab: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [isBuilding, setIsBuilding] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
    const [assessments, setAssessments] = useState<any>([]);
    const [fraudLogs, setFraudLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [restrictedModal, setRestrictedModal] = useState(false);

    // ADVANCED FILTERING & SORTING STATE
    const [searchStr, setSearchStr] = useState('');
    const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [techFilter, setTechFilter] = useState('ALL');

    const formatFullName = (email: string) => {
        if (!email) return 'Admin User';
        return email.split('@')[0]
            .split(/[._-]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const loadAssessments = () => {
        setLoading(true);
        adminService.getAllAssessments()
            .then(setAssessments)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const loadGlobalFraudLogs = () => {
        setLoading(true);
        adminService.getGlobalFraudLogs()
            .then(setFraudLogs)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!isBuilding && !selectedAssessment) {
            if (activeSubTab === 'FRAUD') {
                loadGlobalFraudLogs();
            } else {
                loadAssessments();
            }
        }
    }, [isBuilding, selectedAssessment, activeSubTab]);

    const copyToClipboard = (e: MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
    };

    // 🌟 DYNAMIC TECHNOLOGY PARSER (Strips spaces/underscores for backward DB compatibility)
    const getExamTech = (tags?: string) => {
        if (!tags) return 'MIXED TECH';
        const normalizedTags = String(tags).toUpperCase().replace(/[\s_]/g, '');
        
        const foundTechs = ALL_TECHNOLOGIES.filter(tech => {
            const normalizedTech = tech.toUpperCase().replace(/[\s_]/g, '');
            return normalizedTags.includes(normalizedTech);
        });
        
        if (foundTechs.length > 1) return 'MIXED TECH';
        if (foundTechs.length === 1) return foundTechs[0]; // Returns perfectly formatted name (e.g., "Spring Boot")
        return 'CUSTOM';
    };

    const getLevelBadge = (level?: string) => {
        switch(level) {
            case 'EASY': return 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
            case 'MEDIUM': return 'text-amber-700 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50';
            case 'HARD': return 'text-rose-700 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50';
            default: return 'text-blue-700 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
        }
    };

    // 🌟 INDESTRUCTIBLE FRONTEND FILTERING ENGINE
    const safeAssessments: any[] = Array.isArray(assessments) ? assessments : (assessments?.data || assessments?.content || []);
    
    const processedAssessments = safeAssessments.filter((exam: any) => {
        if (!exam) return false;
        
        const searchLower = searchStr.toLowerCase().trim();
        const titleMatch = exam.title ? String(exam.title).toLowerCase().includes(searchLower) : false;
        const emailMatch = exam.creatorEmail ? String(exam.creatorEmail).toLowerCase().includes(searchLower) : false;
        const idMatch = exam.examId ? String(exam.examId).toLowerCase().includes(searchLower) : false;
        
        const matchesSearch = searchLower === '' || titleMatch || emailMatch || idMatch;

        const examDiff = exam.difficultyLevel ? String(exam.difficultyLevel).toUpperCase() : 'MIXED';
        const matchesLevel = levelFilter === 'ALL' || examDiff === levelFilter;
        
        // Match against dynamic taxonomy
        const tags = exam.tags ? String(exam.tags).toUpperCase().replace(/[\s_]/g, '') : '';
        const normalizedTechFilter = techFilter.toUpperCase().replace(/[\s_]/g, '');
        const matchesTech = techFilter === 'ALL' || tags.includes(normalizedTechFilter);
        
        return matchesSearch && matchesLevel && matchesTech;
    }).sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        
        // Prevent NaN crashes from malformed dates
        const validTimeA = isNaN(timeA) ? 0 : timeA;
        const validTimeB = isNaN(timeB) ? 0 : timeB;

        return sortOrder === 'NEWEST' ? validTimeB - validTimeA : validTimeA - validTimeB;
    });

    const RestrictedModal = () => (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setRestrictedModal(false)}>
            <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">Access Restricted</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-6 leading-relaxed">
                    This assessment was created by a System Administrator. You do not have permission to view its analytics, submissions, or fraud logs.
                </p>
                <button 
                    onClick={() => setRestrictedModal(false)} 
                    className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-gray-900 font-bold py-3 rounded-xl transition-all active:scale-95 shadow-md cursor-pointer"
                >
                    Understood
                </button>
            </div>
        </div>
    );
    
    if (activeSubTab === 'FRAUD') {
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="w-8 h-8 text-red-500 shrink-0 mt-1 animate-pulse" />
                        <div>
                            <h3 className="text-red-800 dark:text-red-400 font-black text-lg">Live Global Proctoring Stream</h3>
                            <p className="text-sm text-red-600/80 dark:text-red-400/80 font-bold mt-1">Monitoring infractions across all active examinations in real-time.</p>
                        </div>
                    </div>
                    <button onClick={loadGlobalFraudLogs} className="bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-bold transition-colors cursor-pointer flex items-center gap-2">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh Stream'}
                    </button>
                </div>

                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden w-full">
                    <div className="overflow-x-auto w-full custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
                            <thead className="bg-gray-50 dark:bg-[#150a29] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                                <tr>
                                    <th className="py-4 px-6">Timestamp</th>
                                    <th className="py-4 px-6">Assessment Context</th>
                                    <th className="py-4 px-6">Participant Identity</th>
                                    <th className="py-4 px-6">Infraction Type</th>
                                    <th className="py-4 px-6">Security Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">Listening for security events...</td></tr>
                                ) : fraudLogs.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">No malpractice incidents detected platform-wide.</td></tr>
                                ) : (
                                    fraudLogs.map((log: any) => (
                                        <tr key={log.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                                            <td className="py-4 px-6 font-mono text-xs text-gray-500 flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" /> 
                                                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                                            </td>
                                            <td className="py-4 px-6 font-bold text-gray-900 dark:text-white truncate max-w-[200px]">{log.examName}</td>
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 dark:text-white">{log.studentName}</p>
                                                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.studentEmail}</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="flex items-center gap-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded w-max text-[10px] font-black uppercase border border-red-200 dark:border-red-900/50">
                                                    <AlertTriangle className="w-3 h-3" /> {log.infractionType.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-xs text-red-800/80 dark:text-red-300/80 whitespace-normal min-w-[300px] leading-relaxed">
                                                {log.details}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (isBuilding) return <AssessmentBuilder onCancel={() => setIsBuilding(false)} onSuccess={() => setIsBuilding(false)} />;
    if (selectedAssessment) return <AssessmentDetailsPanel assessment={selectedAssessment} onBack={() => { setSelectedAssessment(null); loadAssessments(); }} />;

    const selectClass = "bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 focus:border-purple-500 rounded-xl px-3 py-2.5 outline-none cursor-pointer dark:text-white text-xs font-bold transition-all shadow-inner appearance-none w-full";

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in relative pb-10">
            
            {restrictedModal && <RestrictedModal />}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        Global Assessment Control
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage active exams and create new assessment blueprints.</p>
                </div>
                
                <button 
                    onClick={() => setIsBuilding(true)}
                    className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-sm rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="w-5 h-5" /> CREATE NEW EXAM
                </button>
            </div>

            {/* 🌟 ADVANCED 3D FILTERS */}
            <div className="bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-md p-4 rounded-2xl border-2 border-gray-200 dark:border-purple-900/40 shadow-sm flex flex-col xl:flex-row gap-3">
                <div className="flex-1 relative group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by ID, Title, or Creator Email..." 
                        value={searchStr} 
                        onChange={e => setSearchStr(e.target.value)} 
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 focus:border-purple-500 rounded-xl outline-none cursor-text dark:text-white text-xs transition-all shadow-inner font-bold" 
                    />
                </div>
                
                <div className="grid grid-cols-2 sm:flex gap-3 w-full xl:w-auto">
                    <div className="relative">
                        <Code2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-500" />
                        
                        {/* 🌟 DYNAMIC TECHNOLOGY DROPDOWN */}
                        <select value={techFilter} onChange={e => setTechFilter(e.target.value)} className={`${selectClass} pl-9`}>
                            <option value="ALL">All Technologies</option>
                            {ALL_TECHNOLOGIES.map(tech => (
                                <option key={tech} value={tech}>{tech}</option>
                            ))}
                        </select>
                        
                    </div>
                    <div className="relative">
                        <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className={`${selectClass} pl-9`}>
                            <option value="ALL">All Difficulties</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                            <option value="MIXED">Mixed</option>
                        </select>
                    </div>
                    <div className="relative col-span-2 sm:col-auto">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-amber-500" />
                        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as any)} className={`${selectClass} pl-9`}>
                            <option value="NEWEST">Newest First</option>
                            <option value="OLDEST">Oldest First</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden w-full relative z-10">
                <div className="overflow-x-auto w-full custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[1000px]">
                        <thead className="bg-gray-50 dark:bg-[#150a29] text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 dark:border-purple-900/50">
                            <tr>
                                <th className="py-4 px-6">Assessment Details</th>
                                <th className="py-4 px-6">Credentials</th>
                                <th className="py-4 px-6">Configuration Specs</th>
                                <th className="py-4 px-6 text-center">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-20 text-gray-500 font-medium">Loading precise configurations...</td></tr>
                            ) : processedAssessments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-20">
                                        <div className="flex flex-col items-center">
                                            <Search className="w-10 h-10 text-gray-400 mb-3 opacity-50"/>
                                            <p className="text-sm font-bold text-gray-500">No assessments match your exact filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                processedAssessments.map((exam: any) => {
                                    const isAdmin = user?.role === 'ADMIN';
                                    const isCreator = exam.creatorEmail === user?.email;
                                    const hasFullAccess = isAdmin || isCreator;
                                    
                                    const techDisplay = getExamTech(exam.tags);

                                    return (
                                        <tr 
                                            key={exam.id} 
                                            onClick={() => hasFullAccess ? setSelectedAssessment(exam) : setRestrictedModal(true)} 
                                            className={`transition-colors group ${hasFullAccess ? 'hover:bg-gray-50 dark:hover:bg-[#150a29]/50 cursor-pointer' : 'cursor-pointer hover:bg-red-50/30 dark:hover:bg-red-900/10'}`}
                                        >
                                            <td className="py-4 px-6">
                                                <p className={`font-black text-base text-gray-900 dark:text-white transition-colors ${hasFullAccess ? 'group-hover:text-purple-600 dark:group-hover:text-purple-400' : ''}`}>{exam.title}</p>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black flex items-center gap-1">
                                                        <User className="w-3 h-3"/> <span className="text-purple-600 dark:text-purple-400">{formatFullName(exam.creatorEmail)}</span>
                                                    </p>
                                                    <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                                                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                                                        <Calendar className="w-3 h-3"/> {formatDate(exam.createdAt)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 group/copy w-max cursor-pointer bg-gray-50 dark:bg-[#0f0a1c] px-2 py-1 rounded shadow-inner border border-gray-100 dark:border-gray-800" onClick={(e) => copyToClipboard(e, exam.examId)} title="Copy ID">
                                                        <Fingerprint className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                                                        <span className="font-mono text-[11px] font-black text-gray-700 dark:text-gray-300">{exam.examId}</span>
                                                        <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover/copy:opacity-100 transition-opacity shrink-0" />
                                                    </div>
                                                    <div className="flex items-center gap-2 group/copy w-max cursor-pointer bg-gray-50 dark:bg-[#0f0a1c] px-2 py-1 rounded shadow-inner border border-gray-100 dark:border-gray-800" onClick={(e) => copyToClipboard(e, exam.password)} title="Copy Password">
                                                        <KeyRound className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                        <span className="font-mono text-[11px] font-black text-gray-700 dark:text-gray-300">PASS: {exam.password}</span>
                                                        <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover/copy:opacity-100 transition-opacity shrink-0" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-max">
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Volume</span>
                                                        <span className="text-[11px] font-black text-gray-900 dark:text-white">{exam.totalQuestions} Qs</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Duration</span>
                                                        <span className="text-[11px] font-black text-gray-900 dark:text-white">{exam.durationMinutes} Min</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Tech Stack</span>
                                                        <span className="text-[9px] font-black text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/40 px-1.5 py-0.5 rounded w-max shadow-sm border border-purple-200 dark:border-purple-800/50 mt-0.5">{techDisplay}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Complexity</span>
                                                        <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shadow-sm mt-0.5 w-max ${getLevelBadge(exam.difficultyLevel || 'MIXED')}`}>
                                                            {exam.difficultyLevel || 'MIXED'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`font-black text-[9px] tracking-widest uppercase px-3 py-1.5 rounded-lg border shadow-sm ${
                                                    exam.status === 'PUBLISHED' ? 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' : 
                                                    'text-amber-700 bg-amber-100 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
                                                }`}>
                                                    {exam.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    {hasFullAccess ? (
                                                        <>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/${user.role.toLowerCase()}/assessments/${exam.id}/reports`);
                                                                }} 
                                                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-700 dark:bg-[#0f0a1c] dark:border-gray-800 dark:text-gray-300 dark:hover:bg-[#1a0d36] rounded-xl text-[10px] font-black transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-widest"
                                                                title="View Analytics & Fraud Reports"
                                                            >
                                                                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> 
                                                                Reports
                                                            </button>
                                                            <ChevronRight className="w-5 h-5 text-gray-400 inline-block group-hover:text-purple-500 transition-colors" />
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-lg text-[10px] font-bold border border-gray-200 dark:border-gray-700 w-max ml-auto shadow-inner">
                                                            <Lock className="w-3 h-3"/> RESTRICTED
                                                        </div>
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
    );
}