import React, { useState, useEffect } from 'react';
import { adminService } from '../../../../features/admin/adminService';
import { Layers, CheckCircle2, ChevronRight, FileText, Bot, Plus, Trash2, Search, Terminal, CheckCircle, AlertCircle } from 'lucide-react';
import { TECH_STACK } from '../QuestionBankTab';

// Markdown Renderer for Syntax Blocks in Questions
const renderQuestionContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
            return (
                <div key={index} className="my-3 bg-[#0d0714] border border-purple-900/50 rounded-xl overflow-hidden shadow-inner w-full">
                    <div className="bg-[#150a29] px-3 py-1.5 flex items-center gap-2 border-b border-purple-900/50">
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Code Snippet</span>
                    </div>
                    <pre className="p-4 text-[13px] text-green-400 font-mono overflow-x-auto leading-relaxed custom-scrollbar">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        }
        return <span key={index} className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">{part}</span>;
    });
};

export default function AssessmentBuilder({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const numberInputClass = "w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text";

    // Step 1: Base Config
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState<number>(60);
    const [totalQuestions, setTotalQuestions] = useState<number>(30);
    const [positiveMarks, setPositiveMarks] = useState<number>(1.0);
    const [negativeMarks, setNegativeMarks] = useState<number>(0.25);

    const [maxAttempts, setMaxAttempts] = useState<number>(1);
    const [startTime, setStartTime] = useState<string>('');

    // Step 2: Mode
    const [mode, setMode] = useState<'MANUAL' | 'AUTOMATIC'>('AUTOMATIC');

    // Step 3 (Automatic Mode): Rules Array
    const [autoRules, setAutoRules] = useState([{ technology: 'JAVA', difficulty: 'MEDIUM', count: 10 }]);

    // Step 3 (Manual Mode): Filters & Data
    const [manualTechFilter, setManualTechFilter] = useState('JAVA');
    const [manualDifficultyFilter, setManualDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
    const [manualSearch, setManualSearch] = useState('');
    const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

    useEffect(() => {
        if (mode === 'MANUAL' && step === 3) {
            adminService.getQuestionsByTech(manualTechFilter, 0, manualSearch, 500)
                .then(res => setAvailableQuestions(res.content));
        }
    }, [manualTechFilter, manualSearch, mode, step]);

    const handleToggleQuestion = (id: number) => {
        setError('');
        setSelectedQuestionIds(prev => {
            if (prev.includes(id)) return prev.filter(qid => qid !== id);
            if (prev.length >= totalQuestions) {
                setError(`Maximum limit reached! You configured this exam for exactly ${totalQuestions} questions.`);
                return prev;
            }
            return [...prev, id];
        });
    };

    const handleAddRule = () => {
        setError('');
        const currentSum = autoRules.reduce((acc, rule) => acc + rule.count, 0);
        if (currentSum >= totalQuestions) {
            setError(`Maximum limit reached! You have already allocated all ${totalQuestions} questions.`);
            return;
        }
        const remaining = totalQuestions - currentSum;
        setAutoRules([...autoRules, { technology: 'PYTHON', difficulty: 'MEDIUM', count: Math.min(5, remaining) }]);
    };

    const handleRemoveRule = (index: number) => {
        setError('');
        setAutoRules(autoRules.filter((_, i) => i !== index));
    };

    const handleUpdateRule = (index: number, field: string, value: string | number) => {
        setError('');
        const updated = [...autoRules];

        if (field === 'count') {
            const newValue = Number(value);
            const sumWithoutCurrent = autoRules.reduce((acc, rule, i) => i !== index ? acc + rule.count : acc, 0);

            if (sumWithoutCurrent + newValue > totalQuestions) {
                const allowedRemaining = totalQuestions - sumWithoutCurrent;
                updated[index] = { ...updated[index], count: allowedRemaining };
                setError(`Adjusted to ${allowedRemaining}. You cannot exceed the total limit of ${totalQuestions} questions.`);
            } else {
                updated[index] = { ...updated[index], count: newValue };
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }

        setAutoRules(updated);
    };

    const handleSubmit = async () => {
        setError('');
        if (startTime) {
            const selectedDate = new Date(startTime);
            const now = new Date();
            if (selectedDate < now) {
                return setError("Cannot schedule an exam in the past. Please select a future date and time.");
            }
        }

        if (mode === 'AUTOMATIC') {
            const sum = autoRules.reduce((acc, rule) => acc + rule.count, 0);
            if (sum !== totalQuestions) return setError(`Rule sum (${sum}) does not match configured Total Questions (${totalQuestions}).`);
        } else {
            if (selectedQuestionIds.length !== totalQuestions) return setError(`You selected ${selectedQuestionIds.length} questions, but configured ${totalQuestions} Total Questions.`);
        }

        setLoading(true);
        try {
            const payload = {
                title, description, durationMinutes, totalQuestions, positiveMarks, negativeMarks,
                maxAttempts, startTime: startTime ? startTime : null, creationMode: mode,
                questionIds: mode === 'MANUAL' ? selectedQuestionIds : [],
                autoRules: mode === 'AUTOMATIC' ? autoRules : []
            };
            await adminService.createAssessment(payload);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to create assessment");
        } finally {
            setLoading(false);
        }
    };

    const displayedQuestions = availableQuestions.filter(q =>
        manualDifficultyFilter === 'ALL' || q.difficultyLevel === manualDifficultyFilter
    );

    return (
        <div className="bg-white dark:bg-[#1a0d36] sm:rounded-3xl shadow-xl border-0 sm:border border-gray-100 dark:border-purple-900/30 overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-5xl mx-auto flex flex-col h-screen sm:h-[85vh]">

            {/* Header / Stepper (Fixed at top) */}
            <div className="bg-gray-50 dark:bg-[#0f0a1c] border-b border-gray-200 dark:border-purple-900/50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                <div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Exam Blueprint Builder
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">Design, configure, and generate assessments.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                    <span className={`shrink-0 ${step >= 1 ? 'text-purple-600' : 'text-gray-400'}`}>1. Config</span> <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                    <span className={`shrink-0 ${step >= 2 ? 'text-purple-600' : 'text-gray-400'}`}>2. Mode</span> <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 shrink-0" />
                    <span className={`shrink-0 ${step >= 3 ? 'text-purple-600' : 'text-gray-400'}`}>3. Generate</span>
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative">

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800/50 font-bold animate-in slide-in-from-top-2 flex items-center gap-3 sticky top-0 z-50 shadow-sm text-sm">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <span className="leading-tight">{error}</span>
                    </div>
                )}

                {/* --- STEP 1: CONFIGURATION --- */}
                {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Total Questions</label>
                                <input type="number" min="1" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className={`${numberInputClass} cursor-text`} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Exam Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all cursor-text" placeholder="e.g. Mid-Term Spring Boot Evaluation" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-purple-50/50 dark:bg-purple-900/10 p-4 sm:p-5 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Scheduled Start Time (Optional)</label>
                                <div className="relative">
                                    <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-white dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all cursor-pointer text-sm [color-scheme:light] dark:[color-scheme:dark]" />
                                </div>                                <p className="text-[10px] sm:text-xs text-gray-500">Leave blank to make the exam instantly available.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Max Attempts per Student</label>
                                <input type="number" min="1" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} className={`${numberInputClass} bg-white dark:bg-[#0f0a1c] cursor-text`} />
                                <p className="text-[10px] sm:text-xs text-gray-500">How many times a single user can retake this exam.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Time Limit (Minutes)</label>
                                <input type="number" min="1" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className={`${numberInputClass} cursor-text`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Points per Correct (+)</label>
                                <input type="number" step="0.5" min="0" value={positiveMarks} onChange={e => setPositiveMarks(Number(e.target.value))} className={`${numberInputClass} text-emerald-600 dark:text-emerald-400 font-bold focus:ring-emerald-500 cursor-text`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Penalty per Wrong (-)</label>
                                <input type="number" step="0.25" min="0" value={negativeMarks} onChange={e => setNegativeMarks(Number(e.target.value))} className={`${numberInputClass} text-rose-600 dark:text-rose-400 font-bold focus:ring-rose-500 cursor-text`} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300">Description (Optional)</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 focus:ring-2 ring-purple-600 outline-none text-gray-900 dark:text-white transition-all resize-none cursor-text"></textarea>
                        </div>
                    </div>
                )}

                {/* --- STEP 2: CREATION MODE --- */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div onClick={() => { setMode('AUTOMATIC'); setError(''); }} className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all ${mode === 'AUTOMATIC' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10 scale-[1.02]' : 'border-gray-200 dark:border-purple-900/40 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-[#150a29]'}`}>
                                <Bot className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 transition-colors ${mode === 'AUTOMATIC' ? 'text-purple-600' : 'text-gray-400'}`} />
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Rule-Based Generation</h3>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Define counts and difficulties. The system will pull random questions from the bank for every student to prevent cheating.</p>
                            </div>
                            <div onClick={() => { setMode('MANUAL'); setError(''); }} className={`p-5 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all ${mode === 'MANUAL' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 shadow-md shadow-purple-500/10 scale-[1.02]' : 'border-gray-200 dark:border-purple-900/40 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-[#150a29]'}`}>
                                <FileText className={`w-10 h-10 sm:w-12 sm:h-12 mb-4 transition-colors ${mode === 'MANUAL' ? 'text-purple-600' : 'text-gray-400'}`} />
                                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2">Manual Selection</h3>
                                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">Browse the Question Bank UI and manually hand-pick exact questions for a standardized, fixed exam blueprint.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- STEP 3: BUILDER ENGINE --- */}
                {step === 3 && (
                    <div className="animate-in slide-in-from-right-4 h-full flex flex-col min-h-[500px]">

                        {mode === 'AUTOMATIC' && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg flex flex-wrap items-center gap-2">
                                            Define Rules <span className="text-xs sm:text-sm font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full whitespace-nowrap">{autoRules.reduce((a, b) => a + b.count, 0)} / {totalQuestions} Qs</span>
                                        </h3>
                                    </div>
                                    <button onClick={handleAddRule} className="w-full sm:w-auto justify-center flex items-center gap-1 text-sm font-bold text-white bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer">
                                        <Plus className="w-4 h-4" /> Add Rule
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {autoRules.map((rule, index) => {
                                        const selectedTechs = autoRules.map(r => r.technology);
                                        return (
                                            <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white dark:bg-[#0f0a1c] p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-purple-900/40 shadow-sm">
                                                <div className="flex flex-col sm:flex-row w-full gap-2 sm:gap-3 flex-1">
                                                    <select value={rule.technology} onChange={(e) => handleUpdateRule(index, 'technology', e.target.value)} className="w-full sm:flex-1 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-lg p-2.5 sm:p-3 outline-none font-bold text-sm text-gray-700 dark:text-gray-200 focus:ring-2 ring-purple-600 transition-all cursor-pointer">
                                                        {TECH_STACK.filter(t => t.id !== 'OVERVIEW').map(t => (
                                                            <option key={t.id} value={t.id} disabled={selectedTechs.includes(t.id) && rule.technology !== t.id}>{t.name}</option>
                                                        ))}
                                                    </select>
                                                    <select value={rule.difficulty} onChange={(e) => handleUpdateRule(index, 'difficulty', e.target.value)} className="w-full sm:flex-1 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-lg p-2.5 sm:p-3 outline-none font-bold text-sm text-gray-700 dark:text-gray-200 focus:ring-2 ring-purple-600 transition-all cursor-pointer">
                                                        <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between">
                                                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-lg p-1 focus-within:ring-2 ring-purple-600 transition-all flex-1 sm:flex-none">
                                                        <span className="pl-3 text-sm text-gray-500 font-bold">Qty:</span>
                                                        <input type="number" min="1" value={rule.count} onChange={(e) => handleUpdateRule(index, 'count', Number(e.target.value))} className="w-full sm:w-16 bg-transparent p-1.5 sm:p-2 outline-none font-bold text-sm text-center text-gray-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text" />
                                                    </div>
                                                    <button onClick={() => handleRemoveRule(index)} className="p-2.5 sm:p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50 cursor-pointer shrink-0">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {mode === 'MANUAL' && (
                            <div className="flex flex-col h-full space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gray-50 dark:bg-[#0f0a1c] p-4 rounded-2xl border border-gray-200 dark:border-purple-900/50 shrink-0">
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                                        <select value={manualTechFilter} onChange={e => setManualTechFilter(e.target.value)} className="w-full sm:w-auto bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl p-2.5 font-bold outline-none text-sm shadow-sm focus:ring-2 ring-purple-600 cursor-pointer">
                                            {TECH_STACK.filter(t => t.id !== 'OVERVIEW').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <select value={manualDifficultyFilter} onChange={e => setManualDifficultyFilter(e.target.value as any)} className="w-full sm:w-auto bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl p-2.5 font-bold outline-none text-sm shadow-sm focus:ring-2 ring-purple-600 cursor-pointer">
                                            <option value="ALL">All Levels</option>
                                            <option value="EASY">Easy</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HARD">Hard</option>
                                        </select>
                                        <div className="flex items-center bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-2.5 shadow-sm focus-within:ring-2 ring-purple-600 w-full sm:w-64 cursor-text">
                                            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                                            <input type="text" placeholder="Search questions..." value={manualSearch} onChange={e => setManualSearch(e.target.value)} className="bg-transparent border-none outline-none text-sm w-full text-gray-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800/50 px-4 py-2.5 rounded-xl text-sm shadow-sm w-full lg:w-auto shrink-0">
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                                        <span className="font-bold text-purple-900 dark:text-purple-300">{selectedQuestionIds.length} / {totalQuestions} Selected</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 space-y-4 pb-4">
                                    {displayedQuestions.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">No questions found for this filter.</div>
                                    ) : (
                                        displayedQuestions.map(q => {
                                            const isSelected = selectedQuestionIds.includes(q.id);
                                            return (
                                                <div
                                                    key={q.id}
                                                    onClick={() => handleToggleQuestion(q.id)}
                                                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden group ${isSelected
                                                        ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/10 shadow-md'
                                                        : 'border-gray-200 dark:border-purple-900/30 bg-white dark:bg-[#1a0d36] hover:border-purple-300 dark:hover:border-purple-700 shadow-sm'
                                                        }`}
                                                >
                                                    <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-10">
                                                        <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer ${isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-400'}`}>
                                                            {isSelected && <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                                                        </div>
                                                    </div>

                                                    <div className="pr-8 sm:pr-10">
                                                        <div className="flex flex-wrap items-center gap-2 mb-3">
                                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${q.difficultyLevel === 'EASY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                                q.difficultyLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                    'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                                                }`}>
                                                                {q.difficultyLevel}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded truncate max-w-full">
                                                                {q.topic || 'Uncategorized'}
                                                            </span>
                                                        </div>

                                                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                                                            {renderQuestionContent(q.questionText)}
                                                        </div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4">
                                                            {['A', 'B', 'C', 'D'].map((opt) => {
                                                                const isCorrect = q.correctOption === opt;
                                                                const optionText = q[`option${opt}` as keyof typeof q];
                                                                return (
                                                                    <div key={opt} className={`flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm transition-colors ${isCorrect
                                                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200 shadow-sm'
                                                                        : 'bg-gray-50 dark:bg-[#0f0a1c] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400'
                                                                        }`}>
                                                                        <span className={`font-black shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-gray-400'}`}>{opt}.</span>
                                                                        <span className={isCorrect ? 'font-semibold' : ''}>{optionText as string}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer / Action Buttons (Fixed at bottom) */}
            <div className="bg-white dark:bg-[#1a0d36] border-t border-gray-200 dark:border-purple-900/50 p-4 sm:p-6 flex justify-between shrink-0">
                {step > 1 ? (
                    <button onClick={() => { setStep(step - 1); setError(''); }} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-purple-900/20 transition-colors cursor-pointer text-sm sm:text-base">Back</button>
                ) : (
                    <button onClick={onCancel} className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-purple-900/20 transition-colors cursor-pointer text-sm sm:text-base">Cancel</button>
                )}

                {step < 3 ? (
                    <button onClick={() => { setStep(step + 1); setError(''); }} disabled={step === 1 && (!title || !totalQuestions)} className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-lg shadow-purple-600/20 cursor-pointer text-sm sm:text-base">
                        Next Step
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] cursor-pointer text-sm sm:text-base"
                    >
                        {loading ? <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing...</> : <><CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> Publish Blueprint</>}
                    </button>
                )}
            </div>
        </div>
    );
}