import React, { useState, useEffect } from 'react';
import { ShieldAlert, Plus, FileText, KeyRound, Fingerprint, Copy, ChevronRight, Eye } from 'lucide-react';
import AssessmentBuilder from './subtabs/AssessmentBuilder';
import AssessmentDetailsPanel from './subtabs/AssessmentDetailsPanel';
import { adminService } from '../../../features/admin/adminService';
import { useAuth } from '../../../context/AuthContext';

export default function AssessmentHubTab({ activeSubTab }: { activeSubTab: string }) {
    const { user } = useAuth();
    
    const [isBuilding, setIsBuilding] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🌟 HELPER ADDED HERE: Extracts Full Name from email string
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

    useEffect(() => {
        if (!isBuilding && !selectedAssessment && activeSubTab !== 'FRAUD') {
            loadAssessments();
        }
    }, [isBuilding, selectedAssessment, activeSubTab]);

    const copyToClipboard = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
    };
    
    if (activeSubTab === 'FRAUD') {
        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 p-4 rounded-xl flex items-start gap-4">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h3 className="text-red-800 dark:text-red-400 font-bold">Live Proctoring Alerts</h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80">These events are streaming live from active assessments.</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden w-full">
                    <div className="overflow-x-auto w-full custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px]">
                            <thead className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase text-gray-500">
                                <tr>
                                    <th className="py-3 px-4">Time</th>
                                    <th className="py-3 px-4">Student</th>
                                    <th className="py-3 px-4">Infraction Type</th>
                                    <th className="py-3 px-4">Severity</th>
                                    <th className="py-3 px-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                <tr className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50">
                                    <td className="py-3 px-4 text-gray-500">10:42 AM</td>
                                    <td className="py-3 px-4 font-bold dark:text-white">STU-1042</td>
                                    <td className="py-3 px-4 text-red-500 font-bold">MULTIPLE_FACES_DETECTED</td>
                                    <td className="py-3 px-4"><span className="bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">CRITICAL</span></td>
                                    <td className="py-3 px-4 text-right">
                                        <button className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded hover:bg-red-200 font-bold transition-colors cursor-pointer">Terminate</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (isBuilding) {
        return <AssessmentBuilder onCancel={() => setIsBuilding(false)} onSuccess={() => setIsBuilding(false)} />;
    }

    if (selectedAssessment) {
        return <AssessmentDetailsPanel assessment={selectedAssessment} onBack={() => { setSelectedAssessment(null); loadAssessments(); }} />;
    }

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in">
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
                        <thead className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase text-gray-500">
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
                                    // 🌟 CHECK EDIT PERMISSIONS
                                    const canEdit = user?.role === 'ADMIN' || exam.creatorEmail === user?.email;

                                    return (
                                        <tr key={exam.id} onClick={() => setSelectedAssessment(exam)} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors cursor-pointer group">
                                            <td className="py-4 px-6">
                                                <p className="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{exam.title}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">By: <span className="font-medium text-purple-600 dark:text-purple-400">{formatFullName(exam.creatorEmail)}</span></p>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 group/copy w-max" onClick={(e) => copyToClipboard(e, exam.examId)} title="Click to copy">
                                                        <Fingerprint className="w-3.5 h-3.5 text-purple-500" />
                                                        <span className="font-mono font-bold text-gray-700 dark:text-gray-300">ID: {exam.examId}</span>
                                                        <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover/copy:opacity-100 transition-opacity" />
                                                    </div>
                                                    <div className="flex items-center gap-2 group/copy w-max" onClick={(e) => copyToClipboard(e, exam.password)} title="Click to copy">
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
                                                {/* 🌟 RENDER VIEW-ONLY BADGE IF THEY CANNOT EDIT */}
                                                {canEdit ? (
                                                    <ChevronRight className="w-5 h-5 text-gray-400 inline-block group-hover:text-purple-600 transition-colors" />
                                                ) : (
                                                    <span className="flex items-center justify-end gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded w-max ml-auto">
                                                        <Eye className="w-3 h-3"/> VIEW
                                                    </span>
                                                )}
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