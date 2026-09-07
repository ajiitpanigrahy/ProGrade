import React, { useState, useEffect } from 'react';
import { ArrowLeft, Settings, Users, ShieldAlert, CheckCircle2, AlertTriangle, Filter, Lock, Download, Search, Clock, Trophy, Frown, X, FileText, Trash2, PauseCircle, PlayCircle, CalendarClock, Loader2, Database, Code2, BookOpen, Terminal } from 'lucide-react';
import { axiosClient } from '../../../../api/axiosClient';
import { useAuth } from '../../../../context/AuthContext';
import { adminService } from '../../../../features/admin/adminService';
import CodeSnippetBox from '../../../../components/CodeSnippetBox';

interface Props {
    assessment: any;
    onBack: () => void;
}

const renderQuestionContent = (text: string) => {
    if (!text) return null;
    
    const formattedText = text.replace(/\\n/g, '\n');
    const parts = formattedText.split(/(```[\s\S]*?```)/g);
    
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
            return (
                <div key={index} className="my-4 animate-in fade-in">
                    <CodeSnippetBox code={code} language="javascript" />
                </div>
            );
        }
        return <span key={index} className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{part}</span>;
    });
};

export default function AssessmentDetailsPanel({ assessment, onBack }: Props) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUESTIONS' | 'LEADERBOARD' | 'FRAUD'>('OVERVIEW');
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [localAssessment, setLocalAssessment] = useState(assessment);
    const [assessmentQuestions, setAssessmentQuestions] = useState<any[]>([]);

    const [fraudFilter, setFraudFilter] = useState('ALL');
    const [lbSearch, setLbSearch] = useState('');
    const [lbSort, setLbSort] = useState<'RANK' | 'NAME' | 'SCORE' | 'TIME'>('RANK');
    const [lbLimit, setLbLimit] = useState<'ALL' | 'TOP5' | 'TOP10'>('ALL');

    const [newEducatorEmail, setNewEducatorEmail] = useState('');
    const [allowedEducators, setAllowedEducators] = useState<string[]>(
        localAssessment.allowedEducators
            ? localAssessment.allowedEducators.split(',').map((e: string) => e.trim()).filter(Boolean)
            : []
    );

    const [activeModal, setActiveModal] = useState<'NONE' | 'DELETE' | 'TOGGLE' | 'POSTPONE'>('NONE');
    const [postponeDate, setPostponeDate] = useState<string>('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        adminService.getAdvancedAssessmentReport(localAssessment.id)
            .then(res => setReportData(res))
            .catch(err => console.error("Could not fetch details", err));

        adminService.getAssessmentQuestions(localAssessment.id)
            .then(res => setAssessmentQuestions(res))
            .catch(err => console.error("Could not fetch questions", err))
            .finally(() => setLoading(false));

    }, [localAssessment.id]);

    const updateEducatorAccess = async (updatedList: string[]) => {
        try {
            const csvList = updatedList.join(',');
            await axiosClient.put(`/assessments/${localAssessment.id}/allow-educators`, { allowedEducators: csvList });
            setAllowedEducators(updatedList);
            setNewEducatorEmail('');
        } catch (e) {
            alert("Failed to update educator access.");
        }
    };

    const handleAddEducator = () => {
        if (!newEducatorEmail.trim()) return;
        const email = newEducatorEmail.trim().toLowerCase();
        if (allowedEducators.includes(email)) { setNewEducatorEmail(''); return; }
        updateEducatorAccess([...allowedEducators, email]);
    };

    const handleRemoveEducator = (emailToRemove: string) => updateEducatorAccess(allowedEducators.filter(e => e !== emailToRemove));

    const handleDelete = async () => {
        setActionLoading(true);
        try {
            await adminService.deleteAssessment(localAssessment.id);
            onBack();
        } catch (err) {
            alert("Failed to delete assessment.");
        } finally { setActionLoading(false); }
    };

    const handleToggleStatus = async () => {
        setActionLoading(true);
        try {
            const updated = await adminService.toggleAssessmentStatus(localAssessment.id);
            setLocalAssessment(updated);
            setActiveModal('NONE');
        } catch (err) {
            alert("Failed to update status.");
        } finally { setActionLoading(false); }
    };

    const handlePostpone = async () => {
        if (!postponeDate) return;
        setActionLoading(true);
        try {
            const updated = await adminService.postponeAssessment(localAssessment.id, postponeDate);
            setLocalAssessment(updated);
            setActiveModal('NONE');
        } catch (err) {
            alert("Failed to postpone assessment.");
        } finally { setActionLoading(false); }
    };

    const formatTime = (seconds: number | undefined | null) => {
        if (seconds === undefined || seconds === null || isNaN(seconds)) return '--';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}m ${s}s`;
    };

    const formatFullName = (email: string) => {
        if (!email) return 'Unknown';
        return email.split('@')[0].split(/[._-]/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    const rawSubmissions = Array.isArray(reportData?.submissions) ? reportData.submissions : [];
    const maxScore = rawSubmissions.length > 0 ? rawSubmissions[0].maxScore : (localAssessment.totalQuestions * 1);

    const rankedSubmissions = [...rawSubmissions].map(s => ({
        ...s,
        studentName: s.studentName || formatFullName(s.studentEmail),
        timeTaken: s.timeTaken || 0
    })).sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.timeTaken - b.timeTaken;
    }).map((s, idx) => ({ ...s, rank: idx + 1 }));

    const highestScorer = rankedSubmissions.length > 0 ? rankedSubmissions[0] : null;
    const lowestScorer = rankedSubmissions.length > 0 ? rankedSubmissions[rankedSubmissions.length - 1] : null;

    let displayLeaderboard = [...rankedSubmissions];
    if (lbSearch.trim()) {
        const q = lbSearch.toLowerCase();
        displayLeaderboard = displayLeaderboard.filter(s => s.studentName.toLowerCase().includes(q) || s.studentEmail.toLowerCase().includes(q));
    }
    if (lbLimit === 'TOP5') displayLeaderboard = displayLeaderboard.slice(0, 5);
    if (lbLimit === 'TOP10') displayLeaderboard = displayLeaderboard.slice(0, 10);

    displayLeaderboard.sort((a, b) => {
        if (lbSort === 'NAME') return a.studentName.localeCompare(b.studentName);
        if (lbSort === 'TIME') return a.timeTaken - b.timeTaken;
        if (lbSort === 'SCORE') return b.totalScore - a.totalScore;
        return a.rank - b.rank;
    });

    // 🌟 FIX: Bulletproof parsing to stop React crashes on malformed database strings
    const safeFraudLogs = Array.isArray(reportData?.fraudLogs) ? reportData.fraudLogs : [];
    const filteredFraud = fraudFilter === 'ALL' 
        ? safeFraudLogs 
        : safeFraudLogs.filter((log: any) => log?.infractionType === fraudFilter);
        
    const uniqueFraudTypes = Array.from(
        new Set(safeFraudLogs.map((log: any) => log?.infractionType).filter(Boolean))
    ) as string[];

    const handleExport = (format: 'CSV' | 'PDF') => {
        if (format === 'PDF') { window.print(); return; }
        const headers = ["Rank", "Name", "Email", "Score", "Time Taken (Seconds)"];
        const rows = displayLeaderboard.map(s => [`#${s.rank}`, `"${s.studentName}"`, `"${s.studentEmail}"`, s.totalScore, s.timeTaken]);
        const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Leaderboard_${localAssessment.title.replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const ActionModals = () => {
        if (activeModal === 'NONE') return null;
        return (
            <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={() => setActiveModal('NONE')}>
                <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-[2rem] p-8 text-center shadow-2xl border-2 border-gray-100 dark:border-purple-900/50 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                    {activeModal === 'DELETE' && (
                        <>
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-red-100 dark:border-red-800"><Trash2 className="w-10 h-10 text-red-500" /></div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Obliterate Assessment?</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">This action is irreversible. All student submissions, malpractice logs, and analytics tied to <strong className="text-gray-900 dark:text-white">{localAssessment.title}</strong> will be permanently erased.</p>
                            <div className="flex gap-3">
                                <button onClick={() => setActiveModal('NONE')} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                <button onClick={handleDelete} disabled={actionLoading} className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 transition-colors flex justify-center items-center gap-2">
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </>
                    )}
                    {activeModal === 'TOGGLE' && (
                        <>
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 ${localAssessment.status === 'PUBLISHED' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-500' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 text-emerald-500'}`}>
                                {localAssessment.status === 'PUBLISHED' ? <PauseCircle className="w-10 h-10" /> : <PlayCircle className="w-10 h-10" />}
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{localAssessment.status === 'PUBLISHED' ? 'Pause Assessment?' : 'Publish Assessment?'}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{localAssessment.status === 'PUBLISHED' ? 'Pausing will immediately stop new students from starting this exam. Existing active sessions will not be interrupted.' : 'Publishing will make this exam instantly live and accessible to the assigned operational batches.'}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setActiveModal('NONE')} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                <button onClick={handleToggleStatus} disabled={actionLoading} className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors flex justify-center items-center gap-2 ${localAssessment.status === 'PUBLISHED' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : localAssessment.status === 'PUBLISHED' ? 'Pause Exam' : 'Go Live'}
                                </button>
                            </div>
                        </>
                    )}
                    {activeModal === 'POSTPONE' && (
                        <>
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-blue-100 dark:border-blue-800"><CalendarClock className="w-10 h-10 text-blue-500" /></div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Reschedule Exam</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Select a new future date and time for this assessment to unlock.</p>
                            <div className="text-left mb-8">
                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-wider mb-2 block">New Launch Date</label>
                                <input type="datetime-local" value={postponeDate} onChange={(e) => setPostponeDate(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:border-blue-500 [color-scheme:light] dark:[color-scheme:dark]" />
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setActiveModal('NONE')} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                                <button onClick={handlePostpone} disabled={!postponeDate || actionLoading} className="flex-1 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex justify-center items-center gap-2">
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reschedule'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const codingQCount = assessmentQuestions.filter((q: any) => q.questionType === 'CODING' || q.codeSnippet).length;
    const theoryQCount = assessmentQuestions.length - codingQCount;

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 relative">
            <ActionModals />
            <style>
                {`
                    @media print {
                        body * { visibility: hidden; }
                        .print-container, .print-container * { visibility: visible; }
                        .print-container { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
                        .no-print { display: none !important; }
                        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
                        .dark body { background: white !important; color: black !important; }
                    }
                `}
            </style>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border-b border-gray-200 dark:border-purple-900/30 pb-4 no-print">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors cursor-pointer w-max">
                    <ArrowLeft className="w-5 h-5 text-gray-500" />
                </button>
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{localAssessment.title}</h1>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-bold tracking-wider uppercase mt-0.5">Configuration & Analytics</p>
                </div>
            </div>

            <div className="flex gap-2 sm:gap-3 overflow-x-auto custom-scrollbar pb-2 sm:pb-4 w-full no-print">
                <button onClick={() => setActiveTab('OVERVIEW')} className={`px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === 'OVERVIEW' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-white dark:bg-[#150a29] text-gray-600 border border-gray-200 hover:bg-gray-50 dark:border-purple-900/30 dark:text-gray-400'}`}>
                    <Settings className="w-4 h-4" /> Overview & Config
                </button>
                <button onClick={() => setActiveTab('QUESTIONS')} className={`px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === 'QUESTIONS' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-white dark:bg-[#150a29] text-gray-600 border border-gray-200 hover:bg-gray-50 dark:border-purple-900/30 dark:text-gray-400'}`}>
                    <Database className="w-4 h-4" /> Blueprint Questions
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'QUESTIONS' ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400'}`}>{assessmentQuestions.length}</span>
                </button>
                <button onClick={() => setActiveTab('LEADERBOARD')} className={`px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === 'LEADERBOARD' ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20' : 'bg-white dark:bg-[#150a29] text-gray-600 border border-gray-200 hover:bg-gray-50 dark:border-purple-900/30 dark:text-gray-400'}`}>
                    <Users className="w-4 h-4" /> Submissions & Leaderboard
                </button>
                <button onClick={() => setActiveTab('FRAUD')} className={`px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${activeTab === 'FRAUD' ? 'bg-red-600 text-white shadow-md shadow-red-600/20' : 'bg-white dark:bg-[#150a29] text-gray-600 border border-gray-200 hover:bg-gray-50 dark:border-purple-900/30 dark:text-gray-400'}`}>
                    <ShieldAlert className="w-4 h-4" /> Malpractice Logs
                    {safeFraudLogs.length > 0 && <span className={`px-1.5 py-0.5 rounded text-[10px] ${activeTab === 'FRAUD' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400'}`}>{safeFraudLogs.length}</span>}
                </button>
            </div>

            {loading ? (
                <div className="h-40 flex items-center justify-center text-purple-600 animate-pulse font-bold text-sm tracking-widest uppercase no-print">Fetching Diagnostics...</div>
            ) : (
                <div className={`bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 p-4 sm:p-6 overflow-hidden ${activeTab === 'LEADERBOARD' ? 'print-container' : 'no-print'}`}>

                    {activeTab === 'OVERVIEW' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <h3 className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">Exam Configuration</h3>
                                <div className="space-y-3 sm:space-y-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#0f0a1c] p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-purple-900/30">
                                    <div className="flex justify-between border-b border-gray-200 dark:border-purple-900/30 pb-2">
                                        <span className="font-semibold">Duration</span>
                                        <span className="font-black text-blue-600 dark:text-blue-400">{localAssessment.durationMinutes} Minutes</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 dark:border-purple-900/30 pb-2">
                                        <span className="font-semibold">Total Questions</span>
                                        <span className="font-black text-gray-900 dark:text-white">{localAssessment.totalQuestions} Qs</span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 dark:border-purple-900/30 pb-2">
                                        <span className="font-semibold">Assigned Batches</span>
                                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-right">
                                            {localAssessment.assignedBatches && localAssessment.assignedBatches.length > 0
                                                ? localAssessment.assignedBatches.map((b: any) => b.name).join(', ')
                                                : 'All Batches (Public)'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-gray-200 dark:border-purple-900/30 pb-2">
                                        <span className="font-semibold">Marking Scheme</span>
                                        <span className="font-black text-gray-900 dark:text-gray-300">+{localAssessment.positiveMarks || 1} <span className="text-gray-400">/</span> <span className="text-red-500">-{localAssessment.negativeMarks || 0.25}</span></span>
                                    </div>
                                    <div className="flex justify-between pb-1">
                                        <span className="font-semibold">Status</span>
                                        <span className={`font-black uppercase text-[10px] px-2 py-1 rounded border ${localAssessment.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400'}`}>
                                            {localAssessment.status}
                                        </span>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-purple-900/30">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-wider mb-3">Lifecycle Controls</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <button onClick={() => setActiveModal('TOGGLE')} className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border-2 transition-all active:scale-95 cursor-pointer ${localAssessment.status === 'PUBLISHED' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-900/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/40'}`}>
                                                {localAssessment.status === 'PUBLISHED' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                                {localAssessment.status === 'PUBLISHED' ? 'Pause Exam' : 'Publish Live'}
                                            </button>
                                            <button onClick={() => setActiveModal('POSTPONE')} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border-2 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40 transition-all active:scale-95 cursor-pointer">
                                                <CalendarClock className="w-4 h-4" /> Reschedule
                                            </button>
                                            <button onClick={() => setActiveModal('DELETE')} className="flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold border-2 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40 transition-all active:scale-95 cursor-pointer">
                                                <Trash2 className="w-4 h-4" /> Delete Exam
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-3 sm:mb-4">Performance Metrics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-purple-50 dark:bg-purple-900/10 p-5 rounded-xl border border-purple-100 dark:border-purple-900/30 text-center">
                                        <p className="text-4xl font-black text-purple-600 dark:text-purple-400">{rankedSubmissions.length}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Participants</p>
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30 text-center">
                                        <p className="text-4xl font-black text-blue-600 dark:text-blue-400">{reportData?.averageScore || 0}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Platform Average</p>
                                    </div>
                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-xl border border-emerald-100 dark:border-emerald-900/30 text-center flex flex-col justify-center">
                                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1"><Trophy className="w-5 h-5" /> {highestScorer ? highestScorer.totalScore : 0}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Highest Score</p>
                                        <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 mt-1 truncate px-2">{highestScorer ? highestScorer.studentName : '--'}</p>
                                    </div>
                                    <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-xl border border-red-100 dark:border-red-900/30 text-center flex flex-col justify-center">
                                        <p className="text-3xl font-black text-red-600 dark:text-red-400 flex items-center justify-center gap-1"><Frown className="w-5 h-5" /> {lowestScorer ? lowestScorer.totalScore : 0}</p>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Lowest Score</p>
                                        <p className="text-[10px] font-black text-red-700 dark:text-red-300 mt-1 truncate px-2">{lowestScorer ? lowestScorer.studentName : '--'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'QUESTIONS' && (
                        <div className="flex flex-col h-full max-h-[80vh]">
                            <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-[#0f0a1c] p-4 rounded-xl border border-gray-100 dark:border-purple-900/50 shrink-0">
                                <div>
                                    <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                                        <Database className="w-5 h-5 text-purple-600" /> Embedded Assessment Blueprint
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold mt-1">Reviewing the exact question pool compiled for this exam.</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase border border-blue-200 dark:border-blue-900/50">
                                        <BookOpen className="w-3.5 h-3.5" /> Theory: {theoryQCount}
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase border border-emerald-200 dark:border-emerald-900/50">
                                        <Code2 className="w-3.5 h-3.5" /> Coding: {codingQCount}
                                    </div>
                                </div>
                            </div>

                            {assessmentQuestions.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 font-medium border border-dashed border-gray-200 rounded-xl">No questions found for this assessment.</div>
                            ) : (
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                                    {assessmentQuestions.map((q: any, index: number) => (
                                        <div key={q.id} className="p-5 sm:p-6 rounded-[1.5rem] border-2 border-gray-100 dark:border-purple-900/30 bg-white dark:bg-[#150a29] shadow-sm">
                                            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-gray-100 dark:border-purple-900/30 pb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500">Q{index + 1}</span>
                                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${q.difficultyLevel === 'EASY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : q.difficultyLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'}`}>
                                                        {q.difficultyLevel}
                                                    </span>
                                                    <span className="text-[9px] font-black text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 px-2.5 py-1 rounded uppercase tracking-wider">
                                                        {q.technology}
                                                    </span>
                                                    <span className="text-[9px] font-black text-gray-600 bg-gray-200 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded uppercase tracking-wider truncate max-w-full">
                                                        {q.topic || 'Uncategorized'}
                                                    </span>
                                                </div>

                                                {q.questionType === 'CODING' || q.codeSnippet ? (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 shadow-sm"><Code2 className="w-3 h-3" /> Coding</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50 shadow-sm"><BookOpen className="w-3 h-3" /> Theory</span>
                                                )}
                                            </div>

                                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-5 leading-relaxed">
                                                {renderQuestionContent(q.questionText)}

                                                {/* 🌟 FIX: Multi-line Colorful Syntax Highlighting! */}
                                                {q.codeSnippet && (
                                                    <div className="mt-5 bg-[#0c0618] border-2 border-purple-900/50 rounded-xl overflow-hidden shadow-2xl w-full text-left animate-in fade-in">
                                                        <div className="bg-[#150a29] px-4 py-2.5 flex items-center gap-2 border-b border-purple-900/50">
                                                            <Terminal className="w-4 h-4 text-emerald-400"/>
                                                            <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">
                                                                Developer Code ({q.codeLanguage || q.technology || 'Code'})
                                                            </span>
                                                        </div>
                                                        <div className="p-2">
                                                            <CodeSnippetBox 
                                                                code={q.codeSnippet.replace(/\\n/g, '\n')} 
                                                                language={q.codeLanguage || 'javascript'} 
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {['A', 'B', 'C', 'D'].map((opt) => {
                                                    const isCorrect = q.correctOption === opt;
                                                    const optionText = q[`option${opt}` as keyof typeof q];
                                                    return (
                                                        <div key={opt} className={`flex items-start gap-3 p-3 rounded-xl border-2 text-xs transition-colors ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 text-emerald-900 dark:text-emerald-100 shadow-[inset_0_2px_10px_rgba(16,185,129,0.1)]' : 'bg-gray-50 dark:bg-[#0f0a1c] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 shadow-inner'}`}>
                                                            <span className={`font-black shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-gray-400'}`}>{opt}.</span>
                                                            <span className={isCorrect ? 'font-bold' : 'font-medium'}>{optionText as string}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'LEADERBOARD' && (
                        <div className="flex flex-col h-full max-h-[80vh]">
                            <div className="flex flex-col lg:flex-row gap-3 justify-between mb-4 bg-gray-50 dark:bg-[#0f0a1c] p-3 rounded-xl border border-gray-100 dark:border-purple-900/50 no-print">
                                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input type="text" placeholder="Search by name or email..." value={lbSearch} onChange={(e) => setLbSearch(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:text-white" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleExport('CSV')} className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100 px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                                        <Download className="w-3.5 h-3.5" /> Export CSV
                                    </button>
                                </div>
                            </div>

                            {displayLeaderboard.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 font-medium border border-dashed border-gray-200 rounded-xl">No leaderboard data matches your filters.</div>
                            ) : (
                                <div className="flex-1 overflow-auto rounded-xl border border-gray-200 dark:border-purple-900/30 print:border-none print:shadow-none">
                                    <table className="w-full text-left border-collapse whitespace-nowrap">
                                        <thead className="bg-gray-50 dark:bg-[#150a29] sticky top-0 z-10 shadow-sm print:bg-gray-100">
                                            <tr className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold">
                                                <th className="py-3 px-4 w-16 text-center">Rank</th><th className="py-3 px-4">Participant Details</th><th className="py-3 px-4 text-center">Time Taken</th><th className="py-3 px-4 text-center">Total Score</th><th className="py-3 px-4 text-right">Accuracy Breakdown</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30 bg-white dark:bg-[#1a0d36]">
                                            {displayLeaderboard.map((sub: any) => (
                                                <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-[#0f0a1c]/50 transition-colors">
                                                    <td className="py-3 px-4 text-center font-black text-gray-400 dark:text-gray-600">#{sub.rank}</td>
                                                    <td className="py-3 px-4">
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">{sub.studentName}</p>
                                                        <p className="text-[10px] text-gray-500 font-mono">{sub.studentEmail}</p>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="flex items-center justify-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded w-max mx-auto border border-blue-100 dark:border-blue-900/50">
                                                            <Clock className="w-3 h-3" /> {formatTime(sub.timeTaken)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="text-base font-black text-purple-600 dark:text-purple-400">{sub.totalScore}</span>
                                                        <span className="text-[10px] text-gray-400 font-bold ml-1">/ {maxScore}</span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right">
                                                        <div className="flex justify-end gap-1.5 text-[9px] font-bold uppercase">
                                                            <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">{sub.correctCount} ✓</span>
                                                            <span className="text-red-600 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded border border-red-100 dark:border-red-900/30">{sub.incorrectCount} ✗</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'FRAUD' && (
                        <div className="flex flex-col h-full max-h-[80vh]">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 shrink-0 no-print">
                                <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base flex items-center gap-2">
                                    <ShieldAlert className="w-5 h-5 text-red-500" /> Detected Malpractice Incidents
                                </h3>
                                {uniqueFraudTypes.length > 0 && (
                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-2 sm:px-3 py-1.5">
                                        <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 shrink-0" />
                                        <select value={fraudFilter} onChange={(e) => setFraudFilter(e.target.value)} className="bg-transparent text-[10px] sm:text-xs font-bold text-gray-700 dark:text-gray-300 outline-none cursor-pointer w-full">
                                            <option value="ALL">All Violations</option>
                                            {uniqueFraudTypes.map(type => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {safeFraudLogs.length === 0 ? (
                                <div className="text-center py-10 sm:py-16 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-900/30">
                                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 sm:mb-3 opacity-50" />
                                    No malpractice incidents detected for this assessment!
                                </div>
                            ) : filteredFraud.length === 0 ? (
                                <div className="text-center py-10 sm:py-16 text-gray-500 font-bold bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                    No incidents match the selected filter.
                                </div>
                            ) : (
                                <div className="flex-1 overflow-auto rounded-xl border border-red-200 dark:border-red-900/30">
                                    <table className="w-full text-left text-sm whitespace-nowrap">
                                        <thead className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 font-bold uppercase tracking-wider text-[10px] sticky top-0 z-10 shadow-sm">
                                            <tr>
                                                <th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">Student Identity</th><th className="px-4 py-3">Infraction Type</th><th className="px-4 py-3">Security Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-red-100 dark:divide-red-900/30 bg-white dark:bg-[#1a0d36]">
                                            {filteredFraud.map((log: any) => (
                                                <tr key={log.id} className="hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-colors">
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                                        {log.timestamp ? new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Live Session'}
                                                    </td>
                                                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                                                        {formatFullName(log.studentEmail)} <span className="text-[10px] text-gray-400 font-mono block font-normal">{log.studentEmail}</span>
                                                    </td>
                                                    <td className="px-4 py-3 font-black text-red-600 dark:text-red-500">
                                                        <span className="bg-red-100 dark:bg-red-900/30 px-2.5 py-1 rounded border border-red-200 dark:border-red-900/50 text-[10px] uppercase">
                                                            <AlertTriangle className="w-3 h-3 inline mr-1 -mt-0.5" /> {log.infractionType ? log.infractionType.replace(/_/g, ' ') : 'VIOLATION'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-red-800/80 dark:text-red-300/80 whitespace-normal min-w-[250px]">{log.details}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}