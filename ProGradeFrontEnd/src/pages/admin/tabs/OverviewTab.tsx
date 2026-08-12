import React, { useState } from 'react';
import { Users, Activity, DollarSign, ShieldCheck, Clock } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OverviewTab({ metrics, charts }: any) {
    const [timeframe, setTimeframe] = useState('7D'); // LIVE, TODAY, 7D, 30D

    // Mock Data for the new Assessment Ratio chart requested in your PRD
    const assessmentRatio = [
        { name: 'Completed', value: 845, color: '#10b981' },
        { name: 'Timed Out', value: 120, color: '#f59e0b' },
        { name: 'Aborted', value: 45, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-[#1a0d36] p-4 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Global Timeframe Filter
                </span>
                <div className="flex bg-gray-100 dark:bg-[#0f0a1c] p-1 rounded-lg">
                    {['LIVE', 'TODAY', '7D', '30D'].map(tf => (
                        <button
                            key={tf}
                            onClick={() => setTimeframe(tf)}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${timeframe === tf ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                        >
                            {tf === 'LIVE' ? '🔴 LIVE (1H)' : tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Active Students" value={metrics.totalUsers} icon={<Users className="w-6 h-6" />} trend="+12%" color="purple" />
                <MetricCard
                    title="Verified Educators"
                    value={charts?.roleDistribution?.find((r: any) => r.name === 'INSTRUCTOR')?.value || 0}
                    icon={<ShieldCheck className="w-6 h-6" />}
                    color="green"
                />
                <MetricCard title="Ongoing Assessments" value={metrics.activeExams} icon={<Activity className="w-6 h-6" />} color="blue" />
                <MetricCard title="Security Pulse" value="Healthy" icon={<ShieldCheck className="w-6 h-6 text-green-500" />} color="green" />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Traffic Area Chart */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Platform Traffic & Load</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={charts.userGrowth} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="name" stroke="#6b7280" />
                                <YAxis stroke="#6b7280" />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff' }} />
                                <Area type="monotone" dataKey="students" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorStudents)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Assessment Ratio Chart */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Completion Ratio</h3>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assessmentRatio}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    {assessmentRatio.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper Component
function MetricCard({ title, value, icon, trend, color }: any) {
    return (
        <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex items-center justify-between group hover:border-purple-500/50 transition-colors">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
                {trend && <span className="text-xs font-bold text-green-500 mt-2 block">{trend} vs last period</span>}
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400`}>
                {icon}
            </div>
        </div>
    );
}