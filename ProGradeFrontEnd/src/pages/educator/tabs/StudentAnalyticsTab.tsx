import React from 'react';
import { Radar, Sparkles } from 'lucide-react';

export default function StudentAnalyticsTab() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in slide-in-from-bottom-4 p-4 text-center">
            
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 blur-3xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-white dark:bg-[#1a0d36] rounded-3xl flex items-center justify-center border-2 border-indigo-100 dark:border-indigo-900/50 shadow-xl">
                    <Radar className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full border-2 border-white dark:border-[#150a29] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Predictive Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">Coming Soon</span>
                </h2>
                <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                    We are currently calibrating our AI models to provide deep insights into topic mastery radars, cohort learning gaps, and automated intervention strategies.
                </p>
            </div>
            
            <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200 dark:border-gray-700">
                    Status: Intelligence Module in Development
                </span>
            </div>

        </div>
    );
}