import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, Loader2, Trophy, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { studentService } from '../../../features/student/studentService';

export default function PerformanceTranscriptsTab() {
    const navigate = useNavigate();
    const [transcripts, setTranscripts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentService.getMyTranscripts()
            .then(setTranscripts)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="py-24 flex justify-center text-purple-600"><Loader2 className="w-8 h-8 animate-spin" /></div>;

    return (
        <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* Header */}
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-4 sm:p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center border border-purple-200 dark:border-purple-800 shrink-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">Performance Transcripts</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Review historical scores and access deep AI test analysis.</p>
                </div>
            </div>

            {/* Transcript Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {transcripts.length === 0 ? (
                    <div className="col-span-full py-12 sm:py-16 text-center text-gray-500 text-sm sm:text-base font-bold border-2 border-dashed border-gray-200 dark:border-purple-900/30 rounded-2xl">
                        You have not completed any examinations yet.
                    </div>
                ) : (
                    transcripts.map((sub: any) => {
                        const passRatio = (sub.score / sub.maxScore) * 100;
                        const isPass = passRatio >= 50;

                        return (
                            <div key={sub.id} className="bg-white dark:bg-[#150a29] rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col group hover:shadow-md transition-shadow">
                                
                                <div className="flex justify-between items-center mb-3 sm:mb-4">
                                    <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-1 rounded-md tracking-wider ${
                                        isPass ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                    }`}>
                                        {isPass ? 'Passed' : 'Needs Review'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(sub.submittedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white mb-4 sm:mb-6 line-clamp-1">{sub.examTitle}</h3>

                                {/* 🌟 Responsive Stats Grid */}
                                <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 dark:bg-[#1a0d36] rounded-xl border border-gray-100 dark:border-purple-900/30">
                                    <div className="text-center"><p className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400">{sub.score}</p><p className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500">Score</p></div>
                                    <div className="text-center border-l border-gray-200 dark:border-purple-900/50"><p className="text-base sm:text-lg font-black text-emerald-500 flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>{sub.correctCount}</p><p className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500">Correct</p></div>
                                    <div className="text-center border-l border-gray-200 dark:border-purple-900/50"><p className="text-base sm:text-lg font-black text-red-500 flex items-center justify-center gap-1"><XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5"/>{sub.incorrectCount}</p><p className="text-[9px] sm:text-[10px] font-bold uppercase text-gray-500">Wrong</p></div>
                                </div>

                                <button 
                                    onClick={() => navigate(`/student/analysis/${sub.id}`)}
                                    className="mt-auto w-full flex items-center justify-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/40 dark:text-purple-300 font-bold py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
                                >
                                    View Test Analysis <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>

                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}