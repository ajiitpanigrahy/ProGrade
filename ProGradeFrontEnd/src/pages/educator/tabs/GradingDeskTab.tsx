import React from 'react';
import { Clock, Wrench } from 'lucide-react';

export default function GradingDeskTab() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in slide-in-from-bottom-4 p-4 text-center">
            
            <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 dark:bg-purple-500/10 blur-3xl rounded-full"></div>
                <div className="relative w-24 h-24 bg-white dark:bg-[#1a0d36] rounded-3xl flex items-center justify-center border-2 border-purple-100 dark:border-purple-900/50 shadow-xl">
                    <Wrench className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full border-2 border-white dark:border-[#150a29] flex items-center justify-center">
                        <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    Grading Desk <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400">Coming Soon</span>
                </h2>
                <p className="text-sm sm:text-base font-medium text-gray-500 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
                    We are currently forging an advanced manual evaluation and anomaly review interface. This module will be unlocked in a future platform update.
                </p>
            </div>
            
            <div className="pt-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 border border-gray-200 dark:border-gray-700">
                    Status: Under Construction
                </span>
            </div>

        </div>
    );
}