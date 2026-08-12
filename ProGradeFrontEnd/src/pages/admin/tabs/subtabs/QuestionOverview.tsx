import React, { useEffect, useState } from 'react';
import { adminService } from '../../../../features/admin/adminService';
import { TECH_STACK } from '../QuestionBankTab';
import { Loader2, Database, Filter, Layers } from 'lucide-react';

export default function QuestionOverview({ refreshTrigger }: { refreshTrigger: number }) {
    const [data, setData] = useState<{ technologies: any[], topics: any[] } | null>(null);
    const [loading, setLoading] = useState(true);

    // 🌟 Filter States
    const [selectedChartTech, setSelectedChartTech] = useState<string>('JAVA');
    const [selectedDifficulty, setSelectedDifficulty] = useState<'ALL' | 'EASY' | 'MEDIUM' | 'HARD'>('ALL');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await adminService.getQuestionSummaries();
                setData(res);
            } catch (error) {
                console.error("Failed to load question summary", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [refreshTrigger]);

    if (loading) return <div className="h-64 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
    if (!data) return null;

    // Force ALL technologies to render as cards
    const allTechCards = TECH_STACK.filter(t => t.id !== 'OVERVIEW').map(techDef => {
        const backendData = data.technologies.find(t => t.technology === techDef.id);
        return {
            ...techDef,
            totalCount: backendData?.totalCount || 0,
            easyCount: backendData?.easyCount || 0,
            mediumCount: backendData?.mediumCount || 0,
            hardCount: backendData?.hardCount || 0
        };
    });

    // 🌟 Filter Topic Data by Technology and Difficulty
    const activeTechName = TECH_STACK.find(t => t.id === selectedChartTech)?.name || selectedChartTech;

    let filteredTopics = data.topics.filter(t => t.technology === selectedChartTech);

    // Process values based on difficulty filter to hide 0-value topics
    const chartData = filteredTopics.map(topic => {
        let value = 0;
        if (selectedDifficulty === 'ALL') value = topic.totalCount;
        if (selectedDifficulty === 'EASY') value = topic.easyCount;
        if (selectedDifficulty === 'MEDIUM') value = topic.mediumCount;
        if (selectedDifficulty === 'HARD') value = topic.hardCount;

        return { ...topic, displayValue: value };
    }).filter(topic => topic.displayValue > 0); // Only show topics that have questions for the selected difficulty

    // Find highest value to dynamically scale the progress bars
    const maxTopicValue = chartData.length > 0 ? Math.max(...chartData.map(t => t.displayValue)) : 1;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">

            {/* --- TOP ROW: TECH DENSITY CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allTechCards.map((techItem) => {
                    const easyPct = techItem.totalCount > 0 ? (techItem.easyCount / techItem.totalCount) * 100 : 0;
                    const medPct = techItem.totalCount > 0 ? (techItem.mediumCount / techItem.totalCount) * 100 : 0;
                    const hardPct = techItem.totalCount > 0 ? (techItem.hardCount / techItem.totalCount) * 100 : 0;

                    return (
                        <div key={techItem.id} className="bg-white dark:bg-[#1a0d36] border border-gray-100 dark:border-purple-900/40 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">

                            {techItem.totalCount === 0 && (
                                <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-500 bg-white/80 dark:bg-black/80 px-3 py-1 rounded-full shadow-sm">No Assets Yet</span>
                                </div>
                            )}

                            <div className="flex justify-between items-start mb-4">
                                {/* NO ICON, JUST NAME */}
                                <h3 className="font-bold text-gray-900 dark:text-white truncate" title={techItem.name}>{techItem.name}</h3>
                                <span className="text-xl font-black text-purple-600 dark:text-purple-400">{techItem.totalCount}</span>
                            </div>

                            {/* Color Coded Progress Bar with Specific Hover Text */}
                            <div className="w-full h-2.5 rounded-full overflow-hidden flex mb-2 bg-gray-100 dark:bg-gray-800">
                                <div style={{ width: `${easyPct}%` }} className="bg-emerald-500 h-full hover:brightness-110 cursor-help transition-all" title={`Easy Level: ${techItem.easyCount} Questions`}></div>
                                <div style={{ width: `${medPct}%` }} className="bg-amber-400 h-full hover:brightness-110 cursor-help transition-all" title={`Medium Level: ${techItem.mediumCount} Questions`}></div>
                                <div style={{ width: `${hardPct}%` }} className="bg-rose-500 h-full hover:brightness-110 cursor-help transition-all" title={`Hard Level: ${techItem.hardCount} Questions`}></div>
                            </div>

                            {/* Numeric Footer */}
                            <div className="flex justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                <span><span className="text-emerald-500">■</span> {techItem.easyCount}</span>
                                <span><span className="text-amber-500">■</span> {techItem.mediumCount}</span>
                                <span><span className="text-rose-500">■</span> {techItem.hardCount}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* --- BOTTOM ROW: INTERACTIVE TOPIC DENSITY CHART --- */}
            <div className="bg-white dark:bg-[#1a0d36] border border-gray-100 dark:border-purple-900/40 rounded-2xl p-6 shadow-sm">

                {/* Headers and Filters */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 dark:border-purple-900/30 pb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Topic Density Distribution</h3>
                        <p className="text-xs text-gray-500">Visualize question spread by category from left to right.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Technology Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-2 focus-within:ring-2 ring-purple-600 transition-all">
                            <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <select
                                value={selectedChartTech}
                                onChange={(e) => setSelectedChartTech(e.target.value)}
                                className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer pr-4"
                            >
                                {TECH_STACK.filter(t => t.id !== 'OVERVIEW').map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Level Filter */}
                        <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-200 dark:border-purple-900/50 rounded-xl px-3 py-2 focus-within:ring-2 ring-purple-600 transition-all">
                            <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                                className="bg-transparent text-sm font-semibold text-gray-700 dark:text-gray-200 outline-none cursor-pointer pr-4"
                            >
                                <option value="ALL">All Difficulties</option>
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* 🌟 Custom Left-to-Right Horizontal Bar Chart */}
                <div className="w-full relative min-h-[300px]">
                    {chartData.length === 0 ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95">
                            <div className="w-16 h-16 bg-gray-50 dark:bg-[#0f0a1c] border border-gray-100 dark:border-purple-900/30 rounded-2xl flex items-center justify-center mb-4">
                                <Database className="w-8 h-8 text-gray-300 dark:text-purple-900/50" />
                            </div>
                            <h4 className="text-gray-900 dark:text-white font-bold text-lg mb-1">
                                No {selectedDifficulty !== 'ALL' ? selectedDifficulty.toLowerCase() : ''} assets found for {activeTechName}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm leading-relaxed">
                                We are actively working on expanding our curriculum. Check back later or use the Bulk Import tool to seed questions for this technology.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {chartData.map((topic, idx) => {
                                // Calculate percentage based on the highest value topic to scale the bars beautifully
                                const percentage = (topic.displayValue / maxTopicValue) * 100;

                                // Determine bar color based on difficulty filter
                                let barColor = 'bg-purple-500 dark:bg-purple-600'; // ALL
                                if (selectedDifficulty === 'EASY') barColor = 'bg-emerald-500';
                                if (selectedDifficulty === 'MEDIUM') barColor = 'bg-amber-500';
                                if (selectedDifficulty === 'HARD') barColor = 'bg-rose-500';

                                return (
                                    <div key={idx} className="w-full animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                                        {/* Line 1: Topic Name and Count */}
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{topic.topic}</span>
                                            <span className="text-xs font-black text-gray-500 dark:text-gray-400">{topic.displayValue} Qs</span>
                                        </div>

                                        {/* Line 2: The Graph Bar */}
                                        <div className="w-full h-3.5 bg-gray-100 dark:bg-[#0f0a1c] rounded-full overflow-hidden border border-gray-200 dark:border-purple-900/30">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}