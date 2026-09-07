import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader3D from '../../components/Loader3D';

// Import Tabs
import EducatorOverviewTab from './tabs/EducatorOverviewTab';
import GradingDeskTab from './tabs/GradingDeskTab';
import StudentAnalyticsTab from './tabs/StudentAnalyticsTab';
import QuestionBankTab from '../admin/tabs/QuestionBankTab'; 
import AssessmentHubTab from '../admin/tabs/AssessmentHubTab';
// 🌟 Import the Leaderboard Tab
import GlobalLeaderboardTab from '../student/tabs/GlobalLeaderboardTab';

export default function EducatorDashboard() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const activeView = searchParams.get('view') || 'overview';

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await sleep(1500);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-[#1a0d36] rounded-2xl p-6 sm:p-8 border border-gray-100 dark:border-purple-900/30 shadow-sm animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Welcome back, {user?.fullName?.split(' ')[0] || 'Educator'}! 👋
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">Here is your executive summary and active workloads.</p>
                        </div>
                        <EducatorOverviewTab />
                    </div>
                );
            case 'assessments':
                return <AssessmentHubTab activeSubTab="MANAGEMENT" />;
            case 'practice-monitor':
                return <AssessmentHubTab activeSubTab="PRACTICE" />; 
            case 'questions':
                return <QuestionBankTab />;
            case 'grading':
                return <GradingDeskTab />;
            case 'analytics':
                return <StudentAnalyticsTab />;
            case 'leaderboard':
                return <GlobalLeaderboardTab />; // 🌟 Added Leaderboard Routing
            default:
                return <EducatorOverviewTab />;
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout role="EDUCATOR">
                <div className="h-[70vh] flex items-center justify-center">
                    <Loader3D text="INITIALIZING EDUCATOR WORKSPACE..." />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="EDUCATOR">
            {renderContent()}
        </DashboardLayout>
    );
}