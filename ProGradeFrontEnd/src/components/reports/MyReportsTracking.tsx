import React, { useState, useEffect } from 'react';
import { reportService } from '../../features/shared/reportService';
import { Loader2, CheckCircle2, Ticket, Search, ShieldCheck, RefreshCcw, X, AlertTriangle } from 'lucide-react';

export default function MyReportsTracking() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // 🌟 CUSTOM RE-REPORT MODAL STATE
    const [reReportModal, setReReportModal] = useState<{ isOpen: boolean; id: number | null }>({
        isOpen: false, id: null
    });

    useEffect(() => {
        fetchMyReports();
    }, []);

    const fetchMyReports = () => {
        setLoading(true);
        reportService.getMyReports()
            .then(setReports)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const confirmReReport = (id: number) => {
        setReReportModal({ isOpen: true, id });
    };

    const executeReReport = async () => {
        if (!reReportModal.id) return;
        try {
            await reportService.reopenReport(reReportModal.id);
            setReReportModal({ isOpen: false, id: null });
            fetchMyReports(); // Refresh the list
        } catch (error) {
            alert("Failed to re-open report.");
        }
    };

    const formatTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="py-32 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600"/></div>;

    if (reports.length === 0) return (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-gray-50/50 dark:bg-[#150a29]/50 border-2 border-dashed border-gray-200 dark:border-purple-900/30 rounded-[2rem] animate-in zoom-in-95">
            <div className="w-20 h-20 bg-gray-100 dark:bg-[#1a0d36] rounded-full flex items-center justify-center mb-4 shadow-inner">
                <Ticket className="w-10 h-10 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Reports Filed</h3>
            <p className="text-gray-500 font-medium max-w-sm">You have not submitted any system or user reports yet. When you do, they will be tracked here.</p>
        </div>
    );

    return (
        <div className="space-y-6 sm:space-y-8 pb-24 animate-in fade-in slide-in-from-bottom-4 relative">
            
            {/* 🌟 CUSTOM RE-REPORT MODAL */}
            {reReportModal.isOpen && (
                <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#150a29] w-full max-w-md rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-purple-900/50 animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-red-600 dark:text-red-500 flex items-center gap-2"><AlertTriangle className="w-6 h-6"/> Re-Open Issue</h3>
                            <button onClick={() => setReReportModal({isOpen:false, id:null})} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer"><X className="w-4 h-4"/></button>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-8 leading-relaxed">
                            Are you unsatisfied with the resolution? By confirming, this ticket will be marked as <span className="font-black text-red-600 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded">Re-Reported</span> and sent back to the Administration team for immediate review.
                        </p>

                        <div className="flex gap-3">
                            <button onClick={() => setReReportModal({isOpen:false, id:null})} className="flex-1 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer text-sm">Cancel</button>
                            <button onClick={executeReReport} className="flex-1 py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg transform hover:-translate-y-0.5 transition-all cursor-pointer text-sm">Confirm Re-Report</button>
                        </div>
                    </div>
                </div>
            )}

            {reports.map(report => {
                const isResolved = report.status === 'RESOLVED' || report.status === 'DISMISSED';
                const isInvestigating = report.status === 'INVESTIGATING' || isResolved;
                
                // 🌟 Detect Re-opened Status
                const isReopened = report.reopened || report.isReopened;

                return (
                    <div key={report.id} className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-purple-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col xl:flex-row gap-8 hover:border-purple-300 dark:hover:border-purple-500/50 transition-colors group">
                        
                        {/* Ticket Details */}
                        <div className="flex-1 space-y-5">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="text-[10px] sm:text-xs font-black uppercase text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-lg tracking-wider border border-purple-200 dark:border-purple-800">
                                        {report.type.replace('_', ' ')}
                                    </span>
                                    
                                    {/* 🌟 RE-REPORTED BADGE FOR USER */}
                                    {isReopened && (
                                        <span className="text-[10px] sm:text-xs font-black uppercase text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 px-3 py-1.5 rounded-lg tracking-wider border border-red-200 dark:border-red-800 flex items-center gap-1.5 shadow-sm animate-pulse">
                                            <RefreshCcw className="w-3.5 h-3.5" /> Re-Reported
                                        </span>
                                    )}

                                    <span className="text-xs text-gray-400 font-bold bg-gray-50 dark:bg-[#0f0a1c] px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-800">
                                        Reported: {formatTime(report.createdAt)}
                                    </span>
                                </div>
                                
                                {/* 🌟 RE-REPORT ACTION BUTTON */}
                                {isResolved && (
                                    <button 
                                        onClick={() => confirmReReport(report.id)} 
                                        className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border border-red-200 dark:border-red-800/50 shadow-sm"
                                    >
                                        <RefreshCcw className="w-3.5 h-3.5" /> Re-Report Issue
                                    </button>
                                )}
                            </div>
                            
                            <h3 className="font-black text-xl sm:text-2xl text-gray-900 dark:text-white leading-tight">{report.cause}</h3>
                            <div className="bg-gray-50 dark:bg-[#0f0a1c] p-5 sm:p-6 rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-inner">
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{report.description}</p>
                            </div>

                            {report.adminNotes && (
                                <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                                        <ShieldCheck className="w-4 h-4"/> Admin Resolution Note
                                    </p>
                                    <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-100 font-medium italic leading-relaxed whitespace-pre-wrap">
                                        "{report.adminNotes}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 🌟 HORIZONTAL TRACKING PIPELINE (MOBILE-SAFE) */}
                        <div className="xl:w-80 shrink-0 bg-gray-50 dark:bg-[#1a0d36] rounded-[2rem] p-6 sm:p-8 border border-gray-200 dark:border-purple-900/30 flex flex-col justify-center shadow-sm relative overflow-visible">
                            <h4 className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-8 text-center xl:text-left">
                                Resolution Tracker
                            </h4>
                            
                            <div className="flex items-center justify-between relative w-full px-4">
                                <div className="absolute left-[10%] right-[10%] top-1/2 -translate-y-1/2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full z-0"></div>
                                <div className={`absolute left-[10%] top-1/2 -translate-y-1/2 h-1.5 ${isReopened && !isInvestigating ? 'bg-red-500' : 'bg-purple-500'} rounded-full z-0 transition-all duration-700 ${isResolved ? 'w-[80%]' : isInvestigating ? 'w-[40%]' : 'w-0'}`}></div>

                                {/* Step 1: OPEN / RE-OPENED */}
                                <div className="relative z-10">
                                    <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center border-4 border-white dark:border-[#1a0d36] transition-all duration-500 ${isReopened && !isInvestigating ? 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]'}`}>
                                        {isReopened ? <RefreshCcw className="w-4 h-4" /> : <Ticket className="w-4 h-4" />}
                                    </div>
                                </div>
                                
                                {/* Step 2: INVESTIGATING */}
                                <div className="relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a0d36] transition-all duration-500 ${isInvestigating ? 'bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                        <Search className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Step 3: RESOLVED */}
                                <div className="relative z-10">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-[#1a0d36] transition-all duration-500 ${isResolved ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>
                            
                            {/* 🌟 ALWAYS VISIBLE LABELS & TIMESTAMPS FOR MOBILE */}
                            <div className="flex justify-between mt-4 px-1 text-[10px] font-black uppercase tracking-wider w-full">
                                <div className="flex flex-col items-start w-1/3">
                                    <span className={isReopened && !isInvestigating ? "text-red-500" : "text-purple-600 dark:text-purple-400"}>
                                        {isReopened ? 'RE-OPENED' : 'FILED'}
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                                        {formatTime(isReopened ? report.updatedAt : report.createdAt)}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center w-1/3 text-center">
                                    <span className={isInvestigating ? "text-amber-500" : "text-gray-400 dark:text-gray-600"}>REVIEW</span>
                                    <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                                        {report.investigatingAt ? formatTime(report.investigatingAt) : '--'}
                                    </span>
                                </div>
                                <div className="flex flex-col items-end w-1/3 text-right">
                                    <span className={isResolved ? (report.status === 'DISMISSED' ? "text-gray-500 dark:text-gray-400" : "text-emerald-500") : "text-gray-400 dark:text-gray-600"}>
                                        {report.status === 'DISMISSED' ? 'DISMISSED' : 'CLOSED'}
                                    </span>
                                    <span className="text-[8px] sm:text-[9px] text-gray-400 dark:text-gray-500 mt-1 leading-tight">
                                        {report.resolvedAt ? formatTime(report.resolvedAt) : '--'}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}