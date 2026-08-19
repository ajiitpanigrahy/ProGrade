import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, CheckCircle2, XCircle, BrainCircuit, Loader2, MinusCircle, Clock, Calendar, BarChart3, Download, Sparkles, ShieldCheck, Terminal, Code2, BookOpen } from 'lucide-react';
import { studentService } from '../../features/student/studentService';

// 🌟 ADDED RENDER HELPER FOR CODE FORMATTING
const renderQuestionContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
            return (
                <div key={index} className="my-4 bg-[#0d0714] border border-purple-900/50 rounded-xl overflow-hidden shadow-inner w-full">
                    <div className="bg-[#150a29] px-4 py-2.5 flex items-center gap-2 border-b border-purple-900/50">
                        <Terminal className="w-4 h-4 text-purple-400" />
                        <span className="text-xs uppercase font-black text-purple-400 tracking-wider">Code Snippet</span>
                    </div>
                    <pre className="p-5 text-sm sm:text-base text-emerald-400 font-mono overflow-x-auto leading-relaxed custom-scrollbar whitespace-pre">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        }
        return <span key={index} className="whitespace-pre-wrap leading-relaxed">{part}</span>;
    });
};

export default function TestAnalysisView() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState<any>(null);
    const [aiData, setAiData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        studentService.getTestAnalysis(submissionId as string).then(data => {
            setAnalysis(data);
            setLoading(false);
            studentService.getAiInsights(submissionId as string)
                .then(setAiData)
                .catch(console.error);
        });
    }, [submissionId]);

    const handleDownloadPDF = () => {
        const style = document.createElement('style');
        style.id = 'dark-pdf-theme';
        style.innerHTML = `
            @media print {
                @page { margin: 10mm; }
                html, body { 
                    background-color: #05020a !important; 
                    color: white !important; 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important; 
                }
                .no-print { display: none !important; }
                .print-break-inside { break-inside: avoid; }
                
                .bg-\\[\\#150a29\\] { background-color: #150a29 !important; border: 1px solid rgba(88, 28, 135, 0.5) !important; }
                .bg-\\[\\#0f0a1c\\] { background-color: #0f0a1c !important; border: 1px solid rgba(88, 28, 135, 0.3) !important; }
                .bg-\\[\\#1a0d36\\] { background-color: #1a0d36 !important; border: 1px solid rgba(88, 28, 135, 0.5) !important; }
                .bg-purple-900\\/20 { background-color: rgba(88, 28, 135, 0.2) !important; }
                .print-shadow-none { box-shadow: none !important; }
            }
        `;
        document.head.appendChild(style);
        setTimeout(() => {
            window.print();
            document.getElementById('dark-pdf-theme')?.remove();
        }, 250); 
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#05020a] text-purple-600">
            <Loader2 className="w-10 h-10 animate-spin mb-4" /> 
            <p className="font-bold text-sm tracking-wider uppercase">Loading Performance Analytics...</p>
        </div>
    );

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true
            });
        } catch { return dateString; }
    };

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return '0s';
        if (seconds < 60) return `${seconds}s`;
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    let maxTimeSpent = 0;
    if (analysis?.details) {
        analysis.details.forEach((q: any) => {
            const sec = q.timeSpentSeconds || 0;
            if (sec > maxTimeSpent) maxTimeSpent = sec;
        });
    }
    if (maxTimeSpent === 0) maxTimeSpent = 1;

    const totalTimeSeconds = analysis?.totalTimeSeconds || 0;

    return (
        <div className="min-h-screen bg-[#05020a] text-white p-3 sm:p-6 lg:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-8 relative">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print relative z-50">
                    <button onClick={() => navigate('/student/dashboard?view=transcripts')} className="flex items-center gap-1.5 sm:gap-2 text-gray-400 text-xs sm:text-sm font-bold hover:text-purple-400 transition-colors w-fit cursor-pointer">
                        <ArrowLeft className="w-4 h-4"/> Back to Transcripts
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 text-xs sm:text-sm w-full sm:w-auto cursor-pointer">
                        <Download className="w-4 h-4" /> Download Analysis Report
                    </button>
                </div>

                <div className="hidden print:flex items-center justify-between pb-4 border-b border-purple-900/50 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-purple-400">ProGrade Evaluation Report</h1>
                        <p className="text-xs text-gray-400">Verified AI Assessment Analysis</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                        <p>Issued: {new Date().toLocaleDateString()}</p>
                        <p className="font-bold text-emerald-400 flex items-center justify-end gap-1"><ShieldCheck className="w-3 h-3"/> Authenticated</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in zoom-in-95">
                    <div className="bg-[#150a29] rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 shadow-sm border border-purple-900/50 flex flex-col justify-between lg:col-span-2 print-shadow-none">
                        <div className="flex items-center gap-4 sm:gap-6 w-full mb-6">
                            <div className="w-14 h-14 sm:w-20 sm:h-20 bg-purple-900/30 rounded-full flex items-center justify-center shrink-0 border-4 border-purple-900/20">
                                <Trophy className="w-7 h-7 sm:w-10 sm:h-10 text-purple-400" />
                            </div>
                            <div className="text-left flex-1">
                                <h1 className="text-lg sm:text-2xl font-black text-white mb-1 leading-tight">{analysis.examTitle}</h1>
                                <p className="text-gray-400 font-medium text-xs sm:text-sm">Comprehensive Analytics & AI Review</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-1 sm:gap-2 bg-[#0f0a1c] p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-purple-900/30 text-center">
                            <div><p className="text-lg sm:text-3xl font-black text-purple-400">{analysis.score}</p><p className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Score</p></div>
                            <div className="border-l border-purple-900/50"><p className="text-base sm:text-2xl font-bold text-emerald-500">{analysis.correct}</p><p className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Correct</p></div>
                            <div className="border-l border-purple-900/50"><p className="text-base sm:text-2xl font-bold text-red-500">{analysis.incorrect}</p><p className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Wrong</p></div>
                            <div className="border-l border-purple-900/50"><p className="text-base sm:text-2xl font-bold text-gray-400">{analysis.skipped}</p><p className="text-[8px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">Skipped</p></div>
                        </div>
                    </div>

                    <div className="bg-[#150a29] rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 shadow-sm border border-purple-900/50 flex flex-col justify-center print-shadow-none">
                        <h3 className="font-bold text-white flex items-center gap-2 mb-4 sm:mb-6"><Clock className="w-5 h-5 text-amber-500"/> Exam Timestamps</h3>
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex justify-between items-center border-b border-purple-900/30 pb-2 sm:pb-3">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Started</span>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-200 text-right">{formatDate(analysis.startedAt)}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-purple-900/30 pb-2 sm:pb-3">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5"/> Submitted</span>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-200 text-right">{formatDate(analysis.submittedAt)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> Total Time</span>
                                <span className="text-xs sm:text-sm font-black text-amber-400 bg-amber-900/20 px-2 sm:px-3 py-1 rounded-lg">{formatDuration(totalTimeSeconds)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 text-white shadow-lg print-shadow-none print-break-inside">
                    <h2 className="font-black text-lg sm:text-xl flex items-center gap-2 mb-3"><Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300"/> AI Overall Assessment Analysis</h2>
                    {aiData ? (
                        <p className="text-purple-50 font-medium leading-relaxed text-xs sm:text-base whitespace-pre-wrap">{aiData.overallAnalysis}</p>
                    ) : (
                        <p className="flex items-center gap-2 font-bold animate-pulse text-purple-200 text-sm"><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> AI is analyzing your performance...</p>
                    )}
                </div>

                <div className="bg-[#150a29] rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 shadow-sm border border-purple-900/50 print-shadow-none print-break-inside overflow-hidden">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                        <h3 className="font-bold text-base sm:text-lg text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500"/> Time Spent per Question</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase text-gray-500 no-print">
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{backgroundColor: '#34d399'}}></div> Correct</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{backgroundColor: '#f87171'}}></div> Incorrect</span>
                            <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded" style={{backgroundColor: '#374151'}}></div> Skipped</span>
                        </div>
                    </div>

                    <div className="h-48 sm:h-56 w-full flex items-end justify-start gap-2 sm:gap-4 overflow-x-auto pt-10 sm:pt-12 pb-2 px-1 sm:px-2 border-b border-purple-900/30 custom-scrollbar">
                        {analysis.details.map((q: any, i: number) => {
                            const timeSec = q.timeSpentSeconds || 0;
                            const heightPercent = Math.max((timeSec / maxTimeSpent) * 100, 5); 

                            let barColor = "#374151"; 
                            if (q.isCorrect) barColor = "#34d399"; 
                            else if (q.studentOption !== "UNATTEMPTED") barColor = "#f87171"; 

                            return (
                                <div key={i} className="flex flex-col items-center justify-end h-full gap-1 sm:gap-2 shrink-0 w-8 sm:w-10 group relative">
                                    <div className="absolute top-0 bg-white text-gray-900 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 no-print">
                                        Q{i+1}: {formatDuration(timeSec)}
                                    </div>
                                    <span className="text-[8px] sm:text-[10px] font-black text-gray-400">{timeSec}s</span>
                                    <div className="w-full rounded-t-sm sm:rounded-t-md transition-all duration-500 shadow-sm" style={{ height: `${heightPercent}%`, backgroundColor: barColor }}></div>
                                    <span className="text-[8px] sm:text-[10px] font-bold text-gray-400 mt-1">Q{i+1}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <h2 className="text-lg sm:text-2xl font-black text-white pt-2 sm:pt-4 px-2">Detailed Question Review</h2>
                
                <div className="space-y-4 sm:space-y-6">
                    {analysis.details.map((q: any, i: number) => {
                        const isCorrect = q.isCorrect;
                        const isUnattempted = q.studentOption === "UNATTEMPTED";
                        const isCoding = q.questionType === 'CODING' || q.codeSnippet;

                        return (
                            <div key={i} className={`bg-[#1a0d36] rounded-2xl p-4 sm:p-6 shadow-sm border-2 print-shadow-none print-break-inside ${isCorrect ? 'border-emerald-500/50' : isUnattempted ? 'border-purple-900/30' : 'border-red-500/50'}`}>
                                <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                                    <div className="flex gap-2.5 sm:gap-4 items-start w-full">
                                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isCorrect ? 'bg-emerald-900/50 text-emerald-400' : isUnattempted ? 'bg-gray-800 text-gray-400' : 'bg-red-900/50 text-red-400'}`}>
                                            {isCorrect ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5"/> : isUnattempted ? <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5"/> : <XCircle className="w-4 h-4 sm:w-5 sm:h-5"/>}
                                        </div>
                                        <div className="w-full">
                                            <div className="flex items-center gap-3 mb-2">
                                                <p className="text-[10px] sm:text-xs text-gray-400 font-bold">Question {i + 1}</p>
                                                {isCoding ? (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-900/20 px-1.5 py-0.5 rounded border border-emerald-500/30"><Code2 className="w-2.5 h-2.5"/> Coding</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded border border-blue-500/30"><BookOpen className="w-2.5 h-2.5"/> Theory</span>
                                                )}
                                            </div>

                                            <div className="text-white font-semibold text-sm sm:text-lg leading-relaxed w-full">
                                                {/* 🌟 1. Render the main text and handle legacy markdown */}
                                                {renderQuestionContent(q.questionText)}
                                                
                                                {/* 🌟 2. Explicitly render the dedicated Code Snippet */}
                                                {q.codeSnippet && (
                                                    <div className="mt-4 bg-[#0c0618] border border-purple-900/50 rounded-xl overflow-hidden shadow-xl w-full text-left">
                                                        <div className="bg-[#150a29] px-4 py-2 flex items-center gap-2 border-b border-purple-900/50">
                                                            <Terminal className="w-4 h-4 text-emerald-400"/>
                                                            <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">
                                                                Developer Code Snippet ({q.codeLanguage || 'Code'})
                                                            </span>
                                                        </div>
                                                        <pre className="p-4 sm:p-5 text-sm sm:text-base text-emerald-400 font-mono overflow-x-auto leading-relaxed custom-scrollbar whitespace-pre">
                                                            <code>{q.codeSnippet}</code>
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-bold text-gray-500 bg-[#0f0a1c] border border-purple-900/50 px-2 sm:px-2.5 py-1 rounded-lg shrink-0">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 h-3 text-amber-500"/> {formatDuration(q.timeSpentSeconds)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                    {['A', 'B', 'C', 'D'].map(opt => {
                                        const isStudentChoice = q.studentOption === opt;
                                        const isActualCorrect = q.correctOption === opt;
                                        
                                        let bgClass = "bg-[#0f0a1c] border-purple-900/30 text-gray-300";
                                        if (isActualCorrect && isStudentChoice) bgClass = "bg-emerald-900/30 border-emerald-600 text-emerald-100 font-bold shadow-sm";
                                        else if (isActualCorrect) bgClass = "bg-emerald-900/10 border-emerald-300 border-dashed text-emerald-300";
                                        else if (isStudentChoice) bgClass = "bg-red-900/30 border-red-600 text-red-100 font-bold shadow-sm";

                                        return (
                                            <div key={opt} className={`p-3 sm:p-4 rounded-xl border flex flex-col justify-center gap-3 ${bgClass}`}>
                                                <div className="flex items-start gap-3 w-full">
                                                    <span className="w-6 h-6 rounded bg-black/20 flex items-center justify-center text-xs font-bold border border-inherit shrink-0 mt-0.5">{opt}</span>
                                                    <span className="text-xs sm:text-sm leading-relaxed break-words pr-2">{q[`option${opt}`]}</span>
                                                </div>
                                                {(isStudentChoice || isActualCorrect) && (
                                                    <div className="flex flex-wrap items-center gap-2 ml-9">
                                                        {isStudentChoice && <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-white/10 shrink-0 border border-white/20">Your Selection</span>}
                                                        {isActualCorrect && <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/30 text-emerald-300 shrink-0 border border-emerald-500/50">Correct Answer</span>}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}