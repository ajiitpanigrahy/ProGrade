import React, { useEffect, useState, useCallback } from 'react';
import { educatorService } from '../../../features/educator/educatorService';
import { Activity, AlertTriangle, BookOpen, TrendingUp, Clock, ShieldAlert, Target, BrainCircuit, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart, Line, ReferenceLine } from 'recharts';

export default function EducatorOverviewTab() {
    const [kpis, setKpis] = useState<any>(null);
    const [charts, setCharts] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSynced, setLastSynced] = useState<string>('--:--:--');

    const fetchTelemetry = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const [apiKpis, apiCharts] = await Promise.all([
                educatorService.getOverviewKPIs(),
                educatorService.getDashboardCharts()
            ]);

            setKpis({
                activeExams: apiKpis?.activeExams || 0,
                concurrentStudents: apiKpis?.concurrentStudents || 0,
                pendingEvaluations: apiKpis?.pendingEvaluations || 0,
                proctoringFlags: apiKpis?.proctoringFlags || 0,
                authoredQuestions: apiKpis?.authoredQuestions || 0,
                easyPct: apiKpis?.easyPct || 0,
                mediumPct: apiKpis?.mediumPct || 0,
                hardPct: apiKpis?.hardPct || 0,
                avgPassRate: apiKpis?.avgPassRate || 0,
                passRateGrowth: apiKpis?.passRateGrowth || "0%",
                globalDeviation: apiKpis?.globalDeviation || "0%",
                gradingSLA: apiKpis?.gradingSLA || "N/A",
            });

            // Ensure we strictly store arrays in state
            setCharts({
                velocity: Array.isArray(apiCharts?.velocity) ? apiCharts.velocity : [],
                mastery: Array.isArray(apiCharts?.mastery) ? apiCharts.mastery : [],
                distribution: Array.isArray(apiCharts?.distribution) ? apiCharts.distribution : []
            });

            setLastSynced(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Failed to fetch Educator Dashboard data:", err);
            // Fallbacks to prevent UI crashes if API fails entirely
            if (!kpis) {
                setKpis({
                    activeExams: 0, concurrentStudents: 0, pendingEvaluations: 0, proctoringFlags: 0,
                    authoredQuestions: 0, easyPct: 0, mediumPct: 0, hardPct: 0, avgPassRate: 0,
                    passRateGrowth: "0%", globalDeviation: "0%", gradingSLA: "N/A"
                });
                setCharts({ velocity: [], mastery: [], distribution: [] });
            }
        } finally {
            setIsRefreshing(false);
        }
    }, [kpis]);

    useEffect(() => {
        fetchTelemetry();
        const pollInterval = setInterval(fetchTelemetry, 30000); 
        return () => clearInterval(pollInterval);
    }, [fetchTelemetry]);

    if (!kpis || !charts) return <div className="h-64 flex items-center justify-center font-bold text-purple-600 animate-pulse uppercase tracking-widest text-sm">Syncing Telemetry...</div>;

    const getMasteryColor = (accuracy: number) => {
        if (accuracy >= 75) return '#10b981'; 
        if (accuracy >= 55) return '#f59e0b'; 
        return '#ef4444'; 
    };

    // 🌟 BULLETPROOF CHECKS: Guarantee arrays right before rendering charts to prevent Recharts map crashes
    const safeVelocity = Array.isArray(charts?.velocity) ? charts.velocity : [];
    const safeDistribution = Array.isArray(charts?.distribution) ? charts.distribution : [];
    const safeMastery = Array.isArray(charts?.mastery) ? charts.mastery : [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
                <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Command Center</h2>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Operational Metrics & Cohort Health</p>
                </div>
                <button 
                    onClick={fetchTelemetry}
                    disabled={isRefreshing}
                    className="flex items-center gap-2 text-[10px] font-bold text-gray-600 hover:text-purple-600 bg-white dark:bg-[#1a0d36] hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-purple-900/50 shadow-sm transition-colors cursor-pointer"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-purple-500' : ''}`} /> 
                    {isRefreshing ? 'Syncing...' : `Last Synced: ${lastSynced}`}
                </button>
            </div>

            {/* --- 1. KPI SUMMARY CARDS (TOP ROW) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white dark:bg-[#150a29] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Exam Network</h3>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/50 shadow-sm">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> LIVE
                        </span>
                    </div>
                    <div className="flex items-end gap-2 mb-1 relative z-10">
                        <p className="text-4xl font-black text-gray-900 dark:text-white leading-none">{kpis.concurrentStudents}</p>
                        <p className="text-xs font-bold text-emerald-500 mb-1">Testers</p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 relative z-10">Across <span className="text-gray-700 dark:text-gray-300">{kpis.activeExams}</span> active examinations</p>
                </div>

                <div className="bg-white dark:bg-[#150a29] p-5 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-900/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <h3 className="text-xs font-black text-amber-700 dark:text-amber-500 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5"/> Pending Actions</h3>
                    </div>
                    <div className="flex items-end gap-2 mb-1 relative z-10">
                        <p className="text-4xl font-black text-amber-600 dark:text-amber-400 leading-none">{kpis.pendingEvaluations}</p>
                        <p className="text-xs font-bold text-amber-600/70 mb-1">To Grade</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold mt-2 relative z-10">
                        <span className="text-rose-500 flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> {kpis.proctoringFlags} Flags</span>
                        <span className="text-gray-500">SLA: {kpis.gradingSLA}</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#150a29] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> Asset Bank</h3>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-black text-purple-600 dark:text-purple-400 leading-none">{kpis.authoredQuestions}</p>
                        <p className="text-xs font-bold text-gray-500 mb-1">Total</p>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden flex mb-1.5 bg-gray-100 dark:bg-gray-800">
                        <div style={{ width: `${kpis.easyPct}%` }} className="bg-emerald-500 h-full"></div>
                        <div style={{ width: `${kpis.mediumPct}%` }} className="bg-amber-400 h-full"></div>
                        <div style={{ width: `${kpis.hardPct}%` }} className="bg-rose-500 h-full"></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase tracking-wider">
                        <span>{kpis.easyPct}% Easy</span><span>{kpis.mediumPct}% Med</span><span>{kpis.hardPct}% Hard</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#150a29] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5"/> Cohort Health</h3>
                    </div>
                    <div className="flex items-end gap-2 mb-2">
                        <p className="text-4xl font-black text-blue-600 dark:text-blue-400 leading-none">{kpis.avgPassRate}%</p>
                        <p className="text-xs font-bold text-gray-500 mb-1">Avg Pass</p>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <span className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">{kpis.passRateGrowth} MoM</span> 
                        <span className="text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1 rounded">{kpis.globalDeviation} vs Global</span>
                    </p>
                </div>
            </div>

            {/* --- 2. ANALYTICAL CHARTS --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Chart A: Engagement vs Integrity */}
                <div className="xl:col-span-2 bg-white dark:bg-[#150a29] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2 mb-1"><Target className="w-5 h-5 text-indigo-500"/> Engagement vs Integrity</h3>
                            <p className="text-xs font-bold text-gray-500">Mapping submission volume against malpractice triggers.</p>
                        </div>
                    </div>
                    
                    {safeVelocity.length === 0 ? (
                        <div className="h-72 w-full flex items-center justify-center text-gray-400 font-bold text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No historical velocity data available</div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={safeVelocity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#6366f1" opacity={0.1} />
                                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis yAxisId="right" orientation="right" hide />
                                    <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4f46e5', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                                    <Area yAxisId="left" type="monotone" dataKey="submissions" name="Submissions" stroke="#6366f1" strokeWidth={3} fill="url(#colorSub)" />
                                    <Line yAxisId="right" type="monotone" dataKey="flags" name="Malpractice Flags" stroke="#f43f5e" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Chart B: Score Distribution */}
                <div className="bg-white dark:bg-[#150a29] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="font-black text-gray-900 dark:text-white text-lg mb-1">Standard Curve</h3>
                    <p className="text-xs font-bold text-gray-500 mb-6">Aggregate cohort score distribution.</p>
                    
                    {safeDistribution.length === 0 ? (
                        <div className="h-72 w-full flex items-center justify-center text-gray-400 font-bold text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No distribution data available</div>
                    ) : (
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={safeDistribution} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#8b5cf6" opacity={0.1} />
                                    <XAxis dataKey="bracket" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} dy={10} />
                                    <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#8b5cf6', opacity: 0.1}} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#8b5cf6', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                                    <ReferenceLine x="60-69%" stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Avg', fill: '#10b981', fontSize: 10, fontWeight: 'bold' }} />
                                    <Bar dataKey="students" name="Students" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={24}>
                                        {safeDistribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? '#a78bfa' : '#7c3aed'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Chart C: Skill Gap Analysis */}
                <div className="xl:col-span-3 bg-white dark:bg-[#150a29] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="font-black text-gray-900 dark:text-white text-lg flex items-center gap-2 mb-1"><BrainCircuit className="w-5 h-5 text-emerald-500"/> Skill Gap Analysis</h3>
                            <p className="text-xs font-bold text-gray-500">Cross-referencing real topic difficulty with student accuracy.</p>
                        </div>
                    </div>
                    
                    {safeMastery.length === 0 ? (
                        <div className="h-64 w-full flex items-center justify-center text-gray-400 font-bold text-sm border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">No topic mastery data available</div>
                    ) : (
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={safeMastery} margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#6b7280" opacity={0.1} />
                                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 'bold' }} width={120} />
                                    <Tooltip cursor={{fill: '#4c1d95', opacity: 0.1}} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }} />
                                    <ReferenceLine x={70} stroke="#6b7280" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: 'Target 70%', fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                                    <Bar dataKey="accuracy" name="Accuracy %" radius={[0, 6, 6, 0]} barSize={16}>
                                        {safeMastery.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={getMasteryColor(entry.accuracy)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}