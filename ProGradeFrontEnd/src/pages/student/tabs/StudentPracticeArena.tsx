import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../../features/student/studentService';
import { 
    Database, Code, Clock, Target, PlayCircle, Loader2, X, Hexagon, 
    Plus, Trash2, History, DatabaseZap, Lock, Users, ChevronRight, 
    AlertCircle, Sparkles, Rocket, FileText, CheckCircle2, Code2, BookOpen, Bot , Settings
} from 'lucide-react';

const TECH_STACK = [
    { id: 'JAVA', name: 'Java Enterprise' },
    { id: 'SPRING_BOOT', name: 'Spring Boot' },
    { id: 'REACT', name: 'React.js' },
    { id: 'PYTHON', name: 'Python' },
    { id: 'MYSQL', name: 'MySQL Database' },
    { id: 'DSA', name: 'Data Structures' },
    { id: 'JAVASCRIPT', name: 'JavaScript (ES6+)' }
];

const TOPICS_BY_TECH: Record<string, string[]> = {
    'JAVA': ['Core Java', 'OOPs', 'Collections', 'Multithreading', 'Streams', 'Exception Handling', 'Spring Boot Basics'],
    'SPRING_BOOT': ['Spring Core', 'Spring MVC', 'Spring Data JPA', 'Spring Security', 'Microservices', 'REST APIs'],
    'REACT': ['Components', 'Hooks', 'State Management', 'React Router', 'Performance', 'Redux'],
    'PYTHON': ['Syntax', 'Data Structures', 'OOPs', 'File Handling', 'Django Basics', 'Data Science'],
    'MYSQL': ['SQL Basics', 'Joins', 'Indexes', 'Transactions', 'Stored Procedures', 'Optimization'],
    'DSA': ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting'],
    'JAVASCRIPT': ['ES6+', 'Promises/Async', 'DOM Manipulation', 'Closures', 'Hoisting']
};

export default function StudentPracticeArena() {
    const navigate = useNavigate();
    
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [activeTab, setActiveTab] = useState<'BASIC' | 'QUESTIONS' | 'SETTINGS'>('BASIC');
    const [error, setError] = useState('');

    const input3DClass = "w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-3 sm:py-3.5 focus:border-purple-500 focus:ring-4 ring-purple-600/20 outline-none text-gray-900 dark:text-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-text font-semibold";
    const number3DClass = `${input3DClass} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center`;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('Self-Practice Arena Exam Blueprint');
    const [durationMinutes, setDurationMinutes] = useState<number>(60);
    const [totalQuestions, setTotalQuestions] = useState<number>(10);
    const [positiveMarks, setPositiveMarks] = useState<number>(1.0);
    const [negativeMarks, setNegativeMarks] = useState<number>(0.0);
    const [mode] = useState<'AUTOMATIC'>('AUTOMATIC');
    
    const [autoRules, setAutoRules] = useState([
        { technology: 'JAVA', topic: 'ALL', difficulty: 'MEDIUM', theoryCount: 5, codingCount: 5 }
    ]);
    const [techAvailability, setTechAvailability] = useState<Record<string, any[]>>({});

    useEffect(() => {
        fetchPracticeExams();
    }, []);

    useEffect(() => {
        if (isModalOpen && mode === 'AUTOMATIC') {
            const uniqueTechs = Array.from(new Set(autoRules.map(r => r.technology)));
            uniqueTechs.forEach(tech => {
                if (!techAvailability[tech]) {
                    studentService.getInventory(tech)
                        .then(data => setTechAvailability(prev => ({ ...prev, [tech]: Array.isArray(data) ? data : [] })))
                        .catch(() => setTechAvailability(prev => ({ ...prev, [tech]: [] })));
                }
            });
        }
    }, [autoRules, mode, isModalOpen]);

    const fetchPracticeExams = () => {
        setLoading(true);
        studentService.getPracticeExams()
            .then(setExams)
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const handleAddRule = () => {
        setError('');
        const currentSum = autoRules.reduce((acc, rule) => acc + rule.theoryCount + rule.codingCount, 0);
        if (currentSum >= totalQuestions) return setError(`Limit reached! Allocated all ${totalQuestions} questions.`);
        setAutoRules([...autoRules, { technology: 'JAVA', topic: 'ALL', difficulty: 'MEDIUM', theoryCount: Math.min(5, totalQuestions - currentSum), codingCount: 0 }]);
    };

    const handleRemoveRule = (index: number) => { 
        setError(''); 
        setAutoRules(autoRules.filter((_, i) => i !== index)); 
    };

    const handleUpdateRule = (index: number, field: string, value: string | number) => {
        setError('');
        const updated = [...autoRules];
        
        if (field === 'technology') {
            const newTech = value as string;
            updated[index] = { ...updated[index], technology: newTech, topic: 'ALL' };
            if (!techAvailability[newTech]) {
                studentService.getInventory(newTech).then(data => setTechAvailability(prev => ({ ...prev, [newTech]: Array.isArray(data) ? data : [] })));
            }
        } else if (field === 'theoryCount' || field === 'codingCount') {
            const newValue = Number(value);
            
            const techStats = techAvailability[updated[index].technology] || [];
            let totalAvailableInDb = 0;

            if (updated[index].topic === 'ALL') {
                const filtered = techStats.filter((item: any) => item.difficulty === updated[index].difficulty);
                totalAvailableInDb = filtered.reduce((acc: number, curr: any) => acc + Number(curr[field] || 0), 0);
            } else {
                const matchingStat = techStats.find((item: any) => item.topic === updated[index].topic && item.difficulty === updated[index].difficulty);
                totalAvailableInDb = matchingStat ? Number(matchingStat[field] || 0) : 0;
            }

            const claimedByOtherRules = autoRules
                .filter((r, i) => i !== index && r.technology === updated[index].technology && r.topic === updated[index].topic && r.difficulty === updated[index].difficulty)
                .reduce((acc, r) => acc + (field === 'theoryCount' ? r.theoryCount : r.codingCount), 0);

            const effectiveAvailable = Math.max(0, totalAvailableInDb - claimedByOtherRules);
            const boundedValue = Math.min(newValue, effectiveAvailable);

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

    const handleSubmit = async () => {
        setError('');
        const sum = autoRules.reduce((acc, rule) => acc + (rule.theoryCount || 0) + (rule.codingCount || 0), 0);
        if (sum !== totalQuestions) return setError(`Rule sum (${sum}) does not match Total Questions (${totalQuestions}).`);

        setIsGenerating(true);
        try {
            const payload = {
                title, description, durationMinutes, totalQuestions, positiveMarks, negativeMarks, autoRules
            };
            await studentService.generatePracticeExam(payload);
            
            setIsModalOpen(false);
            setStep(1);
            setActiveTab('BASIC');
            setTitle('');
            setAutoRules([{ technology: 'JAVA', topic: 'ALL', difficulty: 'MEDIUM', theoryCount: 5, codingCount: 5 }]);
            fetchPracticeExams();
        } catch (err: any) { 
            setError(err.response?.data || "Failed to compile assessment."); 
        } finally { 
            setIsGenerating(false); 
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-24 animate-in fade-in duration-700 relative">
            
            <div className="absolute top-0 right-10 w-[400px] h-[400px] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/50 dark:bg-[#150a29]/50 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/20 dark:border-purple-900/30 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.4)] shrink-0 transform hover:scale-105 transition-transform duration-300">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600 dark:from-purple-400 dark:to-fuchsia-400 tracking-tight">Self-Practice Arena</h2>
                        <p className="text-sm font-medium text-gray-500 dark:text-purple-200/70 mt-1 max-w-xl leading-relaxed">Compile private practice exams directly from our secure question bank. Mix theory and coding questions to sharpen your skills.</p>
                    </div>
                </div>
                
                <button 
                    onClick={() => { setIsModalOpen(true); setStep(1); setActiveTab('BASIC'); setError(''); }}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:-translate-y-1 active:scale-95 cursor-pointer uppercase tracking-widest text-xs shrink-0"
                >
                    <Plus className="w-4 h-4 text-purple-200" />
                    Create Assessment
                </button>
            </div>

            {/* 🌟 FULLY RESPONSIVE BUILDER MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-6 bg-gray-900/90 dark:bg-black/90 backdrop-blur-md">
                    <div className="bg-gray-50 dark:bg-[#110820] sm:rounded-3xl shadow-2xl border-0 sm:border-2 border-gray-200 dark:border-purple-900/50 overflow-hidden animate-in zoom-in-95 duration-300 w-full max-w-6xl mx-auto flex flex-col md:flex-row h-full sm:h-[85vh] relative z-50">

                        {/* WIZARD SIDEBAR (Hidden on Mobile) */}
                        <div className="hidden md:flex w-64 bg-gray-50 dark:bg-[#0f0a1c] border-r border-gray-200 dark:border-purple-900/50 p-6 flex-col gap-2 shrink-0 overflow-y-auto z-10">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Exam Configurator</h3>
                            
                            <button onClick={() => { setActiveTab('BASIC'); setStep(1); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${activeTab === 'BASIC' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-purple-900/20'}`}>
                                <FileText className="w-4 h-4" /> 1. Basic Details
                            </button>
                            <button onClick={() => { setActiveTab('QUESTIONS'); setStep(2); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${activeTab === 'QUESTIONS' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-purple-900/20'}`}>
                                <DatabaseZap className="w-4 h-4" /> 2. Question Rules
                            </button>
                            <button onClick={() => { setActiveTab('SETTINGS'); setStep(3); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left text-sm cursor-pointer ${activeTab === 'SETTINGS' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-purple-900/20'}`}>
                                <Settings className="w-4 h-4" /> 3. Settings & Assign
                            </button>

                            <div className="mt-auto pt-6">
                                <button onClick={() => !isGenerating && setIsModalOpen(false)} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-gray-500 font-bold bg-gray-200 dark:bg-gray-800 hover:bg-rose-100 hover:text-rose-500 transition-colors cursor-pointer">
                                    Exit
                                </button>
                            </div>
                        </div>

                        {/* WIZARD CONTENT */}
                        <div className="flex-1 flex flex-col relative overflow-hidden z-10">
                            
                            {/* Builder Header (Mobile Friendly Stepper) */}
                            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-4 sm:p-6 flex flex-col justify-between gap-4 shrink-0 shadow-sm">
                                <div className="flex justify-between items-center w-full">
                                    <div>
                                        <h2 className="text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 flex items-center gap-2 drop-shadow-sm">
                                            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" /> Practice Architect
                                        </h2>
                                        <p className="hidden sm:block text-xs sm:text-sm text-gray-500 font-bold mt-1 tracking-wide">Design, configure, and engineer precision exams.</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="md:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-purple-900/30 rounded-full"><X className="w-5 h-5"/></button>
                                </div>
                                
                                <div className="flex items-center gap-1 sm:gap-3 text-[10px] sm:text-sm font-black w-full overflow-x-auto no-scrollbar pb-1 sm:pb-0 tracking-wider uppercase">
                                    <span className={`shrink-0 px-2 sm:px-3 py-1 rounded-full border-2 ${step >= 1 ? 'border-purple-600 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'border-transparent text-gray-400'}`}>1. Config</span> <ChevronRight className="w-3 h-3 text-gray-300" />
                                    <span className={`shrink-0 px-2 sm:px-3 py-1 rounded-full border-2 ${step >= 2 ? 'border-purple-600 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'border-transparent text-gray-400'}`}>2. Engine</span> <ChevronRight className="w-3 h-3 text-gray-300" />
                                    <span className={`shrink-0 px-2 sm:px-3 py-1 rounded-full border-2 ${step >= 3 ? 'border-purple-600 text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400' : 'border-transparent text-gray-400'}`}>3. Build</span>
                                </div>
                            </div>

                            {isGenerating && (
                                <div className="absolute inset-0 z-50 bg-white/80 dark:bg-[#150a29]/90 backdrop-blur-md flex flex-col items-center justify-center">
                                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-widest uppercase">Compiling Exam...</h3>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8">
                                
                                {error && (
                                    <div className="mb-6 p-4 bg-red-500 text-white rounded-2xl font-black animate-in slide-in-from-top-4 flex items-center gap-3 shadow-[0_8px_30px_rgb(239,68,68,0.3)] sticky top-0 z-50 text-xs sm:text-sm border-b-4 border-red-700">
                                        <AlertCircle className="w-6 h-6 shrink-0" />
                                        <span className="leading-tight tracking-wide">{error}</span>
                                    </div>
                                )}

                                {/* STEP 1: CONFIG */}
                                {step === 1 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black dark:text-white mb-1">Basic Details</h2>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                                            <div className="space-y-2 md:col-span-1">
                                                <label className="text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Total Qs</label>
                                                <input type="number" min="1" value={totalQuestions} onChange={e => setTotalQuestions(Number(e.target.value))} className={number3DClass} />
                                            </div>
                                            <div className="space-y-2 md:col-span-3">
                                                <label className="text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Exam Title</label>
                                                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={input3DClass} placeholder="e.g. Weekend Practice" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Time (Min)</label>
                                                <input type="number" min="1" value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} className={number3DClass} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Correct (+)</label>
                                                <input type="number" step="0.5" min="0" value={positiveMarks} onChange={e => setPositiveMarks(Number(e.target.value))} className={`${number3DClass} text-emerald-600`} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] sm:text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">Penalty (-)</label>
                                                <input type="number" step="0.25" min="0" value={negativeMarks} onChange={e => setNegativeMarks(Number(e.target.value))} className={`${number3DClass} text-rose-600`} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">Description</label>
                                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={`${input3DClass} resize-none`}></textarea>
                                        </div>

                                        <div className="space-y-3 mt-4 border-t-2 border-gray-200 dark:border-purple-900/40 pt-6 opacity-60">
                                            <div>
                                                <label className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /> Operational Batches <Lock className="w-3.5 h-3.5" />
                                                </label>
                                                <p className="text-[10px] sm:text-xs text-gray-500 font-bold mt-1">Locked. Practice exams are stored in your private arena.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: ENGINE SELECTION */}
                                {step === 2 && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 h-full flex flex-col justify-center max-w-4xl mx-auto">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                                            <div className="group relative p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border-2 cursor-pointer transition-all duration-300 transform border-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#1a0d36] shadow-lg">
                                                <div className="absolute top-4 right-4 bg-purple-500 text-white p-1 rounded-full"><CheckCircle2 className="w-5 h-5"/></div>
                                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl mb-4 flex items-center justify-center bg-purple-600 text-white shadow-lg">
                                                    <Bot className="w-6 h-6 sm:w-10 sm:h-10" />
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">Auto-Compile</h3>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-500 leading-relaxed">Dynamic Rule-Based generation. Compiles random question sets into your playground.</p>
                                            </div>

                                            <div className="group relative p-6 sm:p-10 rounded-2xl sm:rounded-[2rem] border-2 border-gray-200 dark:border-gray-800 bg-gray-100/50 dark:bg-gray-900/50 opacity-60 cursor-not-allowed">
                                                <div className="absolute top-4 right-4 text-gray-400"><Lock className="w-5 h-5"/></div>
                                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl mb-4 flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-gray-400">
                                                    <FileText className="w-6 h-6 sm:w-10 sm:h-10" />
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black text-gray-500 mb-2">Manual Override</h3>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-500 leading-relaxed">Locked. Surgical manual picking of specific question tokens is restricted.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3 */}
                                {step === 3 && (
                                    <div className="animate-in slide-in-from-right-4 h-full flex flex-col min-h-[500px]">
                                        <div className="space-y-6">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="font-black text-gray-900 dark:text-white text-lg sm:text-2xl flex items-center gap-3">
                                                        Rule Matrices 
                                                        <span className="text-xs sm:text-sm font-black bg-purple-600 text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl shadow-md">
                                                            {autoRules.reduce((a, b) => a + b.theoryCount + b.codingCount, 0)} / {totalQuestions} Qs
                                                        </span>
                                                    </h3>
                                                </div>
                                                <button type="button" onClick={handleAddRule} className="w-full sm:w-auto justify-center flex items-center gap-2 text-xs sm:text-sm font-black text-white bg-gray-900 dark:bg-purple-600 hover:bg-gray-800 dark:hover:bg-purple-500 px-6 py-3.5 rounded-xl transition-all shadow-md active:translate-y-0.5 cursor-pointer border-b-4 border-black dark:border-purple-800 active:border-b-0 uppercase tracking-widest">
                                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Append Rule
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {autoRules.map((rule, index) => {
                                                    const techStats = techAvailability[rule.technology] || [];
                                                    const availableTopics = Array.from(new Set(techStats.map((item: any) => item.topic)));

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

                                                    const otherRules = autoRules.filter((r, i) => i !== index && r.technology === rule.technology && r.topic === rule.topic && r.difficulty === rule.difficulty);
                                                    const usedTheory = otherRules.reduce((acc, r) => acc + r.theoryCount, 0);
                                                    const usedCoding = otherRules.reduce((acc, r) => acc + r.codingCount, 0);

                                                    const effectiveTheoryLeft = Math.max(0, totalAvailableTheoryInDb - usedTheory);
                                                    const effectiveCodingLeft = Math.max(0, totalAvailableCodingInDb - usedCoding);

                                                    return (
                                                        <div key={index} className="flex flex-col bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl border-2 border-gray-200 dark:border-purple-900/50 shadow-sm hover:shadow-md transition-shadow gap-4 relative group">
                                                            
                                                            {/* Trash Icon - Force display on mobile, hover on desktop */}
                                                            {autoRules.length > 1 && (
                                                                <button onClick={() => handleRemoveRule(index)} className="absolute -top-3 -right-3 w-8 h-8 bg-rose-100 dark:bg-rose-900/50 text-rose-500 rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md hover:bg-rose-500 hover:text-white z-10">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            )}

                                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                                <select value={rule.technology} onChange={(e) => handleUpdateRule(index, 'technology', e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 outline-none font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 focus:border-purple-500 transition-colors cursor-pointer shadow-inner">
                                                                    {TECH_STACK.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                </select>

                                                                <select value={rule.topic} onChange={(e) => handleUpdateRule(index, 'topic', e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 outline-none font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 focus:border-purple-500 transition-colors cursor-pointer shadow-inner">
                                                                    <option value="ALL">All Topics</option>
                                                                    {availableTopics.map((t: any) => <option key={t} value={t}>{t}</option>)}
                                                                </select>

                                                                <select value={rule.difficulty} onChange={(e) => handleUpdateRule(index, 'difficulty', e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl p-3 outline-none font-black text-xs uppercase tracking-wider text-gray-700 dark:text-gray-200 focus:border-purple-500 transition-colors cursor-pointer shadow-inner">
                                                                    <option value="EASY">Easy</option><option value="MEDIUM">Medium</option><option value="HARD">Hard</option>
                                                                </select>
                                                            </div>

                                                            {/* Mobile-Friendly Split Qty Inputs Row */}
                                                            <div className="flex flex-col md:flex-row items-center gap-3 w-full border-t border-gray-200 dark:border-gray-800 pt-4 mt-2">
                                                                <div className="flex w-full gap-3">
                                                                    {/* Theory Input */}
                                                                    <div className="flex-1 flex items-center justify-between gap-2 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-900/50 rounded-xl p-2 focus-within:border-blue-500 transition-colors shadow-inner">
                                                                        <div className="flex flex-col pl-1 sm:pl-2">
                                                                            <span className="text-[9px] sm:text-[10px] uppercase text-blue-600 dark:text-blue-400 font-black flex items-center gap-1"><BookOpen className="w-3 h-3"/> Theory</span>
                                                                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-500">Avail: {effectiveTheoryLeft}</span>
                                                                        </div>
                                                                        <input type="number" min="0" max={effectiveTheoryLeft} value={rule.theoryCount} onChange={(e) => handleUpdateRule(index, 'theoryCount', e.target.value)} className="w-12 sm:w-16 bg-white dark:bg-black p-2 rounded-lg border border-blue-200 dark:border-blue-800 outline-none font-black text-sm sm:text-base text-center text-blue-600 dark:text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text" />
                                                                    </div>

                                                                    {/* Coding Input */}
                                                                    <div className="flex-1 flex items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-900/50 rounded-xl p-2 focus-within:border-emerald-500 transition-colors shadow-inner">
                                                                        <div className="flex flex-col pl-1 sm:pl-2">
                                                                            <span className="text-[9px] sm:text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1"><Code2 className="w-3 h-3"/> Coding</span>
                                                                            <span className="text-[8px] sm:text-[9px] font-bold text-gray-500">Avail: {effectiveCodingLeft}</span>
                                                                        </div>
                                                                        <input type="number" min="0" max={effectiveCodingLeft} value={rule.codingCount} onChange={(e) => handleUpdateRule(index, 'codingCount', e.target.value)} className="w-12 sm:w-16 bg-white dark:bg-black p-2 rounded-lg border border-emerald-200 dark:border-emerald-800 outline-none font-black text-sm sm:text-base text-center text-emerald-600 dark:text-emerald-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-text" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Responsive Sticky Bottom Actions */}
                            <div className="bg-white/90 dark:bg-[#110820]/90 backdrop-blur-xl border-t-2 border-gray-200 dark:border-purple-900/50 p-4 sm:p-6 flex gap-3 shrink-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
                                {step > 1 ? (
                                    <button type="button" onClick={() => { setStep(step - 1); setError(''); }} className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl font-black text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all cursor-pointer border-b-4 border-gray-300 dark:border-gray-900 active:border-b-0 active:translate-y-1 text-xs sm:text-sm uppercase tracking-wider">Back</button>
                                ) : (
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl font-black text-rose-600 bg-rose-50 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all cursor-pointer border-b-4 border-rose-200 dark:border-rose-900/60 active:border-b-0 active:translate-y-1 text-xs sm:text-sm uppercase tracking-wider">Cancel</button>
                                )}

                                {step < 3 ? (
                                    <button type="button" onClick={() => { setStep(step + 1); setError(''); }} disabled={step === 1 && (!title || !totalQuestions)} className="w-full sm:w-auto ml-auto px-4 sm:px-10 py-3.5 rounded-xl font-black bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 transition-all cursor-pointer border-b-4 border-purple-800 active:border-b-0 active:translate-y-1 shadow-lg shadow-purple-600/30 text-xs sm:text-sm uppercase tracking-wider">Proceed</button>
                                ) : (
                                    <button type="button" onClick={handleSubmit} disabled={isGenerating} className="w-full sm:w-auto ml-auto px-4 sm:px-10 py-3.5 rounded-xl font-black bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 shadow-lg shadow-emerald-500/30 text-xs sm:text-sm uppercase tracking-wider">
                                        {isGenerating ? <><Loader2 className="w-4 h-4 animate-spin"/> Compiling</> : <><Rocket className="w-4 h-4"/> Launch</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* LIVE DISPLAY GRID VIEW */}
            {loading ? (
                <div className="py-20 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600"/></div>
            ) : exams.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center bg-white/50 dark:bg-[#150a29]/50 backdrop-blur-xl border-2 border-dashed border-gray-200 dark:border-purple-900/30 rounded-[2rem] animate-in zoom-in-95 mx-4 sm:mx-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 dark:bg-[#1a0d36] rounded-full flex items-center justify-center mb-6 shadow-inner border border-gray-100 dark:border-purple-900/50">
                        <DatabaseZap className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2">Your Arena is Empty</h3>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-sm leading-relaxed mb-6 px-4">Create your first private customized blueprints to auto-compile random sets from our repository pools.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {exams.map(exam => (
                        <div key={exam.id} className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-md rounded-[2rem] p-6 border border-gray-100 dark:border-purple-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
                            
                            <div className="mb-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/30 shrink-0 group-hover:scale-110 transition-transform">
                                        <Code className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50 uppercase tracking-widest flex items-center gap-1">
                                        <Target className="w-3 h-3"/> Practice Mode
                                    </span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2">{exam.title}</h3>
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-1.5"><DatabaseZap className="w-3.5 h-3.5"/> {exam.tags?.split(',')[0] || 'Mixed Tech'}</p>
                                
                                <div className="grid grid-cols-2 gap-3 mb-2">
                                    <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 border border-gray-100 dark:border-purple-900/30 shadow-inner">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Questions</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><Hexagon className="w-4 h-4 text-purple-500"/> {exam.totalQuestions}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-[#0f0a1c] rounded-xl p-3 border border-gray-100 dark:border-purple-900/30 shadow-inner">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Duration</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500"/> {exam.durationMinutes}m</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 flex-col sm:flex-row">
                                <button 
                                    onClick={() => navigate(`/student/exam/live/${exam.id}`)}
                                    className="flex-1 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
                                >
                                    <PlayCircle className="w-4 h-4" /> Practice
                                </button>
                                
                                <button 
                                    onClick={() => navigate(`/student/dashboard?view=transcripts`)}
                                    className="w-full sm:w-auto px-4 py-3.5 rounded-xl text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center border border-gray-200 dark:border-gray-700 shadow-sm text-[11px] font-black uppercase tracking-widest"
                                >
                                    <History className="w-4 h-4 sm:mr-0 mr-2" /> <span className="sm:hidden">View History</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}