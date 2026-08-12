import React, { useEffect, useState } from 'react';
import { educatorService } from '../../../features/educator/educatorService';
import { Activity, AlertTriangle, BookOpen, TrendingUp } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function EducatorOverviewTab() {
    const [kpis, setKpis] = useState<any>(null);
    const [charts, setCharts] = useState<any>(null);

    useEffect(() => {
        educatorService.getOverviewKPIs().then(setKpis).catch(console.error);
        educatorService.getDashboardCharts().then(setCharts).catch(console.error);
    }, []);

    if (!kpis || !charts) return <div className="h-64 flex items-center justify-center font-bold text-purple-600 animate-pulse">Syncing Telemetry...</div>;

    // Helper for Chart B coloring
    const getMasteryColor = (accuracy: number) => {
        if (accuracy >= 75) return '#10b981'; // Green
        if (accuracy >= 50) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* --- 1. KPI SUMMARY CARDS (TOP ROW) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Active Examinations */}
                <div className="bg-white dark:bg-[#1a0d36] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Active Exams</h3>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> LIVE</span>
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{kpis.activeExams}</p>
                    <p className="text-xs font-semibold text-gray-500">{kpis.concurrentStudents} concurrent students testing</p>
                </div>

                {/* Pending Evaluations (Action Metric) */}
                <div className="bg-white dark:bg-[#1a0d36] p-5 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-900/5 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <h3 className="text-sm font-bold text-amber-700 dark:text-amber-500 uppercase tracking-wider">Pending Evaluations</h3>
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mb-1 relative z-10">{kpis.pendingEvaluations}</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-500 underline cursor-pointer relative z-10">{kpis.proctoringFlags} Proctoring flags to review &rarr;</p>
                </div>

                {/* Question Bank Contribution */}
                <div className="bg-white dark:bg-[#1a0d36] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Authored Questions</h3>
                        <BookOpen className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{kpis.authoredQuestions}</p>
                    <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <span className="text-emerald-500">{kpis.easyPct}% Easy</span> | <span className="text-amber-500">{kpis.mediumPct}% Med</span> | <span className="text-rose-500">{kpis.hardPct}% Hard</span>
                    </p>
                </div>

                {/* Global Class Passing Index */}
                <div className="bg-white dark:bg-[#1a0d36] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Avg Pass Rate</h3>
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-3xl font-black text-gray-900 dark:text-white mb-1">{kpis.avgPassRate}%</p>
                    <p className="text-xs font-semibold text-gray-500"><span className="text-emerald-500 font-bold">{kpis.passRateGrowth} MoM</span> vs platform baseline</p>
                </div>
            </div>

            {/* --- 2. ANALYTICAL CHARTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart A: Daily Velocity (Area Chart) */}
                <div className="lg:col-span-2 bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1"><Activity className="w-4 h-4 text-indigo-500"/> Engagement Velocity (30 Days)</h3>
                    <p className="text-xs text-gray-500 mb-6">Test submission volume rolling across your assigned assessments.</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.velocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorSubmissions" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6366f1" opacity={0.1} />
                                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#6366f1', color: '#fff', borderRadius: '12px' }} />
                                <Area type="monotone" dataKey="submissions" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSubmissions)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart B: Topic Mastery (Horizontal Bar) */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Topic Mastery Index</h3>
                    <p className="text-xs text-gray-500 mb-6">Aggregate class accuracy mapped against technical sub-topics.</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart layout="vertical" data={charts.mastery} margin={{ top: 0, right: 20, left: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#6b7280" opacity={0.1} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6b7280', fontWeight: 'bold' }} />
                                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '8px' }} />
                                <Bar dataKey="accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                                    {charts.mastery.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={getMasteryColor(entry.accuracy)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart C: Score Distribution Funnel (Vertical Bar) */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">Test Score Distribution</h3>
                    <p className="text-xs text-gray-500 mb-6">Number of students scoring within specific grade brackets.</p>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.distribution} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8b5cf6" opacity={0.1} />
                                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: '#8b5cf6', opacity: 0.1}} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#8b5cf6', color: '#fff', borderRadius: '8px' }} />
                                <Bar dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}