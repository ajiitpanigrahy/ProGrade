import React, { useState, useEffect } from 'react';
import { Trophy, Search, Loader2, Target, Crown, Users, Medal } from 'lucide-react';
import { axiosClient } from '../../../api/axiosClient';

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

export default function GlobalLeaderboardTab() {
    const [data, setData] = useState<LeaderboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'GLOBAL' | 'TECH' | 'EXAM' | 'BATCH'>('GLOBAL');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('RANK_ASC');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await axiosClient.get<LeaderboardData>('/student/dashboard/leaderboard');
                setData(res.data);
            } catch (err) {
                console.error("Failed to load leaderboards", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeaderboard();
    }, []);

    const handleTabChange = (tab: 'GLOBAL' | 'TECH' | 'EXAM' | 'BATCH') => {
        setActiveTab(tab);
        setSearch('');
        setSortBy('RANK_ASC'); // Reset sort on tab change
        if (tab === 'TECH') setSelectedSubCategory(data?.technologyLeaderboards?.[0]?.categoryName || '');
        else if (tab === 'EXAM') setSelectedSubCategory(data?.assessmentLeaderboards?.[0]?.categoryName || '');
        else if (tab === 'BATCH') setSelectedSubCategory(data?.batchLeaderboards?.[0]?.categoryName || '');
    };

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
                <p className="text-sm font-bold text-gray-400 animate-pulse">Calculating Ranks...</p>
            </div>
        );
    }

    // 1. Get the base list for the currently active tab & subcategory
    let baseList: RankEntry[] = [];
    if (activeTab === 'GLOBAL') baseList = data?.globalLeaderboard || [];
    if (activeTab === 'TECH') baseList = data?.technologyLeaderboards?.find(t => t.categoryName === selectedSubCategory)?.rankings || [];
    if (activeTab === 'EXAM') baseList = data?.assessmentLeaderboards?.find(t => t.categoryName === selectedSubCategory)?.rankings || [];
    if (activeTab === 'BATCH') baseList = data?.batchLeaderboards?.find(t => t.categoryName === selectedSubCategory)?.rankings || [];

    // 2. Extract Objective Top 3 (Always based strictly on Rank 1, 2, 3)
    const absoluteTopThree = [...baseList].sort((a, b) => a.rank - b.rank).slice(0, 3);

    // 3. Apply Search Filter
    let filteredList = baseList.filter(user => 
        user.studentName.toLowerCase().includes(search.toLowerCase()) || 
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // 4. Apply Sorting
    filteredList.sort((a, b) => {
        if (sortBy === 'RANK_ASC') return a.rank - b.rank; // Highest Points
        if (sortBy === 'RANK_DESC') return b.rank - a.rank; // Lowest Points
        if (sortBy === 'NAME_ASC') return a.studentName.localeCompare(b.studentName);
        if (sortBy === 'NAME_DESC') return b.studentName.localeCompare(a.studentName);
        return 0;
    });

    // 🌟 SMART UX: Hide the podium if they are actively searching or sorting differently
    const showPodium = search === '' && sortBy === 'RANK_ASC' && absoluteTopThree.length > 0;

    // If podium is showing, remove the top 3 from the table below. Otherwise, show everyone in the table.
    const tableList = showPodium 
        ? filteredList.filter(u => !absoluteTopThree.find(top => top.email === u.email)) 
        : filteredList;

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-10">
            
            {/* 🌟 HEADER & MAIN TABS */}
            <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl border border-purple-900/30 p-6 sm:p-8 rounded-[2rem] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-purple-400 drop-shadow-md" /> Hall of Fame
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-400 font-medium mt-2 max-w-lg leading-relaxed">
                        Compete with peers across the platform. Earn 10 Reward Points for every positive mark in your technical assessments.
                    </p>
                </div>
                
                <div className="flex bg-black/20 p-1.5 rounded-2xl border border-purple-900/30 shadow-inner relative z-10 w-full xl:w-auto overflow-x-auto custom-scrollbar snap-x">
                    <button onClick={() => handleTabChange('GLOBAL')} className={`snap-start cursor-pointer px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'GLOBAL' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>🌍 Global Top</button>
                    <button onClick={() => handleTabChange('BATCH')} className={`snap-start cursor-pointer px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'BATCH' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}><Users className="w-3.5 h-3.5 inline mr-1 -mt-0.5" /> Batches</button>
                    <button onClick={() => handleTabChange('TECH')} className={`snap-start cursor-pointer px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'TECH' ? 'bg-fuchsia-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>💻 Technology</button>
                    <button onClick={() => handleTabChange('EXAM')} className={`snap-start cursor-pointer px-5 py-3 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === 'EXAM' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}>📝 Per Exam</button>
                </div>
            </div>

            {/* 🌟 SUB-CATEGORY FILTERS */}
            {activeTab !== 'GLOBAL' && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x px-1">
                    {(activeTab === 'TECH' ? data?.technologyLeaderboards : activeTab === 'BATCH' ? data?.batchLeaderboards : data?.assessmentLeaderboards)?.map(cat => (
                        <button 
                            key={cat.categoryName}
                            onClick={() => setSelectedSubCategory(cat.categoryName)}
                            className={`cursor-pointer snap-start px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border ${selectedSubCategory === cat.categoryName ? 'bg-purple-500/20 border-purple-500 text-purple-300 shadow-sm' : 'bg-transparent border-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                        >
                            {cat.categoryName}
                        </button>
                    ))}
                    {((activeTab === 'TECH' && !data?.technologyLeaderboards?.length) || (activeTab === 'EXAM' && !data?.assessmentLeaderboards?.length) || (activeTab === 'BATCH' && !data?.batchLeaderboards?.length)) && (
                        <div className="text-xs font-bold text-gray-500 py-2">No categories available.</div>
                    )}
                </div>
            )}

            {/* 🌟 TOP 3 PODIUM (Hides when Searching or Sorting) */}
            {showPodium && (
                <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mt-8 sm:mt-12 mb-8 items-end max-w-4xl mx-auto px-2">
                    {/* 🥈 2nd Place (Purple) */}
                    {absoluteTopThree[1] ? (
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100">
                            <div className="relative mb-3 sm:mb-4">
                                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-4 border-purple-500 bg-[#150a29] flex items-center justify-center text-white font-black text-lg sm:text-2xl shadow-[0_0_20px_rgba(168,85,247,0.3)] z-10 relative">
                                    {absoluteTopThree[1].studentName.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-purple-500 border-2 border-[#150a29] flex items-center justify-center z-20 text-white shadow-md">
                                    <span className="text-[10px] sm:text-xs font-black">2</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-200 text-[10px] sm:text-sm text-center truncate w-full px-1">{absoluteTopThree[1].studentName}</h4>
                            <div className="w-full h-20 sm:h-32 bg-gradient-to-t from-purple-900/10 to-purple-600/30 rounded-t-xl sm:rounded-t-2xl mt-3 sm:mt-4 border-t-2 border-x-2 border-purple-500/50 flex flex-col justify-start pt-3 sm:pt-4 items-center">
                                <span className="font-black text-purple-200 text-xs sm:text-sm">{absoluteTopThree[1].rewardPoints} <span className="text-[8px] sm:text-[10px] text-purple-400">PTS</span></span>
                            </div>
                        </div>
                    ) : <div />}

                    {/* 🥇 1st Place (Fuchsia) */}
                    {absoluteTopThree[0] ? (
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-10 fade-in duration-500 z-10">
                            <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-fuchsia-400 mb-2 drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]" />
                            <div className="relative mb-3 sm:mb-4">
                                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-[5px] sm:border-[6px] border-fuchsia-500 bg-[#150a29] flex items-center justify-center text-white font-black text-2xl sm:text-4xl shadow-[0_0_30px_rgba(217,70,239,0.4)] z-10 relative">
                                    {absoluteTopThree[0].studentName.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-fuchsia-500 border-4 border-[#150a29] flex items-center justify-center z-20 text-white shadow-lg">
                                    <span className="text-xs sm:text-sm font-black">1</span>
                                </div>
                            </div>
                            <h4 className="font-black text-fuchsia-300 text-xs sm:text-lg text-center truncate w-full px-1">{absoluteTopThree[0].studentName}</h4>
                            <div className="w-full h-28 sm:h-40 bg-gradient-to-t from-fuchsia-900/20 to-fuchsia-500/30 rounded-t-xl sm:rounded-t-2xl mt-3 sm:mt-4 border-t-2 border-x-2 border-fuchsia-500/80 flex flex-col justify-start pt-3 sm:pt-4 items-center shadow-[0_-10px_30px_rgba(217,70,239,0.1)]">
                                <span className="font-black text-white text-sm sm:text-base">{absoluteTopThree[0].rewardPoints} <span className="text-[8px] sm:text-[10px] text-fuchsia-300">PTS</span></span>
                            </div>
                        </div>
                    ) : <div />}

                    {/* 🥉 3rd Place (Indigo) */}
                    {absoluteTopThree[2] ? (
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">
                            <div className="relative mb-3 sm:mb-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-indigo-500 bg-[#150a29] flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-[0_0_20px_rgba(99,102,241,0.3)] z-10 relative">
                                    {absoluteTopThree[2].studentName.charAt(0)}
                                </div>
                                <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-500 border-2 border-[#150a29] flex items-center justify-center z-20 text-white shadow-md">
                                    <span className="text-[10px] sm:text-xs font-black">3</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-300 text-[10px] sm:text-sm text-center truncate w-full px-1">{absoluteTopThree[2].studentName}</h4>
                            <div className="w-full h-16 sm:h-24 bg-gradient-to-t from-indigo-900/10 to-indigo-600/30 rounded-t-xl sm:rounded-t-2xl mt-3 sm:mt-4 border-t-2 border-x-2 border-indigo-500/50 flex flex-col justify-start pt-3 sm:pt-4 items-center">
                                <span className="font-black text-indigo-200 text-xs sm:text-sm">{absoluteTopThree[2].rewardPoints} <span className="text-[8px] sm:text-[10px] text-indigo-400">PTS</span></span>
                            </div>
                        </div>
                    ) : <div />}
                </div>
            )}

            {/* 🌟 4. TRUE TABLE & FILTERS */}
            <div className="bg-white/5 dark:bg-[#150a29]/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 dark:border-purple-900/30 p-5 sm:p-8 shadow-sm">
                
                {/* Search & Sort Controls */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 sm:mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Search contender by name or email..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-transparent border border-purple-900/50 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder:text-gray-600"
                        />
                    </div>
                    <div className="shrink-0">
                        <select 
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortOption)}
                            className="w-full md:w-48 px-4 py-3 bg-black/40 border border-purple-900/50 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-purple-500 cursor-pointer appearance-none text-center"
                        >
                            <option value="RANK_ASC">Highest Points</option>
                            <option value="RANK_DESC">Lowest Points</option>
                            <option value="NAME_ASC">Name (A-Z)</option>
                            <option value="NAME_DESC">Name (Z-A)</option>
                        </select>
                    </div>
                </div>

                {/* Data Table */}
                {tableList.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 font-bold border border-dashed border-purple-900/30 rounded-2xl">
                        {baseList.length === 0 ? "No ranking data available for this category yet." : "No contenders found matching your filters."}
                    </div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar rounded-xl border border-purple-900/30 bg-black/10">
                        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[600px]">
                            <thead>
                                <tr className="bg-purple-900/20 text-[10px] uppercase font-black tracking-widest text-gray-400 border-b border-purple-900/40">
                                    <th className="py-4 px-6 w-24 text-center">Rank</th>
                                    <th className="py-4 px-6">Contender</th>
                                    <th className="py-4 px-6 text-right w-40">Reward Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-900/20">
                                {tableList.map((entry) => (
                                    <tr 
                                        key={entry.email} 
                                        className={`transition-colors hover:bg-white/5 ${
                                            entry.isCurrentUser ? 'bg-purple-500/10 border-l-4 border-l-purple-500' : ''
                                        }`}
                                    >
                                        <td className="py-4 px-6 text-center">
                                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm ${
                                                !showPodium && entry.rank === 1 ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' :
                                                !showPodium && entry.rank === 2 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                !showPodium && entry.rank === 3 ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                                                'text-gray-500'
                                            }`}>
                                                #{entry.rank}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className={`font-black text-sm ${entry.isCurrentUser ? 'text-purple-300' : 'text-gray-200'}`}>
                                                        {entry.studentName}
                                                    </span>
                                                    {entry.isCurrentUser && (
                                                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30 tracking-wider font-black">YOU</span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-gray-600 font-mono mt-0.5">{entry.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <span className="text-base font-black text-white">{entry.rewardPoints}</span>
                                            <span className="text-[10px] font-bold text-gray-500 ml-1.5">PTS</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}