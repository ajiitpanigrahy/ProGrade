import React, { useState, useEffect } from 'react';
import { Database, Filter, Calendar, ArrowUpDown, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { adminService } from '../../../features/admin/adminService';

interface LogEvent {
    eventId: number;
    timestamp: number;
    levelString: string;
    loggerName: string;
    callerClass: string;
    formattedMessage: string;
}

export default function SystemLogsTab() {
    // Filters & Pagination State
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('TODAY'); // ALL, TODAY, WEEKLY, 15D, 30D, 90D, CUSTOM
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOrder, setSortOrder] = useState('DESC');
    
    // Data State
    const [logs, setLogs] = useState<LogEvent[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch Data
    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getSystemLogs(
                levelFilter, dateFilter, customStart, customEnd, currentPage, 10, sortOrder
            );
            setLogs(data.content);
            setTotalPages(data.totalPages);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Refetch when dependencies change
    useEffect(() => {
        fetchLogs();
    }, [currentPage, sortOrder]);

    // Handle Manual Filter Apply
    const handleApplyFilters = () => {
        setCurrentPage(1); // Reset to page 1 on new filter
        fetchLogs();
    };

    // --- Styling Helpers ---
    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'ERROR': case 'CRITICAL': 
                return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800';
            case 'WARN': 
                return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
            case 'INFO': 
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
            case 'DEBUG': case 'TRACE':
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
            default: 
                return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
        }
    };

    // Date grouping color generator - assigns a unique border color based on the date string
    const getDateColorClass = (dateString: string) => {
        const hash = dateString.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        const colors = [
            'border-l-blue-500', 'border-l-purple-500', 'border-l-pink-500', 
            'border-l-emerald-500', 'border-l-amber-500', 'border-l-cyan-500'
        ];
        return colors[hash % colors.length];
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
                <Database className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs & Audit Trail</h2>
                    <p className="text-sm text-gray-500">Immutable record of system events mapped from database logs.</p>
                </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap gap-4 bg-white dark:bg-[#1a0d36] p-4 rounded-xl border border-gray-100 dark:border-purple-900/30 shadow-sm items-end">
                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Severity Level</label>
                    <select 
                        value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    >
                        <option value="ALL">All Levels</option>
                        <option value="ERROR">Errors (ERROR)</option>
                        <option value="WARN">Warnings (WARN)</option>
                        <option value="INFO">Info (INFO)</option>
                        <option value="DEBUG">Debug (DEBUG)</option>
                    </select>
                </div>

                <div className="flex-1 min-w-[180px]">
                    <label className="block text-xs font-bold text-gray-500 mb-1">Date Range</label>
                    <select 
                        value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
                    >
                        <option value="ALL">All Time</option>
                        <option value="TODAY">Today</option>
                        <option value="WEEKLY">Last 7 Days</option>
                        <option value="15D">Last 15 Days</option>
                        <option value="30D">Last 30 Days</option>
                        <option value="90D">Last 90 Days</option>
                        <option value="CUSTOM">Custom Date Range...</option>
                    </select>
                </div>
                
                {dateFilter === 'CUSTOM' && (
                    <>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-bold text-gray-500 mb-1">From</label>
                            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-1.5 text-sm" />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-xs font-bold text-gray-500 mb-1">To</label>
                            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-lg px-4 py-1.5 text-sm" />
                        </div>
                    </>
                )}

                <button 
                    onClick={handleApplyFilters}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center min-w-[120px]"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply Filters'}
                </button>
            </div>

            {/* Log Table */}
            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 overflow-hidden font-mono text-sm relative min-h-[400px]">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-[#1a0d36]/50 backdrop-blur-sm z-10 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                )}
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-[#150a29] text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-purple-900/30">
                                <th className="py-3 px-4 font-semibold cursor-pointer hover:text-purple-500 flex items-center gap-1 select-none" 
                                    onClick={() => setSortOrder(prev => prev === 'DESC' ? 'ASC' : 'DESC')}>
                                    Timestamp <ArrowUpDown className="w-3 h-3" />
                                </th>
                                <th className="py-3 px-4 font-semibold">Level</th>
                                <th className="py-3 px-4 font-semibold w-1/4">Logger / Module</th>
                                <th className="py-3 px-4 font-semibold w-1/2">Event Message</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {logs.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-gray-500 font-sans">No logs found matching your filters.</td>
                                </tr>
                            ) : (
                                logs.map((log) => {
                                    const dateObj = new Date(log.timestamp);
                                    const dateString = dateObj.toLocaleDateString();
                                    const timeString = dateObj.toLocaleTimeString();
                                    
                                    // Groups similar dates by left-border color
                                    const borderClass = getDateColorClass(dateString);

                                    return (
                                        <tr key={log.eventId} className="hover:bg-gray-50 dark:hover:bg-[#150a29]/50 transition-colors group">
                                            <td className={`py-3 px-4 text-gray-600 dark:text-gray-300 border-l-4 ${borderClass}`}>
                                                <div className="text-[11px] font-bold">{dateString}</div>
                                                <div className="text-[11px] text-gray-400">{timeString}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded font-bold text-[10px] tracking-wide ${getLevelBadge(log.levelString)}`}>
                                                    {log.levelString}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {/* Cuts down long Java package names, e.g., com.prograde.service.AuthService -> AuthService */}
                                                <div className="text-gray-900 dark:text-white font-semibold truncate max-w-[200px]" title={log.loggerName}>
                                                    {log.loggerName.split('.').pop()}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                                <div className="break-words line-clamp-2 group-hover:line-clamp-none text-xs leading-relaxed" title={log.formattedMessage}>
                                                    {log.formattedMessage}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Real Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-purple-900/30 flex justify-between items-center bg-gray-50 dark:bg-[#1a0d36]">
                    <span className="text-xs text-gray-500 font-sans">
                        Showing page {currentPage} of {totalPages || 1} ({totalElements} total logs)
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="p-1.5 rounded bg-white dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 hover:border-purple-500 disabled:opacity-50 transition-colors" 
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                            className="p-1.5 rounded bg-white dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 hover:border-purple-500 disabled:opacity-50 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}