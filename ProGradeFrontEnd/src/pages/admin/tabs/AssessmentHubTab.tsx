import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, FileText, KeyRound, Fingerprint, Copy, ChevronRight, BarChart3, Lock, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AssessmentBuilder from './subtabs/AssessmentBuilder';
import AssessmentDetailsPanel from './subtabs/AssessmentDetailsPanel';
import { adminService } from '../../../features/admin/adminService';
import { useAuth } from '../../../context/AuthContext';

export default function AssessmentHubTab({ activeSubTab }: { activeSubTab: string }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    const [isBuilding, setIsBuilding] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [fraudLogs, setFraudLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [restrictedModal, setRestrictedModal] = useState(false);

    const formatFullName = (email: string) => {
        if (!email) return 'Admin User';
        return email.split('@')[0]
            .split(/[._-]/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
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

    const copyToClipboard = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
    };

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
    
    // 🌟 FULLY UPGRADED REAL-TIME GLOBAL FRAUD TABLE
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

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in relative">
            
            {restrictedModal && <RestrictedModal />}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                        Global Assessment Control
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage active exams and create new assessment blueprints.</p>
                </div>
                
                <button 
                    onClick={() => setIsBuilding(true)}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-xl font-bold shadow-lg shadow-purple-600/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                    <Plus className="w-5 h-5" /> Create New Exam
                </button>
            </div>
            
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden w-full">
                <div className="overflow-x-auto w-full custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-[#150a29] text-[11px] font-bold uppercase tracking-wider text-gray-500">
                            <tr>
                                <th className="py-4 px-6">Assessment Details</th>
                                <th className="py-4 px-6">Credentials</th>
                                <th className="py-4 px-6">Configuration</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">Loading assessments...</td></tr>
                            ) : assessments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-12 text-gray-500 font-medium">No assessments found. Create one above!</td></tr>
                            ) : (
                                assessments.map((exam) => {
                                    const isAdmin = user?.role === 'ADMIN';
                                    const isCreator = exam.creatorEmail === user?.email;
                                    const hasFullAccess = isAdmin || isCreator;

                                    return (
                                        <tr 
                                            key={exam.id} 
                                            onClick={() => hasFullAccess ? setSelectedAssessment(exam) : setRestrictedModal(true)} 
                                            className={`transition-colors group ${hasFullAccess ? 'hover:bg-gray-50 dark:hover:bg-[#150a29]/50 cursor-pointer' : 'cursor-pointer hover:bg-red-50/30 dark:hover:bg-red-900/10'}`}
                                        >
                                            <td className="py-4 px-6">
                                                <p className={`font-bold text-gray-900 dark:text-white transition-colors ${hasFullAccess ? 'group-hover:text-purple-600' : ''}`}>{exam.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">By: <span className="font-medium text-purple-600 dark:text-purple-400">{formatFullName(exam.creatorEmail)}</span></p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 group/copy w-max cursor-pointer" onClick={(e) => copyToClipboard(e, exam.examId)} title="Click to copy">
                                                        <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
                                                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">ID: {exam.examId}</span>
                                                        <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex items-center gap-2 group/copy w-max cursor-pointer" onClick={(e) => copyToClipboard(e, exam.password)} title="Click to copy">
                                                        <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                                                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">Pass: {exam.password}</span>
                                                        <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-blue-600 dark:text-blue-400">{exam.totalQuestions} Qs</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{exam.durationMinutes} Min</p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`font-bold text-[10px] uppercase px-2 py-1 rounded border ${
                                                    exam.status === 'PUBLISHED' ? 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50' : 
                                                    'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50'
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
                                                                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-[10px] sm:text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer uppercase tracking-wider"
                                                                title="View Analytics & Fraud Reports"
                                                            >
                                                                <BarChart3 className="w-3.5 h-3.5" /> 
                                                                <span className="hidden sm:inline">Reports</span>
                                                            </button>
                                                            <ChevronRight className="w-5 h-5 text-gray-400 inline-block group-hover:text-purple-600 transition-colors" />
                                                        </>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 rounded-lg text-[10px] font-bold border border-gray-200 dark:border-gray-700 w-max ml-auto">
                                                            <Lock className="w-3 h-3"/> ADMIN RESTRICTED
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