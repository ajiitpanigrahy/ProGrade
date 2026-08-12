import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader3D from '../../components/Loader3D';
import { useAuth } from '../../context/AuthContext';

// Import Student Tabs
import ActiveExaminationsTab from './tabs/ActiveExaminationsTab';

export default function StudentDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    
    // 🌟 URL-based Routing for Sidebar Navigation
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await sleep(1500); // 1.5 seconds full-screen 3D animation
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // 🌟 Dynamic Content Switcher
    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="grid gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4">
                        
                        {/* Welcome Card - Fully Responsive */}
                        <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                                Welcome back, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Ready to ace your next technical assessment?</p>
                        </div>

                        {/* Quick Actions - Stacks on Mobile, Side-by-Side on Tablet/Desktop */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            
                            <div className="bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden group cursor-pointer">
                                <div className="relative z-10">
                                    <h3 className="text-lg sm:text-xl font-bold mb-2">Join an Exam</h3>
                                    <p className="text-purple-100 mb-5 sm:mb-6 text-xs sm:text-sm max-w-[85%]">Got a secure access code from your educator?</p>
                                    <button className="w-full sm:w-auto bg-white text-purple-700 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors shadow-md cursor-pointer">
                                        Enter Code
                                    </button>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                            </div>
                            
                            <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm flex flex-col justify-center">
                                 <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1">Recent Results</h3>
                                 <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-5">You have no recent exam results.</p>
                                 <button className="text-purple-600 dark:text-purple-400 font-semibold text-sm self-start hover:underline cursor-pointer">
                                     View all history &rarr;
                                 </button>
                            </div>

                        </div>
                    </div>
                );
            case 'active-exams':
                return <ActiveExaminationsTab />;
            case 'practice':
                return <div className="p-6 sm:p-12 text-center text-gray-500 font-bold bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">Self-Practice Arena coming soon...</div>;
            case 'transcripts':
                return <div className="p-6 sm:p-12 text-center text-gray-500 font-bold bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">Performance Transcripts coming soon...</div>;
            case 'leaderboard':
                return <div className="p-6 sm:p-12 text-center text-gray-500 font-bold bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">Global Leaderboard coming soon...</div>;
            case 'support':
                return <div className="p-6 sm:p-12 text-center text-gray-500 font-bold bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">Support & Appeals coming soon...</div>;
            default:
                return <div className="p-6 sm:p-12 text-center text-gray-500 font-bold bg-white dark:bg-[#1a0d36] rounded-2xl shadow-sm border border-gray-100 dark:border-purple-900/30">Select a tab from the sidebar.</div>;
        }
    };

    // 🌟 Full-Screen Fixed Overlay Loader (Identical to Sign Out / Profile Update)
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[9999] bg-gray-50/95 dark:bg-[#0f0a1c]/95 backdrop-blur-md flex items-center justify-center p-4">
                <Loader3D text="LOADING ASSESSMENT ENVIRONMENT..." />
            </div>
        );
    }

    return (
        <DashboardLayout role="STUDENT">
            {renderContent()}
        </DashboardLayout>
    );
}