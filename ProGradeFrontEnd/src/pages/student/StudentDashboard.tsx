import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Award, TrendingUp, CheckCircle2, Rocket, Clock, ArrowRight, 
    KeyRound, BookOpen, Sparkles, X, Target, BarChart2, Star, Trophy
} from 'lucide-react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
    ResponsiveContainer 
} from 'recharts';

import DashboardLayout from '../../layouts/DashboardLayout';
import Loader3D from '../../components/Loader3D';
import { useAuth } from '../../context/AuthContext';
import { axiosClient } from '../../api/axiosClient';

import ActiveExaminationsTab from './tabs/ActiveExaminationsTab';
import PerformanceTranscriptsTab from './tabs/PerformanceTranscriptsTab';
import GlobalLeaderboardTab from './tabs/GlobalLeaderboardTab';

interface DashboardOverviewData {
    totalExamsTaken: number;
    averageScorePercentage: number;
    overallAccuracy: number;
    totalQuestionsAttempted: number;
    totalCorrectQuestions: number;
    availableExamsCount: number;
    totalRewardPoints: number;
    globalRank: number;
    scoreProgression: Array<{
        examTitle: string;
        scorePercentage: number;
        submittedAt: string;
        totalScore: number;
        maxScore: number;
    }>;
    skillBreakdown: Array<{
        technology: string;
        assessmentsTaken: number;
        averagePercentage: number;
    }>;
    recentSubmissions: Array<{
        submissionId: number;
        assessmentId: number;
        assessmentTitle: string;
        technology: string;
        totalScore: number;
        maxScore: number;
        percentage: number;
        timeTakenSeconds: number;
        passed: boolean;
        submittedAt: string;
    }>;
}

export default function StudentDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const location = useLocation();
    
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<DashboardOverviewData | null>(null);

    // Modal state for Quick Passkey Exam Joining
    const [isPasskeyModalOpen, setIsPasskeyModalOpen] = useState(false);
    const [examCodeInput, setExamCodeInput] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await axiosClient.get<DashboardOverviewData>('/student/dashboard/overview');
                setData(res.data);
            } catch (err) {
                console.error("Failed to load student dashboard metrics", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return '< 1 min';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#150a29]/95 backdrop-blur-xl border border-purple-500/30 p-3.5 rounded-2xl shadow-2xl text-xs z-50">
                    <p className="font-bold text-gray-300 mb-1 max-w-[200px] truncate">{label}</p>
                    <p className="font-black text-fuchsia-400 text-sm flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-purple-400" />
                        Score: {payload[0].value}%
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderOverview = () => {
        const progressionData = data?.scoreProgression?.map((p, idx) => ({
            name: p.examTitle.length > 15 ? p.examTitle.substring(0, 15) + '...' : p.examTitle,
            fullName: p.examTitle,
            score: p.scorePercentage,
            index: idx + 1
        })) || [];

        const skillData = data?.skillBreakdown || [];

        return (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 🌟 1. HERO BANNER */}
                <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/40 via-[#150a29] to-fuchsia-900/30 rounded-[2.5rem] p-6 sm:p-10 border border-purple-900/50 shadow-2xl backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3 max-w-xl">
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-black uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" /> Student Arena
                                </div>
                                
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black tracking-wider shadow-[0_0_10px_rgba(251,191,36,0.1)]">
                                    <Star className="w-3.5 h-3.5 text-amber-400" /> {data?.totalRewardPoints || 0} PTS
                                </div>
                                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-black tracking-wider">
                                    <Trophy className="w-3.5 h-3.5 text-blue-400" /> Global Rank: #{data?.globalRank || '-'}
                                </div>
                            </div>
                            
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight pt-1">
                                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">{user?.fullName?.split(' ')[0] || 'Engineer'}</span>! 👋
                            </h2>
                            <p className="text-sm sm:text-base text-gray-400 font-medium leading-relaxed">
                                Track your technical competency, review historical transcripts, and join scheduled proctored examinations.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button 
                                onClick={() => setIsPasskeyModalOpen(true)}
                                className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border-b-4 border-purple-800 active:border-b-0 active:translate-y-1"
                            >
                                <KeyRound className="w-4 h-4" /> Enter Exam Passkey
                            </button>
                            <button 
                                onClick={() => navigate('/student/dashboard?view=active-exams')}
                                className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-4 h-4 text-purple-400" /> Active Exams
                            </button>
                        </div>
                    </div>
                </div>

                {/* 🌟 2. METRIC KPI CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Exams Completed</span>
                            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                                <Award className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                            {data?.totalExamsTaken || 0}
                        </h3>
                        <p className="text-xs font-bold text-gray-500">Verified Submissions</p>
                    </div>

                    <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden group hover:border-fuchsia-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Average Score</span>
                            <div className="w-10 h-10 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/30 flex items-center justify-center text-fuchsia-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-1">
                            {data?.averageScorePercentage || 0}%
                        </h3>
                        <p className="text-xs font-bold text-gray-500">Aggregate Benchmark</p>
                    </div>

                    <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Overall Accuracy</span>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                            {data?.overallAccuracy || 0}%
                        </h3>
                        <p className="text-xs font-bold text-gray-500">{data?.totalCorrectQuestions || 0} / {data?.totalQuestionsAttempted || 0} Questions</p>
                    </div>

                    <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 rounded-3xl border border-gray-100 dark:border-purple-900/40 shadow-sm relative overflow-hidden group hover:border-blue-500/40 transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Permitted Tests</span>
                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                                <Rocket className="w-5 h-5" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">
                            {data?.availableExamsCount || 0}
                        </h3>
                        <p className="text-xs font-bold text-gray-500">Live in Active Exams</p>
                    </div>
                </div>

                {/* 🌟 3. ANALYTICS CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-purple-400" /> Performance Velocity
                                </h3>
                                <p className="text-xs font-bold text-gray-500 mt-0.5">Chronological score trajectory across test attempts</p>
                            </div>
                        </div>

                        <div className="h-64 sm:h-72 w-full">
                            {progressionData.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-sm font-bold gap-2">
                                    <BookOpen className="w-8 h-8 opacity-40 text-purple-400" />
                                    No assessment attempts recorded yet.
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.6}/>
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false} />
                                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} unit="%" />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="score" 
                                            stroke="#d946ef" 
                                            strokeWidth={3} 
                                            fillOpacity={1} 
                                            fill="url(#scoreGradient)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-gray-100 dark:border-purple-900/30 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                                <BarChart2 className="w-5 h-5 text-fuchsia-400" /> Domain Mastery
                            </h3>
                            <p className="text-xs font-bold text-gray-500 mb-6">Subject proficiency breakdown</p>

                            <div className="space-y-4">
                                {skillData.length === 0 ? (
                                    <p className="text-xs text-gray-500 font-bold text-center py-10">Complete assessments to unlock skill analytics.</p>
                                ) : (
                                    skillData.slice(0, 4).map((skill, index) => (
                                        <div key={index} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-black">
                                                <span className="text-gray-300 uppercase tracking-wider">{skill.technology}</span>
                                                <span className="text-fuchsia-400">{skill.averagePercentage}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-purple-950/60 rounded-full overflow-hidden border border-purple-900/40">
                                                <div 
                                                    className="h-full bg-gradient-to-r from-purple-600 to-fuchsia-500 rounded-full transition-all duration-1000" 
                                                    style={{ width: `${Math.min(100, Math.max(5, skill.averagePercentage))}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/student/dashboard?view=transcripts')}
                            className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 text-purple-300 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                            View Transcripts &rarr;
                        </button>
                    </div>
                </div>

                {/* 🌟 4. RECENT ASSESSMENT HISTORY */}
                <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-purple-900/30 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-purple-400" /> Recent Results
                            </h3>
                            <p className="text-xs font-bold text-gray-500 mt-0.5">Latest technical assessment submissions and outcomes</p>
                        </div>
                        <button 
                            onClick={() => navigate('/student/dashboard?view=transcripts')}
                            className="text-xs font-black uppercase tracking-wider text-purple-400 hover:text-fuchsia-300 transition-colors cursor-pointer flex items-center gap-1"
                        >
                            All History <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="text-[10px] uppercase font-black tracking-widest text-gray-500 border-b border-purple-900/30 pb-3">
                                    <th className="py-3 px-4">Assessment</th>
                                    <th className="py-3 px-4 text-center">Score</th>
                                    <th className="py-3 px-4 text-center">Outcome</th>
                                    <th className="py-3 px-4 text-center">Duration</th>
                                    <th className="py-3 px-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-900/20 text-xs font-bold">
                                {(!data?.recentSubmissions || data.recentSubmissions.length === 0) ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            No recent assessment results found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.recentSubmissions.map((sub) => (
                                        <tr key={sub.submissionId} className="hover:bg-white/5 transition-colors">
                                            <td className="py-4 px-4">
                                                <div>
                                                    <p className="font-black text-gray-900 dark:text-white text-sm">{sub.assessmentTitle}</p>
                                                    <span className="inline-block bg-purple-900/30 text-purple-300 text-[10px] px-2 py-0.5 rounded border border-purple-800/40 mt-1 uppercase font-mono">
                                                        {sub.technology}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className="text-base font-black text-white">{sub.totalScore}</span>
                                                <span className="text-gray-500 text-[10px]"> / {sub.maxScore} ({sub.percentage}%)</span>
                                            </td>
                                            <td className="py-4 px-4 text-center">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                                    sub.passed 
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                                }`}>
                                                    {sub.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center text-gray-400 font-mono">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                                                    {formatDuration(sub.timeTakenSeconds)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-right text-gray-500 font-mono">
                                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        );
    };

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return renderOverview();
            case 'active-exams':
                return <ActiveExaminationsTab />;
            case 'practice':
                return (
                    <div className="p-12 text-center bg-white/5 dark:bg-[#1a0d36] rounded-[2rem] border border-purple-900/30 text-gray-400 font-bold space-y-3">
                        <Sparkles className="w-10 h-10 text-purple-400 mx-auto animate-bounce" />
                        <h3 className="text-xl font-black text-white">Self-Practice Arena</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto">Interactive coding and MCQ practice sandbox with automated AI evaluation.</p>
                    </div>
                );
            case 'transcripts':
                return <PerformanceTranscriptsTab />;
            case 'leaderboard':
                return <GlobalLeaderboardTab />;
            default:
                return renderOverview();
        }
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-[#05020a]/95 backdrop-blur-md flex items-center justify-center p-4">
                <Loader3D text="INITIALIZING STUDENT ARENA..." />
            </div>
        );
    }

    return (
        <DashboardLayout role="STUDENT">
            {renderContent()}

            {/* 🌟 QUICK EXAM PASSKEY DIALOG */}
            {isPasskeyModalOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
                    <div className="bg-[#150a29] border border-purple-900/50 max-w-md w-full rounded-[2.5rem] p-8 text-center shadow-2xl relative animate-in zoom-in-95">
                        <button 
                            onClick={() => setIsPasskeyModalOpen(false)}
                            className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-purple-500/30">
                            <KeyRound className="w-8 h-8 text-white" />
                        </div>

                        <h3 className="text-2xl font-black text-white mb-2">Join Assessment</h3>
                        <p className="text-xs text-gray-400 font-medium mb-6">
                            Enter the Exam ID or Passcode provided by your instructor.
                        </p>

                        <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!examCodeInput.trim()) return;
                            setIsPasskeyModalOpen(false);
                            navigate(`/student/exam/${examCodeInput.trim()}`);
                        }} className="space-y-4">
                            <input 
                                type="text"
                                required
                                placeholder="e.g. EXM-948271"
                                value={examCodeInput}
                                onChange={(e) => setExamCodeInput(e.target.value.toUpperCase())}
                                className="w-full px-5 py-4 bg-white/5 border border-purple-900/50 rounded-2xl text-center text-lg font-black tracking-widest text-white placeholder:text-gray-600 focus:outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 font-mono transition-all uppercase"
                            />

                            <button 
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all active:scale-95 cursor-pointer"
                            >
                                Validate & Launch Exam
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}