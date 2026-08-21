import React, { useState, useEffect } from 'react';
import { adminService } from '../../../features/admin/adminService';
import { Database, UploadCloud, Code2, PlusCircle, History, Award, Calendar, CheckCircle2 } from 'lucide-react';
import BulkUploadModal from '../BulkUploadModal';
import QuestionOverview from './subtabs/QuestionOverview';
import QuestionGrid from './subtabs/QuestionGrid';
import CreateQuestionModal from './subtabs/CreateQuestionModal';

export const TECH_STACK = [
    { id: 'OVERVIEW', name: 'Global Overview' },
    { id: 'JAVA', name: 'Java' },
    { id: 'PYTHON', name: 'Python' },
    { id: 'CPP', name: 'C++' },
    { id: 'C', name: 'C Programming' },
    { id: 'JAVASCRIPT', name: 'JavaScript' },
    { id: 'SQL', name: 'Advanced SQL' },
    { id: 'MYSQL', name: 'MySQL' },
    { id: 'DSA', name: 'Data Structures' },
    { id: 'SPRING_CORE', name: 'Spring Core' },
    { id: 'SPRING_BOOT', name: 'Spring Boot' },
    { id: 'SPRING_MVC', name: 'Spring MVC' },
    { id: 'SPRING_DATA_JPA', name: 'Spring Data JPA' },
    { id: 'SPRING_JDBC', name: 'Spring JDBC' },
    { id: 'SPRING_ORM', name: 'Spring ORM' },
    { id: 'REST_API', name: 'REST API' },
    { id: 'HIBERNATE', name: 'Hibernate' },
    { id: 'MAVEN', name: 'Maven' },
    { id: 'JUNIT', name: 'JUnit' },
    { id: 'LOGGING', name: 'Logging' }
];

export default function QuestionBankTab() {
    const [activeTechId, setActiveTechId] = useState('OVERVIEW');
    const [isUploadModalOpen, setUploadModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false); 
    const [refreshTrigger, setRefreshTrigger] = useState(0); 
    const [questionToEdit, setQuestionToEdit] = useState<any | null>(null); 
    const [activeView, setActiveView] = useState<'BANK' | 'HISTORY'>('BANK');
    const [contributionLog, setContributionLog] = useState<any[]>([]);

    const [uploadSuccess, setUploadSuccess] = useState<{show: boolean, count: number, message: string}>({ show: false, count: 0, message: '' });

    const openEditModal = (questionData: any) => {
        setQuestionToEdit(questionData);
        setCreateModalOpen(true);
    };

    const handleModalClose = () => {
        setCreateModalOpen(false);
        setQuestionToEdit(null); 
    };

    useEffect(() => {
        if (activeView === 'HISTORY') {
            adminService.getQuestionContributionHistory()
                .then(setContributionLog)
                .catch(console.error);
        }
    }, [activeView]);

    const handleSuccessAction = (count?: number, message?: string) => {
        setRefreshTrigger(prev => prev + 1);
        if (count && message) {
            setUploadSuccess({ show: true, count, message });
            setTimeout(() => setUploadSuccess({ show: false, count: 0, message: '' }), 6000);
        }
    };

    const safeLog = Array.isArray(contributionLog) ? contributionLog : [];

    return (
        <div className="space-y-6 animate-in fade-in flex flex-col relative z-10 min-h-full pb-10">
            
            {uploadSuccess.show && (
                <div className="fixed top-24 right-6 z-[9999] bg-white dark:bg-[#1a0d36] border-2 border-emerald-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-10 fade-in duration-300">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-widest">Import Successful</h4>
                        <p className="text-gray-600 dark:text-gray-300 text-xs font-bold mt-1">{uploadSuccess.message}</p>
                    </div>
                </div>
            )}

            <div className="shrink-0 bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 sm:p-8 rounded-[2rem] flex flex-col xl:flex-row xl:items-center justify-between gap-6 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 flex items-center gap-3 drop-shadow-sm">
                        <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        Global Question Bank
                    </h2>
                    <p className="text-sm text-gray-500 font-bold mt-2 tracking-wide">Manage infrastructure, track contributions, and upload bulk data.</p>
                </div>
                
               <div className="flex bg-gray-100 dark:bg-[#0f0a1c] p-1.5 rounded-2xl shadow-inner border border-gray-200 dark:border-purple-900/50 w-full sm:w-auto">
                    <button 
                        onClick={() => setActiveView('BANK')} 
                        // 🌟 ADDED: cursor-pointer
                        className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeView === 'BANK' ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                    >
                        Data Bank
                    </button>
                    <button 
                        onClick={() => setActiveView('HISTORY')} 
                        // 🌟 ADDED: cursor-pointer
                        className={`flex-1 sm:px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer ${activeView === 'HISTORY' ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'}`}
                    >
                        Contribution Log
                    </button>
                </div>
            </div>

            {activeView === 'BANK' && (
                <div className="space-y-6 animate-in slide-in-from-left-4">
                    <div className="flex flex-col sm:flex-row justify-end gap-3 w-full">
                        <button 
                            onClick={() => { setQuestionToEdit(null); setCreateModalOpen(true); }} 
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-[#1a0d36] text-purple-600 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-900/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-xs uppercase tracking-wider rounded-xl font-black transition-all active:scale-95 cursor-pointer shadow-sm w-full sm:w-auto"
                        >
                            <PlusCircle className="w-4 h-4" /> Add Single Question
                        </button>
                        
                        <button 
                            onClick={() => setUploadModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs uppercase tracking-wider rounded-xl font-black shadow-[0_10px_20px_rgba(147,51,234,0.3)] transition-all active:scale-95 cursor-pointer w-full sm:w-auto border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
                        >
                            <UploadCloud className="w-4 h-4" /> Bulk Import Matrix
                        </button>
                    </div>

                    <div className="shrink-0 w-full border-b border-gray-200 dark:border-purple-900/30 overflow-x-auto custom-scrollbar pb-1">
                        <div className="flex items-center gap-2 min-w-max">
                            {TECH_STACK.map((tech) => (
                                <button
                                    key={tech.id}
                                    onClick={() => setActiveTechId(tech.id)}
                                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-sm transition-all cursor-pointer ${
                                        activeTechId === tech.id 
                                        ? 'border-purple-600 text-purple-700 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-900/10' 
                                        : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                                    } rounded-t-xl`}
                                >
                                    <span className="text-lg">{tech.id === 'OVERVIEW' ? <Database className="w-4 h-4"/> : <Code2 className="w-4 h-4"/>}</span>
                                    {tech.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        {activeTechId === 'OVERVIEW' ? (
                            <QuestionOverview refreshTrigger={refreshTrigger} />
                        ) : (
                            <QuestionGrid 
                                technology={activeTechId} 
                                // 🌟 SAFE FALLBACK: Ensures techData is never completely undefined!
                                techData={TECH_STACK.find(t => t.id === activeTechId) || { id: activeTechId, name: activeTechId }} 
                                refreshTrigger={refreshTrigger}
                                onEdit={openEditModal}
                            />
                        )}
                    </div>
                </div>
            )}

            {activeView === 'HISTORY' && (
                <div className="bg-white/80 dark:bg-[#1a0d36]/80 backdrop-blur-xl rounded-[2rem] border-2 border-gray-100 dark:border-purple-900/30 p-6 sm:p-8 shadow-xl min-h-[500px] animate-in slide-in-from-right-4 relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

                    <div className="flex items-center gap-3 mb-8 relative z-10">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
                            <History className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-gray-900 dark:text-white">Audit & Contribution Log</h3>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Leaderboard of Database Architect Contributions</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto w-full custom-scrollbar relative z-10">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-gray-50 dark:bg-[#0f0a1c] text-[10px] font-black uppercase tracking-widest text-gray-500 border-b-2 border-gray-200 dark:border-purple-900/50">
                                <tr>
                                    <th className="py-4 px-6 rounded-tl-xl">Contributor Identity</th>
                                    <th className="py-4 px-6 text-center">Authorization Role</th>
                                    <th className="py-4 px-6 text-center">Total Volume Added</th>
                                    <th className="py-4 px-6 text-right rounded-tr-xl">Latest Contribution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                {safeLog.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-20">
                                            <div className="flex flex-col items-center opacity-50">
                                                <Database className="w-10 h-10 mb-3 text-gray-400" />
                                                <span className="text-sm font-bold text-gray-500">No contribution data logged yet.</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    safeLog.map((log: any, index: number) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0">
                                                        {log.name ? log.name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 dark:text-white text-sm group-hover:text-purple-600 transition-colors">{log.name || 'Unknown'}</p>
                                                        <p className="text-[10px] font-mono text-gray-500 mt-0.5">{log.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border shadow-sm ${log.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400' : 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/50 dark:text-blue-400'}`}>
                                                    {log.role || 'USER'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Award className={`w-4 h-4 ${index === 0 ? 'text-amber-500' : 'text-gray-400'}`} />
                                                    <span className="text-sm font-black text-gray-900 dark:text-white">{log.totalQuestions} <span className="text-[10px] text-gray-500">Qs</span></span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2 text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-bold">
                                                        {log.lastContribution ? new Date(log.lastContribution).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <BulkUploadModal 
                isOpen={isUploadModalOpen} 
                onClose={() => setUploadModalOpen(false)} 
                onSuccess={(res: any) => handleSuccessAction(res?.count, res?.message)} 
            />
            
            <CreateQuestionModal
                isOpen={isCreateModalOpen}
                onClose={handleModalClose}
                onSuccess={() => handleSuccessAction()}
                editData={questionToEdit}
            />
        </div>
    );
}