import React from 'react';
import { Users, ShieldAlert, Activity, MonitorPlay, TrendingUp, Server, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    metrics: any;
    charts: any;
    pendingEducators?: any[];
    onApprove?: (id: string) => void;
    onReject?: (id: string) => void;
}

export default function OverviewTab({ metrics, charts, pendingEducators = [], onApprove, onReject }: Props) {
    
    // Safely map your DTOs to the UI components
    const safeMetrics = metrics || {
        activeStudents: 0, requestsPerMin: "0", liveExams: 0, totalQuestionsServed: "0",
        fraudAlerts: 0, totalUsers: 0, studentCount: 0, educatorCount: 0, growthPercentage: 0
    };

    const safeTrafficData = charts?.traffic || [];
    const safeAffinityData = charts?.affinity || [];

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* 🎴 1. KPI SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                {/* Card 1: Platform Concurrency */}
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 border border-gray-100 dark:border-purple-900/30 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-200 dark:border-emerald-900/50">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Live Activity</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{safeMetrics.activeStudents?.toLocaleString() || 0}</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Students Active</p>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center gap-2">
                        <Server className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">{safeMetrics.requestsPerMin}</strong> HTTP reqs / 60s</span>
                    </div>
                </div>

                {/* Card 2: Live Examinations */}
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 border border-gray-100 dark:border-purple-900/30 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <MonitorPlay className="w-5 h-5" />
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-900/50">
                            <span className="text-[9px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider">Active Schedule</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{safeMetrics.liveExams}</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Live Exams</p>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400"><strong className="text-gray-700 dark:text-gray-300">{safeMetrics.totalQuestionsServed}</strong> Qs served across rooms</span>
                    </div>
                </div>

                {/* Card 3: Fraud Alert Queue */}
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 border border-gray-100 dark:border-purple-900/30 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center">
                            <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md border border-red-200 dark:border-red-900/50 animate-pulse">
                            <span className="text-[9px] font-black text-red-700 dark:text-red-400 uppercase tracking-wider">Requires Attention</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{safeMetrics.fraudAlerts}</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Flagged Cases</p>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 hover:text-purple-600 cursor-pointer font-semibold transition-colors">↳ Audit proctoring streams</span>
                    </div>
                </div>

                {/* Card 4: Platform Growth Index */}
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 border border-gray-100 dark:border-purple-900/30 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded-md border border-purple-200 dark:border-purple-900/50">
                            <TrendingUp className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                            <span className="text-[9px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider">+{safeMetrics.growthPercentage}% MoM</span>
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1">{safeMetrics.totalUsers?.toLocaleString() || 0}</h3>
                    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Total Profiles</p>
                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-purple-900/30 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span><strong className="text-gray-700 dark:text-gray-300">{safeMetrics.educatorCount}</strong> Educators</span>
                        <span>|</span>
                        <span><strong className="text-gray-700 dark:text-gray-300">{safeMetrics.studentCount?.toLocaleString() || 0}</strong> Students</span>
                    </div>
                </div>
            </div>

            {/* 📊 2. REAL-TIME GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-purple-900/30 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">24-Hour Platform Traffic Concurrency</h3>
                        <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-xs font-bold text-gray-600 dark:text-gray-300">Standard Traffic</span></div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-xs font-bold text-gray-600 dark:text-gray-300">Active Exam Submissions</span></div>
                        </div>
                    </div>
                    <div className="h-[280px] w-full">
                        {safeTrafficData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={safeTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/><stop offset="95%" stopColor="#9333ea" stopOpacity={0}/></linearGradient>
                                        <linearGradient id="colorExam" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#150a29', borderColor: '#4c1d95', borderRadius: '12px', color: '#fff' }} />
                                    <Area type="monotone" dataKey="standard" stroke="#9333ea" strokeWidth={3} fillOpacity={1} fill="url(#colorStandard)" />
                                    <Area type="monotone" dataKey="exam" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorExam)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">Waiting for telemetry data...</div>
                        )}
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-5 sm:p-6 border border-gray-100 dark:border-purple-900/30 shadow-sm flex flex-col">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6">Technology Affinity</h3>
                    <div className="flex-1 flex flex-col justify-center space-y-6">
                        {safeAffinityData.length > 0 ? safeAffinityData.map((tech: any, idx: number) => (
                            <div key={idx} className="w-full">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="font-bold text-sm text-gray-700 dark:text-gray-200">{tech.name}</span>
                                    <span className="font-black text-sm text-gray-900 dark:text-white">{tech.percentage}%</span>
                                </div>
                                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                    <div className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${tech.color}`} style={{ width: `${tech.percentage}%` }}></div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-gray-400 text-sm font-bold">No tech data available.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 🌟 3. NEW PENDING EDUCATOR APPROVALS QUEUE */}
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl border border-gray-100 dark:border-purple-900/30 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-purple-900/30 bg-gray-50 dark:bg-[#0f0a1c] flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" /> Pending Educator Approvals
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Review and authorize new instructors requesting platform access.</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-3 py-1 rounded-lg text-xs font-black">
                        {pendingEducators.length} Pending
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-[#150a29]/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <tr>
                                <th className="px-6 py-4">Applicant Name</th>
                                <th className="px-6 py-4">Email Address</th>
                                <th className="px-6 py-4 text-right">Access Controls</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {pendingEducators.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 font-medium">
                                        No pending educator requests at this time.
                                    </td>
                                </tr>
                            ) : (
                                pendingEducators.map((educator: any) => (
                                    <tr key={educator.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{educator.fullName}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{educator.email}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => onReject && onReject(educator.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
                                                    title="Reject Access"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => onApprove && onApprove(educator.id)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/40 rounded-lg font-bold transition-colors cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" /> Approve
                                                </button>
                                            </div>
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
}