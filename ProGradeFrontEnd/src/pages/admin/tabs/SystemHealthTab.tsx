import { useState, useEffect } from 'react';
import { Activity, Server, Database, Zap, ShieldCheck, RefreshCw, Cpu, HardDrive, AlertTriangle, HeartPulse, Network } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { adminService } from '../../../features/admin/adminService';

export default function SystemHealthTab() {
    const [healthData, setHealthData] = useState<any>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const data = await adminService.getSystemHealth();
            setHealthData(data);
            if (data.history) setHistory(data.history);
        } catch (error) { console.error("Failed to fetch health data", error); } 
        finally { setTimeout(() => setIsRefreshing(false), 800); }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); 
        return () => clearInterval(interval);
    }, []);

    // Safely Extract Metrics
    const jvmUsed = healthData?.jvmUsedMb || 0;
    const jvmMax = healthData?.jvmMaxMb || 1024;
    const memPercent = jvmMax > 0 ? (jvmUsed / jvmMax) * 100 : 0;
    
    const dbActive = healthData?.dbActive || 0;
    const dbIdle = healthData?.dbIdle || 0;
    const dbMax = healthData?.dbMax || 10;
    
    const appCpu = healthData?.appCpu || 0;
    const hostCpu = healthData?.hostCpu || 0;

    const activeThreads = healthData?.activeThreads || 0;
    const blockedThreads = healthData?.blockedThreads || 0;

    const diskFree = healthData?.diskFreeGb || 0;
    const diskTotal = healthData?.diskTotalGb || 100;
    const diskPercent = diskTotal > 0 ? ((diskTotal - diskFree) / diskTotal) * 100 : 0;

    // 🌟 CUSTOM GLASSMORPHISM TOOLTIP
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 dark:bg-[#150a29]/90 backdrop-blur-md border-2 border-gray-200 dark:border-purple-900/50 p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] z-50">
                    <p className="text-xs font-black text-gray-500 mb-2 uppercase tracking-widest border-b border-gray-200 dark:border-purple-900/50 pb-2">{label}</p>
                    {payload.map((p: any, idx: number) => (
                        <p key={idx} className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2 my-1">
                            <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: p.color || p.fill || p.stroke }}></span>
                            {p.name}: <span style={{ color: p.color || p.fill || p.stroke }}>{Number(p.value).toFixed(1)}</span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen pb-10">
            
            {/* Glowing Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
            </div>

            {/* Header */}
            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 sm:p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-10 shadow-[0_10px_40px_rgba(0,0,0,0.03)] relative">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 flex items-center gap-3 drop-shadow-sm">
                        <Server className="w-8 h-8 text-emerald-600 dark:text-emerald-400" /> NOC Dashboard
                    </h2>
                    <p className="text-sm text-gray-500 font-bold mt-2 tracking-wide">Network Operations Center: Deep-dive diagnostics and infrastructure health.</p>
                </div>
                <button onClick={fetchData} disabled={isRefreshing} className="w-full md:w-auto bg-gradient-to-b from-white to-gray-50 dark:from-[#1a0d36] dark:to-[#110820] text-gray-700 dark:text-gray-300 font-black px-8 py-3.5 rounded-xl border-2 border-gray-200 dark:border-purple-900/50 border-b-[6px] active:border-b-2 active:translate-y-1 hover:bg-gray-50 dark:hover:bg-[#1a0d36] shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer uppercase tracking-widest text-xs">
                    <RefreshCw className={`w-5 h-5 text-emerald-500 ${isRefreshing ? 'animate-spin' : ''}`} /> Sync Telemetry
                </button>
            </div>

            {/* 🌟 SECTION 1: KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                
                {/* 1. App Heartbeat */}
                <div className="group bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-emerald-100 dark:border-emerald-900/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-400">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-20 transition-all duration-500"><HeartPulse className="w-32 h-32 text-emerald-500"/></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><HeartPulse className="w-4 h-4 text-emerald-500"/> Application Heartbeat</p>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4">99.98% <span className="text-sm text-gray-500 font-bold">Uptime</span></h3>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span> {healthData?.status || 'UP'} | {healthData?.uptime || '0d 0h'}
                    </div>
                </div>

                {/* 2. CPU Usage */}
                <div className="group bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-20 transition-all duration-500"><Cpu className="w-32 h-32 text-blue-500"/></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Cpu className="w-4 h-4 text-blue-500"/> System CPU Usage</p>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{hostCpu.toFixed(1)}<span className="text-2xl text-gray-500">%</span></h3>
                    <div className="flex gap-4">
                        <span className="text-xs font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">App: {appCpu.toFixed(1)}%</span>
                        <span className="text-xs font-black text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">Host: {hostCpu.toFixed(1)}%</span>
                    </div>
                </div>

                {/* 3. JVM Heap */}
                <div className="group bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-purple-400">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-20 transition-all duration-500"><HardDrive className="w-32 h-32 text-purple-500"/></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><HardDrive className="w-4 h-4 text-purple-500"/> JVM Heap Status</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{Math.round(jvmUsed)} <span className="text-sm text-gray-500">MB</span> <span className="text-sm text-gray-400 font-bold">/ {Math.round(jvmMax)}</span></h3>
                    <div className="w-full bg-gray-100 dark:bg-[#0f0a1c] rounded-full h-2 mb-2"><div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(memPercent, 100)}%` }}></div></div>
                    <p className="text-xs text-gray-500 font-black tracking-wider">{memPercent.toFixed(1)}% Allocated</p>
                </div>

                {/* 4. Active Threads */}
                <div className="group bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-amber-400">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-20 transition-all duration-500"><Activity className="w-32 h-32 text-amber-500"/></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-amber-500"/> Active Thread Count</p>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{Math.round(activeThreads)}</h3>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-wider shadow-inner ${blockedThreads > 0 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                        {blockedThreads > 0 ? <AlertTriangle className="w-3.5 h-3.5"/> : <ShieldCheck className="w-3.5 h-3.5"/>}
                        {blockedThreads} Blocked Threads
                    </div>
                </div>

                {/* 5. Database Pool */}
                <div className="group bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-indigo-400">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-20 transition-all duration-500"><Database className="w-32 h-32 text-indigo-500"/></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Database className="w-4 h-4 text-indigo-500"/> HikariCP Database Pool</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{Math.round(dbActive)} <span className="text-sm text-gray-500 font-bold">Active</span></h3>
                    <div className="flex gap-4">
                        <span className="text-xs font-black text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">Idle: {Math.round(dbIdle)}</span>
                        <span className="text-xs font-black text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">Max: {Math.round(dbMax)}</span>
                    </div>
                </div>

                {/* 6. Disk Space */}
                <div className="group bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-pink-400">
                    <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-20 transition-all duration-500"><Server className="w-32 h-32 text-pink-500"/></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-pink-500"/> Disk Space Availability</p>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-4">{diskFree} <span className="text-sm text-gray-500">GB Free</span></h3>
                    <div className="w-full bg-gray-100 dark:bg-[#0f0a1c] rounded-full h-2 mb-2"><div className="h-full bg-pink-500 rounded-full" style={{ width: `${Math.min(diskPercent, 100)}%` }}></div></div>
                    <p className="text-xs text-gray-500 font-black tracking-wider">Total: {diskTotal} GB</p>
                </div>
            </div>

            {/* 🌟 SECTION 2: GRAPHS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                
                {/* A. Sawtooth Memory Graph */}
                <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30 lg:col-span-2">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><HardDrive className="w-5 h-5 text-purple-500"/> JVM Memory Behavior (Sawtooth)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false}/>
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey="heap" name="Heap (MB)" stroke="#a855f7" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }} />
                                <Line type="monotone" dataKey="nonHeap" name="Non-Heap (MB)" stroke="#0ea5e9" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#fff', stroke: '#0ea5e9', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* B. GC Pauses */}
                <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Zap className="w-5 h-5 text-rose-500"/> GC Pause Latencies</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs><linearGradient id="colorGc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.6}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false}/>
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="step" dataKey="gcPause" name="Pause (ms)" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorGc)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* C. API Throughput Stacked Bar */}
                <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Network className="w-5 h-5 text-blue-500"/> API Throughput & Status</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false}/>
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip cursor={{fill: 'rgba(107, 114, 128, 0.1)'}} content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                <Bar dataKey="http2xx" name="2xx Success" stackId="a" fill="#10b981" />
                                <Bar dataKey="http4xx" name="4xx Error" stackId="a" fill="#f59e0b" />
                                <Bar dataKey="http5xx" name="5xx Error" stackId="a" fill="#ef4444" radius={[4,4,0,0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* D. Thread States */}
                <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Activity className="w-5 h-5 text-amber-500"/> Thread Allocation States</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false}/>
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                                <Line type="monotone" dataKey="runnable" name="Runnable" stroke="#10b981" strokeWidth={3} dot={false} />
                                <Line type="monotone" dataKey="waiting" name="Waiting" stroke="#f59e0b" strokeWidth={3} dot={false} />
                                <Line type="step" dataKey="blocked" name="Blocked" stroke="#ef4444" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* E. System I/O */}
                <div className="bg-white/90 dark:bg-[#1a0d36]/90 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] shadow-sm border-2 border-gray-100 dark:border-purple-900/30">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-2"><Database className="w-5 h-5 text-indigo-500"/> System I/O (File Descriptors)</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={history} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                                <defs><linearGradient id="colorIo" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient></defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" opacity={0.15} vertical={false}/>
                                <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area type="monotone" dataKey="ioFiles" name="Open Files" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorIo)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}