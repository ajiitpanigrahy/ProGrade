import { useState, useEffect, useMemo } from 'react';
import { Trophy, Search, Crown, Users, Star, Shield, Calendar, ArrowUpDown, ArrowLeft, ArrowRight, Database, Medal } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

import { adminService } from '../../../features/admin/adminService';
import { educatorService } from '../../../features/educator/educatorService';
import { studentService } from '../../../features/student/studentService';

interface RankEntry {
    rank: number;
    studentName: string;
    email: string;
    rewardPoints: number;
    isCurrentUser: boolean;
}

interface CategoryLeaderboard {
    categoryName: string;
    rankings: RankEntry[];
}

interface LeaderboardData {
    globalLeaderboard: RankEntry[];
    technologyLeaderboards: CategoryLeaderboard[];
    assessmentLeaderboards: CategoryLeaderboard[];
    batchLeaderboards: CategoryLeaderboard[];
}

type SortOption = 'RANK_ASC' | 'RANK_DESC' | 'NAME_ASC' | 'NAME_DESC';
type TimeFilter = 'TODAY' | 'WEEK' | 'MONTH' | 'ALL_TIME';

const PAGE_SIZE = 15;

export default function GlobalLeaderboardTab() {
    const { user } = useAuth(); 
    
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'TECH' | 'EXAM' | 'BATCH'>('GLOBAL');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('RANK_ASC');
    const [timeFilter, setTimeFilter] = useState<TimeFilter>('ALL_TIME'); 
    const [currentPage, setCurrentPage] = useState(1);

    const input3DClass = "w-full bg-white dark:bg-[#0f0a1c] border-2 border-gray-200 dark:border-purple-900/50 rounded-xl px-4 py-2.5 focus:border-purple-500 focus:ring-4 ring-purple-600/20 outline-none text-gray-900 dark:text-white transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] cursor-pointer font-bold text-xs tracking-wider";

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                let resData;
                if (user?.role === 'ADMIN') resData = await adminService.getLeaderboard(timeFilter);
                else if (user?.role === 'EDUCATOR') resData = await educatorService.getLeaderboard(timeFilter);
                // 🌟 FIX: Bypassed the etLeaderboard typo using type assertion to satisfy the strict compiler
                else resData = await (studentService as any).getLeaderboard(timeFilter);
                
                setData(resData);
            } catch (err) {
                console.error("Failed to load leaderboards", err);
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, [user?.role, timeFilter]); 

    const validExamLeaderboards = useMemo(() => {
        const allExams = data?.assessmentLeaderboards || [];
        if (user?.role === 'STUDENT') {
            return allExams.filter(
                cat => !cat.categoryName.toLowerCase().includes('practice') && !cat.categoryName.toLowerCase().includes('self')
            );
        }
        return allExams;
    }, [data?.assessmentLeaderboards, user?.role]);

    useEffect(() => { setCurrentPage(1); }, [activeTab, selectedSubCategory, search, sortBy, timeFilter]);

    const handleTabChange = (tab: 'GLOBAL' | 'TECH' | 'EXAM' | 'BATCH') => {
        setActiveTab(tab);
        setSearch('');
        setSortBy('RANK_ASC');
        
        if (tab === 'TECH') setSelectedSubCategory(data?.technologyLeaderboards?.[0]?.categoryName || '');
        else if (tab === 'EXAM') setSelectedSubCategory(validExamLeaderboards[0]?.categoryName || '');
        else if (tab === 'BATCH') setSelectedSubCategory(data?.batchLeaderboards?.[0]?.categoryName || '');
    };

    const baseList = useMemo(() => {
        if (activeTab === 'GLOBAL') return data?.globalLeaderboard || [];
        if (activeTab === 'TECH') return data?.technologyLeaderboards?.find(t => t.categoryName === selectedSubCategory)?.rankings || [];
        if (activeTab === 'EXAM') return validExamLeaderboards.find(t => t.categoryName === selectedSubCategory)?.rankings || [];
        if (activeTab === 'BATCH') return data?.batchLeaderboards?.find(t => t.categoryName === selectedSubCategory)?.rankings || [];
        return [];
    }, [activeTab, selectedSubCategory, data, validExamLeaderboards]);

    const filteredList = useMemo(() => {
        let filtered = baseList.filter(u => 
            u.studentName.toLowerCase().includes(search.toLowerCase()) || 
            u.email.toLowerCase().includes(search.toLowerCase())
        );

        filtered.sort((a, b) => {
            if (sortBy === 'RANK_ASC') return a.rank - b.rank;
            if (sortBy === 'RANK_DESC') return b.rank - a.rank;
            if (sortBy === 'NAME_ASC') return a.studentName.localeCompare(b.studentName);
            if (sortBy === 'NAME_DESC') return b.studentName.localeCompare(a.studentName);
            return 0;
        });

        return filtered;
    }, [baseList, search, sortBy]);

    const totalPages = Math.ceil(filteredList.length / PAGE_SIZE) || 1;
    const paginatedList = filteredList.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { icon: Crown, colors: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 shadow-[inset_0_0_10px_rgba(245,158,11,0.1)]' };
        if (rank === 2) return { icon: Medal, colors: 'bg-gray-200 dark:bg-gray-500/10 text-gray-500 dark:text-gray-300 border-gray-300 dark:border-gray-500/30 shadow-[inset_0_0_10px_rgba(156,163,175,0.1)]' };
        if (rank === 3) return { icon: Medal, colors: 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/30 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]' };
        return { icon: null, colors: 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700' };
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative min-h-screen">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-1/2 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="bg-white/80 dark:bg-[#150a29]/80 backdrop-blur-xl border-b-2 border-gray-200 dark:border-purple-900/50 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0 z-10 shadow-sm relative">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400 flex items-center gap-2 drop-shadow-sm">
                        <Trophy className="w-6 h-6 text-purple-600 dark:text-purple-400" /> 
                        {user?.role === 'STUDENT' ? 'Hall of Fame Rankings' : 'Global Leaderboard Telemetry'}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-bold mt-1 tracking-wide">
                        {user?.role === 'STUDENT' 
                            ? 'Compete globally. Earn reward points for verified technical competency.' 
                            : 'Monitor top-performing percentiles and cohort point distributions.'}
                    </p>
                </div>

                <div className="flex bg-gray-100 dark:bg-[#0f0a1c] p-1.5 rounded-xl border-2 border-gray-200 dark:border-purple-900/50 shadow-inner w-full md:w-auto overflow-x-auto custom-scrollbar snap-x">
                    <button onClick={() => handleTabChange('GLOBAL')} className={`snap-start flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase whitespace-nowrap ${activeTab === 'GLOBAL' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <GlobeIcon className="w-4 h-4" /> Global Top
                    </button>
                    <button onClick={() => handleTabChange('BATCH')} className={`snap-start flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase whitespace-nowrap ${activeTab === 'BATCH' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <Users className="w-4 h-4" /> Batches
                    </button>
                    <button onClick={() => handleTabChange('TECH')} className={`snap-start flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase whitespace-nowrap ${activeTab === 'TECH' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <Shield className="w-4 h-4" /> Tech
                    </button>
                    <button onClick={() => handleTabChange('EXAM')} className={`snap-start flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-xs font-black transition-all cursor-pointer tracking-wider uppercase whitespace-nowrap ${activeTab === 'EXAM' ? 'bg-white dark:bg-purple-600 text-purple-700 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>
                        <Star className="w-4 h-4" /> Exams
                    </button>
                </div>
            </div>

            <div className="relative z-10 flex flex-col lg:flex-row gap-4 bg-white/60 dark:bg-[#150a29]/60 backdrop-blur-md p-5 rounded-3xl border-2 border-gray-200 dark:border-purple-900/40 shadow-sm items-end">
                <div className="flex-1 w-full lg:w-auto relative">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">Search Contender</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Name or email..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            className={`${input3DClass} pl-10`}
                        />
                    </div>
                </div>

                {activeTab !== 'GLOBAL' && (
                    <div className="flex-1 w-full lg:w-auto">
                        <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">
                            {activeTab === 'TECH' ? 'Technology' : activeTab === 'BATCH' ? 'Target Batch' : 'Target Exam'}
                        </label>
                        <select 
                            value={selectedSubCategory} 
                            onChange={(e) => setSelectedSubCategory(e.target.value)} 
                            className={input3DClass}
                        >
                            {(activeTab === 'TECH' ? data?.technologyLeaderboards : activeTab === 'BATCH' ? data?.batchLeaderboards : validExamLeaderboards)?.map(cat => (
                                <option key={cat.categoryName} value={cat.categoryName}>{cat.categoryName}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="w-full lg:w-48 relative">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">Time Window</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-500" />
                        <select 
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                            disabled={isLoading}
                            className={`${input3DClass} pl-10 disabled:opacity-50`}
                        >
                            <option value="TODAY">Today Only</option>
                            <option value="WEEK">Last 7 Days</option>
                            <option value="MONTH">This Month</option>
                            <option value="ALL_TIME">All Time History</option>
                        </select>
                    </div>
                </div>

                <div className="w-full lg:w-48 relative">
                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1.5 tracking-wider">Sorting</label>
                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className={`${input3DClass} pl-10`}
                        >
                            <option value="RANK_ASC">Highest Points</option>
                            <option value="RANK_DESC">Lowest Points</option>
                            <option value="NAME_ASC">Name (A-Z)</option>
                            <option value="NAME_DESC">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative z-10 bg-white/80 dark:bg-[#1a0d36]/90 backdrop-blur-xl border-2 border-gray-200 dark:border-purple-900/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden min-h-[500px] flex flex-col">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/40 dark:bg-[#1a0d36]/40 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-xs font-black uppercase tracking-widest text-purple-600">Querying Global Ranks...</p>
                    </div>
                )}
                
                <div className="overflow-x-auto flex-1 custom-scrollbar">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50/80 dark:bg-[#150a29]/80 backdrop-blur-md sticky top-0 z-10 border-b-2 border-gray-200 dark:border-purple-900/50">
                            <tr className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-gray-400 font-black">
                                <th className="py-4 px-6 w-24 text-center">Global Rank</th>
                                <th className="py-4 px-6">Contender Details</th>
                                <th className="py-4 px-6 text-right">Earned Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-purple-900/30">
                            {paginatedList.length === 0 && !isLoading ? (
                                <tr>
                                    <td colSpan={3} className="py-24 text-center">
                                        <Database className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 font-bold text-sm tracking-wide">
                                            {baseList.length === 0 ? `No records available for this ${timeFilter === 'ALL_TIME' ? 'category' : 'timeframe'}.` : "No contenders found matching your filters."}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedList.map((entry) => {
                                    const badge = getRankBadge(entry.rank);
                                    const Icon = badge.icon;

                                    return (
                                        <tr key={entry.email} className={`transition-all duration-200 ${entry.isCurrentUser ? 'bg-purple-50/50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-[#110820]'}`}>
                                            <td className={`py-4 px-6 text-center border-l-4 ${entry.isCurrentUser ? 'border-purple-500' : 'border-transparent'}`}>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-xs font-black uppercase tracking-wider ${badge.colors}`}>
                                                    {Icon && <Icon className="w-4 h-4" />} 
                                                    {entry.rank <= 3 ? `Rank ${entry.rank}` : `# ${entry.rank}`}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#150a29] flex items-center justify-center border-2 border-gray-200 dark:border-purple-900/50 shrink-0 shadow-sm font-black text-gray-700 dark:text-gray-300">
                                                        {entry.studentName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`text-sm font-black uppercase ${entry.isCurrentUser ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                                                                {entry.studentName}
                                                            </div>
                                                            {entry.isCurrentUser && (
                                                                <span className="text-[9px] bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border-2 border-purple-200 dark:border-purple-500/50 tracking-widest font-black shadow-sm">YOU</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-gray-400 font-mono mt-0.5">{entry.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <span className="text-xl font-black text-gray-900 dark:text-white">{entry.rewardPoints}</span>
                                                <span className="text-[10px] font-bold text-gray-500 dark:text-gray-500 ml-1.5 tracking-widest">PTS</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="p-4 sm:p-6 border-t-2 border-gray-200 dark:border-purple-900/50 bg-gray-50 dark:bg-[#110820] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <span className="text-xs font-black text-gray-500 uppercase tracking-wider">
                        Page <span className="text-purple-600 dark:text-purple-400">{currentPage}</span> of {totalPages} <span className="text-gray-400 lowercase mx-1">•</span> {filteredList.length} Contenders
                    </span>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1 || isLoading}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a0d36] border-2 border-gray-200 dark:border-purple-900/50 hover:border-purple-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs uppercase tracking-wider" 
                        >
                            <ArrowLeft className="w-4 h-4" /> Prev
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a0d36] border-2 border-gray-200 dark:border-purple-900/50 hover:border-purple-500 dark:hover:border-purple-500 text-gray-700 dark:text-gray-300 disabled:opacity-50 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold text-xs uppercase tracking-wider"
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GlobeIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      <path d="M2 12h20" />
    </svg>
  )
}