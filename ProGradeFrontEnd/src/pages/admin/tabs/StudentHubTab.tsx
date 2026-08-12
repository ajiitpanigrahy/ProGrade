import React, { useState } from 'react';
import { Search, Filter, ShieldAlert, KeyRound, Eye, LockOpen, Users, BarChart2, Calendar } from 'lucide-react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type SubTab = 'DIRECTORY' | 'ANALYTICS';

export default function StudentHubTab() {
    const [activeSubTab, setActiveSubTab] = useState<SubTab>('DIRECTORY');
    const [searchTerm, setSearchTerm] = useState('');
    const [trackFilter, setTrackFilter] = useState('ALL');
    const [techFilter, setTechFilter] = useState('ALL'); // For Analytics

    // --- Mock Data: Student Directory ---
    const students = [
        { id: 'STU-1042', name: 'Alex Johnson', email: 'alex.j@example.com', track: 'Java Full Stack', attempts: 12, avgScore: 84.5, status: 'ACTIVE' },
        { id: 'STU-1088', name: 'Maria Garcia', email: 'maria.g@example.com', track: 'Spring Boot Microservices', attempts: 8, avgScore: 91.2, status: 'ACTIVE' },
        { id: 'STU-1102', name: 'David Chen', email: 'david.c@example.com', track: 'React Frontend', attempts: 3, avgScore: 45.0, status: 'BLOCKED' },
        { id: 'STU-1145', name: 'Sarah Williams', email: 'sarah.w@example.com', track: 'Java Full Stack', attempts: 15, avgScore: 78.8, status: 'ACTIVE' },
    ];

    // --- Mock Data: Analytics ---
    // Simulating a Bell Curve (Normal Distribution of scores)
    const bellCurveData = [
        { scoreRange: '0-20%', count: 15 },
        { scoreRange: '21-40%', count: 45 },
        { scoreRange: '41-60%', count: 180 },
        { scoreRange: '61-80%', count: 420 }, // Peak of the curve
        { scoreRange: '81-100%', count: 110 },
    ];

    // Pass vs Fail Donut
    const passFailData = [
        { name: 'Passed (>60%)', value: 680, color: '#10b981' }, // Green
        { name: 'Failed (<60%)', value: 240, color: '#ef4444' }, // Red
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* Inner Sub-Navigation Toggle */}
            <div className="flex bg-white dark:bg-[#1a0d36] p-1.5 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm w-fit">
                <button 
                    onClick={() => setActiveSubTab('DIRECTORY')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'DIRECTORY' ? 'bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    <Users className="w-4 h-4" /> Student Directory
                </button>
                <button 
                    onClick={() => setActiveSubTab('ANALYTICS')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeSubTab === 'ANALYTICS' ? 'bg-purple-100 dark:bg-purple-600 text-purple-700 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    <BarChart2 className="w-4 h-4" /> Performance Analytics
                </button>
            </div>

            {/* =========================================
                SUB-PAGE A: STUDENT MANAGEMENT GRID
                ========================================= */}
            {activeSubTab === 'DIRECTORY' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* Control Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-[#1a0d36] p-4 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="relative w-full sm:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Search by Student ID, Name or Email..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:text-white"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select 
                                value={trackFilter}
                                onChange={(e) => setTrackFilter(e.target.value)}
                                className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                            >
                                <option value="ALL">All Enrolled Tracks</option>
                                <option value="JAVA">Java Full Stack</option>
                                <option value="SPRING">Spring Boot Microservices</option>
                                <option value="REACT">React Frontend</option>
                            </select>
                        </div>
                    </div>

                    {/* Data Grid */}
                    <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        <th className="py-4 px-6 font-semibold">Student</th>
                                        <th className="py-4 px-6 font-semibold">Enrolled Track</th>
                                        <th className="py-4 px-6 font-semibold cursor-pointer hover:text-purple-500">Attempted</th>
                                        <th className="py-4 px-6 font-semibold cursor-pointer hover:text-purple-500">Avg Score</th>
                                        <th className="py-4 px-6 font-semibold">Status</th>
                                        <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    {student.name} 
                                                    <span className="text-[10px] bg-gray-200 dark:bg-purple-900/40 text-gray-600 dark:text-purple-300 px-2 py-0.5 rounded-full">{student.id}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">{student.email}</div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">{student.track}</td>
                                            <td className="py-4 px-6 text-sm font-bold text-gray-900 dark:text-white">{student.attempts}</td>
                                            <td className="py-4 px-6">
                                                <span className={`text-sm font-bold ${student.avgScore >= 60 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {student.avgScore}%
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                {student.status === 'ACTIVE' ? (
                                                    <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold rounded-md">ACTIVE</span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold rounded-md">BLOCKED</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-1 text-gray-400">
                                                    <button className="p-1.5 hover:text-blue-500 transition-colors" title="View Transcript"><Eye className="w-4 h-4" /></button>
                                                    <button className="p-1.5 hover:text-amber-500 transition-colors" title="Force Password Reset"><KeyRound className="w-4 h-4" /></button>
                                                    {student.status === 'ACTIVE' ? (
                                                        <button className="p-1.5 hover:text-red-500 transition-colors" title="Block Account"><ShieldAlert className="w-4 h-4" /></button>
                                                    ) : (
                                                        <button className="p-1.5 hover:text-green-500 transition-colors" title="Unblock Account"><LockOpen className="w-4 h-4" /></button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================================
                SUB-PAGE B: STUDENT PERFORMANCE ANALYTICS
                ========================================= */}
            {activeSubTab === 'ANALYTICS' && (
                <div className="space-y-6 animate-in fade-in">
                    {/* Analytics Control Bar */}
                    <div className="flex justify-between items-center bg-white dark:bg-[#1a0d36] p-4 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Global Performance Range
                            </span>
                        </div>
                        <select 
                            value={techFilter}
                            onChange={(e) => setTechFilter(e.target.value)}
                            className="bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none"
                        >
                            <option value="ALL">All Technologies</option>
                            <option value="JAVA">Java Only</option>
                            <option value="SPRING">Spring Boot Only</option>
                            <option value="REACT">React Only</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Bell Curve Distribution Chart */}
                        <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Score Distribution (Bell Curve)</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Distribution of test scores across the entire platform.</p>
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={bellCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#d946ef" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                        <XAxis dataKey="scoreRange" stroke="#6b7280" />
                                        <YAxis stroke="#6b7280" />
                                        <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '8px' }} />
                                        <Area type="monotone" dataKey="count" name="Students" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorCurve)" activeDot={{ r: 8 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Global Pass/Fail Donut Chart */}
                        <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Global Pass vs Fail Ratio</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Based on a 60% passing cut-off.</p>
                            <div className="flex-1 w-full min-h-[250px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie 
                                            data={passFailData} 
                                            cx="50%" cy="50%" 
                                            innerRadius={70} 
                                            outerRadius={100} 
                                            paddingAngle={5} 
                                            dataKey="value"
                                        >
                                            {passFailData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '8px' }} />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}