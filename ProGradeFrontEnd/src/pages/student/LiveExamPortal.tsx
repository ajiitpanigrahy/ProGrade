import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, Flag, RotateCcw, ChevronRight, ChevronLeft, Menu, Loader2, CheckSquare, X, AlertTriangle, FileText, Monitor, Terminal } from 'lucide-react';
import { studentService } from '../../features/student/studentService';

type ExamPhase = 'INSTRUCTIONS' | 'TEST' | 'RESULT';

export default function LiveExamPortal() {
    const { id } = useParams();
    const navigate = useNavigate();

    // 🌟 ADD THIS HELPER FUNCTION AT THE TOP
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
        return <span key={index} className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">{part}</span>;
    });
};

    const [examData, setExamData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [examPhase, setExamPhase] = useState<ExamPhase>('INSTRUCTIONS');
    const [hasAcceptedRules, setHasAcceptedRules] = useState(false);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flags, setFlags] = useState<Record<number, boolean>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);

    // 🌟 BULLETPROOF TIME TRACKING REFS
    const startTimeRef = useRef<string>('');
    const timeSpentRef = useRef<Record<number, number>>({});
    const currentQuestionIndexRef = useRef(currentQuestionIndex);
    const violationCountRef = useRef(0);

    // Sync state to ref for accurate interval tracking
    useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);

    const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
    const [showPreSubmitModal, setShowPreSubmitModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitReason, setSubmitReason] = useState<'MANUAL' | 'TIME_UP' | 'MALPRACTICE' | null>(null);
    const [showViolationWarning, setShowViolationWarning] = useState(false);

    const answeredCount = Object.keys(answers).length;
    const flaggedCount = Object.values(flags).filter(Boolean).length;
    const unansweredCount = examData ? examData.totalQuestions - answeredCount : 0;

    useEffect(() => {
        studentService.getSecureExamPayload(id as string).then(data => {
            setExamData(data);
            setTimeLeft(data.durationMinutes * 60);
            setLoading(false);
        }).catch(() => {
            alert("Failed to load secure exam environment.");
            navigate('/student/dashboard');
        });
    }, [id, navigate]);

    const handleStartExam = async () => {
        try { if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); } catch (e) {}
        
        // 🌟 RECORD EXACT START TIMESTAMP
        startTimeRef.current = new Date().toISOString();
        setExamPhase('TEST');
    };

    const handleFinalSubmit = useCallback(async (reason: 'MANUAL' | 'TIME_UP' | 'MALPRACTICE') => {
        setShowPreSubmitModal(false);
        setIsSubmitting(true);
        setSubmitReason(reason);

        try {
            console.log("Submitting Time Data:", timeSpentRef.current); // Debug log to ensure seconds are recorded
            
            const result = await studentService.submitExam(id as string, {
                answers,
                isAutoSubmit: reason !== 'MANUAL',
                flaggedCount,
                startedAt: startTimeRef.current || new Date().toISOString(),
                timeSpent: timeSpentRef.current // 🌟 Send exact seconds recorded by the Ref
            });

            if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
            navigate(`/student/analysis/${result.submissionId}`, { replace: true });
        } catch (err) {
            alert("Submission failed. Please contact your proctor.");
            setIsSubmitting(false);
            setSubmitReason(null);
        }
    }, [answers, id, flaggedCount, navigate]);

    // TIMER & SECONDS TRACKER
    useEffect(() => {
        if (examPhase !== 'TEST' || isSubmitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) { handleFinalSubmit('TIME_UP'); return 0; }
                return prev - 1;
            });

            // 🌟 ACCUMULATE EXACT SECONDS FOR CURRENT QUESTION
            const qIdx = currentQuestionIndexRef.current;
            timeSpentRef.current[qIdx] = (timeSpentRef.current[qIdx] || 0) + 1;
        }, 1000);

        return () => clearInterval(timer);
    }, [examPhase, isSubmitting, handleFinalSubmit]);

    // ANTI-CHEAT ENGINE
    useEffect(() => {
        if (examPhase !== 'TEST' || isSubmitting) return;
        let hiddenTime = 0;

        const handleViolation = (type: string, details: string) => {
            violationCountRef.current += 1;
            const newCount = violationCountRef.current;
            studentService.reportMalpractice(id as string, type, `${details} Violation count: ${newCount}`);
            if (newCount === 1) setShowViolationWarning(true);
            else if (newCount >= 2) { setShowViolationWarning(false); handleFinalSubmit('MALPRACTICE'); }
        };

        const handleVisibilityChange = () => {
            if (document.hidden) hiddenTime = Date.now();
            else {
                const awayDuration = ((Date.now() - hiddenTime) / 1000).toFixed(1);
                handleViolation("TAB_SWITCH", `Switched tabs for ${awayDuration}s.`);
            }
        };

        const handleFullscreenChange = () => { if (!document.fullscreenElement) handleViolation("FULLSCREEN_EXIT", "Exited fullscreen mode."); };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => { document.removeEventListener("visibilitychange", handleVisibilityChange); document.removeEventListener("fullscreenchange", handleFullscreenChange); };
    }, [examPhase, isSubmitting, id, handleFinalSubmit]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white font-mono"><Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" /> Connecting to Secure Examination Gateway...</div>;

    if (examPhase === 'INSTRUCTIONS') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#05020a] flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#150a29] max-w-3xl w-full rounded-3xl shadow-xl border border-gray-200 dark:border-purple-900/50 p-6 sm:p-10">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-purple-900/50">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center border border-purple-200 dark:border-purple-800">
                            <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">{examData.title}</h1>
                            <p className="text-gray-500 font-medium text-sm">Rules & Security Mandate</p>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8 text-sm sm:text-base text-gray-700 dark:text-gray-300">
                        <div className="flex gap-3 bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p><strong>Anti-Cheating Active:</strong> Exiting fullscreen or switching tabs will record a violation. 2 violations trigger immediate auto-submission.</p>
                        </div>
                        <div className="flex gap-3 bg-gray-50 dark:bg-[#0f0a1c] p-4 rounded-xl border border-gray-200 dark:border-purple-900/30">
                            <Monitor className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p><strong>Mandatory Fullscreen:</strong> Fullscreen mode is enforced during the entire session.</p>
                        </div>
                        <div className="flex gap-3 bg-gray-50 dark:bg-[#0f0a1c] p-4 rounded-xl border border-gray-200 dark:border-purple-900/30">
                            <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <p><strong>Auto-Submit:</strong> The test auto-submits when the {examData.durationMinutes} minute timer reaches 00:00.</p>
                        </div>
                    </div>

                    <label className="flex items-start gap-3 p-4 border-2 border-gray-200 dark:border-purple-900/50 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-purple-900/10 transition-colors mb-8">
                        <input type="checkbox" checked={hasAcceptedRules} onChange={e => setHasAcceptedRules(e.target.checked)} className="mt-1 w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 cursor-pointer" />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">I accept the exam rules and understand that leaving fullscreen mode is prohibited.</span>
                    </label>

                    <button onClick={handleStartExam} disabled={!hasAcceptedRules} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer">
                        START EXAMINATION NOW
                    </button>
                </div>
            </div>
        );
    }

    if (isSubmitting) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-3xl p-8 text-center shadow-2xl animate-in zoom-in">
                    {submitReason === 'TIME_UP' ? (
                        <><Clock className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" /><h2 className="text-2xl font-black dark:text-white mb-2">Time Expired!</h2></>
                    ) : submitReason === 'MALPRACTICE' ? (
                        <><ShieldAlert className="w-16 h-16 text-red-600 mx-auto mb-4 animate-pulse" /><h2 className="text-2xl font-black text-red-600 mb-2">Security Lockout</h2></>
                    ) : (
                        <><Loader2 className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" /><h2 className="text-2xl font-black dark:text-white mb-2">Submitting...</h2></>
                    )}
                    <p className="text-gray-500 font-medium">Encrypting answers and compiling analytics.</p>
                </div>
            </div>
        );
    }

    const currentQuestion = examData?.questions[currentQuestionIndex];
    
    // 🌟 ADD THIS TEMPORARY DEBUG LOG
    console.log("CURRENT QUESTION DATA:", currentQuestion);

    return (
        <div className="h-screen w-screen flex flex-col bg-gray-50 dark:bg-[#05020a] font-sans overflow-hidden">
            
            {showPreSubmitModal && (
                <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#150a29] max-w-md w-full rounded-3xl shadow-2xl border border-gray-100 dark:border-purple-900/50 overflow-hidden animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 dark:border-purple-900/50 bg-gray-50 dark:bg-[#0f0a1c] text-center">
                            <CheckSquare className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                            <h3 className="font-black text-xl text-gray-900 dark:text-white">Confirm Submission</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 dark:bg-[#1a0d36] rounded-xl p-4 grid grid-cols-2 gap-4 border border-gray-100 dark:border-purple-900/30">
                                <div className="text-center p-2"><p className="text-2xl font-black text-blue-600">{examData.totalQuestions}</p><p className="text-[10px] font-bold uppercase text-gray-500">Total</p></div>
                                <div className="text-center p-2"><p className="text-2xl font-black text-emerald-500">{answeredCount}</p><p className="text-[10px] font-bold uppercase text-gray-500">Answered</p></div>
                                <div className="text-center p-2"><p className="text-2xl font-black text-amber-500">{flaggedCount}</p><p className="text-[10px] font-bold uppercase text-gray-500">Flagged</p></div>
                                <div className="text-center p-2"><p className="text-2xl font-black text-red-500">{unansweredCount}</p><p className="text-[10px] font-bold uppercase text-gray-500">Unanswered</p></div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-[#0f0a1c] flex gap-3 border-t border-gray-100 dark:border-purple-900/50">
                            <button onClick={() => setShowPreSubmitModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-white dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">Cancel</button>
                            <button onClick={() => handleFinalSubmit('MANUAL')} className="flex-1 py-3 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-md">Submit Now</button>
                        </div>
                    </div>
                </div>
            )}

            {showViolationWarning && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#150a29] max-w-lg w-full rounded-3xl p-6 sm:p-8 text-center shadow-2xl border border-red-500/50">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">SECURITY WARNING</h2>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6 font-medium leading-relaxed">
                            Focus loss or fullscreen exit was detected. <strong className="text-red-500">Next violation triggers immediate auto-submission.</strong>
                        </p>
                        <button onClick={() => { setShowViolationWarning(false); if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{}); }} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer">
                            I Understand, Return to Test
                        </button>
                    </div>
                </div>
            )}

            <header className="h-14 sm:h-16 lg:h-20 bg-white dark:bg-[#0f0a1c] border-b border-gray-200 dark:border-purple-900/50 flex items-center justify-between px-3 sm:px-4 lg:px-8 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsMobilePaletteOpen(true)} className="lg:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-lg cursor-pointer">
                        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <div>
                        <h1 className="font-bold text-gray-900 dark:text-white text-base lg:text-lg leading-tight line-clamp-1">{examData?.title}</h1>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">Proctored Live Engine</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-8">
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl border-2 font-mono font-black text-base sm:text-lg lg:text-xl transition-colors ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-[#1a0d36] dark:border-purple-900/50 dark:text-white'}`}>
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" /> {formatTime(timeLeft)}
                    </div>
                    <button onClick={() => setShowPreSubmitModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 sm:px-6 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl transition-all shadow-md active:scale-95 text-xs sm:text-sm cursor-pointer">Submit</button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                <main className="flex-1 flex flex-col overflow-y-auto bg-gray-50 dark:bg-[#05020a]">
                    <div className="flex-1 max-w-4xl w-full mx-auto p-4 lg:p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 dark:border-purple-900/30">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                                Question {currentQuestionIndex + 1} <span className="text-gray-400 dark:text-gray-600 font-medium text-sm sm:text-base lg:text-lg">/ {examData?.totalQuestions}</span>
                            </h2>
                            <button onClick={() => setFlags(p => ({ ...p, [currentQuestionIndex]: !p[currentQuestionIndex] }))} className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-bold transition-colors border cursor-pointer ${flags[currentQuestionIndex] ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-[#1a0d36] dark:text-gray-400 dark:border-purple-900/50'}`}>
                                <Flag className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden sm:inline">{flags[currentQuestionIndex] ? 'Flagged' : 'Flag for Review'}</span><span className="sm:hidden">Flag</span>
                            </button>
                        </div>

                        <div className="text-sm sm:text-base lg:text-lg text-gray-800 dark:text-gray-200 leading-relaxed mb-6 sm:mb-8 font-medium">
                            {/* 🌟 1. Render the main text and handle legacy markdown */}
                            {renderQuestionContent(currentQuestion?.questionText)}

                            {/* 🌟 2. Explicitly render the dedicated Code Snippet from the Secure Payload */}
                            {currentQuestion?.codeSnippet && (
                                <div className="mt-5 bg-[#0c0618] border-2 border-purple-900/50 rounded-xl overflow-hidden shadow-2xl w-full text-left">
                                    <div className="bg-[#150a29] px-4 py-2.5 flex items-center gap-2 border-b-2 border-purple-900/50">
                                        <Terminal className="w-4 h-4 text-emerald-400"/>
                                        <span className="text-xs uppercase font-black text-emerald-400 tracking-wider">
                                            Developer Code Snippet ({currentQuestion.codeLanguage || currentQuestion.technology || 'Code'})
                                        </span>
                                    </div>
                                    <pre className="p-5 text-sm sm:text-base text-emerald-400 font-mono overflow-x-auto leading-relaxed custom-scrollbar whitespace-pre">
                                        <code>{currentQuestion.codeSnippet}</code>
                                    </pre>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2.5 sm:gap-3 lg:gap-4 mb-auto">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                                const isSelected = answers[currentQuestionIndex] === opt;
                                return (
                                    <div key={opt} onClick={() => setAnswers(p => ({ ...p, [currentQuestionIndex]: opt }))} className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-900/20 shadow-sm' : 'border-gray-200 dark:border-purple-900/30 bg-white dark:bg-[#150a29] hover:border-purple-300 dark:hover:border-purple-700'}`}>
                                        <div className={`w-5 h-5 sm:w-6 sm:h-6 shrink-0 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${isSelected ? 'border-purple-600 bg-purple-600' : 'border-gray-300 dark:border-gray-600'}`}>
                                            {isSelected && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>}
                                        </div>
                                        <span className={`font-semibold text-sm sm:text-base lg:text-lg ${isSelected ? 'text-purple-900 dark:text-purple-100' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {currentQuestion[`option${opt}` as keyof typeof currentQuestion]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-purple-900/30">
                            <button onClick={() => { setAnswers(p => { const o = {...p}; delete o[currentQuestionIndex]; return o; }) }} disabled={!answers[currentQuestionIndex]} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg sm:rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                                <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Clear
                            </button>
                            <div className="flex gap-2 sm:gap-3 ml-auto sm:ml-0">
                                <button onClick={() => setCurrentQuestionIndex(p => Math.max(0, p - 1))} disabled={currentQuestionIndex === 0} className="flex justify-center items-center gap-1 px-3 sm:px-5 py-2 sm:py-3 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 text-gray-700 dark:text-gray-300 font-bold rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-purple-900/30 disabled:opacity-50 transition-colors text-xs sm:text-sm cursor-pointer"><ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5"/> <span className="hidden sm:inline">Prev</span></button>
                                <button onClick={() => setCurrentQuestionIndex(p => Math.min(examData.totalQuestions - 1, p + 1))} disabled={currentQuestionIndex === examData?.totalQuestions - 1} className="flex justify-center items-center gap-1 px-4 sm:px-8 py-2 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg sm:rounded-xl disabled:opacity-50 shadow-md shadow-purple-600/20 transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"><span className="hidden sm:inline">Save & Next</span><span className="sm:hidden">Next</span> <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5"/></button>
                            </div>
                        </div>
                    </div>
                </main>

                <aside className={`fixed inset-y-0 right-0 z-40 w-64 sm:w-72 bg-white dark:bg-[#0f0a1c] border-l border-gray-200 dark:border-purple-900/50 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${isMobilePaletteOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-purple-900/50 flex justify-between items-center bg-gray-50 dark:bg-[#150a29]">
                        <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs sm:text-sm">Palette</h3>
                        <button onClick={() => setIsMobilePaletteOpen(false)} className="lg:hidden p-1 text-gray-500 cursor-pointer"><X className="w-5 h-5"/></button>
                    </div>

                    <div className="p-3 sm:p-4 flex-1 overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                            {examData?.questions.map((_: any, i: number) => {
                                const isCur = currentQuestionIndex === i;
                                return (
                                    <button key={i} onClick={() => { setCurrentQuestionIndex(i); setIsMobilePaletteOpen(false); }} className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm transition-all cursor-pointer ${isCur ? 'border-2 border-purple-600 scale-110 shadow-md z-10' : 'border border-transparent'} ${flags[i] ? 'bg-amber-500 text-white' : answers[i] ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#1a0d36] dark:text-gray-300'}`}>{i + 1}</button>
                                );
                            })}
                        </div>
                    </div>
                </aside>
                {isMobilePaletteOpen && <div onClick={() => setIsMobilePaletteOpen(false)} className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm cursor-pointer"></div>}
            </div>
        </div>
    );
}