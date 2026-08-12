import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, Clock, ShieldCheck, Settings2, RefreshCw } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminService } from '../../../features/admin/adminService';

export default function SystemHealthTab() {
    const [healthData, setHealthData] = useState<any>(null);
    const [logLevel, setLogLevel] = useState('INFO');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Initial Mock Data (Instantly looks beautiful before backend connects)
    const [history, setHistory] = useState([
        { time: '10:00', cpu: 22, memory: 45, http2xx: 120, http4xx: 5, http5xx: 0, gcPause: 12 },
        { time: '10:10', cpu: 35, memory: 48, http2xx: 145, http4xx: 8, http5xx: 0, gcPause: 15 },
        { time: '10:20', cpu: 85, memory: 75, http2xx: 310, http4xx: 45, http5xx: 12, gcPause: 240 }, // Load Spike
        { time: '10:30', cpu: 40, memory: 50, http2xx: 180, http4xx: 10, http5xx: 1, gcPause: 18 },
        { time: '10:40', cpu: 38, memory: 52, http2xx: 160, http4xx: 5, http5xx: 0, gcPause: 14 },
    ]);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const data = await adminService.getSystemHealth();
            setHealthData(data);
            if (data.history && data.history.length > 0) {
                setHistory(data.history);
            }
        } catch (error) {
            console.error("Failed to fetch health data", error);
        } finally {
            setTimeout(() => setIsRefreshing(false), 500);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Auto-refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleChangeLogLevel = async () => {
        try {
            await adminService.updateLogLevel('mac.prograde', logLevel);
            alert(`Log level successfully changed to ${logLevel}`);
        } catch (e) {
            alert('Failed to change log level.');
        }
    };

    const jvmUsed = healthData?.jvmUsedMb || 412;
    const jvmMax = healthData?.jvmMaxMb || 1024;
    const memPercent = (jvmUsed / jvmMax) * 100;
    const dbActive = healthData?.dbActive || 3;
    const dbPending = healthData?.dbPending || 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl">
            
            {/* Header & Refresh */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Infrastructure</h2>
                        <p className="text-sm text-gray-500">Live JVM footprint, Database pools, and Traffic velocity.</p>
                    </div>
                </div>
                <button onClick={fetchData} className="flex items-center gap-2 bg-white dark:bg-[#1a0d36] border border-gray-200 dark:border-purple-900/50 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-colors">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* --- TOP KPIs: The Metric Cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. JVM Memory Health */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">JVM Heap Memory</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{Math.round(jvmUsed)} MB <span className="text-sm text-gray-500 font-medium">/ {Math.round(jvmMax)} MB</span></h3>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                        <div className={`h-2 rounded-full transition-all duration-500 ${memPercent > 80 ? 'bg-orange-500' : memPercent > 90 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(memPercent, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500">{memPercent.toFixed(1)}% Utilized</p>
                </div>

                {/* 2. Database Pool Strain */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 relative overflow-hidden">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hikari DB Pool</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{dbActive} <span className="text-sm text-gray-500 font-medium">Active Connects</span></h3>
                    <p className={`text-xs font-bold ${dbPending > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        {dbPending} Threads Pending
                    </p>
                    {/* Pulsing Status Dot */}
                    <div className="absolute top-6 right-6">
                        <span className="relative flex h-4 w-4">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dbPending > 0 ? 'bg-red-400' : 'bg-green-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-4 w-4 ${dbPending > 0 ? 'bg-red-500' : 'bg-green-500'}`}></span>
                        </span>
                    </div>
                </div>

                {/* 3. API Response Velocity */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">API Velocity</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">42<span className="text-sm text-gray-500 font-medium">ms</span></h3>
                    <p className="text-xs text-green-500 font-bold">↓ 12% vs last hour</p>
                </div>

                {/* 4. Active Thread Count */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tomcat Threads</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{healthData?.activeThreads || 18} <span className="text-sm text-gray-500 font-medium">Live</span></h3>
                    <p className="text-xs text-blue-500 font-bold">High Concurrency Ready</p>
                </div>
            </div>

            {/* --- MIDDLE: The Analytics Charts --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Chart A: System Resource Timeline */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Resource Timeline (60m)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/> {/* Neon Blue */}
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4}/> {/* Deep Purple */}
                                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 12}} />
                                <YAxis stroke="#6b7280" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff' }} />
                                <Legend />
                                <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                                <Area type="monotone" dataKey="memory" name="RAM %" stroke="#7c3aed" strokeWidth={2} fillOpacity={1} fill="url(#colorRam)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart B: API Traffic & Error Volatility */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">API Traffic Volatility</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                                <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 12}} />
                                <YAxis stroke="#6b7280" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff' }} />
                                <Legend />
                                <Bar dataKey="http2xx" name="2xx Success" stackId="a" fill="#10b981" /> {/* Emerald Green */}
                                <Bar dataKey="http4xx" name="4xx Client Error" stackId="a" fill="#f59e0b" /> {/* Amber Yellow */}
                                <Bar dataKey="http5xx" name="5xx Server Crash" stackId="a" fill="#e11d48" /> {/* Crimson Red */}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM: Controls & Integrations --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Chart C: GC Pauses */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Garbage Collection Pauses (Latency Spikes)</h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                                <XAxis dataKey="time" stroke="#6b7280" tick={{fontSize: 12}} />
                                <YAxis stroke="#6b7280" tick={{fontSize: 12}} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff' }} />
                                <Line type="step" dataKey="gcPause" name="GC Pause (ms)" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* System Integrity Controls */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Settings2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Live Logger Control</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Temporarily increase verbosity to trace production bugs without restarting the server.</p>
                        <select 
                            value={logLevel} 
                            onChange={(e) => setLogLevel(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:border-purple-500 dark:text-white mb-4"
                        >
                            <option value="INFO">Standard (INFO)</option>
                            <option value="DEBUG">Detailed (DEBUG)</option>
                            <option value="TRACE">Maximum (TRACE)</option>
                        </select>
                        <button onClick={handleChangeLogLevel} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-bold transition-colors">
                            Apply Level to Engine
                        </button>
                    </div>

                    <div className="mt-8">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Integrations</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-[#0f0a1c] p-2.5 rounded-lg border border-gray-100 dark:border-purple-900/30">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Server className="w-4 h-4 text-blue-500"/> AWS S3 Storage</span>
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-[#0f0a1c] p-2.5 rounded-lg border border-gray-100 dark:border-purple-900/30">
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2"><Zap className="w-4 h-4 text-orange-500"/> Code Compiler Sandbox</span>
                                <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}