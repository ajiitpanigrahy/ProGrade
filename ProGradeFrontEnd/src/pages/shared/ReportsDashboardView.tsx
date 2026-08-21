import React, { useState } from 'react';
import { LifeBuoy, PlusCircle, History, ShieldAlert } from 'lucide-react';
import ReportSubmissionForm from '../../components/reports/ReportSubmissionForm';
import MyReportsTracking from '../../components/reports/MyReportsTracking';
import ReportsManagementPanel from '../admin/tabs/ReportsManagementPanel';

interface ReportsDashboardViewProps {
    role: 'STUDENT' | 'EDUCATOR' | 'ADMIN';
}

export default function ReportsDashboardView({ role }: ReportsDashboardViewProps) {
    const [activeTab, setActiveTab] = useState<'SUBMIT' | 'TRACKING'>('SUBMIT');

    if (role === 'ADMIN') {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative">
                <div className="bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/20 dark:border-purple-900/30 shadow-sm flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] shrink-0">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 tracking-tight">Platform Reports & Support</h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-purple-200/70 mt-1">Manage system bugs, feature requests, and user behavior reports.</p>
                    </div>
                </div>

                <ReportsManagementPanel />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 relative pb-24">
            
            {/* AMBIENT BACKGROUND */}
            <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

            {/* Header & Tab Controls */}
            <div className="bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/20 dark:border-purple-900/30 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] shrink-0 transform hover:scale-105 transition-transform duration-300">
                        <LifeBuoy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 tracking-tight leading-tight">Support & Reports</h2>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-purple-200/70 mt-1 max-w-md">Submit feedback, report system issues, and track resolutions directly with our team.</p>
                    </div>
                </div>

                {/* 🌟 FULLY RESPONSIVE TOGGLE PILL */}
                <div className="flex w-full md:w-auto bg-white dark:bg-[#0f0a1c] p-1.5 rounded-2xl shrink-0 border-2 border-gray-100 dark:border-purple-900/50 shadow-inner">
                    <button
                        onClick={() => setActiveTab('SUBMIT')}
                        className={`flex-1 flex justify-center items-center gap-2 px-2 sm:px-6 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${activeTab === 'SUBMIT'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 transform scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-purple-900/20'
                            }`}
                    >
                        <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">File a </span>Report
                    </button>
                    <button
                        onClick={() => setActiveTab('TRACKING')}
                        className={`flex-1 flex justify-center items-center gap-2 px-2 sm:px-6 py-3.5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap ${activeTab === 'TRACKING'
                                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30 transform scale-[1.02]'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-purple-900/20'
                            }`}
                    >
                        <History className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> My Tickets
                    </button>
                </div>
            </div>

            <div className="relative z-10">
                {activeTab === 'SUBMIT' ? <ReportSubmissionForm /> : <MyReportsTracking />}
            </div>

        </div>
    );
}