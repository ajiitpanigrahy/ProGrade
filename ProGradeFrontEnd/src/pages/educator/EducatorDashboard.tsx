import React from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../layouts/DashboardLayout';
import { PlusCircle, ClipboardList } from 'lucide-react';

export default function EducatorDashboard() {
    const { user } = useAuth();

    return (
        <DashboardLayout role="EDUCATOR">
            <div className="grid gap-6">
                
                {/* Welcome Card */}
                <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Welcome back, {user?.fullName?.split(' ')[0] || 'Educator'}! 👋
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">Ready to design your next technical assessment?</p>
                </div>

                {/* Educator Quick Actions */}
                <div className="grid sm:grid-cols-2 gap-6">
                    {/* Primary Action */}
                    <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                        <div className="relative z-10">
                            <div className="bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                <PlusCircle className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Create Assessment</h3>
                            <p className="text-purple-100 mb-6 text-sm">Build a new coding or multiple-choice exam.</p>
                            <button className="bg-white text-purple-700 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors shadow-md cursor-pointer">
                                Start Draft
                            </button>
                        </div>
                        {/* Decorative circle */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                    
                    {/* Secondary Action */}
                    <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm flex flex-col justify-center cursor-pointer hover:border-purple-500/50 transition-colors group">
                        <div className="bg-blue-50 dark:bg-blue-900/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Grade Submissions</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">You have 12 pending exams to review.</p>
                        <button className="text-purple-600 dark:text-purple-400 font-semibold text-sm self-start hover:underline cursor-pointer">
                            View submissions &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}