import React, { useEffect, useState } from 'react';
import { educatorService } from '../../../features/educator/educatorService';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function StudentAnalyticsTab() {
    const [radarData, setRadarData] = useState<any[]>([]);

    useEffect(() => {
        educatorService.getTopicMastery().then(setRadarData).catch(console.error);
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student Performance Analytics</h2>
                <p className="text-sm text-gray-500">Measure teaching efficacy and identify weak topic areas across student cohorts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Radar Chart: Topic Mastery */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30 flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 dark:text-white w-full mb-2">Class Topic Mastery (Averages)</h3>
                    <p className="text-xs text-gray-500 w-full mb-6">Radar footprint indicates overall proficiency across technical domains.</p>
                    
                    <div className="w-full h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#4c1d95" opacity={0.3} />
                                <PolarAngleAxis dataKey="topic" tick={{ fill: '#a855f7', fontSize: 12, fontWeight: 'bold' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1a0d36', borderColor: '#4c1d95', color: '#fff', borderRadius: '12px' }} />
                                <Radar name="Average Score %" dataKey="score" stroke="#a855f7" strokeWidth={2} fill="#a855f7" fillOpacity={0.4} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Score Distribution Insights */}
                <div className="bg-white dark:bg-[#1a0d36] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">Cohort Insights & Interventions</h3>
                    
                    <div className="space-y-4">
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl">
                            <h4 className="font-bold text-red-700 dark:text-red-400 text-sm">Action Required: Security Concepts</h4>
                            <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-1">Class average for 'Security' is currently at 55%. Consider assigning supplementary reading or holding a review session.</p>
                        </div>
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                            <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Strong Proficiency: Spring Core</h4>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-1">Students are demonstrating excellent retention in Core configuration and Dependency Injection (92% Avg).</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}