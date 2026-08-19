import React, { useState, useEffect } from 'react';
import { adminService } from '../../../../features/admin/adminService';
import { Layers, CheckCircle2, ChevronRight, FileText, Bot, Plus, Trash2, Search, Terminal, CheckCircle, AlertCircle, Users, Sparkles, Database, Rocket, Code2, BookOpen } from 'lucide-react';
import { TECH_STACK } from '../QuestionBankTab';

// ... (KEEP YOUR TOPICS_BY_TECH AND renderQuestionContent EXACTLY AS THEY WERE) ...
const TOPICS_BY_TECH: Record<string, string[]> = {
    'JAVA': ['Core Java', 'OOPs', 'Collections', 'Multithreading', 'Streams', 'Exception Handling', 'Spring Boot Basics'],
    'SPRING_BOOT': ['Spring Core', 'Spring MVC', 'Spring Data JPA', 'Spring Security', 'Microservices', 'REST APIs'],
    'REACT': ['Components', 'Hooks', 'State Management', 'React Router', 'Performance', 'Redux'],
    'PYTHON': ['Syntax', 'Data Structures', 'OOPs', 'File Handling', 'Django Basics', 'Data Science'],
    'MYSQL': ['SQL Basics', 'Joins', 'Indexes', 'Transactions', 'Stored Procedures', 'Optimization'],
    'DSA': ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting'],
    'JAVASCRIPT': ['ES6+', 'Promises/Async', 'DOM Manipulation', 'Closures', 'Hoisting']
};

const renderQuestionContent = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
            const code = part.replace(/```[a-z]*\n?/i, '').replace(/```$/, '');
            return (
                <div key={index} className="my-3 bg-[#0d0714] border-2 border-purple-900/50 rounded-xl overflow-hidden shadow-inner w-full">
                    <div className="bg-[#150a29] px-3 py-2 flex items-center gap-2 border-b-2 border-purple-900/50">
                        <Terminal className="w-3 h-3 text-purple-400" />
                        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">Code Snippet</span>
                    </div>
                    <pre className="p-4 text-[13px] text-emerald-400 font-mono overflow-x-auto leading-relaxed custom-scrollbar">
                        <code>{code}</code>
                    </pre>
                </div>
            );
        }
        return <span key={index} className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base font-medium">{part}</span>;
    });
};

export default function AssessmentBuilder({ onCancel, onSuccess }: { onCancel: () => void, onSuccess: () => void }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const input3DClass = "w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-4 ring-purple-600/20 outline-none text-gray-900 dark:text-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-text font-semibold";
    const number3DClass = `${input3DClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center`;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [durationMinutes, setDurationMinutes] = useState<number>(60);
    const [totalQuestions, setTotalQuestions] = useState<number>(30);
    const [positiveMarks, setPositiveMarks] = useState<number>(1.0);
    const [negativeMarks, setNegativeMarks] = useState<number>(0.25);
    const [maxAttempts, setMaxAttempts] = useState<number>(1);
    const [startTime, setStartTime] = useState<string>('');

    const [availableBatches, setAvailableBatches] = useState<any[]>([]);
    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

    const [mode, setMode] = useState<'MANUAL' | 'AUTOMATIC'>('AUTOMATIC');
    
    const [autoRules, setAutoRules] = useState([
        { technology: 'JAVA', topic: 'ALL', difficulty: 'MEDIUM', theoryCount: 10, codingCount: 0 }
    ]);
    const [techAvailability, setTechAvailability] = useState<Record<string, any[]>>({});

    const [manualTechFilter, setManualTechFilter] = useState('JAVA');
    const [manualTopicFilter, setManualTopicFilter] = useState('ALL');
    const [manualDifficultyFilter, setManualDifficultyFilter] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');
    const [manualTypeFilter, setManualTypeFilter] = useState<'ALL' | 'THEORY' | 'CODING'>('ALL');
    const [manualSearch, setManualSearch] = useState('');
    const [availableQuestions, setAvailableQuestions] = useState<any[]>([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);

    useEffect(() => { adminService.getAllBatches().then(setAvailableBatches).catch(console.error); }, []);

    useEffect(() => {
        if (mode === 'AUTOMATIC') {
            const uniqueTechs = Array.from(new Set(autoRules.map(r => r.technology)));
            uniqueTechs.forEach(tech => {
                if (!techAvailability[tech]) {
                    adminService.getInventory(tech)
                        .then(data => setTechAvailability(prev => ({ ...prev, [tech]: data })))
                        .catch(console.error);
                }
            });
        }
    }, [autoRules, mode]);

    useEffect(() => {
        if (mode === 'MANUAL' && step === 3) {
            adminService.getQuestionsByTech(manualTechFilter, 0, manualSearch, 500, manualTypeFilter)
                .then(res => setAvailableQuestions(res.content));
        }
    }, [manualTechFilter, manualSearch, manualTypeFilter, mode, step]);

    const toggleBatch = (id: string) => setSelectedBatches(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

    const handleToggleQuestion = (id: number) => {
        setError('');
        setSelectedQuestionIds(prev => {
            if (prev.includes(id)) return prev.filter(qid => qid !== id);
            if (prev.length >= totalQuestions) { setError(`Limit reached! Configured for ${totalQuestions} questions.`); return prev; }
            return [...prev, id];
        });
    };

    const handleAddRule = () => {
        setError('');
        const currentSum = autoRules.reduce((acc, rule) => acc + rule.theoryCount + rule.codingCount, 0);
        if (currentSum >= totalQuestions) return setError(`Limit reached! Allocated all ${totalQuestions} questions.`);
        setAutoRules([...autoRules, { technology: 'JAVA', topic: 'ALL', difficulty: 'MEDIUM', theoryCount: Math.min(5, totalQuestions - currentSum), codingCount: 0 }]);
    };

    const handleRemoveRule = (index: number) => { setError(''); setAutoRules(autoRules.filter((_, i) => i !== index)); };

    const handleUpdateRule = (index: number, field: string, value: string | number) => {
        setError('');
        const updated = [...autoRules];
        
        if (field === 'technology') {
            const newTech = value as string;
            updated[index] = { ...updated[index], technology: newTech, topic: 'ALL' };
            if (!techAvailability[newTech]) {
                adminService.getInventory(newTech).then(data => setTechAvailability(prev => ({ ...prev, [newTech]: data })));
            }
        } else if (field === 'theoryCount' || field === 'codingCount') {
            const newValue = Number(value);
            
            // 🌟 REAL-TIME DYNAMIC SUBTRACTION LOGIC
            const techStats = techAvailability[updated[index].technology] || [];
            let totalAvailableInDb = 0;

            if (updated[index].topic === 'ALL') {
                const filtered = techStats.filter((item: any) => item.difficulty === updated[index].difficulty);
                totalAvailableInDb = filtered.reduce((acc: number, curr: any) => acc + Number(curr[field] || 0), 0);
            } else {
                const matchingStat = techStats.find((item: any) => item.topic === updated[index].topic && item.difficulty === updated[index].difficulty);
                totalAvailableInDb = matchingStat ? Number(matchingStat[field] || 0) : 0;
            }

            // Calculate what has ALREADY been claimed by OTHER rules
            const claimedByOtherRules = autoRules
                .filter((r, i) => i !== index && r.technology === updated[index].technology && r.topic === updated[index].topic && r.difficulty === updated[index].difficulty)
                .reduce((acc, r) => acc + (field === 'theoryCount' ? r.theoryCount : r.codingCount), 0);

            const effectiveAvailable = Math.max(0, totalAvailableInDb - claimedByOtherRules);
            
            // Force the value to stay within DB limits mathematically
            const boundedValue = Math.min(newValue, effectiveAvailable);

            // Finally, verify it doesn't exceed Total Questions
            const sumWithoutCurrent = autoRules.reduce((acc, rule, i) => 
                i !== index ? acc + rule.theoryCount + rule.codingCount : acc + (field === 'theoryCount' ? rule.codingCount : rule.theoryCount), 0);
            
            if (sumWithoutCurrent + boundedValue > totalQuestions) {
                updated[index] = { ...updated[index], [field]: totalQuestions - sumWithoutCurrent };
                setError(`Adjusted to max limit of ${totalQuestions}.`);
            } else { 
                updated[index] = { ...updated[index], [field]: boundedValue }; 
            }
        } else {
            updated[index] = { ...updated[index], [field]: value };
        }
        setAutoRules(updated);
    };

    const generateDynamicTags = () => {
        const tagSet = new Set<string>();
        if (mode === 'AUTOMATIC') {
            autoRules.forEach(r => { tagSet.add(r.technology); if (r.topic !== 'ALL') tagSet.add(r.topic); });
        } else {
            const selectedQs = availableQuestions.filter(q => selectedQuestionIds.includes(q.id));
            selectedQs.forEach(q => { tagSet.add(q.technology); if (q.topic && q.topic.trim() !== '') tagSet.add(q.topic); });
        }
        return Array.from(tagSet).map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
    };

    const handleSubmit = async () => {
        setError('');
        if (startTime && new Date(startTime) < new Date()) return setError("Cannot schedule exam in the past.");
        if (mode === 'AUTOMATIC') {
            const sum = autoRules.reduce((acc, rule) => acc + (rule.theoryCount || 0) + (rule.codingCount || 0), 0);
            if (sum !== totalQuestions) return setError(`Rule sum (${sum}) does not match Total Questions (${totalQuestions}).`);
        } else if (selectedQuestionIds.length !== totalQuestions) {
            return setError(`Selected ${selectedQuestionIds.length} questions, but configured ${totalQuestions}.`);
        }

        setLoading(true);
        try {
            const payload = {
                title, description, durationMinutes, totalQuestions, positiveMarks, negativeMarks,
                maxAttempts, startTime: startTime ? startTime : null, creationMode: mode,
                questionIds: mode === 'MANUAL' ? selectedQuestionIds : [],
                autoRules: mode === 'AUTOMATIC' ? autoRules.map(r => ({
                    technology: r.technology,
                    topic: r.topic,
                    difficulty: r.difficulty,
                    theoryCount: r.theoryCount || 0,
                    codingCount: r.codingCount || 0,
                    count: (r.theoryCount || 0) + (r.codingCount || 0)
                })) : [],
                assignedBatchIds: selectedBatches,
                tags: generateDynamicTags()
            };
            await adminService.createAssessment(payload);
            onSuccess();
        } catch (err: any) { setError(err.response?.data?.error || "Failed to create assessment"); } 
        finally { setLoading(false); }
    };

    const displayedQuestions = availableQuestions.filter(q => {
        const matchDiff = manualDifficultyFilter === 'ALL' || q.difficultyLevel === manualDifficultyFilter;
        const matchTopic = manualTopicFilter === 'ALL' || (q.topic && q.topic.toUpperCase() === manualTopicFilter.toUpperCase());
        return matchDiff && matchTopic;
    });

    return (
        <div className="bg-gray-50 dark:bg-[#110820] sm:rounded-3xl shadow-2xl border-0 sm:border-2 border-gray-200 dark:border-purple-900/50 overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-5xl mx-auto flex flex-col h-screen sm:h-[85vh] relative z-50">

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 z-10 shadow-sm">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 flex items-center gap-2 drop-shadow-sm">
                        <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Assessment Forge
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1 tracking-wide">Design, configure, and engineer precision exams.</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black w-full sm:w-auto overflow-x-auto no-scrollbar pb-1 sm:pb-0 tracking-wider uppercase">
                    <span className={`shrink-0 px-3 py-1 rounded-full border-2 ${step >= 1 ? 'border-purple-600 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'border-transparent text-gray-400'}`}>1. Config</span> <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className={`shrink-0 px-3 py-1 rounded-full border-2 ${step >= 2 ? 'border-purple-600 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'border-transparent text-gray-400'}`}>2. Engine</span> <ChevronRight className="w-4 h-4 text-gray-300" />
                    <span className={`shrink-0 px-3 py-1 rounded-full border-2 ${step >= 3 ? 'border-purple-600 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'border-transparent text-gray-400'}`}>3. Build</span>
                </div>
            </div>

            <div className="p-4 sm:p-6 md:p-8 overflow-y-auto flex-1 custom-scrollbar relative z-10">

                {error && (
                    <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl font-black animate-in slide-in-from-top-4 flex items-center gap-3 shadow-[0_8px_30px_rgb(239,68,68,0.3)] sticky top-0 z-50 text-sm border-b-4 border-red-700">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <span className="leading-tight tracking-wide">{error}</span>
                    </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2 md:col-span-1">
                                <label className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Qs</label>
                                <input type="number" min="1" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className={number3DClass} />
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <label className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Exam Title</label>
                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={input3DClass} placeholder="e.g. Advanced Spring Boot Architecture" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-md p-6 rounded-3xl border-2 border-gray-200 dark:border-purple-900/40 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Launch Time (Optional)</label>
                                <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} className={`${input3DClass} [color-scheme:light] dark:[color-scheme:dark]`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Max Attempts</label>
                                <input type="number" min="1" value={maxAttempts} onChange={e => setMaxAttempts(Number(e.target.value))} className={number3DClass} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time (Min)</label>
                                <input type="number" min="1" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className={number3DClass} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Correct (+)</label>
                                <input type="number" step="0.5" min="0" value={positiveMarks} onChange={e => setPositiveMarks(Number(e.target.value))} className={`${number3DClass} text-emerald-600 focus:ring-emerald-500`} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs sm:text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Penalty (-)</label>
                                <input type="number" step="0.25" min="0" value={negativeMarks} onChange={e => setNegativeMarks(Number(e.target.value))} className={`${number3DClass} text-rose-600 focus:ring-rose-500`} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs sm:text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={`${input3DClass} resize-none`}></textarea>
                        </div>

                        <div className="space-y-3 mt-4 border-t-2 border-gray-200 dark:border-purple-900/40 pt-6">
                            <div>
                                <label className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                    <Users className="w-5 h-5 text-purple-600" /> Operational Batches
                                </label>
                                <p className="text-xs text-gray-500 font-bold mt-1 mb-4">Select target audiences. Leave blank for Global Public access.</p>
                            </div>
                            <div className="flex flex-wrap gap-3 bg-white/50 dark:bg-[#0f0a1c]/50 p-5 rounded-2xl border-2 border-gray-200 dark:border-purple-900/40 shadow-inner max-h-48 overflow-y-auto">
                                {availableBatches.length === 0 ? (
                                    <p className="text-xs text-gray-500 font-bold">No batches exist. Upload a roster first.</p>
                                ) : (
                                    availableBatches.map(batch => (
                                        <label key={batch.id} className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl cursor-pointer transition-all transform active:scale-95 ${selectedBatches.includes(batch.id) ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/30' : 'bg-white border-gray-200 text-gray-700 dark:bg-[#1a0d36] dark:border-gray-700 dark:text-gray-300 hover:border-purple-400 hover:-translate-y-0.5'}`}>
                                            <input type="checkbox" checked={selectedBatches.includes(batch.id)} onChange={() => toggleBatch(batch.id)} className="hidden" />
                                            <span className="text-xs font-black tracking-wide">{batch.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 h-full flex flex-col justify-center max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                            <div onClick={() => { setMode('AUTOMATIC'); setError(''); }} className={`group relative p-8 sm:p-10 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 transform ${mode === 'AUTOMATIC' ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#1a0d36] shadow-[0_20px_50px_rgba(147,51,234,0.15)] -translate-y-2' : 'border-gray-200 dark:border-purple-900/30 bg-white dark:bg-[#1a0d36] hover:border-purple-400 hover:-translate-y-1 hover:shadow-xl'}`}>
                                {mode === 'AUTOMATIC' && <div className="absolute top-4 right-4 bg-purple-500 text-white p-1 rounded-full"><CheckCircle2 className="w-5 h-5"/></div>}
                                <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-colors ${mode === 'AUTOMATIC' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-500'}`}>
                                    <Bot className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">AI Engine</h3>
                                <p className="text-sm font-semibold text-gray-500 leading-relaxed">Dynamic Rule-Based generation with live bank statistics. Compiles random question sets per student.</p>
                            </div>

                            <div onClick={() => { setMode('MANUAL'); setError(''); }} className={`group relative p-8 sm:p-10 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 transform ${mode === 'MANUAL' ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-[#1a0d36] shadow-[0_20px_50px_rgba(59,130,246,0.15)] -translate-y-2' : 'border-gray-200 dark:border-purple-900/30 bg-white dark:bg-[#1a0d36] hover:border-blue-400 hover:-translate-y-1 hover:shadow-xl'}`}>
                                {mode === 'MANUAL' && <div className="absolute top-4 right-4 bg-blue-500 text-white p-1 rounded-full"><CheckCircle2 className="w-5 h-5"/></div>}
                                <div className={`w-20 h-20 rounded-2xl mb-6 flex items-center justify-center transition-colors ${mode === 'MANUAL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'}`}>
                                    <FileText className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Manual Override</h3>
                                <p className="text-sm font-semibold text-gray-500 leading-relaxed">Surgical precision. Browse the data bank with topic filters and hand-pick exact questions.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div className="animate-in slide-in-from-right-4 h-full flex flex-col min-h-[500px]">
                        
                        {mode === 'AUTOMATIC' && (
                            <div className="space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <div>
                                        <h3 className="font-black text-gray-900 dark:text-white text-xl sm:text-2xl flex items-center gap-3">
                                            Rule Matrices 
                                            <span className="text-sm font-black bg-purple-600 text-white px-4 py-1.5 rounded-xl shadow-md">
                                                {autoRules.reduce((a, b) => a + b.theoryCount + b.codingCount, 0)} / {totalQuestions} Qs
                                            </span>
                                        </h3>
                                    </div>
                                    <button onClick={handleAddRule} className="w-full sm:w-auto justify-center flex items-center gap-2 text-sm font-black text-white bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-500 px-6 py-3 rounded-xl transition-all shadow-md active:translate-y-0.5 cursor-pointer border-b-4 border-black dark:border-purple-800 active:border-b-0">
                                        <Plus className="w-5 h-5" /> Append Rule
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {autoRules.map((rule, index) => {
                                        const techStats = techAvailability[rule.technology] || [];
                                        const availableTopics = Array.from(new Set(techStats.map((item: any) => item.topic)));

                                        // 🌟 CALCULATE EFFECTIVE AVAILABILITY FOR THIS EXACT RULE
                                        let totalAvailableTheoryInDb = 0;
                                        let totalAvailableCodingInDb = 0;

                                        if (rule.topic === 'ALL') {
                                            const filtered = techStats.filter((item: any) => item.difficulty === rule.difficulty);
                                            totalAvailableTheoryInDb = filtered.reduce((acc: number, curr: any) => acc + Number(curr.theoryCount || 0), 0);
                                            totalAvailableCodingInDb = filtered.reduce((acc: number, curr: any) => acc + Number(curr.codingCount || 0), 0);
                                        } else {
                                            const matchingStat = techStats.find((item: any) => item.topic === rule.topic && item.difficulty === rule.difficulty);
                                            totalAvailableTheoryInDb = matchingStat ? Number(matchingStat.theoryCount || 0) : 0;
                                            totalAvailableCodingInDb = matchingStat ? Number(matchingStat.codingCount || 0) : 0;
                                        }

                                        // Deduct what is already selected in OTHER rules
                                        const otherRules = autoRules.filter((r, i) => i !== index && r.technology === rule.technology && r.topic === rule.topic && r.difficulty === rule.difficulty);
                                        const usedTheory = otherRules.reduce((acc, r) => acc + r.theoryCount, 0);
                                        const usedCoding = otherRules.reduce((acc, r) => acc + r.codingCount, 0);

                                        // What is truly left for this specific rule input box
                                        const effectiveTheoryLeft = Math.max(0, totalAvailableTheoryInDb - usedTheory);
                                        const effectiveCodingLeft = Math.max(0, totalAvailableCodingInDb - usedCoding);

                                        return (
                                            <div key={index} className="flex flex-col bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-gray-200 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-shadow gap-4">
                                                
                                                {/* Selectors Row */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    <select value={rule.technology} onChange={(e) => handleUpdateRule(index, 'technology', e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 outline-none font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 focus:border-purple-500 transition-colors cursor-pointer shadow-inner">
                                                        {TECH_STACK.filter(t => t.id !== 'OVERVIEW').map(t => (
                                                            <option key={t.id} value={t.id}>{t.name}</option>
                                                        ))}
                                                    </select>

                                                    <select value={rule.topic} onChange={(e) => handleUpdateRule(index, 'topic', e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 outline-none font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 focus:border-purple-500 transition-colors cursor-pointer shadow-inner">
                                                        <option value="ALL">All Topics</option>
                                                        {availableTopics.map((t: any) => <option key={t} value={t}>{t}</option>)}
                                                    </select>

                                                    <select value={rule.difficulty} onChange={(e) => handleUpdateRule(index, 'difficulty', e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 outline-none font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 focus:border-purple-500 transition-colors cursor-pointer shadow-inner">
                                                        <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                                                    </select>
                                                </div>

                                                {/* Split Qty Inputs Row */}
                                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                                                    <div className="flex w-full sm:w-auto gap-4">
                                                        {/* Theory Input */}
                                                        <div className="flex-1 sm:flex-none flex items-center justify-between gap-3 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-900/50 rounded-xl p-2 focus-within:border-blue-500 transition-colors shadow-inner">
                                                            <div className="flex flex-col pl-2">
                                                                <span className="text-[10px] uppercase text-blue-600 dark:text-blue-400 font-black flex items-center gap-1"><BookOpen className="w-3 h-3"/> Theory</span>
                                                                <span className="text-[9px] font-bold text-gray-500">Avail: {effectiveTheoryLeft}</span>
                                                            </div>
                                                            <input type="number" min="0" max={effectiveTheoryLeft} value={rule.theoryCount} onChange={(e) => handleUpdateRule(index, 'theoryCount', e.target.value)} className="w-16 bg-white dark:bg-black p-2 rounded-lg border border-blue-200 dark:border-blue-800 outline-none font-black text-base text-center text-blue-600 dark:text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text" />
                                                        </div>

                                                        {/* Coding Input */}
                                                        <div className="flex-1 sm:flex-none flex items-center justify-between gap-3 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-xl p-2 focus-within:border-emerald-500 transition-colors shadow-inner">
                                                            <div className="flex flex-col pl-2">
                                                                <span className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1"><Code2 className="w-3 h-3"/> Coding</span>
                                                                <span className="text-[9px] font-bold text-gray-500">Avail: {effectiveCodingLeft}</span>
                                                            </div>
                                                            <input type="number" min="0" max={effectiveCodingLeft} value={rule.codingCount} onChange={(e) => handleUpdateRule(index, 'codingCount', e.target.value)} className="w-16 bg-white dark:bg-black p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 outline-none font-black text-base text-center text-emerald-600 dark:text-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text" />
                                                        </div>
                                                    </div>

                                                    <button onClick={() => handleRemoveRule(index)} className="w-full sm:w-auto p-3 text-red-500 bg-red-50 hover:bg-red-500 hover:text-white dark:bg-red-900/20 dark:hover:bg-red-600 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer flex justify-center items-center">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {mode === 'MANUAL' && (
                           // ... Your existing Manual UI mode block here ...
                           // (Keeping it exactly as it was, no changes needed to manual UI)
                           <div className="flex flex-col h-full space-y-4">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-gray-200 dark:border-purple-900/50 shadow-sm shrink-0">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-3 w-full lg:w-auto">
                                        <select value={manualTechFilter} onChange={e => { setManualTechFilter(e.target.value); setManualTopicFilter('ALL'); }} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 font-black text-xs uppercase tracking-wider outline-none shadow-inner focus:border-purple-500 cursor-pointer">
                                            {TECH_STACK.filter(t => t.id !== 'OVERVIEW').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                        <select value={manualTopicFilter} onChange={e => setManualTopicFilter(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 font-black text-xs uppercase tracking-wider outline-none shadow-inner focus:border-purple-500 cursor-pointer">
                                            <option value="ALL">All Topics</option>
                                            {(TOPICS_BY_TECH[manualTechFilter] || []).map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <select value={manualDifficultyFilter} onChange={e => setManualDifficultyFilter(e.target.value as any)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 font-black text-xs uppercase tracking-wider outline-none shadow-inner focus:border-purple-500 cursor-pointer">
                                            <option value="ALL">All Levels</option><option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                                        </select>
                                        <select value={manualTypeFilter} onChange={e => setManualTypeFilter(e.target.value as any)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 font-black text-xs uppercase tracking-wider outline-none shadow-inner focus:border-purple-500 cursor-pointer">
                                            <option value="ALL">All Types</option><option value="THEORY">Theory Only</option><option value="CODING">Coding Only</option>
                                        </select>
                                        <div className="col-span-full lg:col-auto flex items-center bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 shadow-inner focus-within:border-purple-500 w-full lg:w-48 cursor-text transition-colors">
                                            <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                                            <input type="text" placeholder="Keyword..." value={manualSearch} onChange={e => setManualSearch(e.target.value)} className="bg-transparent border-none outline-none font-bold text-sm w-full text-gray-900 dark:text-white" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-xl shadow-md w-full lg:w-auto shrink-0 font-black tracking-wide">
                                        <CheckCircle className="w-5 h-5" />
                                        {selectedQuestionIds.length} / {totalQuestions} Selected
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 sm:pr-2 space-y-4 pb-4">
                                    {displayedQuestions.length === 0 ? (
                                        <div className="text-center py-20 bg-white/50 dark:bg-[#150a29]/50 rounded-3xl border-2 border-dashed border-gray-300 dark:border-purple-900/50 text-gray-500 font-bold">No questions found matching your precision filters.</div>
                                    ) : (
                                        displayedQuestions.map(q => {
                                            const isSelected = selectedQuestionIds.includes(q.id);
                                            return (
                                                <div
                                                    key={q.id}
                                                    onClick={() => handleToggleQuestion(q.id)}
                                                    className={`p-5 sm:p-6 rounded-[1.5rem] border-2 transition-all duration-200 cursor-pointer relative group ${isSelected ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-900/20 shadow-[0_10px_30px_rgba(147,51,234,0.15)] -translate-y-1' : 'border-gray-200 dark:border-purple-900/40 bg-white dark:bg-[#150a29] hover:border-purple-400 hover:shadow-lg hover:-translate-y-0.5'}`}
                                                >
                                                    <div className="absolute top-5 right-5 z-10">
                                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer shadow-sm ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300 dark:border-gray-600 group-hover:border-purple-400 bg-white dark:bg-[#0f0a1c]'}`}>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4" />}
                                                        </div>
                                                    </div>

                                                    <div className="pr-12">
                                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider shadow-sm ${q.difficultyLevel === 'EASY' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : q.difficultyLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-400'}`}>{q.difficultyLevel}</span>
                                                            <span className="text-[10px] font-black text-purple-700 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-300 px-2.5 py-1 rounded uppercase tracking-wider shadow-sm">{q.technology}</span>
                                                            <span className="text-[10px] font-black text-gray-600 bg-gray-200 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-1 rounded uppercase tracking-wider shadow-sm truncate max-w-full">{q.topic || 'Uncategorized'}</span>
                                                            {q.questionType === 'CODING' ? (
                                                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/50 shadow-sm"><Code2 className="w-3 h-3" /> Coding</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800/50 shadow-sm"><BookOpen className="w-3 h-3" /> Theory</span>
                                                            )}
                                                        </div>

                                                        <div className="text-base font-semibold text-gray-900 dark:text-white mb-6 leading-relaxed">{renderQuestionContent(q.questionText)}</div>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            {['A', 'B', 'C', 'D'].map((opt) => {
                                                                const isCorrect = q.correctOption === opt;
                                                                const optionText = q[`option${opt}` as keyof typeof q];
                                                                return (
                                                                    <div key={opt} className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-sm transition-colors ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/50 text-emerald-900 dark:text-emerald-100 shadow-[inset_0_2px_10px_rgba(16,185,129,0.1)]' : 'bg-gray-50 dark:bg-[#0f0a1c] border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 shadow-inner'}`}>
                                                                        <span className={`font-black shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-gray-400'}`}>{opt}.</span>
                                                                        <span className={isCorrect ? 'font-bold' : 'font-medium'}>{optionText as string}</span>
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

            <div className="bg-white/90 dark:bg-[#110820]/90 backdrop-blur-xl border-t-2 border-gray-200 dark:border-purple-900/50 p-4 sm:p-6 flex justify-between shrink-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                {step > 1 ? (
                    <button onClick={() => { setStep(step - 1); setError(''); }} className="px-6 sm:px-8 py-3 rounded-xl font-black text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer border-b-4 border-gray-300 dark:border-gray-900 active:border-b-0 active:translate-y-1">Go Back</button>
                ) : (
                    <button onClick={onCancel} className="px-6 sm:px-8 py-3 rounded-xl font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer border-b-4 border-rose-200 dark:border-rose-900/60 active:border-b-0 active:translate-y-1">Cancel</button>
                )}

                {step < 3 ? (
                    <button onClick={() => { setStep(step + 1); setError(''); }} disabled={step === 1 && (!title || !totalQuestions)} className="px-8 sm:px-10 py-3 rounded-xl font-black bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 shadow-lg shadow-purple-600/30">Proceed</button>
                ) : (
                    <button onClick={handleSubmit} disabled={loading} className="px-8 sm:px-10 py-3 rounded-xl font-black bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2 transition-all cursor-pointer border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 shadow-lg shadow-emerald-500/30">
                        {loading ? <><div className="w-5 h-5 border-4 border-white/40 border-t-white rounded-full animate-spin" /> Publishing...</> : <><Rocket className="w-5 h-5" /> Launch Blueprint</>}
                    </button>
                )}
            </div>
        </div>
    );
}